import { createFileRoute } from "@tanstack/react-router";
import { storyService } from "@/lib/services/story-service.server";

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

export const Route = createFileRoute("/api/stories")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const query = url.searchParams.get("query") ?? undefined;
        const category = url.searchParams.get("category") ?? undefined;
        const region = url.searchParams.get("region") ?? undefined;
        const page = readPositiveInt(url.searchParams.get("page"), 1);
        const pageSize = readPositiveInt(url.searchParams.get("pageSize"), 12);

        const payload = await storyService.getPublishedStories({
          query,
          category,
          region,
          page,
          pageSize,
        });

        return json(payload);
      },
    },
  },
});
