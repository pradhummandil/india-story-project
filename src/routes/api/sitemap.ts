import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";

export const Route = createFileRoute("/api/sitemap")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;

        const [stories, themes, states] = await Promise.all([
          prisma.story.findMany({
            where: { status: "Published", deleted: false },
            select: { slug: true, updatedAt: true },
          }),
          prisma.theme.findMany({ select: { slug: true } }),
          prisma.state.findMany({ select: { slug: true } }),
        ]);

        const staticPages = [
          { path: "", priority: "1.0", changefreq: "daily" },
          { path: "/stories", priority: "0.9", changefreq: "daily" },
          { path: "/explore", priority: "0.85", changefreq: "daily" },
          { path: "/about", priority: "0.7", changefreq: "monthly" },
          { path: "/contact", priority: "0.6", changefreq: "monthly" },
          { path: "/community", priority: "0.75", changefreq: "weekly" },
          { path: "/share-story", priority: "0.8", changefreq: "monthly" },
          { path: "/careers", priority: "0.6", changefreq: "monthly" },
          { path: "/impact", priority: "0.7", changefreq: "monthly" },
          { path: "/media-kit", priority: "0.5", changefreq: "monthly" },
          { path: "/authors", priority: "0.75", changefreq: "weekly" },
        ];

        const urls = [
          ...staticPages.map((p) => `
  <url>
    <loc>${origin}${p.path}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`),
          ...themes.map((t) => `
  <url>
    <loc>${origin}/theme/${t.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`),
          ...states.map((st) => `
  <url>
    <loc>${origin}/explore?state=${st.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`),
          ...stories.map((s) => `
  <url>
    <loc>${origin}/stories/${s.slug}</loc>
    <lastmod>${s.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`),
        ].join("");

        const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;

        return new Response(sitemapXml, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
          },
        });
      },
    },
  },
});
