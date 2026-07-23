import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";
import { userInterestService } from "@/lib/services/user-interest.service";

const db = prisma as any;

export const Route = createFileRoute("/api/authors/follow")({
  server: {
    handlers: {
      /**
       * GET /api/authors/follow?authorId=xxx&themeId=yyy&stateName=zzz
       * Check if the authenticated user follows an author, theme, or state.
       */
      GET: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ followed: false });

        const url = new URL(request.url);
        const authorId = url.searchParams.get("authorId");
        const themeId = url.searchParams.get("themeId");
        const stateName = url.searchParams.get("stateName");

        try {
          const follow = await db.follow.findFirst({
            where: {
              followerId: user.id,
              ...(authorId ? { authorId } : {}),
              ...(themeId ? { themeId } : {}),
              ...(stateName ? { stateName } : {}),
            },
          });

          return json({ followed: !!follow });
        } catch {
          return json({ followed: false });
        }
      },

      /**
       * POST /api/authors/follow
       * Toggle follow status for an author, theme, or state.
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

        const { authorId, themeId, stateName } = body;
        if (!authorId && !themeId && !stateName) {
          return json({ error: "authorId, themeId, or stateName is required" }, { status: 400 });
        }

        try {
          const existing = await db.follow.findFirst({
            where: {
              followerId: user.id,
              ...(authorId ? { authorId } : {}),
              ...(themeId ? { themeId } : {}),
              ...(stateName ? { stateName } : {}),
            },
          });

          if (existing) {
            // Unfollow
            await db.follow.delete({
              where: { id: existing.id },
            });
            return json({ followed: false, message: "Unfollowed successfully" });
          } else {
            // Follow
            const newFollow = await db.follow.create({
              data: {
                followerId: user.id,
                authorId: authorId || undefined,
                themeId: themeId || undefined,
                stateName: stateName || undefined,
              },
            });

            // Create notification for follow confirmation
            const entityName = authorId ? "Author" : themeId ? "Theme" : `State (${stateName})`;
            await db.notification.create({
              data: {
                userId: user.id,
                type: "FOLLOW",
                title: `Now Following ${entityName}`,
                content: `You will now receive automatic updates and recommendations whenever stories are published for this ${entityName.toLowerCase()}.`,
              },
            }).catch(() => {});

            // Update user recommendation weights for homepage personalization
            await userInterestService.trackInteraction(user.id, "LIKE", {
              targetId: authorId || undefined,
              themeId: themeId || undefined,
              stateName: stateName || undefined,
            });

            return json({ followed: true, follow: newFollow, message: "Followed successfully" });
          }
        } catch (e: any) {
          console.error("Follow error:", e);
          return json({ error: e.message || "Failed to toggle follow status" }, { status: 500 });
        }
      },
    },
  },
});
