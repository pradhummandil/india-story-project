import { createFileRoute } from "@tanstack/react-router";
import { storyService } from "@/lib/services/story-service.server";

// Server-side query cache
const storiesCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

function readPositiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

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

export const Route = createFileRoute("/api/stories")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const cacheKey = request.url;
        const now = Date.now();
        const cached = storiesCache.get(cacheKey);
        if (cached && now < cached.expiry) {
          return json(cached.data);
        }

        const url = new URL(request.url);
        const query = url.searchParams.get("query") ?? undefined;
        const theme =
          url.searchParams.get("theme") || url.searchParams.get("category") || undefined;
        const region = url.searchParams.get("region") ?? undefined;
        const author = url.searchParams.get("author") ?? undefined;
        const tag = url.searchParams.get("tag") ?? undefined;
        const sortBy = url.searchParams.get("sortBy") ?? undefined;
        const page = readPositiveInt(url.searchParams.get("page"), 1);
        const pageSize = readPositiveInt(url.searchParams.get("pageSize"), 12);

        let payload: any = null;

        try {
          payload = await withTimeout(
            storyService.getPublishedStories({
              query,
              theme,
              region,
              author,
              tag,
              sortBy,
              page,
              pageSize,
            }),
            1500
          );
        } catch (error: any) {
          console.warn("[stories API] Database query timeout or failure - falling back to JSON:", error.message);
        }

        // Fallback to stories-backup.json if database has no records or timed out
        if (!payload || payload.total === 0) {
          try {
            const fs = await import("node:fs");
            const path = await import("node:path");
            const backupPath = path.resolve(process.cwd(), "stories-backup.json");
            const fallbackJson = JSON.parse(fs.readFileSync(backupPath, "utf8"));
            let fallbackStories = fallbackJson.stories || [];

            // Apply filters manually to the fallback stories
            if (theme && theme.toLowerCase() !== "all") {
              const filterThemes = theme.split(/[ ,+]+/).filter(Boolean);
              fallbackStories = fallbackStories.filter((s: any) => {
                const sThemes = Array.isArray(s.themes) ? s.themes : [s.category || s.theme];
                return sThemes.some((t: string) =>
                  filterThemes.some((ft: string) => t?.toLowerCase() === ft.toLowerCase()),
                );
              });
            }
            if (region) {
              fallbackStories = fallbackStories.filter(
                (s: any) => s.region?.toLowerCase() === region.toLowerCase(),
              );
            }
            if (query) {
              const q = query.toLowerCase();
              fallbackStories = fallbackStories.filter(
                (s: any) =>
                  s.title?.toLowerCase().includes(q) ||
                  s.excerpt?.toLowerCase().includes(q) ||
                  s.category?.toLowerCase().includes(q) ||
                  s.region?.toLowerCase().includes(q) ||
                  (s.content && s.content.toLowerCase().includes(q)),
              );
            }

            const total = fallbackStories.length;
            const start = (page - 1) * pageSize;
            payload = {
              stories: fallbackStories.slice(start, start + pageSize) as any[],
              total,
              page,
              pageSize,
              pageCount: Math.ceil(total / pageSize),
            };
          } catch (e) {
            console.error("Failed to load fallback stories from JSON:", e);
            payload = { stories: [], total: 0, page, pageSize, pageCount: 0 };
          }
        }

        // Cache successful response
        if (payload) {
          storiesCache.set(cacheKey, { data: payload, expiry: now + CACHE_TTL });
        }

        return json(payload);
      },
    },
  },
});
