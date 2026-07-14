import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";
import { toStoryCardCompatible } from "@/lib/repositories/story-repository.server";

export const Route = createFileRoute("/api/trending")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const stories = await prisma.story.findMany({
            where: { status: "Published" },
            orderBy: { viewCount: "desc" },
            take: 6,
            include: {
              author: true,
              themes: {
                include: {
                  theme: true,
                },
              },
              state: true,
              images: true,
            },
          });
          return json({ stories: stories.map(toStoryCardCompatible) });
        } catch (error: any) {
          console.error("[trending] GET error:", error);
          return json({ stories: [] });
        }
      },
    },
  },
});
