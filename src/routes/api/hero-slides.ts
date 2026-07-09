import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&auto=format&fit=crop";

export const Route = createFileRoute("/api/hero-slides")({
  server: {
    handlers: {
      GET: async () => {
        try {
          // Fetch stories marked for slideshow
          const slideshowStories = await prisma.story.findMany({
            where: {
              homepageSlideshow: true,
              status: "Published",
              deleted: false,
            },
            orderBy: { slideshowOrder: "asc" },
            include: {
              author: true,
              category: true,
              state: true,
              images: true,
            },
          });

          const activeStories = slideshowStories.length > 0
            ? slideshowStories
            : await prisma.story.findMany({
                where: { status: "Published", deleted: false },
                orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
                take: 5,
                include: {
                  author: true,
                  category: true,
                  state: true,
                  images: true,
                },
              });

          const slides = activeStories.map((s) => {
            const heroImage =
              s.images?.find((img) => img.heroImage)?.imageUrl ??
              (s.images?.[0]?.imageUrl) ??
              FALLBACK_IMAGE;
            return {
              id: s.id,
              storyId: s.id,
              slug: s.slug,
              title: s.title,
              excerpt: s.excerpt,
              titleHi: s.titleHi ?? null,
              excerptHi: s.excerptHi ?? null,
              category: s.category?.name ?? null,
              state: s.state?.name ?? null,
              author: s.author?.name ?? null,
              readingTime: s.readingTime,
              image: heroImage,
              caption: null,
            };
          });

          return json({ slides });
        } catch (error: any) {
          console.error("[hero-slides] GET error:", error);
          return json({ slides: [] });
        }
      },
    },
  },
});
