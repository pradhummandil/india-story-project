import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  Eye,
  MapPin,
  Youtube,
  Film,
  Zap,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { YouTubeStoryCard, type YouTubeVideoItem, extractYouTubeId } from "@/components/site/YouTubeStoryCard";
import { YOUTUBE_STORY_VIDEOS } from "@/lib/youtube-videos";
import { useI18nStore } from "@/lib/i18n";

export const Route = createFileRoute("/videos/")({
  head: () => ({
    meta: [
      { title: "Videos & YouTube Shorts — India Story Project" },
      {
        name: "description",
        content:
          "Watch documentary dispatches and YouTube Shorts celebrating grassroots changemakers across India.",
      },
    ],
  }),
  component: VideosPage,
});

function VideosPage() {
  const lang = useI18nStore((s) => s.lang);
  const [videos] = useState<YouTubeVideoItem[]>(YOUTUBE_STORY_VIDEOS);
  const [activeTab, setActiveTab] = useState<"all" | "shorts" | "films" | "stories">("all");
  const [searchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [states, setStates] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/states")
      .then((r) => r.json())
      .then((sts) => {
        if (sts?.states) {
          setStates(["All", ...sts.states.map((s: any) => s.name)]);
        }
      })
      .catch(() => {});
  }, []);

  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      if (activeTab === "shorts" && !v.isShort) return false;
      if (activeTab === "films" && (v.isShort || v.category === "story")) return false;
      if (activeTab === "stories" && (v.isShort || v.category !== "story")) return false;

      if (selectedRegion !== "All" && v.region?.toLowerCase() !== selectedRegion.toLowerCase())
        return false;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchTitle = v.title.toLowerCase().includes(q) || (v.titleHi && v.titleHi.toLowerCase().includes(q));
        const matchExcerpt = v.excerpt?.toLowerCase().includes(q) || (v.excerptHi && v.excerptHi.toLowerCase().includes(q));
        if (!matchTitle && !matchExcerpt) return false;
      }
      return true;
    });
  }, [videos, activeTab, selectedRegion, searchQuery]);

  const featuredVideo = useMemo(() => {
    return videos.find((v) => !v.isShort) || videos[0] || null;
  }, [videos]);

  const featuredTitle = lang === "hi" && featuredVideo?.titleHi ? featuredVideo.titleHi : featuredVideo?.title;
  const featuredExcerpt = lang === "hi" && featuredVideo?.excerptHi ? featuredVideo.excerptHi : featuredVideo?.excerpt;

  return (
    <SiteLayout>
      <div className="bg-background min-h-screen py-24 md:py-32">
        {/* Header Section */}
        <div className="container mx-auto px-6 border-b border-border/40 pb-10 mb-12">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-500/20 px-3 py-1 rounded-full text-xs font-sans font-bold uppercase tracking-[0.25em] text-red-500">
              <Youtube className="size-4 text-red-500 fill-red-500" />
              {lang === "hi" ? "आधिकारिक यूट्यूब चैनल @indiastoryproject7282" : "Official YouTube Channel @indiastoryproject7282"}
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold leading-none tracking-tight">
              {lang === "hi" ? (
                <>सिनेमा वीडियोज़ और <span className="text-primary italic">यूट्यूब कहानियाँ</span></>
              ) : (
                <>Cinema Dispatches & <span className="text-primary italic">YouTube Stories</span></>
              )}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed font-sans font-medium">
              {lang === "hi"
                ? "बिना साइट छोड़े सीधे वेबसाइट पर वृत्तचित्र, जमीनी वीडियो कहानियां और वीडियो प्रेषण देखें।"
                : "Watch ground documentaries, video dispatches, and grassroots stories directly on site without leaving the platform."}
            </p>
          </div>
        </div>

        {/* Featured Cinema Dispatch Hero Card */}
        {featuredVideo && (
          <div className="container mx-auto px-6 mb-16">
            <div className="border border-border/80 bg-card p-6 md:p-8 flex flex-col lg:flex-row gap-8 items-stretch rounded-3xl shadow-xl transition-all duration-500">
              <div className="flex-1 aspect-video relative overflow-hidden bg-black border border-border/40 rounded-2xl shrink-0 shadow-lg">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${extractYouTubeId(featuredVideo.youtubeId || featuredVideo.id)}`}
                  title={featuredTitle || ""}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="w-full h-full border-0 rounded-2xl"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between py-2 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-[10px] tracking-widest font-bold uppercase text-gold font-sans">
                    <span className="bg-primary/10 border border-primary/20 px-2.5 py-1 rounded">
                      {lang === "hi" ? "विशेष वृत्तचित्र" : "Featured Documentary"}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="size-3 text-gold/80" /> {featuredVideo.region}
                    </span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold leading-tight transition-colors">
                    {featuredTitle}
                  </h2>
                  {featuredExcerpt && (
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {featuredExcerpt}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-border/40 flex items-center justify-between text-xs font-bold tracking-widest uppercase text-muted-foreground font-sans">
                  <span className="flex items-center gap-1.5 text-foreground/80">
                    <Sparkles className="size-3.5 text-gold" /> {featuredVideo.authorName}
                  </span>
                  {featuredVideo.viewCount && (
                    <span className="flex items-center gap-1.5">
                      <Eye className="size-3.5" /> {featuredVideo.viewCount} {lang === "hi" ? "देखें" : "views"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs & Toolbar */}
        <div className="container mx-auto px-6 mb-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-border/60 pb-6">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-5 py-2.5 rounded-full text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "all"
                    ? "bg-primary text-white shadow-md"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {lang === "hi" ? `सभी वीडियो (${videos.length})` : `All Stories (${videos.length})`}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("shorts")}
                className={`px-5 py-2.5 rounded-full text-xs font-sans font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === "shorts"
                    ? "bg-red-600 text-white shadow-md"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Zap className="size-3.5 text-gold" />
                {lang === "hi" ? "यूट्यूब शॉर्ट्स" : "YouTube Shorts"}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("films")}
                className={`px-5 py-2.5 rounded-full text-xs font-sans font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === "films"
                    ? "bg-primary text-white shadow-md"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Film className="size-3.5 text-gold" />
                {lang === "hi" ? "वृत्तचित्र फिल्में" : "Documentary Films"}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("stories")}
                className={`px-5 py-2.5 rounded-full text-xs font-sans font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === "stories"
                    ? "bg-amber-600 text-white shadow-md"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookOpen className="size-3.5 text-gold" />
                {lang === "hi" ? "वीडियो कहानियां" : "Video Stories"}
              </button>
            </div>

            {/* Region Filter */}
            {states.length > 0 && (
              <div className="min-w-[180px] relative flex items-center">
                <MapPin className="absolute left-4 size-4 text-gold/80" />
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full h-11 pl-11 pr-8 bg-card border border-border rounded-full focus:outline-none focus:border-primary text-xs font-semibold uppercase tracking-wider text-foreground font-sans cursor-pointer appearance-none shadow-sm"
                >
                  {states.map((s) => (
                    <option key={s} value={s}>
                      {s === "All" ? (lang === "hi" ? "सभी राज्य" : "All States & Regions") : s}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Video Stories Grid */}
        <div className="container mx-auto px-6 mb-16">
          {filteredVideos.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border/50 rounded-2xl text-muted-foreground text-xs uppercase tracking-widest font-sans font-bold">
              {lang === "hi" ? "चयनित फ़िल्टर से मेल खाता कोई वीडियो नहीं मिला।" : "No YouTube videos matching your selected filter."}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
              {filteredVideos.map((video, idx) => (
                <YouTubeStoryCard
                  key={video.id}
                  video={video}
                  index={idx}
                />
              ))}
            </div>
          )}
        </div>

        {/* Channel Subscription Footer Banner */}
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-red-950/30 via-card to-background border border-red-500/20 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shrink-0">
                <Youtube className="size-8 fill-current" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">
                  {lang === "hi" ? "यूट्यूब चैनल @indiastoryproject7282 को सब्सक्राइब करें" : "Subscribe to @indiastoryproject7282"}
                </h3>
                <p className="text-xs text-muted-foreground font-sans mt-0.5">
                  {lang === "hi" ? "दैनिक शॉर्ट्स, ग्राउंड रिपोर्ट्स और वृत्तचित्र देखें।" : "Catch fresh daily shorts, ground reports, and documentary premiers."}
                </p>
              </div>
            </div>

            <a
              href="https://www.youtube.com/@indiastoryproject7282/videos"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-sans text-xs uppercase tracking-widest font-bold flex items-center gap-2 shadow-lg transition-colors shrink-0"
            >
              <span>{lang === "hi" ? "यूट्यूब चैनल पर जाएं" : "Visit YouTube Channel"}</span>
              <Youtube className="size-4 fill-current" />
            </a>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
