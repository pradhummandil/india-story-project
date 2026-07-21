import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/routes/api/-_utils";
import { storyRepository } from "@/lib/repositories/story-repository.server";

// Server-side in-memory cache
const cache = {
  story: null as any,
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

const cacheHeaders = {
  headers: {
    "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=60",
  },
};

export const Route = createFileRoute("/api/hero-of-the-day")({
  server: {
    handlers: {
      GET: async () => {
        const now = Date.now();
        if (cache.story && now < cache.expiry) {
          return json({ story: cache.story }, cacheHeaders);
        }

        try {
          const story = await withTimeout(storyRepository.findHeroOfTheDay(), 1500);
          if (story) {
            cache.story = story;
            cache.expiry = now + CACHE_TTL;
            return json({ story }, cacheHeaders);
          }
          throw new Error("No hero story found in database");
        } catch (error: any) {
          console.warn("[hero-of-the-day] GET error or timeout:", error.message);
          return json({ story: null }, cacheHeaders);
        }
      },
    },
  },
});
