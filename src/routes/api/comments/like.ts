import { createFileRoute } from "@tanstack/react-router";
import { json, authenticate } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";

export const Route = createFileRoute("/api/comments/like")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const body = await request.json();
          const { commentId } = body;

          if (!commentId) {
            return json({ error: "commentId is required" }, { status: 400 });
          }

          // Create UserProfile record if missing for this authenticated user
          let userProfile = await prisma.userProfile.findUnique({ where: { id: user.id } });
          if (!userProfile) {
            userProfile = await prisma.userProfile.create({
              data: {
                id: user.id,
                email: user.email ?? "",
                name: user.user_metadata?.name || user.email?.split("@")[0] || "Contributor",
                avatarUrl: user.user_metadata?.avatar_url || null,
              },
            });
          }

          // Check if like exists
          const existing = await prisma.commentLike.findUnique({
            where: {
              commentId_userId: {
                commentId,
                userId: user.id,
              },
            },
          });

          let liked = false;
          if (existing) {
            await prisma.commentLike.delete({
              where: { id: existing.id },
            });
          } else {
            await prisma.commentLike.create({
              data: {
                commentId,
                userId: user.id,
              },
            });
            liked = true;
          }

          const count = await prisma.commentLike.count({
            where: { commentId },
          });

          return json({ liked, count });
        } catch (e: any) {
          console.error("[comments/like] POST error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
