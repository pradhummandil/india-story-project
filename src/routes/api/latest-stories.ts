import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/routes/api/-_utils";
import { storyRepository } from "@/lib/repositories/story-repository.server";

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

export const Route = createFileRoute("/api/latest-stories")({
  server: {
    handlers: {
      GET: async () => {
        const now = Date.now();
        if (cache.stories && now < cache.expiry) {
          return json({ stories: cache.stories });
        }

        try {
          const stories = await withTimeout(storyRepository.listPublished(6), 1500);
          cache.stories = stories;
          cache.expiry = now + CACHE_TTL;
          return json({ stories });
        } catch (error: any) {
          console.warn("[latest-stories] GET error or timeout - using JSON fallback:", error.message);
          try {
            const fs = await import("node:fs");
            const path = await import("node:path");
            const backupPath = path.resolve(process.cwd(), "stories-backup.json");
            const fallbackJson = JSON.parse(fs.readFileSync(backupPath, "utf8"));
            const fallbackStories = fallbackJson.stories || [];

            // Sort by publishedAt or createdAt descending
            const sorted = [...fallbackStories]
              .sort(
                (a: any, b: any) =>
                  new Date(b.publishedAt || b.createdAt || 0).getTime() -
                  new Date(a.publishedAt || a.createdAt || 0).getTime()
              )
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
