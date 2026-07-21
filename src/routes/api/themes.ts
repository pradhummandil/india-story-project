import { createFileRoute } from "@tanstack/react-router";
import { themeService } from "@/lib/services/theme-service.server";
import { json } from "@/routes/api/-_utils";

// Server-side in-memory cache
const cache = {
  themes: null as any,
  expiry: 0,
};
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes cache

// Helper to run promises with a timeout
async function withTimeout<T>(promise: Promise<T>, timeoutMs = 10000): Promise<T> {
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
    "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=600",
  },
};

export const Route = createFileRoute("/api/themes")({
  server: {
    handlers: {
      GET: async () => {
        const now = Date.now();
        if (cache.themes && now < cache.expiry) {
          return json(cache.themes, cacheHeaders);
        }

        try {
          const themes = await withTimeout(themeService.getThemes());
          if (themes && themes.length > 0) {
            cache.themes = themes;
            cache.expiry = now + CACHE_TTL;
            return json(themes, cacheHeaders);
          }
          throw new Error("No themes found in database");
        } catch (error: any) {
          console.error("[themes API] Timeout or error:", error.message);
          return json([], cacheHeaders);
        }
      },
    },
  },
});
