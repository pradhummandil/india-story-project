import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";
import { StoryStatus } from "@prisma/client";

const db = prisma as any;

export const Route = createFileRoute("/api/videos/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { slug } = params;

        try {
          const video = await db.video.findUnique({
            where: { slug },
            include: {
              author: { select: { id: true, name: true, bio: true, avatar: true } },
              state: { select: { id: true, name: true, slug: true } },
              themes: {
                include: {
                  theme: true,
                },
              },
            },
          });

          if (!video || video.status !== StoryStatus.Published) {
            return json({ error: "Video not found" }, { status: 404 });
          }

          // Increment view count inside transaction to avoid race conditions
          await db.video.update({
            where: { id: video.id },
            data: { viewCount: { increment: 1 } },
          });

          // Fetch recommended videos (matching same themes or state)
          const themeIds = video.themes.map((vt: any) => vt.themeId);
          const recommended = await db.video.findMany({
            where: {
              status: StoryStatus.Published,
              id: { not: video.id },
              OR: [
                { stateId: video.stateId },
                {
                  themes: {
                    some: {
                      themeId: { in: themeIds },
                    },
                  },
                },
              ],
            },
            take: 4,
            include: {
              state: { select: { name: true } },
              themes: { include: { theme: true } },
            },
          });

          const mappedVideo = {
            id: video.id,
            title: video.title,
            titleHi: video.titleHi,
            excerpt: video.excerpt,
            excerptHi: video.excerptHi,
            slug: video.slug,
            videoUrl: video.videoUrl,
            provider: video.provider,
            duration: video.duration,
            viewCount: video.viewCount + 1,
            thumbnail:
              video.thumbnail || `https://img.youtube.com/vi/${video.videoUrl}/hqdefault.jpg`,
            authorName: video.author?.name || "India Story Project Bureau",
            authorBio: video.author?.bio,
            authorAvatar: video.author?.avatar,
            region: video.state?.name || "India",
            themes: video.themes.map((vt: any) => vt.theme.name),
            createdAt: video.createdAt.toISOString(),
          };

          const mappedRecommended = recommended.map((r: any) => ({
            id: r.id,
            title: r.title,
            slug: r.slug,
            thumbnail: r.thumbnail || `https://img.youtube.com/vi/${r.videoUrl}/hqdefault.jpg`,
            duration: r.duration,
            viewCount: r.viewCount,
            region: r.state?.name || "India",
            themes: r.themes.map((vt: any) => vt.theme.name),
          }));

          return json({
            video: mappedVideo,
            recommended: mappedRecommended,
          });
        } catch (e: any) {
          return json({ error: e.message || "Failed to load video details" }, { status: 500 });
        }
      },
    },
  },
});
