import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate, sanitizeInput } from "@/routes/api/-_utils";

const db = prisma as any;

export const Route = createFileRoute("/api/community/post")({
  server: {
    handlers: {
      /**
       * GET /api/community/post?topicId=xxx
       * Fetch all replies for a topic
       */
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const topicId = url.searchParams.get("topicId");
        if (!topicId) {
          return json({ error: "topicId parameter is required" }, { status: 400 });
        }

        try {
          const posts = await db.discussionPost.findMany({
            where: { topicId },
            orderBy: { createdAt: "asc" },
            include: {
              user: { select: { name: true, avatarUrl: true, level: true } },
            },
          });

          const results = posts.map((p: any) => ({
            id: p.id,
            content: p.content,
            authorName: p.user?.name || "Community Member",
            authorAvatar: p.user?.avatarUrl,
            authorLevel: p.user?.level || 1,
            createdAt: p.createdAt.toISOString(),
          }));

          return json(results);
        } catch (e: any) {
          return json({ error: e.message || "Failed to load posts" }, { status: 500 });
        }
      },

      /**
       * POST /api/community/post
       * Post a new reply to a discussion topic
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

        const { topicId } = body;
        const content = sanitizeInput(body.content);
        if (!topicId || !content) {
          return json({ error: "topicId and content are required fields." }, { status: 400 });
        }

        try {
          const post = await db.discussionPost.create({
            data: {
              topicId,
              content,
              userId: user.id,
            },
          });

          // Award 5 XP for contributing a reply
          await db.userStat.updateMany({
            where: { userId: user.id },
            data: { totalXP: { increment: 5 } },
          });

          return json({ success: true, post });
        } catch (e: any) {
          return json({ error: e.message || "Failed to add post" }, { status: 500 });
        }
      },
    },
  },
});
