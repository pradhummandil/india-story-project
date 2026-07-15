import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate, sanitizeInput } from "@/routes/api/-_utils";

const db = prisma as any;

export const Route = createFileRoute("/api/community")({
  server: {
    handlers: {
      GET: async () => {
        try {
          // 1. Fetch top 10 users for leaderboard
          const topUsers = await db.userStat.findMany({
            take: 10,
            orderBy: { totalXP: "desc" },
            include: {
              user: {
                select: { id: true, name: true, avatarUrl: true, level: true },
              },
            },
          });

          const leaderboard = topUsers.map((tu: any) => ({
            userId: tu.userId,
            name: tu.user?.name || "Anonymous Reader",
            avatarUrl: tu.user?.avatarUrl,
            totalXP: tu.totalXP,
            level: tu.level,
            streak: tu.readingStreak,
          }));

          // 2. Fetch discussion topics
          const topics = await db.discussionTopic.findMany({
            orderBy: { createdAt: "desc" },
            take: 20,
            include: {
              user: { select: { name: true, avatarUrl: true } },
              posts: { select: { id: true } },
            },
          });

          const mappedTopics = topics.map((t: any) => ({
            id: t.id,
            title: t.title,
            content: t.content,
            authorName: t.user?.name || "Community Member",
            authorAvatar: t.user?.avatarUrl,
            repliesCount: t.posts.length,
            createdAt: t.createdAt.toISOString(),
          }));

          return json({
            leaderboard,
            topics: mappedTopics,
          });
        } catch (e: any) {
          return json({ error: e.message || "Failed to load community data" }, { status: 500 });
        }
      },

      /**
       * POST /api/community
       * Create a new discussion topic
       */
      POST: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        let body: any;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const title = sanitizeInput(body.title);
        const content = sanitizeInput(body.content);
        if (!title || !content) {
          return json({ error: "Title and Content are required fields." }, { status: 400 });
        }

        try {
          const topic = await db.discussionTopic.create({
            data: {
              title,
              content,
              userId: user.id,
            },
          });

          // Award 20 XP for starting a discussion
          await db.userStat.updateMany({
            where: { userId: user.id },
            data: { totalXP: { increment: 20 } },
          });

          return json({ success: true, topic });
        } catch (e: any) {
          return json({ error: e.message || "Failed to create discussion topic" }, { status: 500 });
        }
      },
    },
  },
});
