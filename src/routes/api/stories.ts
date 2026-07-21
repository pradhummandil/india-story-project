import { createFileRoute } from "@tanstack/react-router";
import { storyService } from "@/lib/services/story-service.server";
import { json } from "@/routes/api/-_utils";

function readPositiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

// Helper to run promises with a timeout
async function withTimeout<T>(promise: Promise<T>, timeoutMs = 5000): Promise<T> {
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
        console.time("total response time");
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
          console.time("story query time");
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
          console.timeEnd("story query time");

          console.time("serialization time");
          const body = JSON.stringify(payload);
          console.timeEnd("serialization time");

          console.log(
            JSON.stringify({
              source: "database",
              totalStories: payload.total,
              timestamp: new Date().toISOString(),
            })
          );

          console.timeEnd("total response time");

          return new Response(body, {
            headers: {
              "content-type": "application/json",
            },
          });
        } catch (error: any) {
          console.timeEnd("total response time");
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
