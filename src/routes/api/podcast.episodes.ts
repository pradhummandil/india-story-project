import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";

const db = prisma as any;

export const Route = createFileRoute("/api/podcast/episodes")({
  server: {
    handlers: {
      GET: async () => {
        try {
          let episodes = await db.podcastEpisode.findMany({
            orderBy: { publishedAt: "desc" },
            take: 30,
            include: {
              story: {
                select: {
                  title: true,
                  titleHi: true,
                  excerpt: true,
                  excerptHi: true,
                  author: { select: { name: true } },
                  images: { take: 1, select: { imageUrl: true } },
                },
              },
            },
          });

          if (episodes.length === 0) {
            const stories = await db.story.findMany({
              where: { status: "Published", deleted: false },
              orderBy: { publishedAt: "desc" },
              take: 20,
              include: {
                author: { select: { name: true } },
                images: { take: 1, select: { imageUrl: true } },
              },
            });

            episodes = stories.map((s: any) => ({
              id: s.id,
              slug: s.slug,
              title: s.title,
              titleHi: s.titleHi,
              excerpt: s.excerpt,
              excerptHi: s.excerptHi,
              audioUrl: `/api/stories/${s.slug}/audio`,
              duration: (s.readingTime || 5) * 60,
              playCount: s.viewCount || 0,
              completionCount: Math.floor((s.viewCount || 0) * 0.7),
              publishedAt: s.publishedAt || s.createdAt,
              authorName: s.author?.name || "India Story Project",
              imageUrl: s.images?.[0]?.imageUrl || "/Logo-ISP.jpg",
            }));
          } else {
            episodes = episodes.map((ep: any) => ({
              id: ep.id,
              slug: ep.slug,
              title: ep.title,
              titleHi: ep.story?.titleHi,
              excerpt: ep.showNotes || ep.story?.excerpt,
              excerptHi: ep.story?.excerptHi,
              audioUrl: ep.audioUrl,
              duration: ep.duration,
              playCount: ep.playCount,
              completionCount: ep.completionCount,
              publishedAt: ep.publishedAt,
              authorName: ep.story?.author?.name || "India Story Project",
              imageUrl: ep.coverImage || ep.story?.images?.[0]?.imageUrl || "/Logo-ISP.jpg",
            }));
          }

          return json({ episodes });
        } catch (error) {
          console.error("Podcast episodes API error:", error);
          return json({ error: "Internal Server Error" }, { status: 500 });
        }
      },

      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { episodeId, action } = body; // action: 'play' | 'complete'

          if (!episodeId) {
            return json({ error: "Missing episodeId" }, { status: 400 });
          }

          const ep = await db.podcastEpisode.findUnique({
            where: { id: episodeId },
          });

          if (ep) {
            if (action === "complete") {
              await db.podcastEpisode.update({
                where: { id: episodeId },
                data: { completionCount: { increment: 1 } },
              });
            } else {
              await db.podcastEpisode.update({
                where: { id: episodeId },
                data: { playCount: { increment: 1 } },
              });
            }
          }

          return json({ success: true });
        } catch (err: any) {
          console.error("Podcast analytics track error:", err);
          return json({ error: "Internal Server Error" }, { status: 500 });
        }
      },
    },
  },
});
