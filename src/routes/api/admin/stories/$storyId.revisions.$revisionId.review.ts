import { createFileRoute } from "@tanstack/react-router";
import { json, verifyAdmin } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";

/**
 * POST /api/admin/stories/:storyId/revisions/:revisionId/review
 * Body: { action: "approve" | "reject" | "request_changes", adminNote?: string }
 */
export const Route = createFileRoute("/api/admin/stories/$storyId/revisions/$revisionId/review")({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        const admin = await verifyAdmin(request);
        if (!admin) return json({ error: "Forbidden" }, { status: 403 });

        let body: any;
        try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, { status: 400 }); }

        const { action, adminNote } = body as {
          action: "approve" | "reject" | "request_changes";
          adminNote?: string;
        };

        if (!["approve", "reject", "request_changes"].includes(action)) {
          return json({ error: "Invalid action. Must be approve | reject | request_changes" }, { status: 400 });
        }

        // Load the revision
        const revision = await (prisma as any).storyRevision.findUnique({
          where: { id: params.revisionId },
          include: {
            story: { select: { id: true, title: true, version: true, assignedEditorId: true } },
            editor: { select: { id: true, name: true } },
          },
        });
        if (!revision) return json({ error: "Revision not found" }, { status: 404 });
        if (revision.storyId !== params.storyId) return json({ error: "Revision does not belong to this story" }, { status: 400 });

        // Get admin profile
        const adminProfile = await (prisma as any).userProfile.findUnique({
          where: { id: admin.id },
          select: { name: true },
        });

        if (action === "approve") {
          // Replace story content with revision + bump version + publish
          await prisma.story.update({
            where: { id: params.storyId },
            data: {
              title: revision.title,
              excerpt: revision.excerpt,
              content: revision.content,
              titleHi: revision.titleHi ?? undefined,
              excerptHi: revision.excerptHi ?? undefined,
              contentHi: revision.contentHi ?? undefined,
              version: { increment: 1 },
              status: "Published",
              publishedAt: new Date(),
            },
          });

          // Mark revision as approved
          await (prisma as any).storyRevision.update({
            where: { id: revision.id },
            data: { status: "approved", adminNote: adminNote || null },
          });

          // Notify editor
          if (revision.editor?.id) {
            await (prisma as any).notification.create({
              data: {
                recipientId: revision.editor.id,
                senderId: admin.id,
                storyId: params.storyId,
                type: "REVISION_APPROVED",
                title: "Revision Approved & Published!",
                message: `${adminProfile?.name || "Admin"} approved your revision for "${revision.story.title}". The story is now live.`,
                priority: "high",
                actionUrl: `/stories/${revision.story.title}`,
              },
            });
          }

          return json({ success: true, action: "approved", storyPublished: true });
        }

        if (action === "reject") {
          await (prisma as any).storyRevision.update({
            where: { id: revision.id },
            data: { status: "rejected", adminNote: adminNote || null },
          });

          if (revision.editor?.id) {
            await (prisma as any).notification.create({
              data: {
                recipientId: revision.editor.id,
                senderId: admin.id,
                storyId: params.storyId,
                type: "REVISION_REJECTED",
                title: "Revision Rejected",
                message: `${adminProfile?.name || "Admin"} rejected your revision for "${revision.story.title}".${adminNote ? ` Reason: ${adminNote}` : ""}`,
                priority: "normal",
                actionUrl: `/editor/stories/${params.storyId}`,
              },
            });
          }

          return json({ success: true, action: "rejected" });
        }

        // request_changes
        await (prisma as any).storyRevision.update({
          where: { id: revision.id },
          data: { status: "changes_requested", adminNote: adminNote || null },
        });

        if (revision.editor?.id) {
          await (prisma as any).notification.create({
            data: {
              recipientId: revision.editor.id,
              senderId: admin.id,
              storyId: params.storyId,
              type: "REVISION_CHANGES_REQUESTED",
              title: "Changes Requested",
              message: `${adminProfile?.name || "Admin"} requested changes on your revision for "${revision.story.title}".${adminNote ? ` Note: ${adminNote}` : ""}`,
              priority: "high",
              actionUrl: `/editor/stories/${params.storyId}`,
            },
          });
        }

        return json({ success: true, action: "changes_requested" });
      },
    },
  },
});
