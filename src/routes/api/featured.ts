import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&auto=format&fit=crop";

const storyCardSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  titleHi: true,
  excerptHi: true,
  readingTime: true,
  viewCount: true,
  category: { select: { name: true } },
  state: { select: { name: true } },
  author: { select: { name: true } },
  images: {
    where: { heroImage: true },
    take: 1,
    select: { imageUrl: true },
  },
};

export const Route = createFileRoute("/api/featured")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const section = url.searchParams.get("section") ?? "homepage_grid";

          // Try to fetch active featured stories for this section (with selective columns)
          const featuredRows = await prisma.featuredStory.findMany({
            where: {
              active: true,
              section,
              story: {
                status: "Published",
              },
            },
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              story: {
                select: storyCardSelect,
              },
            },
          });

          if (featuredRows.length > 0) {
            const stories = featuredRows.map((fs) => {
              const s = fs.story;
              const image = s.images[0]?.imageUrl ?? FALLBACK_IMAGE;
              return {
                id: s.id,
                slug: s.slug,
                title: s.title,
                excerpt: s.excerpt,
                titleHi: s.titleHi ?? null,
                excerptHi: s.excerptHi ?? null,
                category: s.category?.name ?? null,
                state: s.state?.name ?? null,
                author: s.author?.name ?? null,
                readingTime: s.readingTime,
                viewCount: s.viewCount,
                image,
              };
            });
            return json({ stories });
          }

          // Fallback: stories with featured=true, status=Published (using projection select)
          const fallbackStories = await prisma.story.findMany({
            where: { featured: true, status: "Published" },
            orderBy: { viewCount: "desc" },
            take: 12,
            select: storyCardSelect,
          });

          const stories = fallbackStories.map((s) => {
            const image = s.images[0]?.imageUrl ?? FALLBACK_IMAGE;
            return {
              id: s.id,
              slug: s.slug,
              title: s.title,
              excerpt: s.excerpt,
              titleHi: s.titleHi ?? null,
              excerptHi: s.excerptHi ?? null,
              category: s.category?.name ?? null,
              state: s.state?.name ?? null,
              author: s.author?.name ?? null,
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
