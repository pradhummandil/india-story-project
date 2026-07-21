import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";

const FALLBACK_IMAGE = "/Logo-ISP.jpg";

// Server-side in-memory cache
const cache = {
  slides: null as any,
  expiry: 0,
};
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache

const cacheHeaders = {
  headers: {
    "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=60",
  },
};

export const Route = createFileRoute("/api/hero-slides")({
  server: {
    handlers: {
      GET: async () => {
        const now = Date.now();
        if (cache.slides && now < cache.expiry) {
          return json({ slides: cache.slides }, cacheHeaders);
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

          // Fetch ONLY Homepage Slideshow stories
          const start = Date.now();
          const slideshowStories = await prisma.story.findMany({
            where: {
              homepageSlideshow: true,
              status: "Published",
              deleted: false,
            },
            orderBy: {
              slideshowOrder: "asc",
            },
            select: slideSelect,
          });
          console.log("[hero-slides] Prisma query completed in", Date.now() - start, "ms");

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
          cache.slides = slides;
          cache.expiry = now + CACHE_TTL;

          return json({ slides }, cacheHeaders);
        } catch (error: any) {
          console.error("[hero-slides] Failed to load hero slides:", error);
          return json({ slides: [] }, cacheHeaders);
        }
      },
    },
  },
});
