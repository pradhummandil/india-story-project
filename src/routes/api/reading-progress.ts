import { createFileRoute } from "@tanstack/react-router";
import { json, authenticate } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";

export const Route = createFileRoute("/api/reading-progress")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        const url = new URL(request.url);
        const storyId = url.searchParams.get("storyId");

        if (!storyId) {
          // Return all progress records for the user
          try {
            const progressList = await prisma.readingProgress.findMany({
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
              orderBy: { lastReadAt: "desc" },
            });

            return json({
              progress: progressList.map((p) => ({
                id: p.id,
                storyId: p.storyId,
                progressPercent: p.progressPercent,
                scrollPosition: p.scrollPosition,
                completed: p.completed,
                lastReadAt: p.lastReadAt.toISOString(),
                story: {
                  id: p.storyId,
                  slug: (p as any).story?.slug || "",
                  title: (p as any).story?.title || "",
                  excerpt: (p as any).story?.excerpt || "",
                  themes: ((p as any).story?.themes || [])
                    .map((st: any) => st.theme?.name)
                    .filter(Boolean),
                  image: (p as any).story?.images?.[0]?.imageUrl || null,
                },
              })),
            });
          } catch (error) {
            console.error("[reading-progress] GET list error:", error);
            return json({ error: "Internal server error" }, { status: 500 });
          }
        }

        try {
          const progress = await prisma.readingProgress.findUnique({
            where: {
              userId_storyId: {
                userId: user.id,
                storyId,
              },
            },
            select: {
              progressPercent: true,
              scrollPosition: true,
              completed: true,
              lastReadAt: true,
            },
          });

          return json({ progress: progress ?? null });
        } catch (error: any) {
          console.error("[reading-progress] GET error:", error);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },

      POST: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const body = await request.json();
          const { storyId, progressPercent, scrollPosition, timeDelta } = body as {
            storyId: string;
            progressPercent: number;
            scrollPosition?: number;
            timeDelta?: number; // seconds spent reading in this session
          };

          if (!storyId || progressPercent === undefined) {
            return json({ error: "storyId and progressPercent are required" }, { status: 400 });
          }

          // Create UserProfile record if missing
          let userProfile = await prisma.userProfile.findUnique({ where: { id: user.id } });
          if (!userProfile) {
            userProfile = await prisma.userProfile.create({
              data: {
                id: user.id,
                email: user.email ?? "",
                name: user.user_metadata?.name || user.email?.split("@")[0] || "Contributor",
                avatarUrl: user.user_metadata?.avatar_url || null,
              },
            });
          }

          const completed = progressPercent >= 95;
          const scrollPos = scrollPosition ? Math.round(scrollPosition) : 0;

          // Upsert reading progress
          const progress = await prisma.readingProgress.upsert({
            where: {
              userId_storyId: {
                userId: user.id,
                storyId,
              },
            },
            update: {
              progressPercent,
              scrollPosition: scrollPos,
              completed,
              lastReadAt: new Date(),
            },
            create: {
              userId: user.id,
              storyId,
              progressPercent,
              scrollPosition: scrollPos,
              completed,
              lastReadAt: new Date(),
            },
          });

          // If time delta is passed, increment totalReadingTime and user stats
          const delta = timeDelta && timeDelta > 0 ? Math.min(timeDelta, 3600) : 0; // cap at 1 hour per session
          if (delta > 0) {
            await prisma.userProfile.update({
              where: { id: user.id },
              data: {
                totalReadingTime: { increment: delta },
                // Award XP based on reading time: +1 XP per 10 seconds of reading
                totalXP: { increment: Math.floor(delta / 10) },
              },
            });

            await prisma.userStat.upsert({
              where: { userId: user.id },
              create: {
                userId: user.id,
                totalReadingTime: delta,
                totalXP: Math.floor(delta / 10),
                storiesRead: completed ? 1 : 0,
              },
              update: {
                totalReadingTime: { increment: delta },
                totalXP: { increment: Math.floor(delta / 10) },
                ...(completed ? { storiesRead: { increment: 1 } } : {}),
              },
            });
          }

          return json({ progress });
        } catch (error: any) {
          console.error("[reading-progress] POST error:", error);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
