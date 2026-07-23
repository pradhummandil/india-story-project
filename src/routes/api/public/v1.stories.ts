import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";

const db = prisma as any;

export const Route = createFileRoute("/api/public/v1/stories")({
  server: {
    handlers: {
      /**
       * GET /api/public/v1.stories?limit=20&page=1&state=maharashtra
       * Public REST API for stories catalog
       */
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));
        const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
        const stateSlug = url.searchParams.get("state") || "";

        try {
          const where: any = { status: "Published", deleted: false };
          if (stateSlug) {
            where.state = { slug: stateSlug };
          }

          const [total, stories] = await Promise.all([
            db.story.count({ where }),
            db.story.findMany({
              where,
              skip: (page - 1) * limit,
              take: limit,
              orderBy: { publishedAt: "desc" },
              select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                content: true,
                publishedAt: true,
                readingTime: true,
                viewCount: true,
                author: { select: { name: true, bio: true, avatar: true } },
                state: { select: { name: true, slug: true } },
              },
            }),
          ]);

          return new Response(
            JSON.stringify({
              apiVersion: "1.0",
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit),
              data: stories,
            }),
            {
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "public, max-age=300, s-maxage=3600",
              },
            }
          );
        } catch (err: any) {
          return json({ error: err.message || "Public stories API error" }, { status: 500 });
        }
      },
    },
  },
});
