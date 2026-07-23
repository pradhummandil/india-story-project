import { createFileRoute } from "@tanstack/react-router";
import { json, successResponse } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";

const FALLBACK_IMAGE = "/Logo-ISP.jpg";

// Server-side in-memory cache with 5 min TTL
let cachedSlides: any = null;
let cacheExpiry = 0;
const CACHE_TTL = 5 * 60 * 1000;

export function invalidateHeroCache() {
  cachedSlides = null;
  cacheExpiry = 0;
}

const slideSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  titleHi: true,
  excerptHi: true,
  readingTime: true,
  publishedAt: true,
  pinnedStory: true,
  featured: true,
  homepageSlideshow: true,
  editorsPick: true,
  viewCount: true,
  themes: {
    select: {
      theme: { select: { name: true } },
    },
  },
  state: { select: { name: true } },
  author: { select: { name: true } },
  images: {
    orderBy: [{ heroImage: "desc" as const }, { sortOrder: "asc" as const }],
    select: { imageUrl: true, heroImage: true, caption: true },
    take: 1,
  },
};

export const Route = createFileRoute("/api/hero-slides")({
  server: {
    handlers: {
      GET: async () => {
        const now = Date.now();
        if (cachedSlides && now < cacheExpiry) {
          return successResponse(cachedSlides, {
            meta: { cached: true, count: cachedSlides.length },
            init: { headers: { "Cache-Control": "public, max-age=300, s-maxage=600" } },
          });
        }

        try {
          const selectedStories: any[] = [];
          const selectedIds = new Set<string>();

          // Priority 1: Pinned stories
          const pinned = await prisma.story.findMany({
            where: { pinnedStory: true, status: "Published", deleted: false },
            orderBy: { publishedAt: "desc" },
            take: 5,
            select: slideSelect,
          });
          pinned.forEach((s) => {
            if (!selectedIds.has(s.id)) {
              selectedIds.add(s.id);
              selectedStories.push(s);
            }
          });

          // Priority 2: Homepage Slideshow / Featured
          if (selectedStories.length < 5) {
            const featured = await prisma.story.findMany({
              where: {
                id: { notIn: Array.from(selectedIds) },
                OR: [{ homepageSlideshow: true }, { featured: true }],
                status: "Published",
                deleted: false,
              },
              orderBy: [{ slideshowOrder: "asc" }, { publishedAt: "desc" }],
              take: 5 - selectedStories.length,
              select: slideSelect,
            });
            featured.forEach((s) => {
              if (!selectedIds.has(s.id)) {
                selectedIds.add(s.id);
                selectedStories.push(s);
              }
            });
          }

          // Priority 3: Editor's Picks
          if (selectedStories.length < 5) {
            const editors = await prisma.story.findMany({
              where: {
                id: { notIn: Array.from(selectedIds) },
                editorsPick: true,
                status: "Published",
                deleted: false,
              },
              orderBy: { publishedAt: "desc" },
              take: 5 - selectedStories.length,
              select: slideSelect,
            });
            editors.forEach((s) => {
              if (!selectedIds.has(s.id)) {
                selectedIds.add(s.id);
                selectedStories.push(s);
              }
            });
          }

          // Priority 4: Highest Trending (by view count & interactions)
          if (selectedStories.length < 5) {
            const trending = await prisma.story.findMany({
              where: {
                id: { notIn: Array.from(selectedIds) },
                status: "Published",
                deleted: false,
              },
              orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }],
              take: 5 - selectedStories.length,
              select: slideSelect,
            });
            trending.forEach((s) => {
              if (!selectedIds.has(s.id)) {
                selectedIds.add(s.id);
                selectedStories.push(s);
              }
            });
          }

          // Priority 5: Latest Published backfill
          if (selectedStories.length < 5) {
            const latest = await prisma.story.findMany({
              where: {
                id: { notIn: Array.from(selectedIds) },
                status: "Published",
                deleted: false,
              },
              orderBy: { publishedAt: "desc" },
              take: 5 - selectedStories.length,
              select: slideSelect,
            });
            latest.forEach((s) => {
              if (!selectedIds.has(s.id)) {
                selectedIds.add(s.id);
                selectedStories.push(s);
              }
            });
          }

          const slides = selectedStories.map((s: any) => {
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
              readingTime: s.readingTime ?? 5,
              image: heroImage,
              caption: s.images?.[0]?.caption ?? undefined,
            };
          });

          cachedSlides = slides;
          cacheExpiry = now + CACHE_TTL;

          return successResponse(slides, {
            meta: { cached: false, count: slides.length },
            init: { headers: { "Cache-Control": "public, max-age=300, s-maxage=600" } },
          });
        } catch (error: any) {
          console.error("[hero-slides] GET error:", error);
          return successResponse([], { message: "Failed to load hero slides" });
        }
      },
    },
  },
});
