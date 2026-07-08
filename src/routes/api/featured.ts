import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&auto=format&fit=crop";

export const Route = createFileRoute("/api/featured")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const section = url.searchParams.get("section") ?? "homepage_grid";

          // Try to fetch active featured stories for this section
          const featuredRows = await prisma.featuredStory.findMany({
            where: {
              active: true,
              section,
              story: {
                status: "Published",
              },
            },
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

          if (featuredRows.length > 0) {
            const stories = featuredRows.map((fs) => {
              const s = fs.story;
              const image =
                (s.images as any[])?.find((img) => img.heroImage)?.imageUrl ??
                FALLBACK_IMAGE;
              return {
                id: s.id,
                slug: s.slug,
                title: s.title,
                excerpt: s.excerpt,
                titleHi: (s as any).titleHi ?? null,
                excerptHi: (s as any).excerptHi ?? null,
                category: (s as any).category?.name ?? null,
                state: (s as any).state?.name ?? null,
                author: (s as any).author?.name ?? null,
                readingTime: s.readingTime,
                viewCount: s.viewCount,
                image,
              };
            });
            return json({ stories });
          }

          // Fallback: stories with featured=true, status=Published
          const fallbackStories = await prisma.story.findMany({
            where: { featured: true, status: "Published" },
            orderBy: { viewCount: "desc" },
            take: 12,
            include: {
              author: true,
              category: true,
              state: true,
              images: true,
            },
          });

          const stories = fallbackStories.map((s) => {
            const image =
              (s.images as any[])?.find((img) => img.heroImage)?.imageUrl ??
              FALLBACK_IMAGE;
            return {
              id: s.id,
              slug: s.slug,
              title: s.title,
              excerpt: s.excerpt,
              titleHi: (s as any).titleHi ?? null,
              excerptHi: (s as any).excerptHi ?? null,
              category: (s as any).category?.name ?? null,
              state: (s as any).state?.name ?? null,
              author: (s as any).author?.name ?? null,
              readingTime: s.readingTime,
              viewCount: s.viewCount,
              image,
            };
          });

          return json({ stories });
        } catch (error: any) {
          console.error("[featured] GET error:", error);
          return json({ stories: [] });
        }
      },
    },
  },
});
