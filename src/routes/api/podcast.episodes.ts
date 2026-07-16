import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/podcast/episodes")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const stories = await prisma.story.findMany({
            where: { status: "Published" },
            orderBy: { publishedAt: "desc" },
            take: 20,
            include: {
              author: {
                select: { name: true, avatar: true },
              },
              images: {
                where: { sortOrder: 0 },
                take: 1,
                select: { imageUrl: true },
              },
            },
          });

          const episodes = stories.map((s) => ({
            id: s.id,
            slug: s.slug,
            title: s.title,
            titleHi: s.titleHi,
            excerpt: s.excerpt,
            excerptHi: s.excerptHi,
            audioUrl: `/api/stories/${s.slug}/audio`,
            duration: (s.readingTime || 5) * 60,
            publishedAt: s.publishedAt || s.createdAt,
            authorName: s.author?.name || "India Story Project",
            imageUrl: s.images[0]?.imageUrl || "/Logo-ISP.jpg",
          }));

          return json({ episodes });
        } catch (error) {
          console.error("Podcast episodes API error:", error);
          return json({ error: "Internal Server Error" }, { status: 500 });
        }
      },
    },
  },
});
