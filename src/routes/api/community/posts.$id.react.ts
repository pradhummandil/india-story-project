import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";

const db = prisma as any;

const ALLOWED_EMOJIS = ["👍", "❤️", "🔥", "💡", "🤔", "😂"];

export const Route = createFileRoute("/api/community/posts/$id/react")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        const { id } = params as { id: string };
        try {
          const body = await request.json();
          const { emoji } = body ?? {};

          if (!emoji || !ALLOWED_EMOJIS.includes(emoji)) {
            return json(
              { error: `Invalid emoji. Allowed: ${ALLOWED_EMOJIS.join(" ")}` },
              { status: 400 },
            );
          }

          // Check if post exists
          const post = await db.discussionPost.findUnique({ where: { id } });
          if (!post) return json({ error: "Post not found" }, { status: 404 });

          // Check for existing reaction
          const existing = await db.postReaction.findFirst({
            where: { postId: id, userId: user.id, emoji },
          });

          let added: boolean;
          if (existing) {
            // Toggle off
            await db.postReaction.delete({ where: { id: existing.id } });
            added = false;
          } else {
            // Toggle on
            await db.postReaction.create({
              data: { postId: id, userId: user.id, emoji },
            });
            added = true;
          }

          const totalReactions = await db.postReaction.count({ where: { postId: id } });

          return json({ added, emoji, totalReactions });
        } catch (e: any) {
          console.error("[community/posts/$id/react] POST error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
