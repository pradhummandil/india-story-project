import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";
import { StoryStatus } from "@prisma/client";

const db = prisma as any;

export const Route = createFileRoute("/api/videos")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const query = url.searchParams.get("query") || undefined;
        const theme = url.searchParams.get("theme") || undefined;
        const region = url.searchParams.get("region") || undefined;
        const sortBy = url.searchParams.get("sortBy") || "newest";
        const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
        const pageSize = Math.min(
          60,
          Math.max(1, parseInt(url.searchParams.get("pageSize") || "12", 10)),
        );

        try {
          const where: any = {
            status: StoryStatus.Published,
          };

          if (region && region !== "All") {
            where.state = {
              OR: [
                { name: { equals: region, mode: "insensitive" } },
                { slug: { equals: region, mode: "insensitive" } },
              ],
            };
          }

          if (theme && theme !== "All") {
            where.themes = {
              some: {
                theme: {
                  OR: [
                    { name: { equals: theme, mode: "insensitive" } },
                    { slug: { equals: theme, mode: "insensitive" } },
                  ],
                },
              },
            };
          }

          if (query) {
            where.OR = [
              { title: { contains: query, mode: "insensitive" } },
              { titleHi: { contains: query, mode: "insensitive" } },
              { excerpt: { contains: query, mode: "insensitive" } },
              { excerptHi: { contains: query, mode: "insensitive" } },
            ];
          }

          let orderBy: any = [{ createdAt: "desc" }];
          if (sortBy === "views") {
            orderBy = [{ viewCount: "desc" }, { createdAt: "desc" }];
          } else if (sortBy === "title") {
            orderBy = [{ title: "asc" }];
          }

          const [videos, total] = await Promise.all([
            db.video.findMany({
              where,
              orderBy,
              skip: (page - 1) * pageSize,
              take: pageSize,
              include: {
                author: { select: { id: true, name: true, avatar: true } },
                state: { select: { id: true, name: true, slug: true } },
                themes: {
                  include: {
                    theme: true,
                  },
                },
              },
            }),
            db.video.count({ where }),
          ]);

          const results = (videos as any[]).map((v) => ({
            id: v.id,
            title: v.title,
            titleHi: v.titleHi,
            excerpt: v.excerpt,
            excerptHi: v.excerptHi,
            slug: v.slug,
            videoUrl: v.videoUrl,
            provider: v.provider,
            duration: v.duration,
            viewCount: v.viewCount,
            thumbnail: v.thumbnail || `https://img.youtube.com/vi/${v.videoUrl}/hqdefault.jpg`,
            featured: v.featured,
            authorName: v.author?.name || "India Story Project Bureau",
            region: v.state?.name || "India",
            themes: v.themes.map((vt: any) => vt.theme.name),
            createdAt: v.createdAt.toISOString(),
          }));

          return json({
            videos: results,
            total,
            page,
            pageSize,
            pageCount: Math.ceil(total / pageSize),
          });
        } catch (e: any) {
          return json({ error: e.message || "Failed to load videos" }, { status: 500 });
        }
      },
    },
  },
});
