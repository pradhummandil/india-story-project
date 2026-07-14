import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ArrowRight, X, Sparkles } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import type { Story } from "@/components/site/StoryCard";
import { useStoriesData } from "@/lib/stories-data";
import { useI18nStore, translateStory, getCommonText } from "@/lib/i18n";
import { INDIA_PATHS } from "./IndiaPaths";
import { STATE_COORDINATES } from "./StateCoordinates";

interface Hotspot {
  id: string;
  state: string;
  stories: Story[];
  count: number;
  x: number;
  y: number;
}

// Mini Story Card inside state drawer
function MiniStoryCard({ story }: { story: Story }) {
  const lang = useI18nStore((s) => s.lang);
  const commonText = getCommonText(lang);

  return (
    <Link
      to="/stories/$slug"
      params={{ slug: story.slug }}
      className="flex gap-4 p-3 bg-background hover:bg-muted border border-border/40 hover:border-gold/30 transition-all duration-300 group rounded-none"
    >
      <div className="size-20 shrink-0 overflow-hidden bg-muted border border-border/20">
        {story.image ? (
          <img
            src={story.image}
            alt={story.imageAlt || story.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-950/30 to-stone-900 flex items-center justify-center font-display italic text-gold/30">
            ISP
          </div>
        )}
      </div>
      <div className="flex flex-col justify-between py-1 min-w-0 flex-1">
        <div>
          <span className="text-[9px] uppercase tracking-widest text-gold font-sans font-bold">
            {Array.isArray(story.themes) && story.themes.length > 0 ? story.themes[0] : ""}
          </span>
          <h4 className="font-display text-sm font-bold leading-tight line-clamp-2 mt-1 group-hover:text-primary transition-colors">
            {story.title}
          </h4>
        </div>
        <span className="text-[10px] text-muted-foreground font-sans">
          {story.readTime || "4 min read"}
        </span>
      </div>
    </Link>
  );
}

export function StoryMap() {
  const { stories: dbStories } = useStoriesData();
  const lang = useI18nStore((s) => s.lang);
  const commonText = getCommonText(lang);
  const navigate = useNavigate();

  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState<Hotspot | null>(null);
  const [drawerState, setDrawerState] = useState<Hotspot | null>(null);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Translate database stories dynamically
  const localizedStories = useMemo(() => {
    return dbStories.map((s) => translateStory(s, lang));
  }, [dbStories, lang]);

  // Group stories by region/state name
  const storiesByState = useMemo(() => {
    const map: Record<string, Story[]> = {};
    localizedStories.forEach((s) => {
      const stateName = s.region || "India";
      if (!map[stateName]) {
        map[stateName] = [];
      }
      map[stateName].push(s);
    });
    return map;
  }, [localizedStories]);

  // Map state coordinate centers
  const hotspots = useMemo<Hotspot[]>(() => {
    return Object.entries(storiesByState)
      .map(([stateName, list]) => {
        const coords = STATE_COORDINATES[stateName];
        if (!coords) return null;
        return {
          id: stateName,
          state: stateName,
          stories: list,
          count: list.length,
          x: coords.x,
          y: coords.y,
        };
      })
      .filter((h): h is Hotspot => h !== null);
  }, [storiesByState]);

  // Floating tooltip style using responsive percentages
  const tooltipStyle = useMemo(() => {
    if (!active) return {};
    const left = (active.x / 612) * 100;
    const top = (active.y / 696) * 100;
    return {
      left: `${left}%`,
      top: `${top}%`,
      transform: "translate(-50%, -108%)",
    };
  }, [active]);

  if (!mounted) {
    return (
      <div className="container mx-auto px-6 py-24 min-h-[400px] flex items-center justify-center">
        <span className="font-sans text-xs uppercase tracking-widest text-muted-foreground animate-pulse">
          Loading Story Map…
        </span>
      </div>
    );
  }

  return (
    <section className="relative container mx-auto px-6 py-24 md:py-32 border-b border-border/70">
      {/* Heading */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-xs uppercase tracking-widest text-gold mb-4 font-sans font-bold"
        >
          {lang === "en" ? "Interactive Story Explorer" : "इंटरएक्टिव कहानी मानचित्र"}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="font-display text-4xl md:text-6xl font-bold leading-[1.05]"
        >
          {lang === "en" ? "Every corner of India " : "भारत के हर कोने की "}
          <span className="text-primary italic">
            {lang === "en" ? "has a story" : "अपनी एक कहानी है"}
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed font-sans font-medium"
        >
          {lang === "en"
            ? "Travel across the subcontinental landscape through the lives of changemakers, innovators, and everyday heroes."
            : "बदलाव लाने वालों, नवप्रवर्तकों और रोजमर्रा के नायकों के जीवन के माध्यम से उपमहाद्वीप की यात्रा करें।"}
        </motion.p>
      </div>

      {/* Map + sidebar */}
      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-12 items-start">
        {/* Map Wrapper */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative bg-card/45 border border-border/50 p-4 md:p-8 shadow-sm overflow-visible"
        >
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-hero opacity-30 pointer-events-none" />
          <div className="absolute top-1/4 left-1/3 size-[300px] rounded-full bg-gold/5 blur-3xl pointer-events-none" />

          {/* India SVG map */}
          <svg
            viewBox="0 0 612 696"
            className="relative w-full h-auto"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="stateStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C7A25A" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#C7A25A" stopOpacity="0.3" />
              </linearGradient>
              <filter id="markerGlow">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Render 36 individual state paths */}
            <g className="transition-all duration-300">
              {INDIA_PATHS.map((path) => {
                const hasStories = !!storiesByState[path.name];
                const isHovered = hoveredPath === path.id;

                return (
                  <path
                    key={path.id}
                    d={path.d}
                    fill={
                      isHovered
                        ? "rgba(199, 162, 90, 0.35)"
                        : hasStories
                          ? "rgba(199, 162, 90, 0.12)"
                          : "rgba(229, 220, 203, 0.22)"
                    }
                    stroke="url(#stateStrokeGrad)"
                    strokeWidth={isHovered ? "1.8" : "1.2"}
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredPath(path.id)}
                    onMouseLeave={() => setHoveredPath(null)}
                    onClick={() => {
                      void navigate({
                        to: "/stories",
                        search: { state: path.name },
                      });
                    }}
                  />
                );
              })}
            </g>

            {/* Interactive hotspot pins */}
            {hotspots.map((h, i) => {
              const isHovered = active?.id === h.id;
              const hasMultiple = h.count > 1;

              return (
                <g
                  key={h.id}
                  className="cursor-pointer select-none"
                  onMouseEnter={() => setActive(h)}
                  onMouseLeave={() => setActive((cur) => (cur?.id === h.id ? null : cur))}
                  onClick={() => {
                    if (hasMultiple) {
                      setDrawerState(h);
                    } else {
                      void navigate({
                        to: "/stories/$slug",
                        params: { slug: h.stories[0].slug },
                      });
                    }
                  }}
                >
                  {/* Pulse Ring */}
                  <motion.circle
                    cx={h.x}
                    cy={h.y}
                    r="8"
                    fill="oklch(0.82 0.14 75)"
                    opacity="0.45"
                    animate={{ r: [8, 22, 8], opacity: [0.6, 0, 0.6] }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      delay: i * 0.25,
                      ease: "easeOut",
                    }}
                  />
                  {/* Hover Halo */}
                  <motion.circle
                    cx={h.x}
                    cy={h.y}
                    r="15"
                    fill="oklch(0.82 0.14 75)"
                    opacity={isHovered ? 0.22 : 0}
                    animate={{ opacity: isHovered ? 0.22 : 0 }}
                    transition={{ duration: 0.2 }}
                  />
                  {/* Outer circle dot */}
                  <circle
                    cx={h.x}
                    cy={h.y}
                    r={isHovered ? 6.5 : 5.5}
                    fill="oklch(0.72 0.2 50)"
                    stroke="#F8F4EC"
                    strokeWidth="1.2"
                    filter="url(#markerGlow)"
                    className="transition-all duration-300"
                  />
                  {/* Multiple count badge overlay */}
                  {hasMultiple && (
                    <text
                      x={h.x}
                      y={h.y - 12}
                      textAnchor="middle"
                      className="fill-gold font-sans font-bold text-[9px] uppercase tracking-wider pointer-events-none select-none drop-shadow"
                    >
                      +{h.count}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Floating Tooltip Card (Task 3) */}
          <AnimatePresence>
            {active && (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                style={tooltipStyle}
                className="absolute bg-card/95 backdrop-blur-md border border-gold/30 p-4 shadow-elegant z-30 w-64 rounded-none font-sans pointer-events-auto hidden md:block"
              >
                <div className="relative">
                  {/* Story Image */}
                  {active.stories[0]?.image ? (
                    <div className="w-full aspect-[16/10] overflow-hidden mb-3 border border-border/20 bg-muted">
                      <img
                        src={active.stories[0].image}
                        alt={active.stories[0].title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="flex items-center gap-2 text-[10px] text-gold mb-1 font-bold uppercase tracking-wider">
                    <MapPin className="size-3" />
                    <span>{active.state}</span>
                  </div>

                  <h4 className="font-display text-sm font-bold leading-tight line-clamp-2 text-foreground mb-1">
                    {active.stories[0]?.title || "Untitled Story"}
                  </h4>

                  <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                    {active.stories[0]?.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-3">
                    <span>{Array.isArray(active.stories[0]?.themes) && active.stories[0].themes.length > 0 ? active.stories[0].themes[0] : ""}</span>
                    <span>{active.stories[0]?.readTime || "4 min read"}</span>
                  </div>

                  <Link
                    to="/stories/$slug"
                    params={{ slug: active.stories[0]?.slug }}
                    className="inline-flex w-full items-center justify-center h-9 bg-primary text-primary-foreground text-[10px] uppercase font-bold tracking-widest hover:bg-primary/95 transition-colors rounded-none"
                  >
                    {lang === "en" ? "Read Story" : "कहानी पढ़ें"}
                    <ArrowRight className="size-3 ml-1.5" />
                  </Link>

                  {/* Arrow Pointer */}
                  <div className="absolute bottom-[-22px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-gold/30 pointer-events-none" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Sidebar — state listing */}
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 font-sans font-bold">
            {lang === "en" ? "Featured States" : "फीचर्ड राज्य"}
          </p>
          <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
            {hotspots.map((h, i) => {
              const isActive = active?.id === h.id;
              const repStory = h.stories[0];
              if (!repStory) return null;
              return (
                <motion.button
                  key={h.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.05 }}
                  onMouseEnter={() => setActive(h)}
                  onFocus={() => setActive(h)}
                  onClick={() => {
                    if (h.count === 1) {
                      void navigate({ to: `/stories/${repStory.slug}` });
                    } else {
                      setDrawerState(h);
                    }
                  }}
                  className={`text-left bg-card/45 rounded-none p-4 transition-all border ${
                    isActive ? "border-gold/60 shadow-sm" : "border-border/30 hover:border-gold/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[10px] text-gold mb-1 font-sans">
                        <MapPin className="size-3" />
                        <span className="uppercase tracking-widest font-bold">{h.state}</span>
                        <span className="size-1 rounded-full bg-muted-foreground/50" />
                        <span className="text-muted-foreground font-semibold">
                          {h.count}{" "}
                          {h.count === 1
                            ? lang === "en"
                              ? "Story"
                              : "कहानी"
                            : lang === "en"
                              ? "Stories"
                              : "कहानियाँ"}
                        </span>
                      </div>
                      <p className="font-display text-base leading-snug truncate font-bold text-foreground">
                        {repStory.title}
                      </p>
                    </div>
                    <ArrowRight
                      className={`size-4 shrink-0 transition-all ${
                        isActive ? "text-gold translate-x-1" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-4">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-primary-foreground border-0 shadow-sm uppercase tracking-widest text-xs font-bold rounded-full h-12"
            >
              <Link to="/stories">
                {lang === "en" ? "Browse Story Archive" : "सभी कहानियाँ देखें"}
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Drawer Overlay (Task 4) */}
      <AnimatePresence>
        {drawerState && (
          <>
            {/* Drawer Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerState(null)}
              className="fixed inset-0 bg-black/60 z-[90]"
            />
            {/* Drawer Body */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 210 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[450px] bg-card border-l border-border/50 p-6 z-[100] flex flex-col shadow-elegant overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-border/70 pb-4 mb-6">
                <div>
                  <span className="text-xs uppercase tracking-widest text-gold font-sans font-bold">
                    {lang === "en" ? "Explore State" : "राज्य अन्वेषण"}
                  </span>
                  <h3 className="font-display text-2xl font-bold mt-1 text-foreground">
                    {drawerState.state}
                  </h3>
                </div>
                <button
                  onClick={() => setDrawerState(null)}
                  className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Scrollable Story List */}
              <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-1 scrollbar-thin">
                <p className="text-xs text-muted-foreground font-sans uppercase font-bold tracking-wider mb-1">
                  {drawerState.count} {lang === "en" ? "Stories Found" : "कहानियाँ मिलीं"}
                </p>
                {drawerState.stories.map((st) => (
                  <MiniStoryCard key={st.id} story={st} />
                ))}
              </div>

              {/* Drawer Footer Link to State Archive */}
              <div className="mt-6 pt-4 border-t border-border/70">
                <Button
                  asChild
                  className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-sans uppercase tracking-widest text-xs rounded-full h-12"
                >
                  <Link
                    to="/stories"
                    search={{ state: drawerState.state }}
                    onClick={() => setDrawerState(null)}
                  >
                    {lang === "en" ? "View State Archive" : "सभी कहानियाँ देखें"}
                    <ArrowRight className="size-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
