import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";

const db = prisma as any;

export const Route = createFileRoute("/api/community/topics/$id/posts")({
  server: {
    handlers: {
      GET: async ({ request: _request, params }) => {
        const { id } = params as { id: string };
        try {
          const posts = await db.discussionPost.findMany({
            where: { topicId: id, isSpam: false },
            orderBy: { createdAt: "asc" },
            include: {
              user: { select: { name: true, avatarUrl: true } },
              reactions: true,
            },
          });

          // Group reactions by emoji
          const postsWithGrouped = posts.map((post: any) => {
            const reactionGroups: Record<string, number> = {};
            for (const r of post.reactions) {
              reactionGroups[r.emoji] = (reactionGroups[r.emoji] ?? 0) + 1;
            }
            return { ...post, reactions: reactionGroups };
          });

          return json({ posts: postsWithGrouped });
        } catch (e: any) {
          console.error("[community/topics/$id/posts] GET error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },

      POST: async ({ request, params }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        const { id } = params as { id: string };
        try {
          const body = await request.json();
          const { content, parentId } = body ?? {};

          if (
            !content ||
            typeof content !== "string" ||
            content.trim().length < 1 ||
            content.trim().length > 5000
          ) {
            return json(
              { error: "Content must be between 1 and 5000 characters" },
              { status: 400 },
            );
          }

          // Verify topic exists and is not locked
          const topic = await db.discussionTopic.findUnique({ where: { id } });
          if (!topic) return json({ error: "Topic not found" }, { status: 404 });
          if (topic.isLocked) return json({ error: "This topic is locked" }, { status: 403 });

          const post = await db.discussionPost.create({
            data: {
              topicId: id,
              userId: user.id,
              content: content.trim(),
              parentId: parentId ?? null,
            },
            include: {
              user: { select: { name: true, avatarUrl: true } },
            },
          });

          // Extract @mentions and create UserMention records
          const mentionRegex = /@(\w+)/g;
          let match: RegExpExecArray | null;
          const mentionedNames: string[] = [];
          while ((match = mentionRegex.exec(content)) !== null) {
            mentionedNames.push(match[1]);
          }

          if (mentionedNames.length > 0) {
            try {
              const mentionedUsers = await db.userProfile.findMany({
                where: { name: { in: mentionedNames } },
                select: { id: true },
              });
              if (mentionedUsers.length > 0) {
                await Promise.all(
                  mentionedUsers.map((mu: any) =>
                    db.userMention
                      .create({
                        data: {
                          postId: post.id,
                          mentionedUserId: mu.id,
                          mentioningUserId: user.id,
                        },
                      })
                      .catch(() => {}),
                  ),
                );
              }
            } catch {
              // Non-critical: ignore mention errors
            }
          }

          // Update topic: increment replyCount, update lastActivityAt
          await db.discussionTopic.update({
            where: { id },
            data: {
              replyCount: { increment: 1 },
              lastActivityAt: new Date(),
            },
          });

          return json({ post }, { status: 201 });
        } catch (e: any) {
          console.error("[community/topics/$id/posts] POST error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
