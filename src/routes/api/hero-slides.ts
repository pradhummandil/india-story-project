import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&auto=format&fit=crop";

export const Route = createFileRoute("/api/hero-slides")({
  server: {
    handlers: {
      GET: async () => {
        try {
          // Try to fetch active hero slides from DB
          const heroSlides = await prisma.heroSlide.findMany({
            where: { active: true },
            orderBy: { sortOrder: "asc" },
            include: {
              story: {
                include: {
                  author: true,
                  category: true,
                  state: true,
                  images: true,
                },
              },
            },
          });

          if (heroSlides.length > 0) {
            const slides = heroSlides.map((hs) => {
              const s = hs.story;
              const heroImage =
                s.images?.find((img) => img.heroImage)?.imageUrl ??
                FALLBACK_IMAGE;
              return {
                id: hs.id,
                storyId: s.id,
                slug: s.slug,
                title: s.title,
                excerpt: s.excerpt,
                titleHi: s.titleHi,
                excerptHi: s.excerptHi,
                category: s.category?.name ?? null,
                state: s.state?.name ?? null,
                author: s.author?.name ?? null,
                readingTime: s.readingTime,
                image: heroImage,
                caption: hs.caption ?? null,
              };
            });
            return json({ slides });
          }

          // Fallback: top 5 featured stories
          const featuredStories = await prisma.story.findMany({
            where: { featured: true, status: "Published" },
            orderBy: { viewCount: "desc" },
            take: 5,
            include: {
              author: true,
              category: true,
              state: true,
              images: true,
            },
          });

          const slides = featuredStories.map((s) => {
            const heroImage =
              s.images?.find((img) => img.heroImage)?.imageUrl ??
              FALLBACK_IMAGE;
            return {
              id: `fallback-${s.id}`,
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
          // Return empty — Hero component will use local stories fallback
          return json({ slides: [] });
        }
      },
    },
  },
});
