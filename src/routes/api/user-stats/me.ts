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
          const userStat = await prisma.userStat.findUnique({
            where: { userId: user.id },
          });

          let badgeCount = 0;
          try {
            badgeCount = await (prisma as any).userBadge.count({
              where: { userId: user.id },
            });
          } catch {
            badgeCount = 0;
          }

          const userProfile = await prisma.userProfile
            .findUnique({
              where: { id: user.id },
              select: { name: true, avatarUrl: true, level: true, totalXP: true },
            })
            .catch(() => null);

          // Build response stats — use userStat if available, else return zeros
          const stats = userStat
            ? {
                storiesRead: userStat.storiesRead,
                storiesLiked: userStat.storiesLiked,
                bookmarksCount: userStat.bookmarksCount,
                readingStreak: userStat.readingStreak,
                longestStreak: userStat.longestStreak,
                totalXP: userStat.totalXP,
                level: userStat.level,
                weeklyXP: userStat.weeklyXP,
                monthlyXP: userStat.monthlyXP,
              }
            : null;

          return json({ stats, badgeCount, userProfile });
        } catch (e: any) {
          console.error("[user-stats/me] error:", e);
          if (e?.code === "P2021" || e?.message?.includes("does not exist")) {
            return json({ stats: null, badgeCount: 0, userProfile: null });
          }
          return json({ error: "Server error" }, { status: 500 });
        }
      },
    },
  },
});
