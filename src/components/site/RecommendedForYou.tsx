import { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { StoryCard, type Story } from "@/components/site/StoryCard";
import { useJourney, getRecommendations } from "@/lib/journey-store";

type Mode = {
  id: string;
  emoji: string;
  label: string;
  match: (story: { category: string; title: string; excerpt: string }) => boolean;
};

const emojiForCategory = (category: string) => {
  const c = category.trim().toLowerCase();
  if (!c) return "✨";
  if (c.includes("sustain") || c.includes("env")) return "🌿";
  if (c.includes("women") || c.includes("empower")) return "👩";
  if (c.includes("educ")) return "📚";
  if (c.includes("culture") || c.includes("herit")) return "🪔";
  if (c.includes("rural")) return "🚜";
  if (c.includes("innov") || c.includes("science")) return "🚀";
  return "✨";
};

import { useStoriesData } from "@/lib/stories-data";

function deriveModesFromStories(storyList: Story[]) {
  // Keep the same UI “modes” shape, but drive them from stories.json.
  const uniqueCategories = Array.from(new Set(storyList.map((s) => s.category).filter(Boolean)));

  const top = uniqueCategories.slice(0, 6);

  const modes: Mode[] = [
    {
      id: "all",
      emoji: "✨",
      label: "For You",
      match: () => true,
    },
    ...top.map((cat) => ({
      id: cat,
      emoji: emojiForCategory(cat),
      label: cat,
      match: (st: { category: string }) => st.category === cat,
    })),
  ];
  return modes;
}

export function RecommendedForYou() {
  const { state } = useJourney();
  const { stories: dbStories } = useStoriesData();
  const [mode, setMode] = useState("all");
  const scrollerRef = useRef<HTMLDivElement>(null);

  const modes = useMemo(() => deriveModesFromStories(dbStories), [dbStories]);

  const recs = useMemo(() => {
    if (mode === "all") return getRecommendations(state, 8, dbStories);
    const m = modes.find((x) => x.id === mode);
    if (!m) return getRecommendations(state, 6, dbStories);
    const filtered = dbStories.filter((s) =>
      m.match({
        category: s.category,
        title: s.title,
        excerpt: s.excerpt,
      }),
    );
    return filtered.length ? filtered : getRecommendations(state, 6, dbStories);
  }, [mode, state, modes, dbStories]);

  const personalized = state.viewedIds.length > 0 && mode === "all";

  const scrollBy = (dx: number) => {
    scrollerRef.current?.scrollBy({ left: dx, behavior: "smooth" });
  };

  return (
    <section className="container mx-auto px-6 py-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold mb-3 inline-flex items-center gap-2">
            <Sparkles className="size-3" />
            {personalized ? "Personalized for you" : "Discover"}
          </p>
          <h2 className="font-display text-4xl md:text-5xl max-w-2xl">
            {personalized ? "Recommended For You" : "Find your next story"}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl">
            {personalized
              ? "Updated as you explore — based on the stories, regions and themes you've spent time with."
              : "Pick a discovery mode below. Your recommendations evolve as you read."}
          </p>
        </div>
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scrollBy(-360)}
            className="size-10 rounded-full glass grid place-items-center hover:text-gold transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => scrollBy(360)}
            className="size-10 rounded-full glass grid place-items-center hover:text-gold transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Mode chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-8 -mx-6 px-6 scrollbar-none">
        {modes.map((m: Mode) => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm transition-all border ${
                active
                  ? "bg-gradient-to-r from-gold to-saffron text-gold-foreground shadow-glow border-transparent"
                  : "glass border-border/50 text-muted-foreground hover:text-foreground"
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
      </div>
    </section>
  );
}
