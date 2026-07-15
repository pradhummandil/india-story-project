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
        const theme =
          url.searchParams.get("theme") || url.searchParams.get("category") || undefined;
        const region = url.searchParams.get("region") ?? undefined;
        const author = url.searchParams.get("author") ?? undefined;
        const tag = url.searchParams.get("tag") ?? undefined;
        const sortBy = url.searchParams.get("sortBy") ?? undefined;
        const page = readPositiveInt(url.searchParams.get("page"), 1);
        const pageSize = readPositiveInt(url.searchParams.get("pageSize"), 12);

        let payload = await storyService.getPublishedStories({
          query,
          theme,
          region,
          author,
          tag,
          sortBy,
          page,
          pageSize,
        });

        // Fallback to stories-backup.json if database has no records
        if (payload.total === 0) {
          try {
            const fallbackJson = (await import("@/../stories-backup.json")).default;
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
          }
        }

        return json(payload);
      },
    },
  },
});
