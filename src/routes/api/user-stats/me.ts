import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";
import { supabase } from "@/lib/supabase-client";

export const Route = createFileRoute("/api/user-stats/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return json({ error: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.substring(7);

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser(token);
        if (authError || !user) {
          return json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
          // Lazily create UserProfile if missing
          let userProfile = await prisma.userProfile.findUnique({
            where: { id: user.id },
          });
          if (!userProfile) {
            userProfile = await prisma.userProfile.create({
              data: {
                id: user.id,
                email: user.email ?? "",
                name: user.user_metadata?.name || user.email?.split("@")[0] || "Contributor",
                avatarUrl: user.user_metadata?.avatar_url || null,
                bio: user.user_metadata?.bio || null,
                website: user.user_metadata?.website || null,
                twitter: user.user_metadata?.twitter || null,
                instagram: user.user_metadata?.instagram || null,
                linkedin: user.user_metadata?.linkedin || null,
              },
            });
          }

          // Lazily create UserStat if missing
          let userStat = await prisma.userStat.findUnique({
            where: { userId: user.id },
          });
          if (!userStat) {
            userStat = await prisma.userStat.create({
              data: {
                userId: user.id,
                totalXP: userProfile.totalXP || 0,
                level: userProfile.level || 1,
              },
            });
          }

          let badgeCount = 0;
          let commentsCount = 0;
          let submissionsCount = 0;
          let bookmarksCount = 0;
          let likesCount = 0;
          let continueCount = 0;
          let historyCount = 0;

          try {
            const [badgeC, commentsC, submissionsC, bookmarksC, likesC, continueC, historyC] =
              await Promise.all([
                prisma.userBadge.count({ where: { userId: user.id } }).catch(() => 0),
                prisma.comment.count({ where: { userId: user.id } }).catch(() => 0),
                prisma.submittedStory.count({ where: { userId: user.id } }).catch(() => 0),
                prisma.bookmark.count({ where: { userId: user.id } }).catch(() => 0),
                prisma.storyLike.count({ where: { userId: user.id } }).catch(() => 0),
                prisma.readingProgress
                  .count({
                    where: { userId: user.id, completed: false, progressPercent: { gt: 0 } },
                  })
                  .catch(() => 0),
                prisma.readingProgress.count({ where: { userId: user.id } }).catch(() => 0),
              ]);

            badgeCount = badgeC;
            commentsCount = commentsC;
            submissionsCount = submissionsC;
            bookmarksCount = bookmarksC;
            likesCount = likesC;
            continueCount = continueC;
            historyCount = historyC;
          } catch (err) {
            console.error("Error fetching sub counts in me.ts:", err);
          }

          return json({
            stats: userStat,
            badgeCount,
            userProfile,
            commentsCount,
            submissionsCount,
            bookmarksCount,
            likesCount,
            continueCount,
            historyCount,
          });
        } catch (e: any) {
          console.error("[user-stats/me] error:", e);
          if (e?.code === "P2021" || e?.message?.includes("does not exist")) {
            return json({
              stats: null,
              badgeCount: 0,
              userProfile: null,
              commentsCount: 0,
              submissionsCount: 0,
              bookmarksCount: 0,
              likesCount: 0,
              continueCount: 0,
              historyCount: 0,
            });
          }
          return json({ error: "Server error" }, { status: 500 });
        }
      },
    },
  },
});
