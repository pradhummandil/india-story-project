import { createFileRoute } from "@tanstack/react-router";

import { storyService } from "@/lib/services/story-service.server";
import { invalidQueryResponse, json } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/stories/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const slug = params.slug?.trim();
        if (!slug) {
          return invalidQueryResponse("A story slug is required");
        }

        const story = await storyService.getStoryBySlug(slug);
        if (!story) {
          return json({ error: "Story not found" }, { status: 404 });
        }

        return json(story);
      },
    },
  },
});
