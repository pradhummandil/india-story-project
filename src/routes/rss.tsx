import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { Rss, Youtube, Headphones, Download, Radio } from "lucide-react";
import { type YouTubeVideoItem } from "@/components/site/YouTubeStoryCard";
import { YouTubeModalPlayer } from "@/components/site/YouTubeModalPlayer";
import { LinkedInVideoCard, LINKEDIN_PODCAST_VIDEOS } from "@/components/site/LinkedInVideoCard";

export const Route = createFileRoute("/rss")({
  head: () => ({
    meta: [
      { title: "Podcast & Video RSS Feed — India Story Project" },
      {
        name: "description",
        content: "Subscribe to India Story Project's podcast RSS feed and stream audio episodes.",
      },
    ],
  }),
  component: RSSPage,
});

interface PodcastEp {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  audioUrl: string;
  duration: number;
  playCount: number;
  publishedAt: string;
  authorName: string;
  imageUrl: string;
}

function RSSPage() {
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideoItem | null>(null);

  return (
    <SiteLayout>
      <div className="bg-background min-h-screen py-24 md:py-32">
        {/* Header Section */}
        <div className="container mx-auto px-6 border-b border-border/40 pb-12 mb-12">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 px-3 py-1 rounded-full text-xs font-sans font-bold uppercase tracking-[0.25em] text-gold">
              <Radio className="size-3.5 text-gold" /> Spotify & Apple Podcast Hub
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              Podcast RSS & <span className="text-primary italic">Video Dispatches</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed font-sans font-medium">
              Stream our audio podcasts and video dispatches directly on website or subscribe on Spotify & Apple Podcasts via standard RSS specs.
            </p>

            {/* Quick Action Links */}
            <div className="pt-4 flex flex-wrap gap-3">
              <a
                href="/api/podcast/feed/xml"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full bg-primary text-white font-sans text-xs uppercase tracking-wider font-bold flex items-center gap-2 shadow-md hover:bg-primary/90 transition-colors"
              >
                <Download className="size-4" />
                Spotify & Apple RSS Feed
              </a>
              <a
                href="/api/rss"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full border border-border bg-card text-foreground font-sans text-xs uppercase tracking-wider font-bold flex items-center gap-2 hover:bg-muted transition-colors"
              >
                <Rss className="size-4 text-gold" />
                Articles RSS XML Feed
              </a>
              <a
                href="https://www.youtube.com/@indiastoryproject7282"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full bg-red-600 text-white font-sans text-xs uppercase tracking-wider font-bold flex items-center gap-2 shadow-md hover:bg-red-700 transition-colors"
              >
                <Youtube className="size-4 fill-current" />
                YouTube Channel
              </a>
            </div>
          </div>
        </div>

        {/* LinkedIn Playable Podcast Episodes Section */}
        <div className="container mx-auto px-6 mb-16 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                <Headphones className="size-5 text-gold" /> Playable Podcast Episodes
              </h2>
              <p className="text-xs text-muted-foreground font-sans mt-1">
                Watch conversations, interviews and stories from the India Story Project Podcast.
              </p>
            </div>
            <span className="text-xs font-sans font-semibold text-blue-500 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full w-fit">
              LinkedIn Video Podcasts
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {LINKEDIN_PODCAST_VIDEOS.map((vid) => (
              <LinkedInVideoCard key={vid.id} video={vid} showTitle />
            ))}
          </div>
        </div>
      </div>

      <YouTubeModalPlayer
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </SiteLayout>
  );
}
