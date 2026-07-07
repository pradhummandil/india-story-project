import { createFileRoute } from "@tanstack/react-router";

import { storyService } from "@/lib/services/story-service.server";
import { invalidQueryResponse, json, readPositiveInt, readOptionalString } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/stories/search")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const query = readOptionalString(url.searchParams.get("query"));
          if (!query) {
            return invalidQueryResponse("A search query is required");
          }

          const page = readPositiveInt(url.searchParams.get("page"), 1, "page");
          const pageSize = readPositiveInt(url.searchParams.get("pageSize"), 12, "pageSize");

          const payload = await storyService.searchStories(query, { page, pageSize });
          return json(payload);
        } catch (error) {
          return invalidQueryResponse(error instanceof Error ? error.message : "Invalid query parameters");
        }
      },
    },
  },
});
