import { createFileRoute } from "@tanstack/react-router";
import { storyService } from "@/lib/services/story-service.server";
import { fetchStoriesBackup } from "@/routes/api/-_utils";

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

        try {
          const payload = await withTimeout(
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
            5000,
          );

          console.log(
            JSON.stringify({
              source: "database",
              totalStories: payload.total,
              timestamp: new Date().toISOString(),
            })
          );

          return json(payload);
        } catch (error: any) {
          console.error("[stories API] Database query failed:", error?.name, error?.message);
          return json(
            { error: "Database query failed or timed out", details: error?.message },
            { status: 500 }
          );
        }
      },
    },
  },
});
