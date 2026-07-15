import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";

const db = prisma as any;

async function isAdmin(userId: string): Promise<boolean> {
  try {
    const profile = await db.userProfile.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    return profile && ["SuperAdmin", "Admin", "Editor"].includes(profile.role);
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/api/community/topics/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { id } = params as { id: string };
        try {
          const topic = await db.discussionTopic.findUnique({
            where: { id },
            include: {
              user: { select: { name: true, avatarUrl: true } },
              category: { select: { name: true, slug: true, icon: true, color: true } },
              posts: {
                where: { isSpam: false },
                orderBy: { createdAt: "asc" },
                include: {
                  user: { select: { name: true, avatarUrl: true } },
                  reactions: true,
                  reports: { select: { id: true } },
                },
              },
            },
          });

          if (!topic) return json({ error: "Topic not found" }, { status: 404 });

          // Increment view count (fire and forget)
          db.discussionTopic.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
          }).catch(() => {});

          // Group reactions by emoji for each post
          const topicWithGroupedReactions = {
            ...topic,
            posts: topic.posts.map((post: any) => {
              const reactionGroups: Record<string, number> = {};
              for (const r of post.reactions) {
                reactionGroups[r.emoji] = (reactionGroups[r.emoji] ?? 0) + 1;
              }
              return {
                ...post,
                reactions: reactionGroups,
                reportCount: post.reports.length,
                reports: undefined,
              };
            }),
          };

          return json({ topic: topicWithGroupedReactions });
        } catch (e: any) {
          console.error("[community/topics/$id] GET error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },

      PATCH: async ({ request, params }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        const { id } = params as { id: string };
        try {
          const topic = await db.discussionTopic.findUnique({ where: { id } });
          if (!topic) return json({ error: "Topic not found" }, { status: 404 });

          const canEdit = topic.userId === user.id || (await isAdmin(user.id));
          if (!canEdit) return json({ error: "Forbidden" }, { status: 403 });

          const body = await request.json();
          const data: any = {};
          if (body.title?.trim()) data.title = body.title.trim();
          if (body.content?.trim()) data.content = body.content.trim();

          const updated = await db.discussionTopic.update({ where: { id }, data });
          return json({ topic: updated });
        } catch (e: any) {
          console.error("[community/topics/$id] PATCH error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },

      DELETE: async ({ request, params }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        const { id } = params as { id: string };
        try {
          const topic = await db.discussionTopic.findUnique({ where: { id } });
          if (!topic) return json({ error: "Topic not found" }, { status: 404 });

          const canDelete = topic.userId === user.id || (await isAdmin(user.id));
          if (!canDelete) return json({ error: "Forbidden" }, { status: 403 });

          await db.discussionTopic.delete({ where: { id } });
          return json({ success: true });
        } catch (e: any) {
          console.error("[community/topics/$id] DELETE error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
