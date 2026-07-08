import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/routes/api/-_utils";
import { storyRepository } from "@/lib/repositories/story-repository.server";

export const Route = createFileRoute("/api/latest-stories")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const stories = await storyRepository.listPublished(6);
          return json({ stories });
        } catch (error: any) {
          console.error("[latest-stories] GET error:", error);
          return json({ stories: [] });
        }
      },
    },
  },
});
