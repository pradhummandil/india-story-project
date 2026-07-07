import { createFileRoute } from "@tanstack/react-router";

import { storyService } from "@/lib/services/story-service.server";
import { invalidQueryResponse, json, readPositiveInt } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/stories/featured")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const limit = readPositiveInt(url.searchParams.get("limit"), 3, "limit");

          const stories = await storyService.getFeaturedStories(limit);
          return json(stories);
        } catch (error) {
          return invalidQueryResponse(error instanceof Error ? error.message : "Invalid query parameters");
        }
      },
    },
  },
});
