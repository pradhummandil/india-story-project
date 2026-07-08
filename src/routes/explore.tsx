import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  TrendingUp,
  MapPin,
  Eye,
  ChevronRight,
  X,
  Layers,
  Loader2,
  BookOpen,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { SiteLayout } from "@/components/site/Layout";
import { StoryCard } from "@/components/site/StoryCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStoriesData } from "@/lib/stories-data";
import { useI18nStore, translateStory } from "@/lib/i18n";

export const Route = createFileRoute("/explore")({
  component: RouteComponent,
});

// ─── Category icon/colour map ─────────────────────────────────────────────────
const CATEGORY_META: Record<string, { emoji: string; gradient: string; accent: string }> = {
  Heritage:       { emoji: "🏛️", gradient: "from-amber-900/80 to-stone-900/90",    accent: "#c8a96a" },
  Innovation:     { emoji: "⚡", gradient: "from-blue-900/80 to-slate-900/90",     accent: "#60a5fa" },
  Sustainability: { emoji: "🌿", gradient: "from-green-900/80 to-stone-900/90",    accent: "#4ade80" },
  Science:        { emoji: "🔬", gradient: "from-purple-900/80 to-slate-900/90",   accent: "#a78bfa" },
  Culture:        { emoji: "🎨", gradient: "from-rose-900/80 to-stone-900/90",     accent: "#fb7185" },
  Environment:    { emoji: "🌍", gradient: "from-teal-900/80 to-stone-900/90",     accent: "#2dd4bf" },
  Food:           { emoji: "🍛", gradient: "from-orange-900/80 to-stone-900/90",   accent: "#fb923c" },
  Festival:       { emoji: "🪔", gradient: "from-yellow-900/80 to-orange-900/90",  accent: "#facc15" },
  Freedom:        { emoji: "🕊️", gradient: "from-indigo-900/80 to-slate-900/90",   accent: "#818cf8" },
  History:        { emoji: "📜", gradient: "from-stone-800/80 to-zinc-900/90",     accent: "#a8a29e" },
  All:            { emoji: "✨", gradient: "from-red-900/80 to-stone-900/90",       accent: "#f87171" },
};

function getCategoryMeta(cat: string) {
  return CATEGORY_META[cat] ?? { emoji: "📖", gradient: "from-stone-800/80 to-zinc-900/90", accent: "#c8a96a" };
}

const PAGE_SIZE = 12;

// ─── Fade-in animation variant ────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ─── Utility: format view count ───────────────────────────────────────────────
function fmtViews(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ─── Main component ───────────────────────────────────────────────────────────
function RouteComponent() {
  void useNavigate({ from: "/explore" });
  const { stories, loading } = useStoriesData();
  const lang = useI18nStore((s) => s.lang);

  const [query, setQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchFocused, setSearchFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync search query from URL param ?q=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q") ?? "";
    if (initial) setQuery(initial);
  }, []);

  function handleQueryChange(val: string) {
    setQuery(val);
    setPage(1);
    const url = new URL(window.location.href);
    if (val) {
      url.searchParams.set("q", val);
    } else {
      url.searchParams.delete("q");
    }
    window.history.replaceState({}, "", url.toString());
  }

  // ── Derived: localised stories ──────────────────────────────────────────────
  const localizedStories = useMemo(
    () => stories.map((s) => translateStory(s, lang)),
    [stories, lang],
  );

  // ── Derived: top categories (exclude "All") ─────────────────────────────────
  const categoryList = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of stories) {
      if (s.category && s.category !== "All") {
        counts[s.category] = (counts[s.category] ?? 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, count]) => ({ cat, count }));
  }, [stories]);

  // ── Derived: top 6 categories for quick chips ──────────────────────────────
  const quickCategories = useMemo(() => categoryList.slice(0, 6).map((c) => c.cat), [categoryList]);

  // ── Derived: states ─────────────────────────────────────────────────────────
  const stateList = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of stories) {
      if (s.region && s.region !== "India") {
        counts[s.region] = (counts[s.region] ?? 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([state, count]) => ({ state, count }));
  }, [stories]);

  // ── Derived: trending (top 6 by viewCount) ──────────────────────────────────
  const trending = useMemo(
    () =>
      [...stories]
        .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
        .slice(0, 6),
    [stories],
  );

  // ── Derived: filtered stories ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    return localizedStories.filter((s) => {
      const matchQuery =
        !query ||
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.excerpt.toLowerCase().includes(query.toLowerCase());
      const matchState = !selectedState || s.region === selectedState;
      const matchCategory = !selectedCategory || s.category === selectedCategory;
      return matchQuery && matchState && matchCategory;
    });
  }, [localizedStories, query, selectedState, selectedCategory]);

  const paginated = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);
  const hasMore = paginated.length < filtered.length;

  function clearFilters() {
    setQuery("");
    setSelectedState(null);
    setSelectedCategory(null);
    setPage(1);
    window.history.replaceState({}, "", window.location.pathname);
  }

  const anyFilter = !!(query || selectedState || selectedCategory);

  return (
    <SiteLayout>
      {/* ── PAGE WRAPPER ─────────────────────────────────────────────────────── */}
      <div className="min-h-screen bg-background">

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 1 · HERO SEARCH
        ══════════════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden pt-28 pb-16 bg-hero">
          {/* Decorative orbs */}
          <div className="pointer-events-none absolute -top-32 left-1/4 size-[480px] rounded-full bg-gold/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-1/3 size-[360px] rounded-full bg-primary/8 blur-3xl" />

          <div className="container relative mx-auto px-4 sm:px-6">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mx-auto max-w-3xl text-center"
            >
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-card/40 px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-gold backdrop-blur-sm">
                <Layers className="size-3" />
                Explore India's Stories
              </div>

              {/* Headline */}
              <h1 className="mt-6 font-display text-4xl leading-[1.08] text-foreground md:text-6xl lg:text-7xl">
                Discover India,
                <span className="block italic text-gradient-gold">
                  one story at a time
                </span>
              </h1>

              <p className="mt-5 text-base text-muted-foreground md:text-lg">
                A curated library of stories from every corner of the subcontinent.
                <br className="hidden sm:block" />
                Search, filter by state or theme, and find your next read.
              </p>

              {/* ── Search input ─────────────────────────────────────────────── */}
              <div className="relative mt-10 mx-auto max-w-2xl">
                <motion.div
                  animate={searchFocused ? { scale: 1.01 } : { scale: 1 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                >
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    ref={inputRef}
                    id="explore-search"
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder="Search stories, states, themes…"
                    className={[
                      "h-14 w-full rounded-xl border bg-card/80 pl-12 pr-12 text-base shadow-soft backdrop-blur-md transition-all duration-300",
                      searchFocused
                        ? "border-gold/60 shadow-[0_0_0_3px_color-mix(in_oklab,var(--gold)_18%,transparent)]"
                        : "border-border/80",
                    ].join(" ")}
                  />
                  {query && (
                    <button
                      onClick={() => handleQueryChange("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground transition hover:text-foreground"
                      aria-label="Clear search"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </motion.div>

                {/* Focus glow ring */}
                <AnimatePresence>
                  {searchFocused && (
                    <motion.div
                      key="ring"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-gold/30"
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* ── Quick category chips ────────────────────────────────────── */}
              {quickCategories.length > 0 && (
                <motion.div
                  variants={fadeUp}
                  custom={1}
                  initial="hidden"
                  animate="show"
                  className="mt-5 flex flex-wrap items-center justify-center gap-2"
                >
                  <span className="text-xs text-muted-foreground uppercase tracking-widest mr-1">
                    Quick:
                  </span>
                  {quickCategories.map((cat) => {
                    const meta = getCategoryMeta(cat);
                    const active = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(active ? null : cat);
                          setPage(1);
                        }}
                        className={[
                          "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-300 border",
                          active
                            ? "bg-primary text-primary-foreground border-primary shadow-glow"
                            : "border-border/70 bg-card/60 text-muted-foreground hover:border-gold/40 hover:text-foreground backdrop-blur-sm",
                        ].join(" ")}
                      >
                        <span>{meta.emoji}</span>
                        {cat}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 2 · TRENDING TODAY
        ══════════════════════════════════════════════════════════════════════ */}
        {!loading && trending.length > 0 && !anyFilter && (
          <section className="relative bg-secondary py-16 overflow-hidden">
            {/* Subtle noise texture */}
            <div className="pointer-events-none absolute inset-0 opacity-20"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%23000' opacity='.15'/%3E%3C/svg%3E\")" }}
            />

            <div className="container mx-auto px-4 sm:px-6">
              {/* Section heading */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="flex items-center gap-3 mb-8"
              >
                <TrendingUp className="size-5 text-gold" />
                <h2 className="font-display text-2xl text-white md:text-3xl">
                  Trending Today
                </h2>
                <div className="ml-2 h-px flex-1 bg-gradient-to-r from-gold/40 to-transparent" />
              </motion.div>

              {/* Horizontal scroll on mobile, grid on desktop */}
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar md:grid md:grid-cols-3 md:overflow-visible md:pb-0 lg:grid-cols-6">
                {trending.map((story, i) => {
                  const localized = translateStory(story, lang);
                  const fallbackGrads = [
                    "from-amber-900 to-stone-900",
                    "from-red-950 to-stone-900",
                    "from-yellow-900 to-stone-900",
                    "from-orange-950 to-stone-900",
                  ];
                  const hash = story.title.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
                  const grad = fallbackGrads[hash % fallbackGrads.length];

                  return (
                    <motion.a
                      key={story.id}
                      href={`/stories/${story.slug}`}
                      variants={fadeUp}
                      custom={i}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true }}
                      whileHover={{ y: -6, scale: 1.02 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="group relative flex-shrink-0 w-48 snap-start rounded-xl overflow-hidden border border-white/10 md:w-auto cursor-pointer"
                    >
                      {/* Image */}
                      <div className="aspect-[3/4] relative overflow-hidden">
                        {story.image ? (
                          <img
                            src={story.image}
                            alt={story.imageAlt ?? story.title}
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110 saturate-75 group-hover:saturate-100"
                          />
                        ) : (
                          <div className={`absolute inset-0 bg-gradient-to-b ${grad}`} />
                        )}

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                        {/* Rank badge */}
                        <div className="absolute top-3 left-3 flex items-center justify-center size-7 rounded-full bg-gold/90 text-[10px] font-bold text-black">
                          #{i + 1}
                        </div>

                        {/* Category tag */}
                        <div className="absolute top-3 right-3 rounded-sm bg-black/60 px-2 py-0.5 text-[9px] uppercase tracking-widest text-gold backdrop-blur-sm border border-gold/20">
                          {localized.category}
                        </div>

                        {/* Bottom content */}
                        <div className="absolute bottom-0 inset-x-0 p-3">
                          <h3 className="font-display text-sm font-bold leading-tight text-white line-clamp-2">
                            {localized.title}
                          </h3>
                          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-white/60">
                            <Eye className="size-3" />
                            {fmtViews(story.viewCount ?? 0)} views
                          </div>
                        </div>
                      </div>
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 3 · BROWSE BY STATE
        ══════════════════════════════════════════════════════════════════════ */}
        {!loading && stateList.length > 0 && (
          <section className="border-b border-border/60 bg-card/50 py-10">
            <div className="container mx-auto px-4 sm:px-6">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="flex items-center gap-3 mb-6"
              >
                <MapPin className="size-4 text-gold" />
                <h2 className="font-display text-xl text-foreground md:text-2xl">
                  Browse by State
                </h2>
                {selectedState && (
                  <button
                    onClick={() => { setSelectedState(null); setPage(1); }}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition"
                  >
                    <X className="size-3" /> Clear state
                  </button>
                )}
              </motion.div>

              {/* Horizontal scrollable state chips */}
              <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                {stateList.map(({ state, count }, i) => {
                  const active = selectedState === state;
                  return (
                    <motion.button
                      key={state}
                      variants={fadeUp}
                      custom={i * 0.3}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true }}
                      onClick={() => {
                        setSelectedState(active ? null : state);
                        setPage(1);
                      }}
                      className={[
                        "flex-shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 border",
                        active
                          ? "bg-primary text-primary-foreground border-primary shadow-glow"
                          : "border-border/70 bg-background text-muted-foreground hover:border-gold/50 hover:text-foreground",
                      ].join(" ")}
                    >
                      <span>{state}</span>
                      <span
                        className={[
                          "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                          active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground",
                        ].join(" ")}
                      >
                        {count}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 4 · BROWSE BY CATEGORY
        ══════════════════════════════════════════════════════════════════════ */}
        {!loading && categoryList.length > 0 && !anyFilter && (
          <section className="py-14 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="flex items-center gap-3 mb-8"
              >
                <BookOpen className="size-4 text-gold" />
                <h2 className="font-display text-xl text-foreground md:text-2xl">
                  Browse by Category
                </h2>
                <div className="ml-2 h-px flex-1 bg-gradient-to-r from-border to-transparent" />
              </motion.div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {categoryList.slice(0, 8).map(({ cat, count }, i) => {
                  const meta = getCategoryMeta(cat);
                  const active = selectedCategory === cat;
                  return (
                    <motion.button
                      key={cat}
                      variants={fadeUp}
                      custom={i}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true }}
                      onClick={() => {
                        setSelectedCategory(active ? null : cat);
                        setPage(1);
                      }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className={[
                        "group relative overflow-hidden rounded-xl border text-left transition-all duration-500 h-32",
                        active
                          ? "border-gold/60 shadow-glow ring-2 ring-gold/20"
                          : "border-border/60 hover:border-gold/30 hover:shadow-md",
                      ].join(" ")}
                    >
                      {/* Background gradient */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} transition-opacity duration-500`}
                        style={{ opacity: active ? 1 : 0.85 }}
                      />

                      {/* Shine on hover */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Content */}
                      <div className="relative h-full flex flex-col justify-between p-4">
                        <span className="text-2xl">{meta.emoji}</span>
                        <div>
                          <p
                            className="font-display text-base font-bold text-white leading-tight"
                            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}
                          >
                            {cat}
                          </p>
                          <p className="mt-0.5 text-[11px] text-white/60">
                            {count} {count === 1 ? "story" : "stories"}
                          </p>
                        </div>
                      </div>

                      {/* Active checkmark */}
                      {active && (
                        <div className="absolute top-2.5 right-2.5 size-5 rounded-full bg-gold flex items-center justify-center">
                          <svg className="size-3 text-black" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 5 · MAIN STORIES GRID
        ══════════════════════════════════════════════════════════════════════ */}
        <section className="py-14 bg-background border-t border-border/40">
          <div className="container mx-auto px-4 sm:px-6">

            {/* Header row */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="flex flex-wrap items-center justify-between gap-4 mb-8"
            >
              <div className="flex items-center gap-3">
                <h2 className="font-display text-xl text-foreground md:text-2xl">
                  {anyFilter ? "Filtered Stories" : "All Stories"}
                </h2>
                <AnimatePresence mode="wait">
                  {!loading && (
                    <motion.span
                      key={filtered.length}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary border border-primary/15"
                    >
                      {filtered.length} {filtered.length === 1 ? "story" : "stories"}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Active filter pills */}
              <div className="flex flex-wrap gap-2">
                {selectedCategory && (
                  <button
                    onClick={() => { setSelectedCategory(null); setPage(1); }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition"
                  >
                    {getCategoryMeta(selectedCategory).emoji} {selectedCategory}
                    <X className="size-3" />
                  </button>
                )}
                {selectedState && (
                  <button
                    onClick={() => { setSelectedState(null); setPage(1); }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-medium text-gold hover:bg-gold/20 transition"
                  >
                    <MapPin className="size-3" /> {selectedState}
                    <X className="size-3" />
                  </button>
                )}
                {query && (
                  <button
                    onClick={() => handleQueryChange("")}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition"
                  >
                    <Search className="size-3" /> &ldquo;{query}&rdquo;
                    <X className="size-3" />
                  </button>
                )}
                {anyFilter && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition"
                  >
                    Clear all
                    <ChevronRight className="size-3 rotate-180" />
                  </button>
                )}
              </div>
            </motion.div>

            {/* ── Loading state ──────────────────────────────────────────────── */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
                <Loader2 className="size-10 animate-spin text-gold" />
                <p className="text-sm">Curating stories…</p>
              </div>
            )}

            {/* ── Empty state ────────────────────────────────────────────────── */}
            {!loading && filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-24 gap-4 text-center"
              >
                <span className="text-5xl">🔍</span>
                <p className="font-display text-2xl text-foreground">No stories found</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Try adjusting your search or removing filters to discover more stories.
                </p>
                <Button onClick={clearFilters} variant="outline" className="mt-2">
                  Clear all filters
                </Button>
              </motion.div>
            )}

            {/* ── Story grid ─────────────────────────────────────────────────── */}
            {!loading && paginated.length > 0 && (
              <>
                {/* StoryCard handles its own i18n, so we pass the original story objects */}
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
                  {paginated.map((localStory, i) => {
                    const original = stories.find((s) => s.id === localStory.id) ?? stories[i];
                    if (!original) return null;
                    return <StoryCard key={original.id} story={original} index={i} />;
                  })}
                </div>

                {/* ── Load more ───────────────────────────────────────────────── */}
                <AnimatePresence>
                  {hasMore && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-12 flex justify-center"
                    >
                      <Button
                        onClick={() => setPage((p) => p + 1)}
                        variant="outline"
                        className="group btn-premium h-12 min-w-[180px] rounded-full border-gold/30 text-sm font-medium hover:border-gold/60"
                      >
                        Load more stories
                        <ChevronRight className="size-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* End of results */}
                {!hasMore && filtered.length > PAGE_SIZE && (
                  <p className="mt-10 text-center text-sm text-muted-foreground">
                    You&apos;ve seen all {filtered.length} stories.
                  </p>
                )}
              </>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 6 · CINEMATIC FOOTER BANNER
        ══════════════════════════════════════════════════════════════════════ */}
        {!loading && (
          <section className="relative bg-secondary py-20 overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-hero opacity-60" />
            <div className="pointer-events-none absolute -top-32 right-0 size-[480px] rounded-full bg-gold/10 blur-3xl" />

            <div className="container relative mx-auto px-4 sm:px-6 text-center">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                <p className="font-display text-3xl italic text-white md:text-5xl">
                  &ldquo;To tell a billion stories
                  <span className="block text-gradient-gold mt-2">
                    with the craft they deserve.&rdquo;
                  </span>
                </p>
                <p className="mt-6 text-sm text-white/50 tracking-widest uppercase">
                  — India Story Project
                </p>
                <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                  <Button
                    asChild
                    className="btn-premium h-12 rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground shadow-glow"
                  >
                    <a href="/stories">Browse all stories</a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-12 rounded-full border-white/20 bg-white/5 px-8 text-sm text-white hover:bg-white/10 backdrop-blur-sm"
                  >
                    <a href="/join">Join the community</a>
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>
        )}
      </div>

      {/* ── Hide scrollbar utility ──────────────────────────────────────────── */}
      <style>{`
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </SiteLayout>
  );
}
