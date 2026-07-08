import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/admin/analytics")({
  server: {
    handlers: {
      GET: async () => {
        const [
          totalStories,
          published,
          draft,
          archived,
          totalAuthors,
          totalCategories,
          totalStates,
          recentStories,
        ] = await Promise.all([
          prisma.story.count(),
          prisma.story.count({ where: { status: "Published" } }),
          prisma.story.count({ where: { status: "Draft" } }),
          prisma.story.count({ where: { status: "Archived" } }),
          prisma.author.count(),
          prisma.category.count(),
          prisma.state.count(),
          prisma.story.findMany({
            take: 20,
            orderBy: [{ createdAt: "desc" }],
            select: {
              title: true,
              status: true,
              viewCount: true,
              createdAt: true,
              category: { select: { name: true } },
              state: { select: { name: true } },
            },
          }),
        ]);

        const totalViews =
          (await prisma.story.aggregate({ _sum: { viewCount: true } }))._sum.viewCount ?? 0;

        return json({
          totalStories,
          published,
          draft,
          archived,
          totalViews,
          totalAuthors,
          totalCategories,
          totalStates,
          recentStories: recentStories.map((s) => ({
            title: s.title,
            status: s.status,
            viewCount: s.viewCount,
            createdAt: s.createdAt.toISOString(),
            category: s.category.name,
            region: s.state.name,
          })),
        });
      },
    },
  },
});
