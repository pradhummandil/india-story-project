import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/routes/api/-_utils";
import { storyRepository } from "@/lib/repositories/story-repository.server";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&auto=format&fit=crop";

export const Route = createFileRoute("/api/featured")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const featured = await storyRepository.listFeatured(12);
          const stories = featured.map((s) => {
            return {
              id: s.id,
              slug: s.slug,
              title: s.title,
              excerpt: s.excerpt,
              titleHi: s.titleHi ?? null,
              excerptHi: s.excerptHi ?? null,
              category: s.category ?? null,
              state: s.region ?? null,
              author: s.authorName ?? null,
              readingTime: s.readTime ? parseInt(s.readTime.split(" ")[0], 10) || 4 : 4,
              viewCount: s.viewCount ?? 0,
              image: s.image ?? FALLBACK_IMAGE,
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
