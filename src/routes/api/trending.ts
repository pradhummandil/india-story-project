import { createFileRoute } from "@tanstack/react-router";
import { json, fetchStoriesBackup } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";
import { toStoryCardCompatible } from "@/lib/repositories/story-repository.server";

// Server-side in-memory cache
const cache = {
  stories: null as any,
  expiry: 0,
};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

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

export const Route = createFileRoute("/api/trending")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const now = Date.now();
        if (cache.stories && now < cache.expiry) {
          return json({ stories: cache.stories });
        }

        try {
          const stories = await withTimeout(
            prisma.story.findMany({
              where: { status: "Published" },
              orderBy: { viewCount: "desc" },
              take: 6,
              include: {
                author: true,
                themes: {
                  include: {
                    theme: true,
                  },
                },
                state: true,
                images: true,
              },
            }),
            1500
          );
          const mapped = stories.map(toStoryCardCompatible);
          cache.stories = mapped;
          cache.expiry = now + CACHE_TTL;
          return json({ stories: mapped });
        } catch (error: any) {
          console.warn("[trending] GET error or timeout - using JSON fallback:", error.message);
          try {
            const fallbackJson = await fetchStoriesBackup(request);
            const fallbackStories = fallbackJson.stories || [];

            // Sort by views descending
            const sorted = [...fallbackStories]
              .sort((a: any, b: any) => (b.viewCount || 0) - (a.viewCount || 0))
              .slice(0, 6);

            const mapped = sorted.map((s: any) => {
              const themes = Array.isArray(s.themes) ? s.themes : [s.category || s.theme].filter(Boolean);
              return {
                id: s.id,
                slug: s.slug,
                title: s.title,
                excerpt: s.excerpt,
                themes,
                region: s.region || "India",
                readTime: s.readTime || "3 min read",
                image: s.image,
                publishedAt: s.publishedAt,
                createdAt: s.createdAt,
              };
            });

            return json({ stories: mapped });
          } catch (e) {
            return json({ stories: [] });
          }
        }
      },
    },
  },
});
