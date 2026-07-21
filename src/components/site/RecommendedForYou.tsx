import { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { StoryCard, type Story } from "@/components/site/StoryCard";
import { useJourney } from "@/lib/journey-store";
import { useI18nStore, translateStory } from "@/lib/i18n";

type Mode = {
  id: string;
  emoji: string;
  label: string;
};

const emojiForTheme = (theme: string) => {
  const c = theme.trim().toLowerCase();
  if (!c) return "✨";
  if (c.includes("sustain") || c.includes("env")) return "🌿";
  if (c.includes("women") || c.includes("empower")) return "👩";
  if (c.includes("educ")) return "📚";
  if (c.includes("culture") || c.includes("herit")) return "🪔";
  if (c.includes("rural")) return "🚜";
  if (c.includes("innov") || c.includes("science")) return "🚀";
  if (c.includes("hist") || c.includes("freedom")) return "📜";
  return "✨";
};

function deriveModesFromThemes(themesList: readonly string[]) {
  const filtered = themesList.filter((t) => t !== "All" && t.toLowerCase() !== "general").slice(0, 6);
  return [
    {
      id: "all",
      emoji: "✨",
      label: "For You",
    },
    ...filtered.map((t) => ({
      id: t,
      emoji: emojiForTheme(t),
      label: t,
    })),
  ];
}

export function RecommendedForYou({ themes = [] }: { themes?: readonly string[] }) {
  const { state } = useJourney();
  const lang = useI18nStore((s) => s.lang);
  const [mode, setMode] = useState("all");
  const scrollerRef = useRef<HTMLDivElement>(null);

  const [recs, setRecs] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);

  const modes = useMemo(() => deriveModesFromThemes(themes), [themes]);

  // Fetch recommendations dynamically from the server endpoint based on preferences
  useEffect(() => {
    setLoading(true);
    const viewed = state.viewedIds.join(",");
    const preferredThemes = mode === "all" ? Object.keys(state.categoryCounts).join(",") : mode;
    const preferredRegions = Object.keys(state.regionCounts).join(",");

    fetch(
      `/api/stories/recommended?limit=8&viewed=${encodeURIComponent(viewed)}&themes=${encodeURIComponent(preferredThemes)}&regions=${encodeURIComponent(preferredRegions)}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRecs(data.map((s: any) => translateStory(s, lang)));
        } else {
          setRecs([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load recommendations:", err);
        setRecs([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [state, mode, lang]);

  const personalized = state.viewedIds.length > 0 && mode === "all";

  const scrollBy = (dx: number) => {
    scrollerRef.current?.scrollBy({ left: dx, behavior: "smooth" });
  };

  return (
    <section className="container mx-auto px-6 py-16 md:py-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold mb-3 inline-flex items-center gap-2">
            <Sparkles className="size-3" />
            {personalized ? "Personalized for you" : "Discover"}
          </p>
          <h2 className="font-display text-4xl md:text-5xl max-w-2xl font-bold">
            {personalized ? "Recommended For You" : "Find your next story"}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl font-sans text-sm">
            {personalized
              ? "Updated as you explore — based on the stories, regions and themes you've spent time with."
              : "Pick a discovery theme below. Your recommendations evolve as you read."}
          </p>
        </div>
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scrollBy(-360)}
            className="size-10 rounded-full border border-border/50 bg-card/25 flex items-center justify-center hover:text-gold hover:border-gold/50 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => scrollBy(360)}
            className="size-10 rounded-full border border-border/50 bg-card/25 flex items-center justify-center hover:text-gold hover:border-gold/50 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Mode chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-8 -mx-6 px-6 scrollbar-none">
        {modes.map((m) => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-sans font-semibold transition-all border ${
                active
                  ? "bg-primary text-primary-foreground border-transparent"
                  : "bg-card/20 border-border/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="mr-2">{m.emoji}</span>
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Carousel */}
      <div className="relative">
        {loading ? (
          <div className="flex flex-col gap-3 py-16 items-center justify-center">
            <div className="size-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
            <span className="text-xs text-muted-foreground font-sans">{lang === "en" ? "Loading Recommendations..." : "सिफारिशें लोड हो रही हैं..."}</span>
          </div>
        ) : recs.length > 0 ? (
          <div
            ref={scrollerRef}
            className="flex gap-6 overflow-x-auto pb-6 -mx-6 px-6 snap-x snap-mandatory scrollbar-none"
          >
            <AnimatePresence mode="popLayout">
              {recs.map((s, i) => (
                <motion.div
                  key={`${mode}-${s.id}`}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="snap-start shrink-0 w-[85%] sm:w-[55%] md:w-[38%] lg:w-[30%]"
                >
                  <StoryCard story={s} index={0} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground font-sans py-16 text-center">
            {lang === "en" ? "No recommendations found." : "कोई सिफारिश नहीं मिली।"}
          </p>
        )}
      </div>
    </section>
  );
}
