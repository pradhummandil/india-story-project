import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";
import { StoryStatus } from "@prisma/client";

export const Route = createFileRoute("/api/authors/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { id } = params;

        try {
          const db = prisma as any;
          const author = await db.author.findUnique({
            where: { id },
            include: {
              stories: {
                where: { status: StoryStatus.Published },
                orderBy: { createdAt: "desc" },
                include: {
                  state: { select: { name: true } },
                  themes: { include: { theme: true } },
                  images: { orderBy: { sortOrder: "asc" }, take: 1 },
                },
              },
              videos: {
                where: { status: StoryStatus.Published },
                orderBy: { createdAt: "desc" },
                include: {
                  state: { select: { name: true } },
                  themes: { include: { theme: true } },
                },
              },
            },
          });

          if (!author) {
            return json({ error: "Author not found" }, { status: 404 });
          }

          const storyCount = (author.stories as any[]).length;
          const videoCount = (author.videos as any[]).length;
          const totalViews =
            (author.stories as any[]).reduce((acc: number, s: any) => acc + s.viewCount, 0) +
            (author.videos as any[]).reduce((acc: number, v: any) => acc + v.viewCount, 0);

          const storiesMapped = (author.stories as any[]).map((s: any) => ({
            id: s.id,
            slug: s.slug,
            title: s.title,
            excerpt: s.excerpt,
            publishedAt: s.publishedAt?.toISOString() || s.createdAt.toISOString(),
            viewCount: s.viewCount,
            region: s.state?.name || "India",
            themes: s.themes.map((t: any) => t.theme.name),
            image: s.images?.[0]?.imageUrl || null,
          }));

          const videosMapped = (author.videos as any[]).map((v: any) => ({
            id: v.id,
            slug: v.slug,
            title: v.title,
            excerpt: v.excerpt,
            publishedAt: v.createdAt.toISOString(),
            viewCount: v.viewCount,
            region: v.state?.name || "India",
            themes: v.themes.map((t: any) => t.theme.name),
            thumbnail: v.thumbnail || `https://img.youtube.com/vi/${v.videoUrl}/hqdefault.jpg`,
            duration: v.duration,
          }));

          // Fetch how many readers follow this author
          const followersCount = await db.follow.count({
            where: { authorId: author.id },
          });

          // Fetch related authors for recommendations
          const relatedAuthors = await db.author.findMany({
            where: { id: { not: author.id } },
            take: 4,
            select: { id: true, name: true, avatar: true, bio: true },
          });

          return json({
            author: {
              id: author.id,
              name: author.name,
              bio: author.bio,
              avatar: author.avatar,
              joinedAt: author.createdAt.toISOString(),
              location: "India",
              verified: true,
              followersCount,
              storyCount,
              videoCount,
              totalViews,
            },
            stories: storiesMapped,
            videos: videosMapped,
            relatedAuthors,
          });
        } catch (e: any) {
          return json({ error: e.message || "Failed to fetch author details" }, { status: 500 });
        }
      },
    },
  },
});
