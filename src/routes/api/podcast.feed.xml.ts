import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";

const db = prisma as any;

export const Route = createFileRoute("/api/podcast/feed/xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const urlObj = new URL(request.url);
        const host = urlObj.origin || "https://indiastoryproject.com";

        try {
          let episodes = await db.podcastEpisode.findMany({
            take: 50,
            orderBy: { publishedAt: "desc" },
            include: {
              story: {
                select: {
                  title: true,
                  excerpt: true,
                  author: { select: { name: true } },
                  images: { take: 1, select: { imageUrl: true } },
                },
              },
            },
          });

          if (episodes.length === 0) {
            const stories = await db.story.findMany({
              where: { status: "Published", deleted: false },
              orderBy: { publishedAt: "desc" },
              take: 20,
              include: {
                author: { select: { name: true } },
                images: { take: 1, select: { imageUrl: true } },
              },
            });

            episodes = stories.map((s: any) => ({
              id: s.id,
              title: s.title,
              slug: s.slug,
              audioUrl: `${host}/api/stories/${s.slug}/audio`,
              coverImage: s.images?.[0]?.imageUrl || `${host}/Logo-ISP.jpg`,
              duration: (s.readingTime || 5) * 60,
              fileSizeBytes: 10485760,
              season: 1,
              episodeNumber: 1,
              explicit: false,
              showNotes: s.excerpt,
              transcript: s.excerpt,
              publishedAt: s.publishedAt || s.createdAt,
              authorName: s.author?.name || "India Story Project",
            }));
          }

          const rssItems = episodes
            .map((ep: any) => {
              const pubDate = new Date(ep.publishedAt).toUTCString();
              const epUrl = `${host}/stories/${ep.slug}`;
              const audioUrl = ep.audioUrl.startsWith("http") ? ep.audioUrl : `${host}${ep.audioUrl}`;
              const imageUrl = ep.coverImage || ep.story?.images?.[0]?.imageUrl || `${host}/Logo-ISP.jpg`;
              const authorName = ep.authorName || ep.story?.author?.name || "India Story Project";
              const notes = ep.showNotes || ep.story?.excerpt || ep.title;
              const durationSec = ep.duration || 600;

              const hours = Math.floor(durationSec / 3600);
              const minutes = Math.floor((durationSec % 3600) / 60);
              const seconds = durationSec % 60;
              const formattedDuration = hours > 0
                ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
                : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

              return `
    <item>
      <title><![CDATA[${ep.title}]]></title>
      <description><![CDATA[${notes}]]></description>
      <link>${epUrl}</link>
      <guid isPermaLink="true">${epUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <enclosure url="${escapeXml(audioUrl)}" length="${ep.fileSizeBytes || 10485760}" type="audio/mpeg" />
      <itunes:author><![CDATA[${authorName}]]></itunes:author>
      <itunes:duration>${formattedDuration}</itunes:duration>
      <itunes:summary><![CDATA[${notes}]]></itunes:summary>
      <itunes:image href="${escapeXml(imageUrl)}" />
      <itunes:explicit>${ep.explicit ? "yes" : "no"}</itunes:explicit>
      <itunes:episodeType>full</itunes:episodeType>
      ${ep.season ? `<itunes:season>${ep.season}</itunes:season>` : ""}
      ${ep.episodeNumber ? `<itunes:episode>${ep.episodeNumber}</itunes:episode>` : ""}
      <content:encoded><![CDATA[${ep.transcript || notes}]]></content:encoded>
    </item>`;
            })
            .join("\n");

          const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" 
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:spotify="http://www.spotify.com/ns/rss"
  xmlns:podcast="https://podcastindex.org/podcast/1.0">
  <channel>
    <title>India Story Project Podcast</title>
    <link>${host}</link>
    <language>en-in</language>
    <copyright>Copyright © ${new Date().getFullYear()} India Story Project</copyright>
    <itunes:author>India Story Project Editorial</itunes:author>
    <itunes:type>episodic</itunes:type>
    <description>Authentic podcast narrations of grassroots change, culture, history, and untold stories across India.</description>
    <itunes:summary>Authentic podcast narrations of grassroots change, culture, history, and untold stories across India.</itunes:summary>
    <itunes:owner>
      <itunes:name>India Story Project</itunes:name>
      <itunes:email>support@indiastoryproject.com</itunes:email>
    </itunes:owner>
    <itunes:image href="${host}/Logo-ISP.jpg" />
    <itunes:category text="Society &amp; Culture">
      <itunes:category text="Documentary" />
    </itunes:category>
    <itunes:category text="Education" />
    <itunes:explicit>no</itunes:explicit>
    <spotify:countryOfOrigin>in</spotify:countryOfOrigin>
    ${rssItems}
  </channel>
</rss>`;

          return new Response(rssFeed.trim(), {
            status: 200,
            headers: {
              "Content-Type": "application/rss+xml; charset=utf-8",
              "Cache-Control": "public, max-age=1800",
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
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}
