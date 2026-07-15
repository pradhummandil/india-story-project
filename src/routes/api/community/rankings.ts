import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";

const db = prisma as any;

export const Route = createFileRoute("/api/community/rankings")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const tab = url.searchParams.get("tab") ?? "global";

          let rankings: any[] = [];

          switch (tab) {
            case "weekly": {
              rankings = await db.userStat.findMany({
                orderBy: { weeklyXP: "desc" },
                take: 50,
                include: {
                  user: { select: { name: true, avatarUrl: true, level: true } },
                },
              });
              break;
            }

            case "monthly": {
              rankings = await db.userStat.findMany({
                orderBy: { monthlyXP: "desc" },
                take: 50,
                include: {
                  user: { select: { name: true, avatarUrl: true, level: true } },
                },
              });
              break;
            }

            case "writers": {
              // Authors ordered by viewCount (sum of stories)
              rankings = await db.author.findMany({
                orderBy: { viewCount: "desc" },
                take: 50,
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                  viewCount: true,
                  slug: true,
                },
              });
              break;
            }

            case "commenters": {
              // Aggregate comment count per user
              const grouped = await db.comment.groupBy({
                by: ["userId"],
                _count: { id: true },
                orderBy: { _count: { id: "desc" } },
                take: 50,
              });

              const userIds = grouped.map((g: any) => g.userId);
              const users = await db.userProfile.findMany({
                where: { id: { in: userIds } },
                select: { id: true, name: true, avatarUrl: true, level: true, totalXP: true },
              });

              const userMap = new Map(users.map((u: any) => [u.id, u]));
              rankings = grouped.map((g: any) => {
                const u = userMap.get(g.userId) || {};
                return {
                  ...u,
                  commentCount: g._count.id,
                };
              });
              break;
            }

            default: // global
              rankings = await db.userProfile.findMany({
                orderBy: { totalXP: "desc" },
                take: 50,
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                  totalXP: true,
                  level: true,
                  readingStreak: true,
                  userBadges: {
                    include: {
                      badge: { select: { name: true, icon: true, color: true } },
                    },
                    take: 5,
                  },
                },
              });
          }

          return json({ rankings, tab });
        } catch (e: any) {
          console.error("[community/rankings] GET error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
