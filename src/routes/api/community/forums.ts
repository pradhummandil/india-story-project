import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";

const db = prisma as any;

export const Route = createFileRoute("/api/community/forums")({
  server: {
    handlers: {
      GET: async ({ request: _request }) => {
        try {
          const [
            categories,
            pinned,
            trending,
            announcements,
            totalTopics,
            totalPosts,
            totalGroups,
            totalChallenges,
          ] = await Promise.all([
            // All active categories ordered by sortOrder, with topic counts
            db.discussionCategory.findMany({
              where: { isActive: true },
              orderBy: { sortOrder: "asc" },
              include: { _count: { select: { topics: true } } },
            }),

            // Top 5 pinned topics
            db.discussionTopic.findMany({
              where: { isPinned: true, isSpam: false },
              take: 5,
              orderBy: { lastActivityAt: "desc" },
              include: {
                user: { select: { name: true, avatarUrl: true } },
                category: { select: { name: true } },
              },
            }),

            // Top 10 trending topics
            db.discussionTopic.findMany({
              where: { isSpam: false },
              orderBy: [{ isTrending: "desc" }, { viewCount: "desc" }],
              take: 10,
              include: {
                user: { select: { name: true, avatarUrl: true } },
                category: { select: { name: true } },
              },
            }),

            // Active global announcements
            db.communityAnnouncement.findMany({
              where: {
                isGlobal: true,
                isActive: true,
                OR: [{ expiresAt: { gt: new Date() } }, { expiresAt: null }],
              },
              orderBy: { createdAt: "desc" },
              take: 5,
            }),

            // Stats counts
            db.discussionTopic.count({ where: { isSpam: false } }),
            db.discussionPost.count({ where: { isSpam: false } }),
            db.communityGroup.count({ where: { isActive: true } }),
            db.storyChallenge.count(),
          ]);

          return json({
            categories,
            pinned,
            trending,
            announcements,
            stats: {
              totalTopics,
              totalPosts,
              totalGroups,
              totalChallenges,
            },
          });
        } catch (e: any) {
          console.error("[community/forums] GET error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
