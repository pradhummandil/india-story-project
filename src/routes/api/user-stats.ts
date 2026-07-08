import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";
import { supabase } from "@/lib/supabase-client";

async function authenticate(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.substring(7);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export const Route = createFileRoute("/api/user-stats")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        // Route sub-paths: /api/user-stats/me vs /api/user-stats
        const pathParts = url.pathname.split("/").filter(Boolean);
        const isMe = pathParts[pathParts.length - 1] === "me";

        if (isMe) {
          // Authenticated: return current user's stats
          const user = await authenticate(request);
          if (!user) return json({ error: "Unauthorized" }, { status: 401 });

          try {
            const userStat = await prisma.userStat.findFirst({
              where: { userId: user.id },
            });

            // Count badges — field may not exist; guard with try/catch
            let badgeCount = 0;
            try {
              badgeCount = await (prisma as any).userBadge.count({
                where: { userId: user.id },
              });
            } catch {
              badgeCount = 0;
            }

            const userProfile = await prisma.userProfile.findUnique({
              where: { id: user.id },
              select: { name: true, avatarUrl: true, level: true, totalXP: true },
            }).catch(() => null);

            return json({
              userStat: userStat ?? null,
              badgeCount,
              userProfile,
            });
          } catch (error: any) {
            console.error("[user-stats/me] GET error:", error);
            if (error?.code === "P2021" || error?.message?.includes("does not exist")) {
              return json({ leaderboard: [] });
            }
            return json({ error: "Internal server error" }, { status: 500 });
          }
        }

        // Public leaderboard
        try {
          const stats = await prisma.userStat.findMany({
            orderBy: { totalXP: "desc" },
            take: 20,
          });

          const leaderboard = await Promise.all(
            stats.map(async (stat, index) => {
              const profile = await prisma.userProfile
                .findUnique({
                  where: { id: stat.userId },
                  select: { name: true, avatarUrl: true },
                })
                .catch(() => null);

              return {
                rank: index + 1,
                userId: stat.userId,
                name: profile?.name ?? "Anonymous",
                avatarUrl: profile?.avatarUrl ?? null,
                totalXP: stat.totalXP,
                level: stat.level,
                readingStreak: stat.readingStreak,
                storiesRead: stat.storiesRead,
              };
            })
          );

          return json({ leaderboard });
        } catch (error: any) {
          console.error("[user-stats] GET error:", error);
          if (error?.code === "P2021" || error?.message?.includes("does not exist")) {
            return json({ leaderboard: [] });
          }
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
