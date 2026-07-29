import { createFileRoute } from "@tanstack/react-router";
import { json, authenticate, verifyAdmin } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";

/**
 * GET  /api/admin/stories/:id/assign  — get current assignment info + list of editors
 * POST /api/admin/stories/:id/assign  — assign an editor (Admin only)
 */
export const Route = createFileRoute("/api/admin/stories/assign/$id")({
  server: {
    handlers: {
      // ─── GET: return current assignedEditor + all available editors ──────
      GET: async ({ params, request }) => {
        const admin = await verifyAdmin(request);
        if (!admin) return json({ error: "Forbidden" }, { status: 403 });

        const [story, editors] = await Promise.all([
          prisma.story.findUnique({
            where: { id: params.id },
            select: {
              id: true,
              title: true,
              assignedEditorId: true,
              assignedEditor: {
                select: { id: true, name: true, email: true },
              },
            },
          }),
          (prisma as any).userProfile.findMany({
            where: { role: "Editor", active: true },
            select: { id: true, name: true, email: true },
            orderBy: { name: "asc" },
          }),
        ]);

        if (!story) return json({ error: "Story not found" }, { status: 404 });

        return json({
          assignedEditorId: story.assignedEditorId,
          assignedEditor: story.assignedEditor,
          editors,
        });
      },

      // ─── POST: assign an editor, create notification ─────────────────────
      POST: async ({ params, request }) => {
        const admin = await verifyAdmin(request);
        if (!admin) return json({ error: "Forbidden" }, { status: 403 });

        let body: any;
        try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, { status: 400 }); }

        const { editorId } = body;

        // Validate editor exists and has Editor role
        if (editorId) {
          const editor = await (prisma as any).userProfile.findFirst({
            where: { id: editorId, role: "Editor" },
            select: { id: true, name: true, email: true },
          });
          if (!editor) return json({ error: "Editor not found or not an Editor role" }, { status: 404 });
        }

        const story = await prisma.story.findUnique({
          where: { id: params.id },
          select: { id: true, title: true },
        });
        if (!story) return json({ error: "Story not found" }, { status: 404 });

        // Get admin profile for notification
        const adminProfile = await (prisma as any).userProfile.findUnique({
          where: { id: admin.id },
          select: { id: true, name: true },
        });

        // Update story assignment
        await prisma.story.update({
          where: { id: params.id },
          data: { assignedEditorId: editorId || null },
        });

        // Create notification for the editor
        if (editorId) {
          await (prisma as any).notification.create({
            data: {
              recipientId: editorId,
              senderId: admin.id,
              storyId: story.id,
              type: "ASSIGNMENT",
              title: "Story Assigned To You",
              message: `${adminProfile?.name || "Admin"} assigned you the story: "${story.title}". Open your Editor Workspace to begin editing.`,
              priority: "high",
              actionUrl: `/editor/stories/${story.id}`,
            },
          });
        }

        return json({ success: true, assignedEditorId: editorId || null });
      },
    },
  },
});
