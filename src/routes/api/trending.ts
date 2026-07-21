import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/routes/api/-_utils";
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

const cacheHeaders = {
  headers: {
    "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=60",
  },
};

export const Route = createFileRoute("/api/trending")({
  server: {
    handlers: {
      GET: async () => {
        const now = Date.now();
        if (cache.stories && now < cache.expiry) {
          return json({ stories: cache.stories }, cacheHeaders);
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
          return json({ stories: mapped }, cacheHeaders);
        } catch (error: any) {
          console.error("[trending] GET error or timeout:", error.message);
          return json({ stories: [] }, cacheHeaders);
        }
      },
    },
  },
});
