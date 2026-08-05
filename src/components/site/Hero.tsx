import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  ArrowRight,
  ChevronDown,
  Pause,
  Play,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18nStore, translateStory } from "@/lib/i18n";
import { getOptimizedImageUrl, getResponsiveSrcSet } from "@/lib/utils";

type HeroSlide = {
  id: string;
  storyId?: string;
  slug: string;
  title: string;
  excerpt: string;
  titleHi?: string | undefined;
  excerptHi?: string | undefined;
  themes?: string[];
  state?: string | null;
  author?: string | null;
  readingTime?: string | number | undefined;
  image: string;
  caption?: string | undefined;
};

const SLIDE_DURATION = 8000;

const FALLBACK_IMAGES = [
  "/Logo-ISP.jpg",
  "/Logo-ISP.jpg",
  "/Logo-ISP.jpg",
  "/Logo-ISP.jpg",
  "/Logo-ISP.jpg",
];

export function CinematicHero({
  heroSlides: propSlides,
  todayPublicationCount = 0,
  latestStoriesTitles = [],
}: {
  heroSlides?: HeroSlide[];
  todayPublicationCount?: number;
  latestStoriesTitles?: string[];
}) {
  const lang = useI18nStore((s) => s.lang);

  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [direction, setDirection] = useState<1 | -1>(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const buildSlides = async () => {
      // 1. Prefer slides from TanStack loader (passed as prop) — no HTTP fetch needed
      if (propSlides && propSlides.length > 0) {
        setSlides(propSlides);
        setLoaded(true);
        return;
      }
      // 2. Use SSR-injected global (if present)
      if (typeof window !== "undefined" && (window as any).__STORIES_DATA__?.heroSlides?.length > 0) {
        setSlides((window as any).__STORIES_DATA__.heroSlides);
        setLoaded(true);
        return;
      }
      // 3. Fall back to API fetch
      try {
        const res = await fetch("/api/hero-slides");
        if (res.ok) {
          const data = await res.json();
          if (data.slides && data.slides.length > 0) {
            setSlides(data.slides);
            setLoaded(true);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch hero slides:", err);
      }
      setSlides(buildFallbackSlides());
      setLoaded(true);
    };

    buildSlides();

    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel("isp-stories-updates");
    channel.onmessage = () => {
      buildSlides();
    };

    return () => {
      channel.close();
    };
  }, [propSlides]);

  function buildFallbackSlides(): HeroSlide[] {
    return FALLBACK_IMAGES.map((img, i) => ({
      id: `fallback-${i}`,
      slug: "stories",
      title: "Stories of India",
      excerpt: "Discover the stories that define a nation.",
      themes: ["Culture"],
      state: "India",
      author: "India Story Project",
      image: img,
    }));
  }

  const goTo = useCallback(
    (index: number, dir: 1 | -1 = 1) => {
      setDirection(dir);
      setCurrent((index + slides.length) % slides.length);
    },
    [slides.length],
  );

  const next = useCallback(() => {
    goTo(current + 1, 1);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo(current - 1, -1);
  }, [current, goTo]);

  // Auto-advance
  useEffect(() => {
    if (!isPlaying || slides.length <= 1) return;
    intervalRef.current = setInterval(next, SLIDE_DURATION);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, next, slides.length]);

  const togglePlay = () => setIsPlaying((v) => !v);

  if (!loaded || slides.length === 0) {
    return (
      <section className="relative w-full h-[100vh] bg-black flex items-center justify-center">
        <div className="text-white/40 font-sans text-xs uppercase tracking-widest animate-pulse">
          Loading…
        </div>
      </section>
    );
  }

  const slide = slides[current];
  const title = lang === "hi" && slide.titleHi ? slide.titleHi : slide.title;
  const rawExcerpt = lang === "hi" && slide.excerptHi ? slide.excerptHi : slide.excerpt;

  // Strip CMS bureau prefixes and truncate to a clean teaser
  const cleanExcerpt = (text: string | undefined, maxLen = 120): string => {
    if (!text) return "";
    // Remove bureau prefixes like "ISP Ahmedabad Bureau", "ISP Delhi Bureau", etc.
    const cleaned = text
      .replace(/^ISP\s+\w+\s+Bureau\s+/i, "")
      .replace(/^ISP\s+Bureau\s+/i, "")
      .replace(/\s*\[…\]\s*$/, "")
      .replace(/\s*\[\.\.\.\]\s*$/, "")
      .trim();
    if (cleaned.length <= maxLen) return cleaned;
    // Cut at last word boundary before maxLen
    const cut = cleaned.slice(0, maxLen);
    return cut.slice(0, cut.lastIndexOf(" ")) + "…";
  };

  const excerpt = cleanExcerpt(rawExcerpt);
  const readTime =
    typeof slide.readingTime === "number"
      ? `${slide.readingTime} min read`
      : slide.readingTime || "4 min read";

  return (
    <section
      className="relative w-full h-[100vh] flex items-center justify-center overflow-hidden bg-black text-white"
      aria-label="Featured Stories"
    >
      {/* ── Background slides ── */}
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={`bg-${current}`}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={getOptimizedImageUrl(slide.image, 1920)}
            srcSet={getResponsiveSrcSet(slide.image, [640, 1024, 1920])}
            sizes="100vw"
            alt={title}
            className="w-full h-full object-cover"
            style={{ objectPosition: "center 20%" }}
            loading="eager"
            fetchPriority="high"
            decoding="sync"
            width="1920"
            height="1080"
          />
          {/* Cinematic gradients — left-heavy so image on right stays visible */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/15 to-black/85 z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent z-10" />
        </motion.div>
      </AnimatePresence>

      {/* ── Floating Ambient Particles ── */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden opacity-25">
        {[...Array(12)].map((_, i) => {
          const size = Math.random() * 5 + 2;
          const delay = Math.random() * 6;
          const duration = Math.random() * 10 + 10;
          const left = Math.random() * 100;
          return (
            <motion.div
              key={i}
              className="absolute bottom-[-10px] rounded-full bg-gold/30 blur-[1px]"
              style={{
                width: size,
                height: size,
                left: `${left}%`,
              }}
              animate={{
                y: ["0vh", "-110vh"],
                x: ["0px", `${Math.random() * 30 - 15}px`, "0px"],
                opacity: [0, 0.8, 0.8, 0],
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay,
                ease: "linear",
              }}
            />
          );
        })}
      </div>



      {/* ── Slide progress bar ── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 h-[2px] bg-white/10">
        {isPlaying && (
          <motion.div
            key={`progress-${current}`}
            className="h-full bg-gold"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
          />
        )}
      </div>

      {/* ── Content ── */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`content-${current}`}
          className="relative z-20 w-full max-w-6xl mx-auto px-6 md:px-12 flex flex-col items-start text-left space-y-5 mt-16 md:mt-20"
          initial={{ opacity: 0, y: 30, x: direction > 0 ? 20 : -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20, x: direction > 0 ? -20 : 20 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] sm:text-xs uppercase tracking-[0.22em] font-sans font-bold text-gold">
            {(slide.themes || []).map((t, idx) => (
              <span
                key={idx}
                className="bg-primary/25 backdrop-blur-sm px-3 py-1 border border-primary/20"
              >
                {t}
              </span>
            ))}
            {slide.state && (
              <span className="flex items-center gap-1 text-white/70">
                <MapPin className="size-3" />
                {slide.state}
              </span>
            )}
            <span className="flex items-center gap-1 text-white/60">
              <Clock className="size-3" />
              {readTime}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.04] text-white tracking-tight max-w-4xl font-bold drop-shadow-lg text-pretty">
            {title}
          </h1>

          {/* Author */}
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.28em] text-white/75 font-sans font-semibold">
            {lang === "en"
              ? `By ${slide.author || "ISP Editorial"}`
              : `लेखक: ${slide.author || "आईएसपी एडिटोरियल"}`}
          </p>

          {/* Excerpt — clean teaser, max 2 lines */}
          {excerpt && (
            <p className="text-sm sm:text-base text-white/80 max-w-xl leading-relaxed font-sans font-normal drop-shadow hidden sm:block italic">
              {excerpt}
            </p>
          )}

          {/* CTA */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans uppercase tracking-[0.18em] text-xs h-12 px-8 rounded-full border border-primary/50 shadow-glow hover:-translate-y-0.5 transition-transform duration-300"
            >
              <Link to="/stories/$slug" params={{ slug: slide.slug }}>
                {lang === "en" ? "Read Story" : "कहानी पढ़ें"}
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white font-sans uppercase tracking-[0.18em] text-xs h-12 px-8 rounded-full hover:-translate-y-0.5 transition-transform duration-300 flex items-center gap-2"
            >
              <Link to="/share-story">
                <Sparkles className="size-3.5 text-gold" />
                {lang === "en" ? "Share Your Story" : "कहानी साझा करें"}
              </Link>
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Controls (bottom-right) ── */}
      <div className="absolute bottom-10 right-6 md:right-12 z-30 flex items-center gap-3">
        {/* Slide counter */}
        <span className="text-[10px] font-sans tracking-widest text-white/50 uppercase tabular-nums">
          {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>

        {/* Play/pause */}
        <button
          onClick={togglePlay}
          className="size-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
          aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
        >
          {isPlaying ? (
            <Pause className="size-3 text-white" />
          ) : (
            <Play className="size-3 text-white" />
          )}
        </button>

        {/* Prev / Next */}
        <button
          onClick={prev}
          className="size-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="size-4 text-white" />
        </button>
        <button
          onClick={next}
          className="size-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="size-4 text-white" />
        </button>
      </div>

      {/* ── Dot indicators (bottom-center) ── */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > current ? 1 : -1)}
            className={`transition-all duration-300 rounded-full ${
              i === current ? "w-6 h-1.5 bg-gold" : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* ── Scroll indicator ── */}
      <div className="absolute bottom-10 left-6 md:left-12 z-30 flex flex-col items-center gap-2 pointer-events-none">
        <span className="text-[9px] uppercase tracking-[0.4em] text-white/50 font-sans font-bold">
          {lang === "en" ? "Scroll" : "स्क्रॉल"}
        </span>
        <ChevronDown className="size-3.5 text-gold animate-bounce" />
      </div>
    </section>
  );
}

// Keep backward-compatible named exports
export { CinematicHero as Hero };
export type { HeroSlide };
