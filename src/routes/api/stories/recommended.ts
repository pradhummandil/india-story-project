import { createFileRoute } from "@tanstack/react-router";

import { storyService } from "@/lib/services/story-service.server";
import {
  invalidQueryResponse,
  json,
  readPositiveInt,
  readOptionalString,
} from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/stories/recommended")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const slug = readOptionalString(url.searchParams.get("slug"));
          if (!slug) {
            return invalidQueryResponse("A story slug is required");
          }

          const limit = readPositiveInt(url.searchParams.get("limit"), 3, "limit");
          const stories = await storyService.getRecommendedStories(slug, limit);
          return json(stories);
        } catch (error) {
          return invalidQueryResponse(
            error instanceof Error ? error.message : "Invalid query parameters",
          );
        }
      },
    },
  },
});
