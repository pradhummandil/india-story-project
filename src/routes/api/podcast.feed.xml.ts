import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";

export const Route = createFileRoute("/api/podcast/feed/xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const urlObj = new URL(request.url);
        const host = urlObj.origin;

        try {
          // Fetch top 50 published stories with authors and images
          const stories = await prisma.story.findMany({
            where: { status: "Published" },
            orderBy: { publishedAt: "desc" },
            take: 50,
            include: {
              author: true,
              images: {
                where: { sortOrder: 0 },
                take: 1,
              },
            },
          });

          const rssItems = stories
            .map((story) => {
              const audioUrl = `${host}/api/stories/${story.slug}/audio`;
              const detailUrl = `${host}/stories/${story.slug}`;
              const pubDate = story.publishedAt
                ? new Date(story.publishedAt).toUTCString()
                : new Date(story.createdAt).toUTCString();

              const imageUrl = story.images[0]?.imageUrl || `${host}/logo.png`;
              const durationSeconds = (story.readingTime || 5) * 60;
              const authorName = story.author?.name || "India Story Project";

              return `
    <item>
      <title>${escapeXml(story.title)}</title>
      <description>${escapeXml(story.excerpt)}</description>
      <link>${detailUrl}</link>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="false">${story.id}</guid>
      <enclosure url="${audioUrl}" length="0" type="audio/mpeg" />
      <itunes:author>${escapeXml(authorName)}</itunes:author>
      <itunes:summary>${escapeXml(story.excerpt)}</itunes:summary>
      <itunes:duration>${durationSeconds}</itunes:duration>
      <itunes:image href="${escapeXml(imageUrl)}" />
    </item>`;
            })
            .join("\n");

          const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" 
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>India Story Project Podcast</title>
    <link>${host}</link>
    <language>en-us</language>
    <copyright>© ${new Date().getFullYear()} India Story Project</copyright>
    <itunes:author>India Story Project</itunes:author>
    <itunes:summary>Explore the inspiring tales of change-makers, culture keepers, innovators, and everyday heroes across India.</itunes:summary>
    <description>Explore the inspiring tales of change-makers, culture keepers, innovators, and everyday heroes across India.</description>
    <itunes:owner>
      <itunes:name>India Story Project</itunes:name>
      <itunes:email>support@indiastoryproject.com</itunes:email>
    </itunes:owner>
    <itunes:image href="${host}/logo.png" />
    <itunes:category text="Society &amp; Culture">
      <itunes:category text="History" />
    </itunes:category>
    <itunes:category text="Education" />
    <itunes:explicit>no</itunes:explicit>
    ${rssItems}
  </channel>
</rss>`;

          return new Response(rssFeed.trim(), {
            status: 200,
            headers: {
              "Content-Type": "application/rss+xml; charset=utf-8",
              "Cache-Control": "public, max-age=3600",
            },
          });
        } catch (error) {
          console.error("Failed to generate Podcast RSS Feed:", error);
          return new Response("Internal Server Error", { status: 500 });
        }
      },
    },
  },
});

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}
