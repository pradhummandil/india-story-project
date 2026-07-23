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

        const staticPages = ["", "/explore", "/about", "/contact", "/community", "/share-story"];

        const urls = [
          ...staticPages.map((p) => `
  <url>
    <loc>${origin}${p}</loc>
    <changefreq>daily</changefreq>
    <priority>${p === "" ? "1.0" : "0.8"}</priority>
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
