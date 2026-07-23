import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";

export const Route = createFileRoute("/api/rss")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const stories = await prisma.story.findMany({
          where: { status: "Published", deleted: false },
          orderBy: { publishedAt: "desc" },
          take: 50,
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            publishedAt: true,
            author: { select: { name: true } },
          },
        });

        const itemsXml = stories
          .map((s) => {
            const pubDate = s.publishedAt ? new Date(s.publishedAt).toUTCString() : new Date().toUTCString();
            const link = `${origin}/stories/${s.slug}`;
            return `
    <item>
      <title><![CDATA[${s.title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description><![CDATA[${s.excerpt ?? ""}]]></description>
      <pubDate>${pubDate}</pubDate>
      ${s.author?.name ? `<dc:creator><![CDATA[${s.author.name}]]></dc:creator>` : ""}
    </item>`;
          })
          .join("");

        const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>India Story Project</title>
    <link>${origin}</link>
    <description>Experience India's Stories — Premier Slow-Journalism & Editorial Platform</description>
    <language>en</language>
    <atom:link href="${origin}/api/rss" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`;

        return new Response(rssXml, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
          },
        });
      },
    },
  },
});
