import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";

const db = prisma as any;

const ALLOWED_REASONS = ["spam", "hate", "harassment", "misinformation", "other"];

export const Route = createFileRoute("/api/community/posts/$id/report")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        const { id } = params as { id: string };
        try {
          const body = await request.json();
          const { reason, details } = body ?? {};

          if (!reason || !ALLOWED_REASONS.includes(reason)) {
            return json(
              { error: `Invalid reason. Allowed: ${ALLOWED_REASONS.join(", ")}` },
              { status: 400 }
            );
          }

          const post = await db.discussionPost.findUnique({ where: { id } });
          if (!post) return json({ error: "Post not found" }, { status: 404 });

          // Upsert: one report per user per post
          await db.postReport.upsert({
            where: { postId_userId: { postId: id, userId: user.id } },
            create: {
              postId: id,
              userId: user.id,
              reason,
              details: details ?? null,
            },
            update: {
              reason,
              details: details ?? null,
            },
          });

          // Get updated report count
          const reportCount = await db.postReport.count({ where: { postId: id } });

          // Update reportCount on post
          const updatedPost = await db.discussionPost.update({
            where: { id },
            data: {
              reportCount,
              // Auto-spam if threshold reached
              ...(reportCount >= 5 ? { isSpam: true } : {}),
            },
          });

          return json({ reported: true, reportCount: updatedPost.reportCount });
        } catch (e: any) {
          console.error("[community/posts/$id/report] POST error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
