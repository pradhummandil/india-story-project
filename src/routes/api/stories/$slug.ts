import { createFileRoute } from "@tanstack/react-router";

import { storyService } from "@/lib/services/story-service.server";
import { invalidQueryResponse, json } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";

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

      POST: async ({ params }) => {
        const slug = params.slug?.trim();
        if (!slug) {
          return invalidQueryResponse("A story slug is required");
        }

        try {
          const dbStory = await prisma.story.findFirst({
            where: { slug, status: "Published" },
            select: { id: true },
          });

          if (dbStory) {
            const updated = await prisma.story.update({
              where: { id: dbStory.id },
              data: { viewCount: { increment: 1 } },
              select: { viewCount: true },
            });

            await prisma.storyView.create({
              data: { storyId: dbStory.id },
            });

            return json({ success: true, viewCount: updated.viewCount });
          }
          return json({ success: false, message: "Story not in database" });
        } catch (e) {
          console.error("Failed to increment story view count:", e);
          return json({ success: false, error: String(e) }, { status: 500 });
        }
      },
    },
  },
});
