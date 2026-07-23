import { createFileRoute } from "@tanstack/react-router";
import { json, successResponse } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";
import { toStoryCardCompatible } from "@/lib/repositories/story-repository.server";

// Server-side in-memory cache with 5 min TTL
let cachedTrending: any = null;
let cacheExpiry = 0;
const CACHE_TTL = 5 * 60 * 1000;

export function invalidateTrendingCache() {
  cachedTrending = null;
  cacheExpiry = 0;
}

export const Route = createFileRoute("/api/trending")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const now = Date.now();
        if (cachedTrending && now < cacheExpiry) {
          return successResponse(cachedTrending, {
            meta: { cached: true, count: cachedTrending.length },
            init: { headers: { "Cache-Control": "public, max-age=300, s-maxage=600" } },
          });
        }

        try {
          const rawStories = await prisma.story.findMany({
            where: { status: "Published", deleted: false },
            take: 30,
            include: {
              author: true,
              themes: {
                include: {
                  theme: true,
                },
              },
              state: true,
              images: true,
              _count: {
                select: {
                  likes: true,
                  bookmarks: true,
                  comments: true,
                },
              },
            },
          });

          const nowMs = Date.now();

          // Calculate weighted trending score per story
          const scored = rawStories.map((s: any) => {
            const likesCount = s._count?.likes ?? 0;
            const bookmarksCount = s._count?.bookmarks ?? 0;
            const commentsCount = s._count?.comments ?? 0;
            const viewsCount = s.viewCount ?? 0;
            
            // Recency boost: published within last 7 days gets extra score
            const publishedMs = s.publishedAt ? new Date(s.publishedAt).getTime() : s.createdAt.getTime();
            const daysOld = Math.max(0, (nowMs - publishedMs) / (1000 * 60 * 60 * 24));
            const recencyBoost = Math.max(0, (7 - daysOld) * 8);

            const manualBoost = s.trendingStory ? 50 : 0;
            
            const score = (viewsCount * 1.0) + (likesCount * 2.5) + (bookmarksCount * 3.0) + (commentsCount * 2.0) + recencyBoost + manualBoost;
            return { story: s, score };
          });

          scored.sort((a, b) => b.score - a.score);
          const topStories = scored.slice(0, 6).map((item) => item.story);
          const mapped = topStories.map(toStoryCardCompatible);

          cachedTrending = mapped;
          cacheExpiry = now + CACHE_TTL;

          return successResponse(mapped, {
            meta: { cached: false, count: mapped.length },
            init: { headers: { "Cache-Control": "public, max-age=300, s-maxage=600" } },
          });
        } catch (error: any) {
          console.error("[trending] GET error:", error);
          return successResponse([], { message: "Failed to load trending stories" });
        }
      },
    },
  },
});
