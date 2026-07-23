import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ArrowRight, X, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import type { Story } from "@/components/site/StoryCard";
import { useI18nStore, translateStory, getCommonText, translateStateName } from "@/lib/i18n";
import { INDIA_PATHS } from "./IndiaPaths";
import { STATE_COORDINATES } from "./StateCoordinates";

interface Hotspot {
  id: string;
  state: string;
  count: number;
  x: number;
  y: number;
}

// Mini Story Card inside state drawer
function MiniStoryCard({ story }: { story: Story }) {
  const lang = useI18nStore((s) => s.lang);

  return (
    <Link
      to="/stories/$slug"
      params={{ slug: story.slug }}
      className="flex gap-4 p-3 bg-background hover:bg-muted border border-border/40 hover:border-gold/30 transition-all duration-300 group rounded-xl"
    >
      <div className="size-20 shrink-0 overflow-hidden bg-muted border border-border/20 rounded-lg">
        {story.image ? (
          <img
            src={story.image}
            alt={story.imageAlt || story.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-950/30 to-stone-900 flex items-center justify-center font-display italic text-gold/30 rounded-lg">
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

export function StoryMap({ stateCounts = {} }: { stateCounts?: Record<string, number> }) {
  const lang = useI18nStore((s) => s.lang);
  const commonText = getCommonText(lang);

  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState<Hotspot | null>(null);
  const [selectedState, setSelectedState] = useState<Hotspot | null>(null);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  // Dynamic selected state stories loading state
  const [selectedStories, setSelectedStories] = useState<Story[]>([]);
  const [loadingStories, setLoadingStories] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch stories on-demand when selectedState changes with AbortController to prevent race conditions
  useEffect(() => {
    if (!selectedState) {
      setSelectedStories([]);
      return;
    }

    const abortController = new AbortController();
    setLoadingStories(true);

    fetch(`/api/stories?region=${encodeURIComponent(selectedState.state)}&pageSize=6`, {
      signal: abortController.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.stories)) {
          setSelectedStories(data.stories.map((s: any) => translateStory(s, lang)));
        } else {
          setSelectedStories([]);
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          // Request aborted, ignore
          return;
        }
        console.error("Failed to fetch state stories:", err);
        setSelectedStories([]);
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setLoadingStories(false);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [selectedState, lang]);

  // Map state coordinate centers
  const hotspots = useMemo<Hotspot[]>(() => {
    return Object.entries(STATE_COORDINATES)
      .map(([stateName, coords]) => {
        const count = stateCounts[stateName] || 0;
        if (count === 0) return null;
        return {
          id: stateName,
          state: stateName,
          count,
          x: coords.x,
          y: coords.y,
        };
      })
      .filter((h): h is Hotspot => h !== null);
  }, [stateCounts]);

  // Floating tooltip style using responsive percentages
  const tooltipStyle = useMemo(() => {
    if (!active) return {};
    return {
      left: `${(active.x / 800) * 100}%`,
      top: `${(active.y / 900) * 100 - 6}%`,
    };
  }, [active]);

  if (!mounted) return null;

  return (
    <section className="container mx-auto px-6 py-16 md:py-24 border-b border-border/70 relative">
      <div className="text-center mb-12">
        <p className="text-xs uppercase tracking-[0.25em] font-sans font-bold text-gold mb-3 inline-flex items-center gap-2">
          <MapPin className="size-3" />
          {lang === "en" ? "Explore India in 3D" : "भारत का अन्वेषण"}
        </p>
        <h2 className="font-display text-4xl md:text-5xl font-bold">
          {lang === "en" ? "Stories by State" : "राज्यों के अनुसार कहानियाँ"}
        </h2>
        <div className="w-12 h-[1px] bg-primary mx-auto mt-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Column: Map visualization */}
        <div className="w-full relative bg-gradient-to-b from-card/10 to-card/40 border border-border/40 p-4 md:p-8 flex items-center justify-center overflow-hidden aspect-[9/10] sm:aspect-square md:aspect-[4/3] lg:aspect-[9/10]">
          {/* Map Vector Graphic */}
          <svg
            viewBox="0 0 800 900"
            className="w-full h-full max-h-[800px] select-none filter drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
          >
            <defs>
              <filter id="markerGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Render Map Paths */}
            {INDIA_PATHS.map((item) => {
              const hasStories = (stateCounts[item.name] || 0) > 0;
              const isHovered = hoveredPath === item.id;

              return (
                <path
                  key={item.id}
                  d={item.d}
                  fill={
                    isHovered
                      ? "oklch(0.35 0.08 30)"
                      : hasStories
                        ? "oklch(0.24 0.04 20)"
                        : "oklch(0.18 0.02 15)"
                  }
                  stroke={hasStories ? "oklch(0.72 0.2 50 / 0.45)" : "oklch(0.32 0.02 15)"}
                  strokeWidth={isHovered ? "2.5" : "1.2"}
                  className="transition-all duration-300 ease-out cursor-pointer"
                  onMouseEnter={() => setHoveredPath(item.id)}
                  onMouseLeave={() => setHoveredPath(null)}
                  onClick={() => {
                    const hs = hotspots.find((h) => h.state === item.name) || {
                      id: item.name,
                      state: item.name,
                      count: 0,
                      x: 0,
                      y: 0,
                    };
                    setSelectedState(hs);
                  }}
                />
              );
            })}

            {/* Interactive hotspot pins */}
            {hotspots.map((h) => {
              const isHovered = active?.id === h.id;

              return (
                <g
                  key={h.id}
                  className="cursor-pointer select-none"
                  onMouseEnter={() => setActive(h)}
                  onMouseLeave={() => setActive((cur) => (cur?.id === h.id ? null : cur))}
                  onClick={() => setSelectedState(h)}
                >
                  {/* Pulse Ring */}
                  <motion.circle
                    cx={h.x}
                    cy={h.y}
                    r="8"
                    fill="oklch(0.82 0.14 75)"
                    opacity="0.45"
                    animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
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
                  {h.count > 1 && (
                    <text
                      x={h.x}
                      y={h.y - 12}
                      textAnchor="middle"
                      className="fill-gold font-sans text-[10px] font-bold tracking-tighter filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]"
                    >
                      {h.count}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Tooltip Overlay */}
          <AnimatePresence>
            {active && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute bg-card/95 border border-border/80 px-4 py-2.5 shadow-elegant rounded-none pointer-events-none z-50 flex flex-col items-center min-w-[140px]"
                style={tooltipStyle}
              >
                <span className="font-display font-bold text-sm text-foreground">{translateStateName(active.state, lang)}</span>
                <span className="text-[10px] uppercase tracking-widest text-gold font-sans font-bold mt-1">
                  {active.count} {active.count === 1 ? (lang === "hi" ? "कहानी" : "Story") : (lang === "hi" ? "कहानियाँ" : "Stories")}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Stories Panel */}
        <div className="h-[600px] bg-card border border-border/80 rounded-2xl p-6 overflow-hidden flex flex-col shadow-md text-foreground">
          <AnimatePresence mode="wait">
            {!selectedState ? (
              <motion.div
                key="list-selection"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-full overflow-hidden"
              >
                <div className="mb-4 shrink-0">
                  <h3 className="font-display text-2xl font-bold mb-2 text-foreground">
                    {lang === "en" ? "India's Cultural Landscape" : "भारत का सांस्कृतिक परिदृश्य"}
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed font-sans font-medium">
                    {lang === "en"
                      ? "Every state contains unique stories of innovators and changemakers. Click on active states on the map or select from the list below to discover stories from that region."
                      : "प्रत्येक राज्य में नवप्रवर्तकों और बदलाव लाने वालों की अनूठी कहानियां हैं। उस क्षेत्र की कहानियों को खोजने के लिए मानचित्र पर सक्रिय राज्यों पर क्लिक करें या नीचे दी गई सूची से चयन करें।"}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto border border-border/40 p-2 space-y-1.5 pr-1 scrollbar-thin bg-background/50 rounded-xl">
                  {hotspots.map((h) => {
                    return (
                      <motion.button
                        key={h.id}
                        onClick={() => setSelectedState(h)}
                        className="w-full text-left px-4 py-3 border border-border/40 hover:border-primary/40 bg-background hover:bg-muted/80 transition-all duration-300 flex items-center justify-between font-sans text-foreground rounded-xl shadow-xs group cursor-pointer"
                        whileTap={{ scale: 0.99 }}
                      >
                        <span className="text-xs font-semibold tracking-wider text-foreground group-hover:text-primary transition-colors">
                          {translateStateName(h.state, lang)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 border border-primary/20 rounded">
                            {h.count}
                          </span>
                          <ArrowRight className="size-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-border/30 shrink-0">
                  <Button
                    asChild
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/95 text-primary-foreground border-0 shadow-sm uppercase tracking-widest text-xs font-bold rounded-full h-12"
                  >
                    <Link to="/stories">
                      {lang === "en" ? "Browse Story Archive" : "सभी कहानियाँ देखें"}
                      <ArrowRight className="size-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="state-stories"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-full overflow-hidden"
              >
                {/* Panel Header */}
                <div className="flex items-center justify-between border-b border-border/30 pb-4 mb-4 shrink-0">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-gold font-sans font-bold">
                      {lang === "en" ? "Explore State" : "राज्य अन्वेषण"}
                    </span>
                    <h3 className="font-display text-2xl font-bold mt-1 text-foreground">
                      {translateStateName(selectedState.state, lang)}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedState(null)}
                    className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors"
                    title={lang === "en" ? "Back to list" : "सूची पर वापस जाएं"}
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {/* Scrollable Story List wrapper */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                  <p className="text-xs text-muted-foreground font-sans uppercase font-bold tracking-wider mb-1">
                    {selectedState.count} {lang === "en" ? "Stories Found" : "कहानियाँ मिलीं"}
                  </p>

                  {loadingStories ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((n) => (
                        <div key={n} className="flex gap-4 p-3 border border-border/20 animate-pulse bg-card/40 rounded-xl">
                          <div className="size-20 bg-muted/70 shrink-0 rounded-lg" />
                          <div className="flex flex-col justify-between py-1 flex-1 space-y-2">
                            <div>
                              <div className="h-2.5 w-16 bg-muted/60 rounded" />
                              <div className="h-4 w-5/6 bg-muted/70 rounded mt-2" />
                              <div className="h-4 w-2/3 bg-muted/70 rounded mt-1.5" />
                            </div>
                            <div className="h-2 w-12 bg-muted/60 rounded mt-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : selectedStories.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3"
                    >
                      {selectedStories.map((st) => (
                        <MiniStoryCard key={st.id} story={st} />
                      ))}
                    </motion.div>
                  ) : (
                    <div className="text-center py-8 px-4 border border-dashed border-border/40 bg-card/10 space-y-4 rounded-xl">
                      <div className="mx-auto size-10 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                        <Sparkles className="size-5 text-gold animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-display font-bold text-sm text-foreground">
                          {lang === "en" ? "No Stories Yet" : "कोई कहानी उपलब्ध नहीं"}
                        </h4>
                        <p className="text-xs text-muted-foreground font-sans leading-relaxed max-w-xs mx-auto">
                          {lang === "en"
                            ? "We are currently documenting stories for this region. Explore other vibrant states nearby."
                            : "हम वर्तमान में इस क्षेत्र की कहानियों का दस्तावेजीकरण कर रहे हैं। पास के अन्य राज्यों को देखें।"}
                        </p>
                      </div>

                      {/* Recommended active regions fallback */}
                      {hotspots.length > 0 && (
                        <div className="pt-2">
                          <p className="text-[10px] uppercase font-sans font-bold tracking-widest text-gold mb-2">
                            {lang === "en" ? "Recommended Regions" : "अनुशंसित क्षेत्र"}
                          </p>
                          <div className="flex flex-wrap gap-1.5 justify-center">
                            {hotspots
                              .filter((h) => h.state !== selectedState.state)
                              .slice(0, 3)
                              .map((h) => (
                                <button
                                  key={h.id}
                                  onClick={() => setSelectedState(h)}
                                  className="text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-1 bg-background border border-border/50 hover:border-gold/30 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-300 rounded"
                                >
                                  {h.state}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Panel Footer */}
                <div className="mt-4 pt-4 border-t border-border/30 shrink-0">
                  <Button
                    asChild
                    className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-sans uppercase tracking-widest text-xs rounded-full h-12"
                  >
                    <Link to="/stories" search={{ state: selectedState.state }}>
                      {lang === "en" ? "View State Archive" : "सभी कहानियाँ देखें"}
                      <ArrowRight className="size-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
