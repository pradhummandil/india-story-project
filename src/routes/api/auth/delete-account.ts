import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";

const db = prisma as any;

export const Route = createFileRoute("/api/auth/delete-account")({
  server: {
    handlers: {
      /**
       * POST /api/auth/delete-account
       * Wipes the reader's profile, statistics, bookmarks, comments, and stats records
       */
      POST: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          // Perform cascading deletes inside transactional logic
          await db.$transaction([
            db.bookmark.deleteMany({ where: { userId: user.id } }),
            db.storyLike.deleteMany({ where: { userId: user.id } }),
            db.readingProgress.deleteMany({ where: { userId: user.id } }),
            db.userBadge.deleteMany({ where: { userId: user.id } }),
            db.userStat.deleteMany({ where: { userId: user.id } }),
            db.commentLike?.deleteMany({ where: { userId: user.id } }) || Promise.resolve(),
            db.commentReport?.deleteMany({ where: { userId: user.id } }) || Promise.resolve(),
            db.comment.deleteMany({ where: { userId: user.id } }),
            db.follow.deleteMany({ where: { followerId: user.id } }),
            db.collectionStory.deleteMany({ where: { collection: { userId: user.id } } }),
            db.collection.deleteMany({ where: { userId: user.id } }),
            db.discussionPost.deleteMany({ where: { userId: user.id } }),
            db.discussionTopic.deleteMany({ where: { userId: user.id } }),
            db.userProfile.delete({ where: { id: user.id } }),
            db.profile.delete({ where: { id: user.id } }),
          ]);

          return json({ success: true, message: "Your profile has been wiped successfully." });
        } catch (e: any) {
          console.error("[Delete Account API] Error:", e);
          return json({ error: e.message || "Failed to wipe account records" }, { status: 500 });
        }
      },
    },
  },
});
