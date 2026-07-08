import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/routes/api/-_utils";
import { storyRepository } from "@/lib/repositories/story-repository.server";

export const Route = createFileRoute("/api/hero-of-the-day")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const story = await storyRepository.findHeroOfTheDay();
          return json({ story });
        } catch (error: any) {
          console.error("[hero-of-the-day] GET error:", error);
          return json({ story: null });
        }
      },
    },
  },
});
