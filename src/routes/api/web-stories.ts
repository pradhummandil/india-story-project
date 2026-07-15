import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";
import { StoryStatus } from "@prisma/client";

const db = prisma as any;

export const Route = createFileRoute("/api/web-stories")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
        const pageSize = Math.min(60, Math.max(1, parseInt(url.searchParams.get("pageSize") || "12", 10)));

        try {
          const [webStories, total] = await Promise.all([
            db.webStory.findMany({
              where: {
                status: StoryStatus.Published,
              },
              orderBy: { createdAt: "desc" },
              skip: (page - 1) * pageSize,
              take: pageSize,
              include: {
                author: { select: { name: true, avatar: true } },
              },
            }),
            db.webStory.count({
              where: {
                status: StoryStatus.Published,
              },
            }),
          ]);

          const results = (webStories as any[]).map((ws) => ({
            id: ws.id,
            title: ws.title,
            titleHi: ws.titleHi,
            slug: ws.slug,
            coverImage: ws.coverImage,
            excerpt: ws.excerpt,
            viewCount: ws.viewCount,
            authorName: ws.author?.name || "India Story Project Bureau",
            authorAvatar: ws.author?.avatar,
            createdAt: ws.createdAt.toISOString(),
          }));

          return json({
            webStories: results,
            total,
            page,
            pageSize,
            pageCount: Math.ceil(total / pageSize),
          });
        } catch (e: any) {
          return json({ error: e.message || "Failed to load web stories" }, { status: 500 });
        }
      },
    },
  },
});
