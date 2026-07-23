import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";

const db = prisma as any;

export const Route = createFileRoute("/api/public/v1/feed/json")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;

        try {
          const stories = await db.story.findMany({
            where: { status: "Published", deleted: false },
            orderBy: { publishedAt: "desc" },
            take: 50,
            select: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              content: true,
              publishedAt: true,
              author: { select: { name: true, avatar: true } },
            },
          });

          const items = stories.map((s: any) => ({
            id: `${origin}/stories/${s.slug}`,
            url: `${origin}/stories/${s.slug}`,
            title: s.title,
            summary: s.excerpt || "",
            content_html: `<p>${s.excerpt || ""}</p>`,
            date_published: s.publishedAt ? new Date(s.publishedAt).toISOString() : new Date().toISOString(),
            author: {
              name: s.author?.name || "India Story Project",
              avatar: s.author?.avatar || "",
            },
          }));

          const jsonFeed = {
            version: "https://jsonfeed.org/version/1.1",
            title: "India Story Project",
            home_page_url: origin,
            feed_url: `${origin}/api/public/v1/feed.json`,
            description: "Experience India's Stories — Premier Slow-Journalism & Editorial Platform",
            icon: `${origin}/favicon.ico`,
            items,
          };

          return new Response(JSON.stringify(jsonFeed, null, 2), {
            headers: {
              "Content-Type": "application/feed+json; charset=utf-8",
              "Access-Control-Allow-Origin": "*",
              "Cache-Control": "public, max-age=3600, s-maxage=86400",
            },
          });
        } catch (err: any) {
          return new Response(JSON.stringify({ error: "Failed to generate JSON Feed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
