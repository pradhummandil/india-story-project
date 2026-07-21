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
          console.log("[Admin Slideshow API] Prisma where:", {
            homepageSlideshow: true,
            deleted: false,
          });
          const slides = await prisma.story.findMany({
            where: { homepageSlideshow: true, deleted: false },
            orderBy: { slideshowOrder: "asc" },
            select: {
              id: true,
              title: true,
              slug: true,
              slideshowOrder: true,
              homepageSlideshow: true,
              heroOfTheDay: true,
              featured: true,
              status: true,
              deleted: true,
              images: {
                orderBy: { sortOrder: "asc" },
                take: 1,
                select: { imageUrl: true },
              },
            },
          });

          console.log("[Admin Slideshow API] slides.length =", slides.length);
          console.log(
            "[Admin Slideshow API] slides =",
            slides.map((s) => ({
              slug: s.slug,
              homepageSlideshow: s.homepageSlideshow,
              slideshowOrder: s.slideshowOrder,
              heroOfTheDay: s.heroOfTheDay,
              featured: s.featured,
              status: s.status,
              deleted: s.deleted,
            })),
          );

          const payload = { slides };
          console.log("[Admin Slideshow API] returning payload =", payload);
          return json(payload);
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

          await prisma.story.updateMany({
            data: {
              homepageSlideshow: false,
              slideshowOrder: 0,
            },
          });

          // Step 2: Mark only the selected stories as slideshow
          await prisma.$transaction(
            storyIds.map((id, index) =>
              prisma.story.update({
                where: { id },
                data: {
                  homepageSlideshow: true,
                  slideshowOrder: index,
                },
              }),
            ),
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
