import { createFileRoute } from "@tanstack/react-router";
import { json, authenticate } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";

/**
 * GET  /api/stories/:id/revisions   — list all revisions for a story
 * POST /api/stories/:id/revisions   — editor submits a new revision
 */
export const Route = createFileRoute("/api/stories/$id/revisions")({
  server: {
    handlers: {
      // ─── GET: list all revisions ─────────────────────────────────────────
      GET: async ({ params, request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        const revisions = await (prisma as any).storyRevision.findMany({
          where: { storyId: params.id },
          orderBy: { createdAt: "desc" },
          include: {
            editor: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
        });

        return json({ revisions });
      },

      // ─── POST: editor submits revision ───────────────────────────────────
      POST: async ({ params, request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        // Check editor is assigned to this story
        const story = await prisma.story.findUnique({
          where: { id: params.id },
          select: { id: true, title: true, version: true, assignedEditorId: true },
        });
        if (!story) return json({ error: "Story not found" }, { status: 404 });
        if (story.assignedEditorId !== user.id) {
          return json({ error: "You are not assigned to this story" }, { status: 403 });
        }

        let body: any;
        try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, { status: 400 }); }

        const { title, excerpt, content, titleHi, excerptHi, contentHi, editorNote } = body;
        if (!title || !excerpt || !content) {
          return json({ error: "title, excerpt, content are required" }, { status: 400 });
        }

        // Create revision
        const revision = await (prisma as any).storyRevision.create({
          data: {
            storyId: story.id,
            title,
            excerpt,
            content,
            titleHi: titleHi || null,
            excerptHi: excerptHi || null,
            contentHi: contentHi || null,
            changedBy: user.id,
            version: story.version + 1,
            status: "pending",
            editorNote: editorNote || null,
          },
        });

        // Get editor profile
        const editorProfile = await (prisma as any).userProfile.findUnique({
          where: { id: user.id },
          select: { name: true },
        });

        // Notify all Admins and SuperAdmins
        const admins = await (prisma as any).userProfile.findMany({
          where: { role: { in: ["Admin", "SuperAdmin"] }, active: true },
          select: { id: true },
        });

        await Promise.all(
          admins.map((admin: any) =>
            (prisma as any).notification.create({
              data: {
                recipientId: admin.id,
                senderId: user.id,
                storyId: story.id,
                type: "REVISION_SUBMITTED",
                title: "Editor Submitted Revision",
                message: `${editorProfile?.name || "An editor"} submitted a revision for "${story.title}". Review and approve or request changes.`,
                priority: "high",
                actionUrl: `/admin/stories/${story.id}/revisions`,
              },
            })
          )
        );

        return json({ success: true, revision });
      },
    },
  },
});
