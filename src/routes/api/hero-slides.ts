import { createFileRoute } from "@tanstack/react-router";
import { json, fetchStoriesBackup } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&auto=format&fit=crop";

// Server-side in-memory cache
const cache = {
  slides: null as any,
  expiry: 0,
};
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache

// Helper to run promises with a timeout
async function withTimeout<T>(promise: Promise<T>, timeoutMs = 1500): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("Database query timed out"));
    }, timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

export const Route = createFileRoute("/api/hero-slides")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const now = Date.now();
        if (cache.slides && now < cache.expiry) {
          return json({ slides: cache.slides });
        }

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

          // Fetch Hero of the Day with 1500ms timeout
          const heroStory = await withTimeout(
            prisma.story.findFirst({
              where: {
                heroOfTheDay: true,
                status: "Published",
                deleted: false,
              },
              select: slideSelect,
            }),
            1500
          );

          // Fetch stories marked for slideshow with 1500ms timeout
          const slideshowStories = await withTimeout(
            prisma.story.findMany({
              where: {
                homepageSlideshow: true,
                status: "Published",
                deleted: false,
                heroOfTheDay: false,
              },
              orderBy: { slideshowOrder: "asc" },
              select: slideSelect,
            }),
            1500
          );

          const activeStories = [];
          if (heroStory) {
            activeStories.push(heroStory);
          }
          activeStories.push(...slideshowStories);

          if (activeStories.length === 0) {
            const fallbackStories = await withTimeout(
              prisma.story.findMany({
                where: {
                  status: "Published",
                  deleted: false,
                  featured: false,
                  heroOfTheDay: false,
                },
                orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
                take: 5,
                select: slideSelect,
              }),
              1500
            );
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

          // Cache the compiled slides
          cache.slides = slides;
          cache.expiry = now + CACHE_TTL;

          return json({ slides });
        } catch (error: any) {
          console.warn("[hero-slides] GET error or timeout - using JSON fallback:", error.message);
          try {
            const fallbackJson = await fetchStoriesBackup(request);
            const fallbackStories = (fallbackJson.stories || [])
              .filter((s: any) => s.homepageSlideshow || s.heroOfTheDay || s.featured)
              .slice(0, 5);

            const slides = fallbackStories.map((s: any) => {
              const themes = Array.isArray(s.themes) ? s.themes : [s.category || s.theme].filter(Boolean);
              return {
                id: s.id,
                storyId: s.id,
                slug: s.slug,
                title: s.title,
                excerpt: s.excerpt,
                titleHi: s.titleHi ?? null,
                excerptHi: s.excerptHi ?? null,
                themes,
                state: s.region ?? "India",
                author: s.authorName ?? "India Story Project",
                readingTime: s.readTime ?? "4 min read",
                image: s.image || FALLBACK_IMAGE,
                caption: null,
              };
            });

            return json({ slides });
          } catch (e) {
            return json({ slides: [] });
          }
        }
      },
    },
  },
});
