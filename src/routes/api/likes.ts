import { createFileRoute } from "@tanstack/react-router";
import { json, authenticate } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";
import { awardXPAndSyncStats } from "@/lib/level-system.server";

export const Route = createFileRoute("/api/likes")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const storyId = url.searchParams.get("storyId");

        if (!storyId) {
          // Return list of stories liked by the logged-in user
          const user = await authenticate(request);
          if (!user) return json({ error: "Unauthorized" }, { status: 401 });

          try {
            const likes = await prisma.storyLike.findMany({
              where: { userId: user.id },
              include: {
                story: {
                  include: {
                    images: true,
                    state: true,
                    themes: { select: { theme: { select: { name: true } } } },
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            });

            return json({
              likes: likes.map((l) => ({
                id: l.id,
                storyId: l.storyId,
                createdAt: l.createdAt.toISOString(),
                story: {
                  id: l.storyId,
                  slug: (l as any).story?.slug || "",
                  title: (l as any).story?.title || "",
                  excerpt: (l as any).story?.excerpt || "",
                  themes: ((l as any).story?.themes || [])
                    .map((st: any) => st.theme?.name)
                    .filter(Boolean),
                  image: (l as any).story?.images?.[0]?.imageUrl || null,
                },
              })),
            });
          } catch (error) {
            console.error("[likes] GET user likes error:", error);
            return json({ error: "Internal server error" }, { status: 500 });
          }
        }

        try {
          const count = await prisma.storyLike.count({ where: { storyId } });

          // Optionally check if current user liked it
          const user = await authenticate(request);
          let liked = false;

          if (user) {
            const existing = await prisma.storyLike.findFirst({
              where: { userId: user.id, storyId },
            });
            liked = !!existing;
          }

          return json({ liked, count });
        } catch (error: any) {
          console.error("[likes] GET error:", error);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },

      POST: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const body = await request.json();
          const { storyId } = body as { storyId: string };

          if (!storyId) {
            return json({ error: "storyId is required" }, { status: 400 });
          }

          // Create UserProfile record if missing
          let userProfile = await prisma.userProfile.findUnique({ where: { id: user.id } });
          if (!userProfile) {
            const existingProfile = await prisma.profile.findUnique({
              where: { id: user.id },
            });
            userProfile = await prisma.userProfile.create({
              data: {
                id: user.id,
                email: user.email ?? "",
                name: existingProfile?.fullName || user.user_metadata?.name || user.email?.split("@")[0] || "Contributor",
                avatarUrl: existingProfile?.avatarUrl || user.user_metadata?.avatar_url || null,
              },
            });
          }

          // Toggle: delete if exists, create if not
          const existing = await prisma.storyLike.findFirst({
            where: { userId: user.id, storyId },
          });

          if (existing) {
            await prisma.storyLike.delete({ where: { id: existing.id } });
          } else {
            await prisma.storyLike.create({
              data: { userId: user.id, storyId },
            });
          }

          // Update user stat
          const liked = !existing;
          await awardXPAndSyncStats({
            userId: user.id,
            xpDelta: 0,
            incrementStoriesLiked: liked ? 1 : -1,
          });

          const count = await prisma.storyLike.count({ where: { storyId } });

          return json({ liked, count });
        } catch (error: any) {
          console.error("[likes] POST error:", error);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
