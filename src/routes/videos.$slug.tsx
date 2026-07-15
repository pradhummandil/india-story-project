import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Play, Eye, Compass, User, MapPin, Calendar, Clock } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";

export const Route = createFileRoute("/videos/$slug")({
  component: VideoDetailPage,
});

type VideoDetail = {
  video: {
    id: string;
    title: string;
    titleHi?: string;
    excerpt?: string;
    excerptHi?: string;
    slug: string;
    videoUrl: string;
    provider: string;
    duration: number;
    viewCount: number;
    thumbnail: string;
    authorName: string;
    authorBio?: string;
    authorAvatar?: string;
    region: string;
    themes: string[];
    createdAt: string;
  };
  recommended: Array<{
    id: string;
    title: string;
    slug: string;
    thumbnail: string;
    duration: number;
    viewCount: number;
    region: string;
    themes: string[];
  }>;
};

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function VideoDetailPage() {
  const { slug } = Route.useParams();
  const [data, setData] = useState<VideoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/videos/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Video not found or failed to load");
        return r.json();
      })
      .then((res) => setData(res))
      .catch((err) => setError(err.message || "Failed to load video"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <SiteLayout>
        <div className="min-h-[70vh] flex items-center justify-center bg-background">
          <div className="text-muted-foreground font-sans font-semibold uppercase tracking-widest text-xs animate-pulse">
            Loading Video Dispatches…
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (error || !data) {
    return (
      <SiteLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background text-center px-6">
          <h1 className="font-display text-4xl font-bold mb-4">Video Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The video dispatch you're looking for doesn't exist.
          </p>
          <Link
            to="/videos"
            className="flex items-center gap-2 text-gold hover:text-saffron font-semibold font-sans transition-colors uppercase tracking-widest text-xs"
          >
            <ArrowLeft className="size-4" /> Back to Videos
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const { video, recommended } = data;

  const renderEmbedPlayer = () => {
    if (video.provider === "youtube") {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${video.videoUrl}?autoplay=1`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      );
    }

    if (video.provider === "vimeo") {
      return (
        <iframe
          src={`https://player.vimeo.com/video/${video.videoUrl}?autoplay=1`}
          title={video.title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      );
    }

    // Default self-hosted HTML5 player fallback
    return (
      <video
        src={video.videoUrl}
        controls
        autoPlay
        poster={video.thumbnail}
        className="absolute inset-0 w-full h-full object-contain"
      />
    );
  };

  return (
    <SiteLayout>
      <div className="bg-background min-h-screen py-24 md:py-32">
        <div className="container mx-auto px-6">
          {/* Back button */}
          <Link
            to="/videos"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors mb-6 font-sans"
          >
            <ArrowLeft className="size-3.5" /> Back to Videos
          </Link>

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Player & Details Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Responsive Player Box */}
              <div className="aspect-video w-full relative bg-black border border-border/80 shadow-elegant overflow-hidden">
                {renderEmbedPlayer()}
              </div>

              {/* Title & Stats */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-[10px] tracking-widest font-bold uppercase text-gold font-sans">
                  {video.themes.map((t) => (
                    <span key={t} className="bg-primary/10 border border-primary/20 px-2 py-0.5">
                      {t}
                    </span>
                  ))}
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3 text-gold/80" /> {video.region}
                  </span>
                </div>
                <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight">
                  {video.title}
                </h1>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground font-sans border-y border-border/30 py-3.5 mt-2">
                  <span className="flex items-center gap-1.5">
                    <Eye className="size-4" /> {video.viewCount} views
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-4" /> {formatDuration(video.duration)} duration
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-4" /> {new Date(video.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Excerpt Description */}
              <div className="bg-card/30 border border-border/30 p-6 space-y-4">
                <p className="text-sm md:text-base leading-relaxed text-muted-foreground/90 font-sans font-medium whitespace-pre-line">
                  {video.excerpt ||
                    "No further descriptive info has been populated for this dispatch."}
                </p>
              </div>

              {/* Author Info */}
              <div className="border border-border/70 bg-card p-6 flex items-start gap-4 hover:border-gold/30 transition-colors">
                {video.authorAvatar ? (
                  <img
                    src={video.authorAvatar}
                    alt={video.authorName}
                    className="size-12 rounded-full object-cover border border-white/10 shrink-0"
                  />
                ) : (
                  <div className="size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-gold uppercase shrink-0">
                    {video.authorName[0]}
                  </div>
                )}
                <div>
                  <p className="text-xs uppercase tracking-widest text-gold font-sans font-bold">
                    Producer / Reporter
                  </p>
                  <p className="text-sm font-bold text-white font-sans mt-0.5">
                    {video.authorName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {video.authorBio ||
                      "Dedicated contributor documenting visual dispatches for the India Story Project."}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations Column */}
            <div className="space-y-6">
              <h3 className="text-xs uppercase tracking-widest font-bold text-white border-b border-border/40 pb-3 font-sans">
                Recommended Films
              </h3>
              {recommended.length > 0 ? (
                <div className="space-y-6">
                  {recommended.map((r) => (
                    <div
                      key={r.id}
                      className="border border-border/60 bg-card/60 p-4 hover:border-gold/40 transition-colors group flex gap-3"
                    >
                      <div className="w-28 aspect-video relative overflow-hidden bg-black shrink-0">
                        <img
                          src={r.thumbnail}
                          alt={r.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.2 text-[8px] font-mono text-white">
                          {formatDuration(r.duration)}
                        </span>
                      </div>
                      <div className="min-w-0 flex flex-col justify-between">
                        <h4 className="font-display text-xs font-bold leading-snug hover:text-primary transition-colors line-clamp-2">
                          <Link to="/videos/$slug" params={{ slug: r.slug }}>
                            {r.title}
                          </Link>
                        </h4>
                        <div className="text-[9px] text-muted-foreground font-sans mt-1">
                          <span className="block font-semibold text-gold/85">{r.region}</span>
                          <span>{r.viewCount} views</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground font-sans italic">
                  No similar video recommendations found.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
