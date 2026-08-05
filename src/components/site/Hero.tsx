import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from "framer-motion";
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

// Check for reduced motion preference (SSR-safe)
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

// Split title into words for staggered reveal
function WordReveal({
  text,
  delay = 0,
  reducedMotion,
}: {
  text: string;
  delay?: number;
  reducedMotion: boolean;
}) {
  const words = text.split(" ");

  if (reducedMotion) {
    return <>{text}</>;
  }

  return (
    <>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em] last:mr-0">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{
              duration: 0.7,
              delay: delay + i * 0.06,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </>
  );
}

// Magnetic button wrapper — follows cursor within a radius
function MagneticButton({
  children,
  reducedMotion,
}: {
  children: React.ReactNode;
  reducedMotion: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 20 });
  const sy = useSpring(y, { stiffness: 200, damping: 20 });

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reducedMotion) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      // Only apply within 80px radius for subtlety
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 80;
      if (dist < maxDist) {
        x.set(dx * 0.25);
        y.set(dy * 0.25);
      }
    },
    [reducedMotion, x, y],
  );

  const onLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={reducedMotion ? {} : { x: sx, y: sy }}
      className="inline-flex"
    >
      {children}
    </motion.div>
  );
}

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
  const reducedMotion = usePrefersReducedMotion();

  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [direction, setDirection] = useState<1 | -1>(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Parallax scroll tracking
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);

  useEffect(() => {
    const buildSlides = async () => {
      if (propSlides && propSlides.length > 0) {
        setSlides(propSlides);
        setLoaded(true);
        return;
      }
      if (typeof window !== "undefined" && (window as any).__STORIES_DATA__?.heroSlides?.length > 0) {
        setSlides((window as any).__STORIES_DATA__.heroSlides);
        setLoaded(true);
        return;
      }
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
    channel.onmessage = () => { buildSlides(); };
    return () => { channel.close(); };
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

  const next = useCallback(() => { goTo(current + 1, 1); }, [current, goTo]);
  const prev = useCallback(() => { goTo(current - 1, -1); }, [current, goTo]);

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

  const cleanExcerpt = (text: string | undefined, maxLen = 120): string => {
    if (!text) return "";
    const cleaned = text
      .replace(/^ISP\s+\w+\s+Bureau\s+/i, "")
      .replace(/^ISP\s+Bureau\s+/i, "")
      .replace(/\s*\[…\]\s*$/, "")
      .replace(/\s*\[\.\.\.\]\s*$/, "")
      .trim();
    if (cleaned.length <= maxLen) return cleaned;
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
      ref={sectionRef}
      className="relative w-full min-h-[580px] h-[85dvh] sm:h-[100vh] flex items-center justify-center overflow-hidden bg-black text-white max-w-[100vw]"
      aria-label="Featured Stories"
    >
      {/* ── Background slides with parallax ── */}
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={`bg-${current}`}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Parallax wrapper — only when motion is OK */}
          <motion.div
            className="absolute inset-0 will-change-transform overflow-hidden"
            style={reducedMotion ? {} : { y: bgY }}
          >
            <img
              src={getOptimizedImageUrl(slide.image, 1920)}
              srcSet={getResponsiveSrcSet(slide.image, [640, 1024, 1920])}
              sizes="100vw"
              alt={title}
              className="w-full h-[115%] object-cover"
              style={{ objectPosition: "center 20%" }}
              loading="eager"
              fetchPriority="high"
              decoding="sync"
              width="1920"
              height="1080"
            />
          </motion.div>

          {/* Cinematic gradients */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/15 to-black/85 z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent z-10" />
        </motion.div>
      </AnimatePresence>

      {/* ── Ambient gradient orbs (brand colors, very slow drift) ── */}
      <div aria-hidden className="absolute inset-0 z-5 pointer-events-none overflow-hidden max-w-full">
        <motion.div
          className="absolute -top-40 -left-40 size-[500px] sm:size-[700px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(200,169,106,0.14) 0%, transparent 70%)" }}
          animate={reducedMotion ? {} : { x: [0, 60, -30, 0], y: [0, 80, 40, 0] }}
          transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 -right-60 size-[450px] sm:size-[600px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(255,153,51,0.10) 0%, transparent 70%)" }}
          animate={reducedMotion ? {} : { x: [0, -80, 20, 0], y: [0, 60, -40, 0] }}
          transition={{ duration: 42, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-20 left-1/3 size-[400px] sm:size-[500px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(139,0,0,0.16) 0%, transparent 70%)" }}
          animate={reducedMotion ? {} : { x: [0, 40, -50, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* ── Floating Ambient Particles ── */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden opacity-25 max-w-full">
        {!reducedMotion && [...Array(12)].map((_, i) => {
          const size = Math.random() * 5 + 2;
          const delay = Math.random() * 6;
          const duration = Math.random() * 10 + 10;
          const left = Math.random() * 100;
          return (
            <motion.div
              key={i}
              className="absolute bottom-[-10px] rounded-full bg-gold/30 blur-[1px]"
              style={{ width: size, height: size, left: `${left}%` }}
              animate={{ y: ["0vh", "-110vh"], x: ["0px", `${Math.random() * 30 - 15}px`, "0px"], opacity: [0, 0.8, 0.8, 0] }}
              transition={{ duration, repeat: Infinity, delay, ease: "linear" }}
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
          className="relative z-20 w-full max-w-6xl mx-auto px-5 sm:px-6 md:px-12 flex flex-col items-start text-left space-y-4 sm:space-y-5 mt-8 sm:mt-16 md:mt-20 pb-16 sm:pb-0"
          initial={{ opacity: 0, y: 30, x: direction > 0 ? 20 : -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20, x: direction > 0 ? -20 : 20 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[9px] sm:text-xs uppercase tracking-[0.2em] font-sans font-bold text-gold">
            {(slide.themes || []).map((t, idx) => (
              <span key={idx} className="bg-primary/25 backdrop-blur-sm px-2.5 py-0.5 border border-primary/20">{t}</span>
            ))}
            {slide.state && (
              <span className="flex items-center gap-1 text-white/70">
                <MapPin className="size-3" />{slide.state}
              </span>
            )}
            <span className="flex items-center gap-1 text-white/60">
              <Clock className="size-3" />{readTime}
            </span>
          </div>

          {/* Title — staggered word reveal */}
          <h1 className="font-display text-2xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.06] text-white tracking-tight max-w-4xl font-bold drop-shadow-lg text-pretty">
            <WordReveal key={`${current}-${title}`} text={title} delay={0.1} reducedMotion={reducedMotion} />
          </h1>

          {/* Author */}
          {(() => {
            const rawAuthor = slide.author;
            const isRealAuthor = !!(
              rawAuthor &&
              rawAuthor.trim() !== "" &&
              rawAuthor.toLowerCase() !== "india story project" &&
              rawAuthor.toLowerCase() !== "not identifiable" &&
              rawAuthor.toLowerCase() !== "isp editorial" &&
              rawAuthor.toLowerCase() !== "unknown"
            );
            const authorName = isRealAuthor ? rawAuthor : "India Story Project";
            return (
              <motion.p
                className="text-[9px] sm:text-xs uppercase tracking-[0.24em] text-white/75 font-sans font-semibold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.55 }}
              >
                {isRealAuthor && (slide as any).authorId ? (
                  <Link
                    to="/authors/$id"
                    params={{ id: (slide as any).authorId }}
                    className="hover:text-gold transition-colors cursor-pointer underline"
                  >
                    {lang === "en" ? `By ${authorName}` : `लेखक: ${authorName}`}
                  </Link>
                ) : (
                  lang === "en" ? `By ${authorName}` : `लेखक: ${authorName}`
                )}
              </motion.p>
            );
          })()}

          {/* Excerpt */}
          {excerpt && (
            <motion.p
              className="text-xs sm:text-base text-white/80 max-w-xl leading-relaxed font-sans font-normal drop-shadow hidden sm:block italic"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
            >
              {excerpt}
            </motion.p>
          )}

          {/* CTA — magnetic buttons */}
          <motion.div
            className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1 sm:pt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.75 }}
          >
            <MagneticButton reducedMotion={reducedMotion}>
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans uppercase tracking-[0.16em] text-[11px] sm:text-xs h-10 sm:h-12 px-6 sm:px-8 rounded-full border border-primary/50 shadow-glow btn-premium transition-all duration-300 min-h-[44px] min-w-[44px]"
              >
                <Link to="/stories/$slug" params={{ slug: slide.slug }}>
                  {lang === "en" ? "Read Story" : "कहानी पढ़ें"}
                  <ArrowRight className="size-4 ml-1.5" />
                </Link>
              </Button>
            </MagneticButton>

            <MagneticButton reducedMotion={reducedMotion}>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white font-sans uppercase tracking-[0.16em] text-[11px] sm:text-xs h-10 sm:h-12 px-6 sm:px-8 rounded-full hover:-translate-y-0.5 transition-transform duration-300 flex items-center gap-2 min-h-[44px] min-w-[44px]"
              >
                <Link to="/share-story">
                  <Sparkles className="size-3.5 text-gold" />
                  {lang === "en" ? "Share Your Story" : "कहानी साझा करें"}
                </Link>
              </Button>
            </MagneticButton>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* ── Desktop Controls (bottom-right) ── */}
      <div className="hidden sm:flex absolute bottom-8 right-6 md:right-12 z-30 items-center gap-3">
        <span className="text-[10px] font-sans tracking-widest text-white/50 uppercase tabular-nums">
          {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>

        <button
          type="button"
          onClick={togglePlay}
          className="size-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
          aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
        >
          {isPlaying ? <Pause className="size-3 text-white" /> : <Play className="size-3 text-white" />}
        </button>

        <button
          type="button"
          onClick={prev}
          className="size-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
          aria-label="Previous slide"
        >
          <ChevronLeft className="size-4 text-white" />
        </button>
        <button
          type="button"
          onClick={next}
          className="size-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
          aria-label="Next slide"
        >
          <ChevronRight className="size-4 text-white" />
        </button>
      </div>

      {/* ── Desktop Dot indicators (bottom-center) ── */}
      <div className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-30 items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i, i > current ? 1 : -1)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              i === current ? "w-6 h-1.5 bg-gold" : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* ── Mobile Unified Controls Bar (bottom-4 left-4) ── */}
      <div className="flex sm:hidden absolute bottom-4 left-4 right-20 z-30 items-center justify-between bg-black/50 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full">
        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i, i > current ? 1 : -1)}
              className={`transition-all duration-300 rounded-full ${
                i === current ? "w-4 h-1.5 bg-gold" : "w-1.5 h-1.5 bg-white/40"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[9px] font-sans tracking-widest text-white/70 uppercase tabular-nums font-bold">
            {current + 1}/{slides.length}
          </span>
          <button
            type="button"
            onClick={prev}
            className="size-7 rounded-full bg-white/15 flex items-center justify-center text-white"
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="size-7 rounded-full bg-white/15 flex items-center justify-center text-white"
            aria-label="Next slide"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      {/* ── Scroll indicator (desktop only) ── */}
      <div className="hidden md:flex absolute bottom-8 left-12 z-30 flex-col items-center gap-2 pointer-events-none">
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
