import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { Rss, Youtube, Headphones, Download, Film, Play, Pause, Volume2, Radio } from "lucide-react";
import { YouTubeStoryCard, type YouTubeVideoItem } from "@/components/site/YouTubeStoryCard";
import { YouTubeModalPlayer } from "@/components/site/YouTubeModalPlayer";

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

const FEATURED_DISPATCHES: YouTubeVideoItem[] = [
  {
    id: "rss-yt-1",
    youtubeId: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    title: "Wonder Woman of India — Dr. Seema Rao's Commando Legacy",
    excerpt: "The extraordinary story of India's only female commando trainer who trained special forces soldiers.",
    duration: 380,
    viewCount: 142000,
    thumbnail: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80",
    authorName: "India Story Project",
    region: "Delhi",
    isShort: false,
  },
  {
    id: "rss-yt-2",
    youtubeId: "https://www.youtube.com/shorts/3JZ_D3ELwOQ",
    title: "10th-Grade Pass Scientist Innovation from Plastic Waste",
    excerpt: "Watch how simple innovation transformed single-use plastic into durable building material.",
    duration: 59,
    viewCount: 98400,
    thumbnail: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80",
    authorName: "ISP Shorts",
    region: "Chhattisgarh",
    isShort: true,
  },
  {
    id: "rss-yt-3",
    youtubeId: "https://www.youtube.com/shorts/fJ9rUzIMcZQ",
    title: "Reviving 1000-Year-Old Tribal Weaving in Bastar Forests",
    excerpt: "Indigenous artisans preserving botanical dye techniques handed down across centuries.",
    duration: 55,
    viewCount: 76500,
    thumbnail: "https://images.unsplash.com/photo-1606744888344-493238951221?w=800&auto=format&fit=crop&q=80",
    authorName: "ISP Shorts",
    region: "Chhattisgarh",
    isShort: true,
  },
];

function RSSPage() {
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideoItem | null>(null);
  const [episodes, setEpisodes] = useState<PodcastEp[]>([]);
  const [playingEpId, setPlayingEpId] = useState<string | null>(null);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch("/api/podcast/episodes")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.episodes)) setEpisodes(data.episodes);
      })
      .catch(console.error);
  }, []);

  const handlePlayToggle = (ep: PodcastEp) => {
    if (playingEpId === ep.id && audioObj) {
      if (audioObj.paused) {
        audioObj.play();
      } else {
        audioObj.pause();
        setPlayingEpId(null);
      }
      return;
    }

    if (audioObj) {
      audioObj.pause();
    }

    const newAudio = new Audio(ep.audioUrl);
    newAudio.play().catch(console.error);
    setAudioObj(newAudio);
    setPlayingEpId(ep.id);

    // Track analytics play
    fetch("/api/podcast/episodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ episodeId: ep.id, action: "play" }),
    }).catch(() => {});

    newAudio.onended = () => {
      setPlayingEpId(null);
      fetch("/api/podcast/episodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episodeId: ep.id, action: "complete" }),
      }).catch(() => {});
    };
  };

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

        {/* Playable Podcast Episodes */}
        <div className="container mx-auto px-6 mb-16 space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <Headphones className="size-5 text-gold" /> Playable Podcast Episodes
            </h2>
            <span className="text-xs font-sans text-muted-foreground">Powered by PostgreSQL & AI Audio</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {episodes.map((ep) => {
              const isPlaying = playingEpId === ep.id;
              return (
                <div
                  key={ep.id}
                  className={`p-4 rounded-xl border transition-all flex gap-4 items-center ${
                    isPlaying ? "bg-primary/10 border-primary" : "bg-card/45 border-border hover:border-gold/30"
                  }`}
                >
                  <div className="relative size-16 rounded-lg overflow-hidden shrink-0 bg-muted">
                    <img src={ep.imageUrl} alt={ep.title} className="size-full object-cover" />
                    <button
                      onClick={() => handlePlayToggle(ep)}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center text-white hover:scale-105 transition-transform"
                    >
                      {isPlaying ? <Pause className="size-6 text-gold fill-gold" /> : <Play className="size-6 text-white fill-white ml-0.5" />}
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-foreground truncate">{ep.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{ep.excerpt}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground font-sans">
                      <span>👤 {ep.authorName}</span>
                      <span>⏱️ {Math.ceil((ep.duration || 300) / 60)} mins</span>
                      <span>▶️ {ep.playCount || 0} plays</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Video Dispatches Section */}
        <div className="container mx-auto px-6 mb-16 space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <Film className="size-5 text-gold" /> Video Dispatches & YouTube Shorts
            </h2>
            <span className="text-xs font-sans text-muted-foreground">Playable On Site</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {FEATURED_DISPATCHES.map((v, idx) => (
              <YouTubeStoryCard
                key={v.id}
                video={v}
                index={idx}
                onPlay={(selected) => setSelectedVideo(selected)}
              />
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
