import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PremiumLoader } from "@/components/common/PremiumLoader";
import {
  ArrowLeft,
  BookOpen,
  Compass,
  Mail,
  Globe,
  Sparkles,
  User,
  Clock,
  Eye,
  Play,
  Plus,
  Check,
  MapPin,
} from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/authors/$id")({
  component: AuthorDetailPage,
});

type AuthorDetail = {
  author: {
    id: string;
    name: string;
    bio?: string;
    avatar?: string;
    joinedAt: string;
    location: string;
    verified: boolean;
    followersCount: number;
    storyCount: number;
    videoCount: number;
    totalViews: number;
  };
  stories: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    publishedAt: string;
    viewCount: number;
    region: string;
    themes: string[];
    image?: string | null;
  }>;
  videos: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    publishedAt: string;
    viewCount: number;
    region: string;
    themes: string[];
    thumbnail: string;
    duration: number;
  }>;
};

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function AuthorDetailPage() {
  const { id } = Route.useParams();
  const { user, session } = useAuthStore();
  const [data, setData] = useState<AuthorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"stories" | "videos">("stories");
  const [isFollowed, setIsFollowed] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const fetchAuthorData = () => {
    setLoading(true);
    setError(null);
    fetch(`/api/authors/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Author portfolio failed to load");
        return r.json();
      })
      .then((res) => setData(res))
      .catch((err) => setError(err.message || "Failed to load author"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAuthorData();
  }, [id]);

  // Check if following
  useEffect(() => {
    if (!user || !session) return;
    fetch(`/api/authors/follow?authorId=${id}`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })
      .then((r) => r.json())
      .then((d) => setIsFollowed(d.followed))
      .catch(console.error);
  }, [id, user, session]);

  const handleFollow = async () => {
    if (!user || !session) {
      toast.warning("Please log in to follow chroniclers.");
      return;
    }
    setFollowLoading(true);
    try {
      const res = await fetch("/api/authors/follow", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ authorId: id }),
      });
      const d = await res.json();
      if (res.ok) {
        setIsFollowed(d.followed);
        setData((p) => {
          if (!p) return null;
          return {
            ...p,
            author: {
              ...p.author,
              followersCount: p.author.followersCount + (d.followed ? 1 : -1),
            },
          };
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return <PremiumLoader />;
  }

  if (error || !data) {
    return (
      <SiteLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background text-center px-6">
          <h1 className="font-display text-4xl font-bold mb-4">Chronicler Profile Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The profile you're looking for doesn't exist.
          </p>
          <Link
            to="/authors"
            className="flex items-center gap-2 text-gold hover:text-saffron font-semibold font-sans transition-colors uppercase tracking-widest text-xs"
          >
            <ArrowLeft className="size-4" /> Back to Chroniclers
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const { author, stories, videos } = data;

  return (
    <SiteLayout>
      <div className="bg-background min-h-screen py-24 md:py-32">
        <div className="container mx-auto px-6">
          {/* Back button */}
          <Link
            to="/authors"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors mb-8 font-sans"
          >
            <ArrowLeft className="size-3.5" /> Directory
          </Link>

          {/* Profile Card Summary */}
          <div className="border border-border/80 bg-card p-6 md:p-10 hover:border-gold/30 transition-all duration-300 shadow-elegant mb-12">
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 md:gap-8">
              {author.avatar ? (
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="size-24 md:size-32 rounded-full object-cover border-2 border-gold/40 shadow-md shrink-0"
                />
              ) : (
                <div className="size-24 md:size-32 rounded-full bg-white/5 border-2 border-gold/40 flex items-center justify-center text-3xl font-bold text-gold uppercase shrink-0">
                  {author.name[0]}
                </div>
              )}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center md:justify-start">
                    <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">
                      {author.name}
                    </h1>
                    <span className="bg-gold/10 border border-gold/35 text-gold text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-none font-sans self-center">
                      Verified Chronicler
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 font-sans flex items-center justify-center md:justify-start gap-1">
                    <MapPin className="size-3.5 text-gold" /> {author.location} • Joined{" "}
                    {new Date(author.joinedAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm md:text-base leading-relaxed text-muted-foreground/95 max-w-2xl font-sans font-medium">
                  {author.bio ||
                    "Writer and visual journalist capturing deep stories of resilience, culture, and progress from the heartlands of India."}
                </p>

                {/* Direct Action triggers */}
                <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
                  <Button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`h-10 px-5 rounded-none font-sans text-xs uppercase tracking-widest gap-2 ${
                      isFollowed
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-primary hover:bg-primary/90 text-white"
                    }`}
                  >
                    {isFollowed ? (
                      <>
                        <Check className="size-4" /> Following
                      </>
                    ) : (
                      <>
                        <Plus className="size-4" /> Follow Author
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 px-5 rounded-none border border-border bg-transparent hover:bg-white/5 text-white/60 font-sans text-xs uppercase tracking-widest gap-2"
                  >
                    <Mail className="size-4" /> Contact
                  </Button>
                </div>
              </div>
            </div>

            {/* Author details indicators */}
            <div className="mt-10 pt-8 border-t border-border/40 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs uppercase font-bold tracking-wider text-muted-foreground font-sans">
              <div className="border-r border-border/40 last:border-0">
                <span className="text-white text-xl md:text-2xl block font-mono font-medium">
                  {author.storyCount}
                </span>
                <span className="text-[10px] font-sans">Stories</span>
              </div>
              <div className="border-r border-border/40 last:border-0">
                <span className="text-white text-xl md:text-2xl block font-mono font-medium">
                  {author.videoCount}
                </span>
                <span className="text-[10px] font-sans">Videos</span>
              </div>
              <div className="border-r border-border/40 last:border-0 font-mono">
                <span className="text-white text-xl md:text-2xl block font-medium">
                  {author.followersCount}
                </span>
                <span className="text-[10px] font-sans">Followers</span>
              </div>
              <div>
                <span className="text-white text-xl md:text-2xl block font-mono font-medium">
                  {author.totalViews > 1000
                    ? `${(author.totalViews / 1000).toFixed(1)}k`
                    : author.totalViews}
                </span>
                <span className="text-[10px] font-sans">Readership Views</span>
              </div>
            </div>
          </div>

          {/* Portfolio content switcher tabs */}
          <div className="flex border-b border-border/40 mb-8 gap-6 font-sans">
            <button
              onClick={() => setActiveTab("stories")}
              className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${
                activeTab === "stories"
                  ? "border-primary text-white"
                  : "border-transparent text-muted-foreground hover:text-white"
              }`}
            >
              Written Stories ({stories.length})
            </button>
            <button
              onClick={() => setActiveTab("videos")}
              className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${
                activeTab === "videos"
                  ? "border-primary text-white"
                  : "border-transparent text-muted-foreground hover:text-white"
              }`}
            >
              Video Dispatches ({videos.length})
            </button>
          </div>

          {/* Tab content grids */}
          {activeTab === "stories" ? (
            stories.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border/50 text-xs text-muted-foreground uppercase tracking-widest font-sans font-bold">
                No written stories published by this chronicler.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {stories.map((story) => (
                  <div
                    key={story.id}
                    className="border border-border/60 bg-card hover:bg-card/75 hover:border-gold/40 transition-colors flex flex-col justify-between group overflow-hidden"
                  >
                    {story.image && (
                      <div className="aspect-video w-full overflow-hidden bg-muted">
                        <img
                          src={story.image}
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[9px] tracking-widest uppercase font-bold text-gold font-sans">
                          <span>{story.themes[0] || "General"}</span>
                          <span>{story.region}</span>
                        </div>
                        <h3 className="font-display text-lg font-bold leading-snug hover:text-primary transition-colors">
                          <Link to="/stories/$slug" params={{ slug: story.slug }}>
                            {story.title}
                          </Link>
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-1">
                          {story.excerpt}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground font-sans">
                        <span>{new Date(story.publishedAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="size-3" /> {story.viewCount} reads
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : videos.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border/50 text-xs text-muted-foreground uppercase tracking-widest font-sans font-bold">
              No video dispatches published by this chronicler.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="border border-border/60 bg-card hover:bg-card/75 hover:border-gold/40 transition-colors flex flex-col justify-between group overflow-hidden"
                >
                  <div className="aspect-video relative overflow-hidden bg-black">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover filter brightness-90 group-hover:scale-105 transition-transform duration-500"
                    />
                    <Link
                      to="/videos/$slug"
                      params={{ slug: video.slug }}
                      className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors"
                    >
                      <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all">
                        <Play className="size-4 fill-white text-white ml-0.5" />
                      </div>
                    </Link>
                    <span className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 text-[9px] font-mono text-white">
                      {formatDuration(video.duration)}
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[9px] tracking-widest uppercase font-bold text-gold font-sans">
                        <span>{video.themes[0] || "General"}</span>
                        <span>{video.region}</span>
                      </div>
                      <h3 className="font-display text-lg font-bold leading-snug hover:text-primary transition-colors">
                        <Link to="/videos/$slug" params={{ slug: video.slug }}>
                          {video.title}
                        </Link>
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-1">
                        {video.excerpt}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground font-sans">
                      <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="size-3" /> {video.viewCount} views
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
