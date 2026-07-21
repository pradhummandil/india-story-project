import { createFileRoute } from "@tanstack/react-router";
import { json, authenticate } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";

export const Route = createFileRoute("/api/comments/report")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const body = await request.json();
          const { commentId, reason } = body;

          if (!commentId || !reason?.trim()) {
            return json({ error: "commentId and reason are required" }, { status: 400 });
          }

          // Create UserProfile record if missing for this authenticated user
          let userProfile = await prisma.userProfile.findUnique({ where: { id: user.id } });
          if (!userProfile) {
            const existingProfile = await prisma.profile.findUnique({
              where: { id: user.id },
            });
            userProfile = await prisma.userProfile.create({
              data: {
                id: user.id,
                email: user.email ?? "",
                name: existingProfile?.fullName || user.user_metadata?.name || user.email?.split("@")[0] || "Contributor",
                avatarUrl: existingProfile?.avatarUrl || user.user_metadata?.avatar_url || null,
              },
            });
          }

          // Upsert comment report
          await prisma.commentReport.upsert({
            where: {
              commentId_userId: {
                commentId,
                userId: user.id,
              },
            },
            create: {
              commentId,
              userId: user.id,
              reason: reason.trim(),
            },
            update: {
              reason: reason.trim(),
            },
          });

          // Flags the comment for moderation
          await prisma.comment.update({
            where: { id: commentId },
            data: {
              status: "flagged",
            },
          });

          return json({ success: true });
        } catch (e: any) {
          console.error("[comments/report] POST error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
