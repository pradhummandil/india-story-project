import { createFileRoute } from "@tanstack/react-router";
import { json, verifyAdmin } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";

export const Route = createFileRoute("/api/admin/slideshow")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const admin = await verifyAdmin(request);
        if (!admin) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const slides = await prisma.story.findMany({
            where: { homepageSlideshow: true, deleted: false },
            orderBy: { slideshowOrder: "asc" },
            select: {
              id: true,
              title: true,
              slug: true,
              slideshowOrder: true,
              images: {
                orderBy: { sortOrder: "asc" },
                take: 1,
                select: { imageUrl: true },
              },
            },
          });

          return json({ slides });
        } catch (error: any) {
          console.error("[Admin Slideshow API] GET error:", error);
          return json({ error: "Internal Server Error" }, { status: 500 });
        }
      },

      POST: async ({ request }) => {
        const admin = await verifyAdmin(request);
        if (!admin) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const body = await request.json();
          const { storyIds } = body;

          if (!Array.isArray(storyIds)) {
            return json({ error: "storyIds must be an array" }, { status: 400 });
          }

          // Update slideshowOrder sequentially
          await prisma.$transaction(
            storyIds.map((id, index) =>
              prisma.story.update({
                where: { id },
                data: { slideshowOrder: index },
              })
            )
          );

          return json({ success: true });
        } catch (error: any) {
          console.error("[Admin Slideshow API] POST error:", error);
          return json({ error: "Internal Server Error" }, { status: 500 });
        }
      },
    },
  },
});
