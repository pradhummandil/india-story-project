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

export const Route = createFileRoute("/api/themes")({
  server: {
    handlers: {
      GET: async () => {
        const now = Date.now();
        if (cache.themes && now < cache.expiry) {
          return json(cache.themes);
        }

        try {
          const themes = await withTimeout(themeService.getThemes(), 1500);
          if (themes && themes.length > 0) {
            cache.themes = themes;
            cache.expiry = now + CACHE_TTL;
            return json(themes);
          }
          throw new Error("No themes found in database");
        } catch (error: any) {
          console.warn("[themes API] Timeout or error - using fallback:", error.message);
          try {
            const fs = await import("node:fs");
            const path = await import("node:path");
            const backupPath = path.resolve(process.cwd(), "stories-backup.json");
            const fallbackJson = JSON.parse(fs.readFileSync(backupPath, "utf8"));
            const themesList = fallbackJson.themes || fallbackJson.categories || [
              "Heritage", "Innovation", "Sustainability", "Science", "Culture", "Environment", "Festival", "Food"
            ];
            const mapped = themesList.map((t: string) => ({
              id: t,
              name: t,
              slug: t.toLowerCase()
            }));
            return json(mapped);
          } catch (e) {
            return json([
              { id: "Heritage", name: "Heritage", slug: "heritage" },
              { id: "Innovation", name: "Innovation", slug: "innovation" }
            ]);
          }
        }
      },
    },
  },
});
