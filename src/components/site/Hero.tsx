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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStoriesData } from "@/lib/stories-data";
import { useI18nStore, translateStory } from "@/lib/i18n";
import { getStoryAuthor } from "@/lib/utils";

type HeroSlide = {
  id: string;
  storyId?: string;
  slug: string;
  title: string;
  excerpt: string;
  titleHi?: string;
  excerptHi?: string;
  category: string;
  state: string;
  author: string;
  readingTime?: string | number;
  image: string;
  caption?: string;
};

const SLIDE_DURATION = 8000;

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1524492449929-c42ab9ec4449?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1506461883276-594a12b11cc3?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1585938338392-50a59970d8ee?auto=format&fit=crop&q=80&w=1920",
];

export function CinematicHero() {
  const { stories: dbStories } = useStoriesData();
  const lang = useI18nStore((s) => s.lang);

  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [direction, setDirection] = useState<1 | -1>(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Build slides from DB stories (featured first) or API
  useEffect(() => {
    const buildSlides = async () => {
      // Try API first
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
      } catch {
        // fall through to local stories
      }

      // Fallback: use featured/top stories from store
      if (dbStories.length > 0) {
        const featured = dbStories
          .filter((s) => s.image)
          .slice(0, 7)
          .map((s, i) => {
            const t = translateStory(s, "en");
            return {
              id: s.id || s.slug,
              slug: s.slug,
              title: t.title,
              excerpt: t.excerpt,
              titleHi: s.titleHi,
              excerptHi: s.excerptHi,
              category: s.category,
              state: s.region || "India",
              author: getStoryAuthor(s.slug),
              readingTime: s.readTime,
              image: s.image || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length],
            } as HeroSlide;
          });
        setSlides(featured.length > 0 ? featured : buildFallbackSlides());
        setLoaded(true);
      }
    };

    buildSlides();
  }, [dbStories]);

  function buildFallbackSlides(): HeroSlide[] {
    return FALLBACK_IMAGES.map((img, i) => ({
      id: `fallback-${i}`,
      slug: "stories",
      title: "Stories of India",
      excerpt: "Discover the stories that define a nation.",
      category: "Culture",
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
  const excerpt = lang === "hi" && slide.excerptHi ? slide.excerptHi : slide.excerpt;
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
            src={slide.image}
            alt={title}
            className="w-full h-full object-cover filter saturate-[0.88] brightness-[0.72]"
            loading="eager"
          />
          {/* Cinematic gradients */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black/90 z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/15 to-transparent z-10" />
        </motion.div>
      </AnimatePresence>

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
            <span className="bg-primary/25 backdrop-blur-sm px-3 py-1 border border-primary/20">
              {slide.category}
            </span>
            <span className="flex items-center gap-1 text-white/70">
              <MapPin className="size-3" />
              {slide.state}
            </span>
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
            {lang === "en" ? `By ${slide.author}` : `लेखक: ${slide.author}`}
          </p>

          {/* Excerpt */}
          <p className="text-sm sm:text-base md:text-lg text-white/88 max-w-2xl leading-relaxed font-sans font-medium text-balance drop-shadow hidden sm:block">
            {excerpt}
          </p>

          {/* CTA */}
          <div className="flex items-center gap-3 pt-2">
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
            <Link
              to="/stories"
              className="text-xs text-white/60 font-sans uppercase tracking-widest hover:text-white transition-colors"
            >
              {lang === "en" ? "All Stories" : "सभी कहानियां"}
            </Link>
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
              i === current
                ? "w-6 h-1.5 bg-gold"
                : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"
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

// Keep backward-compatible named export
export { CinematicHero as Hero };
