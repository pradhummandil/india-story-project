import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&auto=format&fit=crop";

export const Route = createFileRoute("/api/hero-slides")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const slideSelect = {
            id: true,
            slug: true,
            title: true,
            excerpt: true,
            titleHi: true,
            excerptHi: true,
            readingTime: true,
            themes: {
              select: {
                theme: { select: { name: true } },
              },
            },
            state: { select: { name: true } },
            author: { select: { name: true } },
            images: {
              orderBy: [{ heroImage: "desc" as const }, { sortOrder: "asc" as const }],
              select: { imageUrl: true, heroImage: true },
              take: 1,
            },
          };

          // Fetch Hero of the Day
          const heroStory = await prisma.story.findFirst({
            where: {
              heroOfTheDay: true,
              status: "Published",
              deleted: false,
            },
            select: slideSelect,
          });

          // Fetch stories marked for slideshow
          const slideshowStories = await prisma.story.findMany({
            where: {
              homepageSlideshow: true,
              status: "Published",
              deleted: false,
              heroOfTheDay: false,
            },
            orderBy: { slideshowOrder: "asc" },
            select: slideSelect,
          });

          const activeStories = [];
          if (heroStory) {
            activeStories.push(heroStory);
          }
          activeStories.push(...slideshowStories);

          if (activeStories.length === 0) {
            const fallbackStories = await prisma.story.findMany({
              where: {
                status: "Published",
                deleted: false,
                featured: false,
                heroOfTheDay: false,
              },
              orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
              take: 5,
              select: slideSelect,
            });
            activeStories.push(...fallbackStories);
          }

          const slides = activeStories.map((s: any) => {
            const heroImage = s.images?.[0]?.imageUrl ?? FALLBACK_IMAGE;
            return {
              id: s.id,
              storyId: s.id,
              slug: s.slug,
              title: s.title,
              excerpt: s.excerpt,
              titleHi: s.titleHi ?? null,
              excerptHi: s.excerptHi ?? null,
              themes: s.themes?.map((t: any) => t.theme?.name).filter(Boolean) ?? [],
              state: s.state?.name ?? null,
              author: s.author?.name ?? null,
              readingTime: s.readingTime,
              image: heroImage,
              caption: null,
            };
          });

          return json({ slides });
        } catch (error: any) {
          console.error("[hero-slides] GET error:", error);
          return json({ slides: [] });
        }
      },
    },
  },
});
