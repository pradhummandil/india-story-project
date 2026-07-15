import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { ArrowLeft, Play, Pause, ChevronLeft, ChevronRight, Share2, Bookmark, Check } from "lucide-react";

export const Route = createFileRoute("/web-stories/$slug")({
  component: WebStoryPlayerPage,
});

type StoryPage = {
  id: string;
  imageUrl: string;
  heading?: string;
  headingHi?: string;
  text?: string;
  textHi?: string;
  sortOrder: number;
  durationMs: number;
};

type WebStoryDetail = {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  excerpt?: string;
  authorName: string;
  authorAvatar?: string;
  pages: StoryPage[];
};

function WebStoryPlayerPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState<WebStoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const progressIntervalRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());
  const elapsedRef = useRef<number>(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/web-stories/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Web story not found");
        return r.json();
      })
      .then((res) => {
        setStory(res);
        setActiveIndex(0);
        setProgress(0);
        elapsedRef.current = 0;
      })
      .catch((err) => setError(err.message || "Failed to load web story"))
      .finally(() => setLoading(false));
  }, [slug]);

  const activePage = story?.pages?.[activeIndex] || null;
  const pageDuration = activePage?.durationMs || 5000;

  // Progress Bar timer logic
  useEffect(() => {
    if (!story || !isPlaying || loading || error) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      return;
    }

    lastTimeRef.current = Date.now();

    progressIntervalRef.current = window.setInterval(() => {
      const now = Date.now();
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      elapsedRef.current += delta;
      const currentProgress = (elapsedRef.current / pageDuration) * 100;

      if (elapsedRef.current >= pageDuration) {
        // Go to next page
        elapsedRef.current = 0;
        setProgress(0);
        if (activeIndex < story.pages.length - 1) {
          setActiveIndex((prev) => prev + 1);
        } else {
          // Finished all pages, loop back to start or pause
          setActiveIndex(0);
          setIsPlaying(false);
        }
      } else {
        setProgress(currentProgress);
      }
    }, 30);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [story, activeIndex, isPlaying, pageDuration, loading, error]);

  const handleNext = () => {
    if (!story) return;
    elapsedRef.current = 0;
    setProgress(0);
    if (activeIndex < story.pages.length - 1) {
      setActiveIndex((prev) => prev + 1);
    } else {
      setActiveIndex(0);
    }
  };

  const handlePrev = () => {
    if (!story) return;
    elapsedRef.current = 0;
    setProgress(0);
    if (activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    } else {
      setActiveIndex(story.pages.length - 1);
    }
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white/50 font-sans font-semibold uppercase tracking-widest text-xs">
        Loading Story Frame…
      </div>
    );
  }

  if (error || !story || story.pages.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-6 text-white">
        <h1 className="font-display text-2xl font-bold mb-3">Story Dispatch Unavailable</h1>
        <Link
          to="/web-stories"
          className="text-gold hover:text-saffron font-sans font-bold uppercase tracking-wider text-xs flex items-center gap-1 mt-4"
        >
          <ArrowLeft className="size-4" /> Back to Stories
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center select-none overflow-hidden relative">
      {/* Dynamic blurred background to make frame pop */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 scale-110"
        style={{ backgroundImage: `url(${activePage?.imageUrl})` }}
      />

      {/* Main Container Card (Story format aspect ratio) */}
      <div className="relative w-full max-w-md h-screen md:h-[90vh] md:max-h-[800px] bg-black border border-white/10 shadow-2xl flex flex-col justify-between overflow-hidden z-10">
        {/* Story progress bars */}
        <div className="absolute top-3 inset-x-3 z-40 flex gap-1 px-1">
          {story.pages.map((_, i) => {
            let width = "0%";
            if (i < activeIndex) width = "100%";
            if (i === activeIndex) width = `${progress}%`;

            return (
              <div key={i} className="flex-1 h-1 bg-white/20 overflow-hidden rounded-full">
                <div
                  className="h-full bg-white transition-all duration-75 ease-out"
                  style={{ width }}
                />
              </div>
            );
          })}
        </div>

        {/* Story top controls */}
        <div className="absolute top-6 inset-x-4 z-40 flex items-center justify-between text-white drop-shadow-md">
          <Link
            to="/web-stories"
            className="p-2 rounded-full bg-black/30 hover:bg-black/50 border border-white/5 transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex gap-2">
            <button
              onClick={togglePlay}
              className="p-2 rounded-full bg-black/30 hover:bg-black/50 border border-white/5 transition-colors"
            >
              {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-black/30 hover:bg-black/50 border border-white/5 transition-colors"
            >
              {copied ? <Check className="size-4 text-emerald-400" /> : <Share2 className="size-4" />}
            </button>
          </div>
        </div>

        {/* Click detection columns to navigate */}
        <div className="absolute inset-y-16 inset-x-0 z-30 flex">
          <div onClick={handlePrev} className="w-1/3 h-full cursor-w-resize" />
          <div onClick={togglePlay} className="w-1/3 h-full" />
          <div onClick={handleNext} className="w-1/3 h-full cursor-e-resize" />
        </div>

        {/* Carousel slide images */}
        <div className="absolute inset-0 z-10 w-full h-full bg-[#121212] flex items-center justify-center">
          <img
            src={activePage?.imageUrl}
            alt={activePage?.heading || story.title}
            className="w-full h-full object-cover filter brightness-[0.8]"
          />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
        </div>

        {/* Nav arrows (visible on desktop hover) */}
        <button
          onClick={handlePrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-40 p-2 rounded-full bg-black/30 text-white/70 hover:text-white border border-white/5 hover:bg-black/60 hidden md:flex transition-all"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-40 p-2 rounded-full bg-black/30 text-white/70 hover:text-white border border-white/5 hover:bg-black/60 hidden md:flex transition-all"
        >
          <ChevronRight className="size-5" />
        </button>

        {/* Bottom Story panel contents */}
        <div className="absolute bottom-6 inset-x-6 z-40 text-white space-y-3 pointer-events-none drop-shadow-lg">
          <p className="text-[10px] uppercase font-bold tracking-widest text-gold font-sans">
            By {story.authorName}
          </p>
          {activePage?.heading && (
            <h2 className="font-display text-2xl font-bold leading-tight tracking-tight">
              {activePage.heading}
            </h2>
          )}
          {activePage?.text && (
            <p className="text-xs text-white/80 leading-relaxed font-sans font-medium line-clamp-4">
              {activePage.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
