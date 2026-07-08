import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, verifyAdmin } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/admin/comments")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const admin = await verifyAdmin(request);
        if (!admin) {
          return json({ error: "Forbidden" }, { status: 403 });
        }

        const url = new URL(request.url);
        const filter = url.searchParams.get("filter") || "all";

        try {
          if (filter === "flagged") {
            // Fetch comment reports
            const reports = await prisma.commentReport.findMany({
              include: {
                comment: {
                  include: {
                    user: { select: { name: true, email: true } },
                    story: { select: { title: true, slug: true } },
                  },
                },
                user: { select: { name: true, email: true } },
              },
              orderBy: { createdAt: "desc" },
            });
            return json({
              reports: reports.map((r) => ({
                id: r.id,
                reason: r.reason,
                createdAt: r.createdAt.toISOString(),
                reporterName: r.user?.name || "Anonymous",
                reporterEmail: r.user?.email || "",
                commentId: r.commentId,
                commentContent: r.comment?.content || "",
                commentAuthor: r.comment?.user?.name || "Unknown",
                storyTitle: r.comment?.story?.title || "",
              })),
            });
          }

          // List comments
          const whereClause: any = {};
          if (filter === "pending") whereClause.status = "pending";
          if (filter === "approved") whereClause.status = "approved";
          if (filter === "rejected") whereClause.status = "rejected";

          const comments = await prisma.comment.findMany({
            where: whereClause,
            include: {
              user: { select: { name: true, email: true, avatarUrl: true } },
              story: { select: { title: true, slug: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 100,
          });

          return json({
            comments: comments.map((c) => ({
              id: c.id,
              content: c.content,
              status: c.status,
              createdAt: c.createdAt.toISOString(),
              authorName: c.user?.name || "Anonymous",
              authorEmail: c.user?.email || "",
              authorAvatar: c.user?.avatarUrl || "",
              storyTitle: c.story?.title || "",
              storySlug: c.story?.slug || "",
            })),
          });
        } catch (e: any) {
          return json({ error: e.message || "Failed to load admin comments" }, { status: 500 });
        }
      },

      POST: async ({ request }) => {
        const admin = await verifyAdmin(request);
        if (!admin) {
          return json({ error: "Forbidden" }, { status: 403 });
        }

        try {
          const body = await request.json();
          const { commentId, action, reportId } = body;

          if (!commentId && !reportId) {
            return json({ error: "commentId or reportId is required" }, { status: 400 });
          }

          if (reportId && action === "dismissReport") {
            await prisma.commentReport.delete({ where: { id: reportId } });
            return json({ success: true });
          }

          if (commentId) {
            if (action === "approve") {
              await prisma.comment.update({
                where: { id: commentId },
                data: { status: "approved" },
              });
            } else if (action === "reject") {
              await prisma.comment.update({
                where: { id: commentId },
                data: { status: "rejected" },
              });
            } else if (action === "delete") {
              // Soft delete by clearing text content
              await prisma.comment.update({
                where: { id: commentId },
                data: { content: "[This comment was removed by moderators]", status: "rejected" },
              });
            }
            return json({ success: true });
          }

          return json({ error: "Invalid action" }, { status: 400 });
        } catch (e: any) {
          return json({ error: e.message || "Failed to moderate comment" }, { status: 500 });
        }
      },
    },
  },
});
