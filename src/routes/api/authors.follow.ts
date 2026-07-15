import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";

const db = prisma as any;

export const Route = createFileRoute("/api/authors/follow")({
  server: {
    handlers: {
      /**
       * GET /api/authors/follow?authorId=xxx
       * Check if the authenticated user follows this author.
       */
      GET: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ followed: false });

        const url = new URL(request.url);
        const authorId = url.searchParams.get("authorId");
        if (!authorId) {
          return json({ error: "authorId parameter is required" }, { status: 400 });
        }

        try {
          const follow = await db.follow.findUnique({
            where: {
              followerId_authorId: {
                followerId: user.id,
                authorId,
              },
            },
          });

          return json({ followed: !!follow });
        } catch {
          return json({ followed: false });
        }
      },

      /**
       * POST /api/authors/follow
       * Toggle follow status for an author.
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

        const { authorId } = body;
        if (!authorId) {
          return json({ error: "authorId is required" }, { status: 400 });
        }

        try {
          const existing = await db.follow.findUnique({
            where: {
              followerId_authorId: {
                followerId: user.id,
                authorId,
              },
            },
          });

          if (existing) {
            // Unfollow
            await db.follow.delete({
              where: {
                followerId_authorId: {
                  followerId: user.id,
                  authorId,
                },
              },
            });
            return json({ followed: false, message: "Unfollowed successfully" });
          } else {
            // Follow
            await db.follow.create({
              data: {
                followerId: user.id,
                authorId,
              },
            });
            return json({ followed: true, message: "Followed successfully" });
          }
        } catch (e: any) {
          return json({ error: e.message || "Failed to toggle follow status" }, { status: 500 });
        }
      },
    },
  },
});
