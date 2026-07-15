import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { Search, Compass, Clock, Eye, Play, Sparkles, User, MapPin, RefreshCw, Filter } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/videos/")({
  head: () => ({
    meta: [
      { title: "Videos — India Story Project" },
      { name: "description", content: "Watch inspiring video stories, profiles, and documentaries celebrating changemakers across India." },
    ],
  }),
  component: VideosPage,
});

type VideoItem = {
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
  region: string;
  themes: string[];
  featured: boolean;
  createdAt: string;
};

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function VideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [themes, setThemes] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);

  useEffect(() => {
    // Fetch filter options
    Promise.all([
      fetch("/api/themes").then((r) => r.json().catch(() => [])),
      fetch("/api/states").then((r) => r.json().catch(() => ({ states: [] }))),
    ])
      .then(([thms, sts]) => {
        setThemes(["All", ...thms.map((t: any) => t.name)]);
        setStates(["All", ...sts.states.map((s: any) => s.name)]);
      })
      .catch(console.error);
  }, []);

  const fetchVideos = () => {
    setLoading(true);
    let url = `/api/videos?page=${page}&pageSize=12&sortBy=${sortBy}`;
    if (selectedTheme !== "All") url += `&theme=${encodeURIComponent(selectedTheme)}`;
    if (selectedRegion !== "All") url += `&region=${encodeURIComponent(selectedRegion)}`;
    if (searchQuery.trim() !== "") url += `&query=${encodeURIComponent(searchQuery.trim())}`;

    fetch(url)
      .then((r) => r.json())
      .then((data: any) => {
        setVideos(data.videos ?? []);
        setTotalPages(data.pageCount ?? 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVideos();
  }, [page, selectedTheme, selectedRegion, sortBy, searchQuery]);

  const featuredVideo = useMemo(() => {
    return videos.find((v) => v.featured) || videos[0] || null;
  }, [videos]);

  return (
    <SiteLayout>
      <div className="bg-background min-h-screen py-24 md:py-32">
        {/* Header Section */}
        <div className="container mx-auto px-6 border-b border-border/40 pb-10 mb-12">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-sans font-bold mb-3 flex items-center gap-2">
              <Play className="size-4 text-gold fill-gold" /> Cinema Dispatches
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-none tracking-tight">
              Inspiring Stories, <span className="text-primary italic">In Motion.</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-sm md:text-base leading-relaxed font-sans font-medium">
              A premium visual archive of documentaries, ground dispatches, and profiles celebrating change and culture.
            </p>
          </div>
        </div>

        {/* Featured Video Player Banner */}
        {featuredVideo && (
          <div className="container mx-auto px-6 mb-16">
            <div className="border border-border bg-card p-6 flex flex-col lg:flex-row gap-8 items-stretch hover:border-gold/45 transition-colors duration-500 group">
              <div className="flex-1 aspect-video relative overflow-hidden bg-black border border-border/30 rounded-none shrink-0">
                <img
                  src={featuredVideo.thumbnail}
                  alt={featuredVideo.title}
                  className="absolute inset-0 w-full h-full object-cover filter brightness-[0.7] group-hover:scale-[1.01] transition-all duration-[1.2s]"
                />
                <Link
                  to="/videos/$slug"
                  params={{ slug: featuredVideo.slug }}
                  className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/40 transition-colors"
                >
                  <div className="size-16 rounded-full bg-primary/95 border border-gold/40 flex items-center justify-center text-white shadow-elegant hover:scale-105 transition-transform duration-300">
                    <Play className="size-6 text-white fill-white ml-1" />
                  </div>
                </Link>
                <span className="absolute bottom-4 right-4 bg-black/85 border border-white/10 px-2.5 py-1 text-xs font-mono font-bold text-white tracking-wider">
                  {formatDuration(featuredVideo.duration)}
                </span>
              </div>
              <div className="flex-1 flex flex-col justify-between py-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-[10px] tracking-widest font-bold uppercase text-gold font-sans">
                    <span className="bg-primary/10 border border-primary/20 px-2 py-0.5">Featured Video</span>
                    <span className="flex items-center gap-1"><MapPin className="size-3 text-gold/80" /> {featuredVideo.region}</span>
                  </div>
                  <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight hover:text-primary transition-colors">
                    <Link to="/videos/$slug" params={{ slug: featuredVideo.slug }}>
                      {featuredVideo.title}
                    </Link>
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {featuredVideo.excerpt || "No summary provided for this film entry."}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs font-bold tracking-widest uppercase text-muted-foreground font-sans">
                  <span className="flex items-center gap-1.5"><User className="size-3.5 text-gold/80" /> {featuredVideo.authorName}</span>
                  <span className="flex items-center gap-1.5"><Eye className="size-3.5" /> {featuredVideo.viewCount} views</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toolbar Filters */}
        <div className="container mx-auto px-6 mb-12">
          <div className="flex flex-col lg:flex-row flex-wrap gap-4 bg-card/45 border border-border/50 p-6">
            {/* Search Box */}
            <div className="flex-1 min-w-[240px] relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documentaries..."
                className="pl-11 h-12 bg-background border-border rounded-none focus-visible:ring-primary/45 font-sans"
              />
            </div>

            {/* Theme filter */}
            <div className="min-w-[180px] relative flex items-center">
              <Compass className="absolute left-4 size-4 text-gold/80" />
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="w-full h-12 pl-11 pr-8 bg-background border border-border rounded-none focus:outline-none focus:border-primary text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans cursor-pointer appearance-none"
              >
                <option value="All">All Themes</option>
                {themes.filter((t) => t !== "All").map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* State filter */}
            <div className="min-w-[180px] relative flex items-center">
              <MapPin className="absolute left-4 size-4 text-gold/80" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full h-12 pl-11 pr-8 bg-background border border-border rounded-none focus:outline-none focus:border-primary text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans cursor-pointer appearance-none"
              >
                <option value="All">All States</option>
                {states.filter((s) => s !== "All").map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="min-w-[180px] relative flex items-center">
              <Filter className="absolute left-4 size-4 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full h-12 pl-11 pr-8 bg-background border border-border rounded-none focus:outline-none focus:border-primary text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans cursor-pointer appearance-none"
              >
                <option value="newest">Sort: Newest</option>
                <option value="views">Sort: Most Viewed</option>
                <option value="title">Sort: Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="container mx-auto px-6 mb-16">
          {loading && videos.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-video bg-white/5 rounded-none border border-border/30 animate-pulse" />
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border/50 text-muted-foreground text-xs uppercase tracking-widest font-sans font-bold">
              No videos matching the selected criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="border border-border/70 bg-card hover:bg-card/75 hover:border-gold/45 transition-all duration-300 flex flex-col justify-between group overflow-hidden shadow-sm"
                >
                  <div className="aspect-video relative overflow-hidden bg-black border-b border-border/40">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover filter saturate-75 brightness-90 group-hover:scale-[1.02] transition-transform duration-[0.8s] ease-out"
                    />
                    <Link
                      to="/videos/$slug"
                      params={{ slug: video.slug }}
                      className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors"
                    >
                      <div className="size-12 rounded-full bg-primary/90 flex items-center justify-center text-white scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">
                        <Play className="size-4 fill-white ml-0.5" />
                      </div>
                    </Link>
                    <span className="absolute bottom-3 right-3 bg-black/80 px-2 py-0.5 text-[10px] font-mono font-bold text-white border border-white/5">
                      {formatDuration(video.duration)}
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[9px] tracking-widest uppercase font-bold text-gold font-sans">
                        <span>{video.themes[0] || "General"}</span>
                        <span>{video.region}</span>
                      </div>
                      <h3 className="font-display text-xl font-bold leading-snug hover:text-primary transition-colors">
                        <Link to="/videos/$slug" params={{ slug: video.slug }}>
                          {video.title}
                        </Link>
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-1">
                        {video.excerpt || "No description available."}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground font-sans font-medium">
                      <span>{video.authorName}</span>
                      <span className="flex items-center gap-1"><Eye className="size-3" /> {video.viewCount} views</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination buttons */}
        {totalPages > 1 && (
          <div className="container mx-auto px-6 flex justify-center gap-2 mt-8">
            <Button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              variant="outline"
              className="h-10 px-4 rounded-none border border-border bg-transparent text-white font-sans text-xs uppercase tracking-widest"
            >
              Previous
            </Button>
            <Button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              variant="outline"
              className="h-10 px-4 rounded-none border border-border bg-transparent text-white font-sans text-xs uppercase tracking-widest"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
