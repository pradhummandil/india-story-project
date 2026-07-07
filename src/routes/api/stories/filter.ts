import { createFileRoute } from "@tanstack/react-router";

import { storyService } from "@/lib/services/story-service.server";
import { invalidQueryResponse, json, readOptionalString, readPositiveInt } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/stories/filter")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const category = readOptionalString(url.searchParams.get("category"));
          const region = readOptionalString(url.searchParams.get("region"));
          const page = readPositiveInt(url.searchParams.get("page"), 1, "page");
          const pageSize = readPositiveInt(url.searchParams.get("pageSize"), 12, "pageSize");

          const payload = await storyService.getPublishedStories({ category, region, page, pageSize });
          return json(payload);
        } catch (error) {
          return invalidQueryResponse(error instanceof Error ? error.message : "Invalid query parameters");
        }
      },
    },
  },
});
