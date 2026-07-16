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
        // const now = Date.now();
        // CACHE DISABLED FOR DEBUG
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

          // Fetch ONLY Homepage Slideshow stories (no hero-of-the-day substitution)
          const slideshowStories = await withTimeout(
            prisma.story.findMany({
              where: {
                homepageSlideshow: true,
                status: "Published",
                deleted: false,
              },
              orderBy: {
                slideshowOrder: "asc",
              },
              select: slideSelect,
            }),
            1500,
          );

          // No mixing/substitution logic: slideshow endpoint returns ONLY
          // homepageSlideshow=true stories (with Published+!deleted eligibility).
          const slides = slideshowStories.map((s: any) => {
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
          //cache.slides = slides;
          //cache.expiry = now + CACHE_TTL;

          return json({ slides });
        } catch (error: any) {
          console.error("FULL HERO SLIDES ERROR");
          console.error(error);
          console.error(error.stack);

          try {
            const fallbackJson = await fetchStoriesBackup(request);

            // Fallback must still respect slideshow-only eligibility.
            const fallbackStories = (fallbackJson.stories || [])
              .filter(
                (s: any) =>
                  s.homepageSlideshow === true && s.status === "Published" && s.deleted === false,
              )
              .slice(0, 5);

            const slides = fallbackStories.map((s: any) => ({
              id: s.id,
              storyId: s.id,
              slug: s.slug,
              title: s.title,
              excerpt: s.excerpt,
              titleHi: s.titleHi ?? null,
              excerptHi: s.excerptHi ?? null,
              themes: Array.isArray(s.themes) ? s.themes : [s.category || s.theme].filter(Boolean),
              state: s.region ?? "India",
              author: s.authorName ?? "India Story Project",
              readingTime: s.readTime ?? "4 min read",
              image: s.image || FALLBACK_IMAGE,
              caption: null,
            }));

            return json({ slides });
          } catch (e) {
            console.error("Fallback JSON failed", e);
            return json({ slides: [] });
          }
        }
      },
    },
  },
});
