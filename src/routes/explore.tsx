import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  Filter,
  Globe2,
  Search,
  TrendingUp,
  MapPin,
  Clock,
  BookOpen,
  LayoutGrid,
  List,
  Flame,
  Sparkles,
  User,
  History,
  Calendar,
  ChevronRight,
  SlidersHorizontal,
  X,
  Award,
  ChevronDown,
  ArrowRight
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { StoryCard } from "@/components/site/StoryCard";
import { useI18nStore, translateStory } from "@/lib/i18n";
import { useAuthStore } from "@/lib/auth-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { z } from "zod";

const exploreSearchSchema = z.object({
  q: z.string().optional(),
  state: z.string().optional(),
  theme: z.string().optional(),
  era: z.string().optional(),
  collection: z.string().optional(),
});

export const Route = createFileRoute("/explore")({
  validateSearch: (search) => exploreSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Explore India — Discover Heritage, History & Culture | India Story Project" },
      {
        name: "description",
        content:
          "Discover stories, cultures, traditions, people, history, food, festivals, heritage and hidden places across India through our dynamic discovery engine.",
      },
    ],
  }),
  component: RouteComponent,
});

function formatReadTime(readingTime: number | null) {
  return readingTime != null && readingTime > 0 ? `${readingTime} min read` : "";
}

// Helper for highlighting text matches
function highlightText(text: string, query: string) {
  if (!query || !text) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-gold/25 text-gold rounded-sm px-0.5 font-semibold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

const THEME_EMOJIS: Record<string, string> = {
  heritage: "🏛️",
  innovation: "💡",
  sustainability: "🌱",
  science: "🔬",
  culture: "🎭",
  environment: "🌳",
  history: "📜",
  freedom: "🇮🇳",
  food: "🍲",
  festival: "🎉",
};

const THEME_GRADIENTS: Record<string, string> = {
  heritage: "from-amber-950/80 to-neutral-950 border-amber-900/40 hover:border-amber-500/50 hover:shadow-amber-500/10",
  innovation: "from-red-950/80 to-neutral-950 border-red-900/40 hover:border-red-500/50 hover:shadow-red-500/10",
  sustainability: "from-emerald-950/80 to-neutral-950 border-emerald-900/40 hover:border-emerald-500/50 hover:shadow-emerald-500/10",
  science: "from-indigo-950/80 to-neutral-950 border-indigo-900/40 hover:border-indigo-500/50 hover:shadow-indigo-500/10",
  culture: "from-red-950/80 to-neutral-950 border-red-900/40 hover:border-red-500/50 hover:shadow-red-500/10",
  environment: "from-teal-950/80 to-neutral-950 border-teal-900/40 hover:border-teal-500/50 hover:shadow-teal-500/10",
  history: "from-amber-900/60 to-neutral-950 border-amber-800/40 hover:border-amber-500/50 hover:shadow-amber-500/10",
  freedom: "from-orange-950/80 to-neutral-950 border-orange-900/40 hover:border-orange-500/50 hover:shadow-orange-500/10",
  food: "from-rose-950/80 to-neutral-950 border-rose-900/40 hover:border-rose-500/50 hover:shadow-rose-500/10",
  festival: "from-purple-950/80 to-neutral-950 border-purple-900/40 hover:border-purple-500/50 hover:shadow-purple-500/10",
};

function RouteComponent() {
  const lang = useI18nStore((s) => s.lang);
  const { session } = useAuthStore();
  const navigate = useNavigate({ from: Route.fullPath });
  const searchParams = Route.useSearch();

  // Consolidated aggregation data from /api/explore
  const [exploreData, setExploreData] = useState<any>(null);
  const [exploreLoading, setExploreLoading] = useState(true);

  // Main filtered stories feed state
  const [stories, setStories] = useState<any[]>([]);
  const [totalStoriesCount, setTotalStoriesCount] = useState(0);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Local Filter settings
  const [searchQuery, setSearchQuery] = useState(searchParams.q || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.q || "");
  const [selectedState, setSelectedState] = useState<string | null>(searchParams.state || null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(searchParams.theme || null);
  const [selectedEra, setSelectedEra] = useState<string | null>(searchParams.era || null);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(searchParams.collection || null);

  const [district, setDistrict] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [readTimeFilter, setReadTimeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Mobile Bottom Sheet toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeTimelineEra, setActiveTimelineEra] = useState(0);

  // Debounce search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 450);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sync state variables with search parameters from Route
  useEffect(() => {
    setSearchQuery(searchParams.q || "");
    setSelectedState(searchParams.state || null);
    setSelectedTheme(searchParams.theme || null);
    setSelectedEra(searchParams.era || null);
    setSelectedCollection(searchParams.collection || null);
  }, [searchParams]);

  // 1. Fetch Consolidated Explore Feed
  useEffect(() => {
    async function loadExploreData() {
      try {
        setExploreLoading(true);
        const headers: Record<string, string> = {};
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }
        const res = await fetch("/api/explore", { headers });
        if (res.ok) {
          const data = await res.json();
          setExploreData(data);
        }
      } catch (err) {
        console.error("Failed to load explore stats and feeds:", err);
      } finally {
        setExploreLoading(false);
      }
    }
    void loadExploreData();
  }, [session]);

  // 2. Fetch main paginated, filtered story feed
  const activeFiltersApplied = useMemo(() => {
    return (
      debouncedSearch.trim() !== "" ||
      selectedState !== null ||
      selectedTheme !== null ||
      selectedEra !== null ||
      selectedCollection !== null ||
      district.trim() !== "" ||
      authorName.trim() !== "" ||
      languageFilter !== "all" ||
      readTimeFilter !== "all" ||
      sortBy !== "latest"
    );
  }, [debouncedSearch, selectedState, selectedTheme, selectedEra, selectedCollection, district, authorName, languageFilter, readTimeFilter, sortBy]);

  useEffect(() => {
    async function fetchFilteredFeed() {
      try {
        setStoriesLoading(true);
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("query", debouncedSearch);
        if (selectedTheme) params.set("theme", selectedTheme);
        if (selectedState) params.set("region", selectedState);
        if (selectedEra) params.set("era", selectedEra);
        if (selectedCollection) params.set("collection", selectedCollection);
        if (district) params.set("district", district);
        if (authorName) params.set("author", authorName);
        if (languageFilter !== "all") params.set("language", languageFilter);
        if (readTimeFilter !== "all") params.set("readTime", readTimeFilter);
        
        // Map UI sort keys to API sort keys
        let apiSort = "date";
        if (sortBy === "trending" || sortBy === "views") apiSort = "views";
        if (sortBy === "alphabetical") apiSort = "title";
        params.set("sortBy", apiSort);
        
        params.set("page", String(page));
        params.set("pageSize", "12");

        const res = await fetch(`/api/stories?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (page === 1) {
            setStories(data.stories || []);
          } else {
            setStories((prev) => [...prev, ...(data.stories || [])]);
          }
          setTotalStoriesCount(data.total || 0);
          setHasMore((data.stories || []).length === 12);
        }
      } catch (err) {
        console.error("Failed to load stories feed:", err);
      } finally {
        setStoriesLoading(false);
      }
    }
    void fetchFilteredFeed();
  }, [debouncedSearch, selectedState, selectedTheme, selectedEra, selectedCollection, district, authorName, languageFilter, readTimeFilter, sortBy, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedState, selectedTheme, selectedEra, selectedCollection, district, authorName, languageFilter, readTimeFilter, sortBy]);

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setSelectedState(null);
    setSelectedTheme(null);
    setSelectedEra(null);
    setSelectedCollection(null);
    setDistrict("");
    setAuthorName("");
    setLanguageFilter("all");
    setReadTimeFilter("all");
    setSortBy("latest");
    void navigate({ search: {} });
  };

  const handleStateSelect = (stateName: string) => {
    const newVal = selectedState === stateName ? null : stateName;
    setSelectedState(newVal);
    void navigate({ search: { ...searchParams, state: newVal || undefined } });
  };

  const handleThemeSelect = (themeName: string) => {
    const newVal = selectedTheme === themeName ? null : themeName;
    setSelectedTheme(newVal);
    void navigate({ search: { ...searchParams, theme: newVal || undefined } });
  };

  const handleEraSelect = (eraName: string) => {
    const newVal = selectedEra === eraName ? null : eraName;
    setSelectedEra(newVal);
    void navigate({ search: { ...searchParams, era: newVal || undefined } });
  };

  const handleCollectionSelect = (colName: string) => {
    const newVal = selectedCollection === colName ? null : colName;
    setSelectedCollection(newVal);
    void navigate({ search: { ...searchParams, collection: newVal || undefined } });
  };

  return (
    <SiteLayout>
      <div className="bg-background text-foreground min-h-screen">
        {/* ─── Hero Section & Counters ─── */}
        <section className="relative overflow-hidden pt-28 pb-14 border-b border-border/40 bg-hero">
          <div className="absolute inset-0 bg-hero opacity-25 pointer-events-none" />
          <div className="absolute -top-44 left-1/3 size-[450px] rounded-full bg-gold/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-60 right-1/4 size-[550px] rounded-full bg-saffron/5 blur-3xl pointer-events-none" />

          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-950/40 border border-red-500/20 text-[10px] uppercase tracking-widest text-red-400 font-sans font-bold shadow-md"
              >
                <Compass className="size-3.5 text-gold animate-spin-slow" />
                Discovery Portal
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] text-white"
              >
                Explore India
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-sans text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto"
              >
                Discover stories, cultures, traditions, people, history, food, festivals, heritage and hidden places across India.
              </motion.p>

              {/* Universal Search Bar */}
              <div className="relative max-w-xl mx-auto mt-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title, state, tags, theme, author..."
                  className="w-full h-14 pl-12 pr-10 bg-neutral-900 border-neutral-800 rounded-xl font-sans text-sm shadow-lg focus:border-red-500/50 focus-visible:ring-0 text-white placeholder-neutral-550 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* Dynamic Database Statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-3xl mx-auto pt-8 border-t border-neutral-800">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 text-center shadow-md">
                  <div className="text-xl sm:text-2xl font-bold font-display text-red-500">
                    {exploreData?.stats?.stories ?? "..."}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-sans font-semibold mt-0.5">
                    Stories
                  </div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 text-center shadow-md">
                  <div className="text-xl sm:text-2xl font-bold font-display text-red-500">
                    {exploreData?.stats?.states ?? "..."}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-sans font-semibold mt-0.5">
                    States
                  </div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 text-center shadow-md">
                  <div className="text-xl sm:text-2xl font-bold font-display text-red-500">
                    {exploreData?.stats?.themes ?? "..."}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-sans font-semibold mt-0.5">
                    Themes
                  </div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 text-center shadow-md">
                  <div className="text-xl sm:text-2xl font-bold font-display text-red-500">
                    {exploreData?.stats?.authors ?? "..."}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-sans font-semibold mt-0.5">
                    Authors
                  </div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 text-center col-span-2 sm:col-span-1 shadow-md">
                  <div className="text-xl sm:text-2xl font-bold font-display text-red-500">
                    {exploreData?.stats?.views ? `${Math.round(exploreData.stats.views / 100) / 10}k` : "..."}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-sans font-semibold mt-0.5">
                    Views
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Active Filters Toolbar & Quick Chips ─── */}
        <section className="bg-card/25 border-b border-border/40 py-4">
          <div className="container mx-auto px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Quick Explore Theme Chips */}
            <div className="flex-1 overflow-x-auto scrollbar-none flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mr-1">
                Themes:
              </span>
              {exploreLoading ? (
                [...Array(6)].map((_, i) => (
                  <div key={i} className="h-8 w-24 bg-muted/20 animate-pulse rounded-full" />
                ))
              ) : (
                exploreData?.themes?.map((t: any) => {
                  const isSelected = selectedTheme === t.name;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleThemeSelect(t.name)}
                      className={`h-8 px-4 rounded-full text-xs font-sans font-semibold border flex-shrink-0 transition-all duration-300 ${
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground shadow-glow"
                          : "bg-background border-border/60 text-muted-foreground hover:border-gold/30 hover:text-foreground"
                      }`}
                    >
                      {t.name} <span className="opacity-50 text-[10px]">({t.count})</span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Layout view controls and Mobile filter toggle */}
            <div className="flex items-center justify-end gap-3 flex-shrink-0">
              {(activeFiltersApplied) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAllFilters}
                  className="text-xs font-sans text-red-400 hover:text-red-300 hover:bg-transparent h-8"
                >
                  Clear Filters
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMobileFilters(true)}
                className="md:hidden rounded-full border-border h-9 text-xs font-sans font-bold gap-2 text-white"
              >
                <Filter className="size-3.5 text-gold" />
                Filters
              </Button>
            </div>
          </div>
        </section>

        {/* ─── Page Layout Content ─── */}
        <div className="container mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Desktop Filters Panel */}
            <aside className="hidden lg:block space-y-6">
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 sticky top-28 space-y-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                  <h3 className="font-display font-bold text-base flex items-center gap-2 text-white">
                    <SlidersHorizontal className="size-4 text-gold" />
                    Discovery Filters
                  </h3>
                  {activeFiltersApplied && (
                    <button
                      onClick={handleClearAllFilters}
                      className="text-[10px] uppercase tracking-wider font-sans font-bold text-muted-foreground hover:text-foreground"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* State selector */}
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    State
                  </Label>
                  <select
                    value={selectedState || ""}
                    onChange={(e) => handleStateSelect(e.target.value || "")}
                    className="w-full h-10 bg-background border border-border/60 text-white rounded-lg px-3 text-xs font-sans outline-none focus:border-gold/30"
                  >
                    <option value="">All States</option>
                    {exploreData?.states?.map((s: any) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* District Search */}
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    District / City
                  </Label>
                  <Input
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Udaipur, Jodhpur"
                    className="h-10 bg-background border-border/60 text-white rounded-lg text-xs font-sans"
                  />
                </div>

                {/* Author Search */}
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Author
                  </Label>
                  <Input
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Search author..."
                    className="h-10 bg-background border-border/60 text-white rounded-lg text-xs font-sans"
                  />
                </div>

                {/* Language Select */}
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Language
                  </Label>
                  <select
                    value={languageFilter}
                    onChange={(e) => setLanguageFilter(e.target.value)}
                    className="w-full h-10 bg-background border border-border/60 text-white rounded-lg px-3 text-xs font-sans outline-none focus:border-gold/30"
                  >
                    <option value="all">Any Language</option>
                    <option value="en">English Only</option>
                    <option value="hi">Hindi (हिन्दी)</option>
                  </select>
                </div>

                {/* Read Time */}
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Reading Time
                  </Label>
                  <select
                    value={readTimeFilter}
                    onChange={(e) => setReadTimeFilter(e.target.value)}
                    className="w-full h-10 bg-background border border-border/60 text-white rounded-lg px-3 text-xs font-sans outline-none focus:border-gold/30"
                  >
                    <option value="all">Any Read Time</option>
                    <option value="short">Short (≤ 3 min)</option>
                    <option value="medium">Medium (4-6 min)</option>
                    <option value="long">Long (&gt; 6 min)</option>
                  </select>
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Sort Order
                  </Label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full h-10 bg-background border border-border/60 text-gold rounded-lg px-3 text-xs font-sans font-bold outline-none focus:border-gold/30"
                  >
                    <option value="latest">Latest Stories</option>
                    <option value="trending">Trending & Popular</option>
                    <option value="alphabetical">Alphabetical</option>
                  </select>
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="lg:col-span-3 space-y-12">
              
              {/* If no filters are active, display premium discovery layouts */}
              {!activeFiltersApplied && (
                <>
                  {/* A. Continue Reading (Zustand Auth Scoped) */}
                  {exploreData?.continueReading?.length > 0 && (
                    <section className="space-y-4">
                      <div className="flex items-center gap-2">
                        <History className="size-4.5 text-gold" />
                        <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                          Continue Reading
                        </h2>
                      </div>
                      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin snap-x snap-mandatory">
                        {exploreData.continueReading.map((item: any) => {
                          const localized = translateStory(item.story, lang);
                          return (
                            <Link
                              key={item.story.id}
                              to="/stories/$slug"
                              params={{ slug: item.story.slug }}
                              className="w-72 flex-shrink-0 bg-neutral-900 border border-neutral-850 rounded-2xl p-5 snap-start hover:border-red-500/50 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                            >
                              <div className="space-y-2">
                                <span className="text-[9px] uppercase tracking-widest text-red-500 bg-red-500/10 px-2.5 py-0.5 rounded border border-red-500/20 font-sans font-bold">
                                  {localized.region}
                                </span>
                                <h3 className="font-display font-bold text-sm text-white line-clamp-2 leading-snug">
                                  {localized.title}
                                </h3>
                              </div>
                              <div className="mt-4 space-y-2">
                                <div className="flex items-center justify-between text-[10px] text-neutral-300 font-sans font-medium">
                                  <span>Progress: {item.progressPercent}%</span>
                                  <span>{formatReadTime(item.story.readingTime)}</span>
                                </div>
                                <div className="w-full bg-neutral-850 rounded-full h-1 overflow-hidden">
                                  <div
                                    className="bg-red-600 h-full transition-all duration-300"
                                    style={{ width: `${item.progressPercent}%` }}
                                  />
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {/* B. Recommended For You (Custom likeness algorithm) */}
                  {exploreData?.recommended?.length > 0 && (
                    <section className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="size-4.5 text-gold animate-pulse" />
                        <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                          Recommended For You
                        </h2>
                      </div>
                      <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin snap-x snap-mandatory">
                        {exploreData.recommended.map((story: any) => {
                          const localized = translateStory(story, lang);
                          return (
                            <Link
                              key={story.id}
                              to="/stories/$slug"
                              params={{ slug: story.slug }}
                              className="w-72 flex-shrink-0 group snap-start bg-neutral-900 border border-neutral-850 rounded-2xl overflow-hidden hover:border-red-500/50 hover:shadow-lg transition-all duration-300"
                            >
                              <div className="aspect-[16/10] overflow-hidden relative bg-neutral-950">
                                {story.image ? (
                                  <img
                                    src={story.image}
                                    alt={localized.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-red-950/20 to-neutral-900" />
                                )}
                              </div>
                              <div className="p-4 space-y-1.5">
                                <div className="text-[9px] uppercase tracking-wider text-red-500 font-sans font-bold">
                                  {localized.region}
                                </div>
                                <h3 className="font-display font-bold text-sm text-neutral-100 line-clamp-2 leading-snug group-hover:text-red-500 transition-colors">
                                  {localized.title}
                                </h3>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {/* C. Trending This Week */}
                  {exploreData?.trending?.length > 0 && (
                    <section className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Flame className="size-4.5 text-gold animate-bounce-slow" />
                        <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                          Trending This Week
                        </h2>
                      </div>
                      <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin snap-x snap-mandatory">
                        {exploreData.trending.map((story: any) => {
                          const localized = translateStory(story, lang);
                          return (
                            <Link
                              key={story.id}
                              to="/stories/$slug"
                              params={{ slug: story.slug }}
                              className="w-72 flex-shrink-0 group snap-start bg-neutral-900 border border-neutral-850 rounded-2xl overflow-hidden hover:border-red-500/50 hover:shadow-lg transition-all duration-300"
                            >
                              <div className="aspect-[16/10] overflow-hidden relative bg-neutral-950">
                                {story.image ? (
                                  <img
                                    src={story.image}
                                    alt={localized.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-red-950/20 to-neutral-900" />
                                )}
                                <span className="absolute bottom-2.5 left-2.5 bg-red-600/90 backdrop-blur text-[8px] text-white uppercase font-bold tracking-widest px-2.5 py-1 rounded font-sans shadow-md">
                                  🔥 {story.viewCount} views
                                </span>
                              </div>
                              <div className="p-4 space-y-1.5">
                                <div className="text-[9px] uppercase tracking-wider text-red-500 font-sans font-bold">
                                  {localized.region}
                                </div>
                                <h3 className="font-display font-bold text-sm text-neutral-100 line-clamp-2 leading-snug group-hover:text-red-500 transition-colors">
                                  {localized.title}
                                </h3>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {/* D. Explore by State Grid */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Globe2 className="size-4.5 text-gold" />
                      <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                        Explore by State
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                      {exploreData?.states?.map((st: any) => (
                        <div
                          key={st.id}
                          onClick={() => handleStateSelect(st.name)}
                          className="relative rounded-2xl border border-neutral-800 overflow-hidden aspect-[4/3] group cursor-pointer hover:border-red-500/50 shadow-lg hover:shadow-red-500/10 transition-all duration-500"
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-10" />
                          <img
                            src={st.image}
                            alt={st.name}
                            className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute bottom-4 left-4 right-4 z-20 space-y-1">
                            <h3 className="font-display font-bold text-base text-white tracking-wide group-hover:text-red-400 transition-colors">
                              {st.name}
                            </h3>
                            <div className="text-[10px] text-neutral-300 font-sans flex items-center gap-1.5 uppercase font-medium tracking-wider">
                              <BookOpen className="size-3 text-red-500" />
                              {st.count} {st.count === 1 ? "Story" : "Stories"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* E. Explore by Theme */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Filter className="size-4.5 text-gold" />
                      <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                        Explore by Theme
                      </h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {exploreData?.themes?.map((t: any) => {
                        const emoji = THEME_EMOJIS[t.name.toLowerCase()] || "✨";
                        const gradient = THEME_GRADIENTS[t.name.toLowerCase()] || "from-neutral-900 to-neutral-950";
                        return (
                           <div
                             key={t.id}
                             onClick={() => handleThemeSelect(t.name)}
                             className={`relative rounded-2xl border p-6 flex flex-col items-center justify-center text-center gap-2.5 bg-gradient-to-b ${gradient} hover:scale-[1.03] cursor-pointer hover:shadow-xl transition-all duration-300`}
                           >
                             <span className="text-3xl">{emoji}</span>
                             <span className="font-sans font-bold text-xs text-white leading-tight mt-1">
                               {t.name}
                             </span>
                             <span className="text-[10px] text-neutral-300 font-sans font-semibold">{t.count} stories</span>
                           </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* F. Featured Collections */}
                  {exploreData?.collections?.length > 0 && (
                    <section className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Award className="size-4.5 text-gold" />
                        <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                          Featured Collections
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                        {exploreData.collections.map((item: any) => (
                          <div
                            key={item.name}
                            onClick={() => handleCollectionSelect(item.slug)}
                            className="group relative rounded-2xl border border-neutral-850 overflow-hidden aspect-[4/3] cursor-pointer hover:border-red-500/50 shadow-lg hover:shadow-red-500/10 transition-all duration-500"
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-10" />
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-700"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-red-950/20 to-neutral-900 absolute inset-0" />
                            )}
                            <div className="absolute bottom-4 left-4 right-4 z-20 space-y-1">
                              <h3 className="font-display font-bold text-sm sm:text-base text-white tracking-wide group-hover:text-red-455 transition-colors line-clamp-1">
                                {item.name}
                              </h3>
                              <p className="text-[10px] text-neutral-350 font-sans line-clamp-2 leading-tight">
                                {item.description}
                              </p>
                              <div className="text-[9px] text-red-500 font-sans flex items-center gap-1.5 uppercase font-bold tracking-wider pt-1.5">
                                Browse Collection <ChevronRight className="size-3" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* G. Interactive Historical Timeline */}
                  {exploreData?.historicalTimeline?.length > 0 && (
                    <section className="space-y-6 bg-neutral-900/40 border border-neutral-850 rounded-3xl p-6 sm:p-8">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-5 text-gold" />
                          <h2 className="font-display text-xl font-bold text-white">
                            Historical Era Timeline
                          </h2>
                        </div>
                        <span className="text-[10px] uppercase font-sans tracking-widest text-muted-foreground font-bold">
                          Chronicles of India
                        </span>
                      </div>

                      {/* Era Selector Steps */}
                      <div className="relative flex justify-between items-center max-w-2xl mx-auto py-4">
                        <div className="absolute left-0 right-0 h-0.5 bg-neutral-800 top-1/2 -translate-y-1/2 z-0" />
                        <div
                          className="absolute left-0 h-0.5 bg-primary top-1/2 -translate-y-1/2 z-0 transition-all duration-500"
                          style={{ width: `${(activeTimelineEra / (exploreData.historicalTimeline.length - 1)) * 100}%` }}
                        />
                        {exploreData.historicalTimeline.map((item: any, idx: number) => {
                          const isActive = activeTimelineEra === idx;
                          return (
                            <button
                              key={item.era}
                              onClick={() => setActiveTimelineEra(idx)}
                              className="relative z-10 flex flex-col items-center group focus:outline-none"
                            >
                              <div
                                className={`size-8 rounded-full border flex items-center justify-center font-sans text-xs font-bold transition-all duration-300 ${
                                  isActive
                                    ? "bg-primary border-primary text-primary-foreground scale-110 shadow-glow"
                                    : "bg-neutral-900 border-neutral-800 text-neutral-400 group-hover:border-gold/50"
                                }`}
                              >
                                {idx + 1}
                              </div>
                              <span
                                className={`absolute top-10 whitespace-nowrap text-[10px] sm:text-xs font-bold tracking-wider transition-colors duration-300 ${
                                  isActive ? "text-gold" : "text-neutral-400 group-hover:text-white"
                                }`}
                              >
                                {item.era}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Timeline Stories Slider */}
                      <div className="pt-8">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={activeTimelineEra}
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -15 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                          >
                            <p className="text-xs text-muted-foreground font-sans max-w-lg italic">
                              {exploreData.historicalTimeline[activeTimelineEra]?.desc}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                              {exploreData.historicalTimeline[activeTimelineEra]?.stories?.map((story: any) => (
                                <Link
                                  key={story.id}
                                  to="/stories/$slug"
                                  params={{ slug: story.slug }}
                                  className="group bg-neutral-900 border border-neutral-850 hover:border-red-500/50 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col"
                                >
                                  <div className="aspect-[16/10] overflow-hidden bg-neutral-950">
                                    {story.image ? (
                                      <img
                                        src={story.image}
                                        alt={story.title}
                                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-red-950/20 to-neutral-900" />
                                    )}
                                  </div>
                                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                                    <h3 className="font-display font-bold text-xs text-neutral-100 group-hover:text-red-500 line-clamp-2 leading-snug transition-colors">
                                      {story.title}
                                    </h3>
                                    <span className="text-[9px] uppercase font-bold tracking-wider text-gold font-sans block">
                                      {story.region}
                                    </span>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </section>
                  )}

                  {/* Active Writing Challenges */}
                  {exploreData?.challenges?.length > 0 && (
                    <section className="bg-gradient-to-br from-red-950/20 via-neutral-900 to-neutral-900 border border-neutral-850 rounded-3xl p-6 sm:p-8 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase tracking-widest text-gold bg-gold/10 px-2.5 py-0.5 rounded border border-gold/20 font-sans font-bold">
                            Community Writing Streak
                          </span>
                          <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                            <Flame className="size-5 text-gold animate-pulse" />
                            Active Story Challenges
                          </h2>
                        </div>
                        <span className="text-xs text-muted-foreground font-sans">
                          Join, contribute, and win badges
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {exploreData.challenges.map((challenge: any) => (
                          <div
                            key={challenge.id}
                            className="bg-stone-900/60 border border-border/40 rounded-2xl p-6 flex flex-col justify-between gap-4 hover:border-gold/30 transition-all duration-300"
                          >
                            <div className="space-y-2">
                              <h3 className="font-display font-bold text-base text-white">
                                {challenge.title}
                              </h3>
                              <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                                {challenge.description}
                              </p>
                              <div className="text-[10px] text-neutral-400 font-sans space-y-1 pt-1.5">
                                <div><span className="font-semibold text-gold">Prize:</span> {challenge.prize}</div>
                                <div><span className="font-semibold text-gold">Rules:</span> {challenge.rules}</div>
                                <div>
                                  <span className="font-semibold text-gold">Ends:</span>{" "}
                                  {new Date(challenge.endAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>

                            <Button
                              asChild
                              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-sans uppercase tracking-widest text-xs h-10 rounded-xl"
                            >
                              <Link to="/share-story" search={{ challenge: challenge.slug }}>
                                Submit Your Entry
                              </Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Festival Calendar Section */}
                  {exploreData?.festivalStories?.length > 0 && (
                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="size-4.5 text-gold" />
                          <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                            Festival Calendar & Celebrations
                          </h2>
                        </div>
                        <span className="text-[10px] uppercase font-sans tracking-widest text-muted-foreground font-bold">
                          Spiritual Harmony
                        </span>
                      </div>
                      <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin snap-x snap-mandatory">
                        {exploreData.festivalStories.map((story: any) => {
                          const localized = translateStory(story, lang);
                          return (
                            <Link
                              key={story.id}
                              to="/stories/$slug"
                              params={{ slug: story.slug }}
                              className="w-72 flex-shrink-0 group snap-start bg-neutral-900 border border-neutral-850 rounded-2xl overflow-hidden hover:border-red-500/50 hover:shadow-lg transition-all duration-300"
                            >
                              <div className="aspect-[16/10] overflow-hidden relative bg-neutral-950">
                                {story.image ? (
                                  <img
                                    src={story.image}
                                    alt={localized.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-red-950/20 to-neutral-900" />
                                )}
                                <span className="absolute top-2.5 left-2.5 bg-gold text-black text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 font-sans shadow-md">
                                  Festival Special
                                </span>
                              </div>
                              <div className="p-4 space-y-1.5">
                                <div className="text-[9px] uppercase tracking-wider text-red-500 font-sans font-bold">
                                  {localized.region}
                                </div>
                                <h3 className="font-display font-bold text-sm text-neutral-100 line-clamp-2 leading-snug group-hover:text-red-500 transition-colors">
                                  {localized.title}
                                </h3>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {/* Travel Routes Section */}
                  {exploreData?.travelRoutes?.length > 0 && (
                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Compass className="size-4.5 text-gold" />
                          <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                            Scenic Travel Routes & Trails
                          </h2>
                        </div>
                        <span className="text-[10px] uppercase font-sans tracking-widest text-muted-foreground font-bold">
                          Road-trip routes
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {exploreData.travelRoutes.map((route: any) => (
                          <div
                            key={route.name}
                            className="bg-neutral-900 border border-neutral-850 rounded-2xl p-6 space-y-4 shadow-lg hover:border-red-500/30 transition-all duration-300 flex flex-col justify-between"
                          >
                            <div className="space-y-2">
                              <h3 className="font-display font-bold text-base text-white hover:text-red-400 transition-colors">
                                {route.name}
                              </h3>
                              <p className="text-xs text-neutral-305 text-neutral-300 font-sans leading-relaxed">
                                {route.desc}
                              </p>
                              {/* State flow dots */}
                              <div className="flex items-center gap-2 pt-2 text-[9px] font-sans font-bold text-gold tracking-widest uppercase">
                                {route.states.map((st: string, idx: number) => (
                                  <span key={st} className="flex items-center gap-2">
                                    {st}
                                    {idx < route.states.length - 1 && <span className="text-red-500 font-bold">→</span>}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Stories list under the trail */}
                            <div className="space-y-2 pt-2 border-t border-white/5">
                              <span className="text-[9px] uppercase tracking-wider font-sans font-semibold text-neutral-450">Stories on this route:</span>
                              {route.stories.map((story: any) => (
                                <Link
                                  key={story.id}
                                  to="/stories/$slug"
                                  params={{ slug: story.slug }}
                                  className="flex items-center justify-between text-xs text-neutral-200 hover:text-red-500 transition-colors py-0.5 group/link"
                                >
                                  <span className="truncate max-w-[85%]">{story.title}</span>
                                  <ChevronRight className="size-3 text-gold opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* H. Author Spotlight */}
                  {exploreData?.authors?.length > 0 && (
                    <section className="space-y-4">
                      <div className="flex items-center gap-2">
                        <User className="size-4.5 text-gold" />
                        <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                          Contributor Spotlight
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                        {exploreData.authors.map((author: any) => (
                          <div
                            key={author.id}
                            className="bg-card/45 border border-border/40 rounded-xl p-4 flex gap-4 hover:border-gold/30 transition-all duration-300"
                          >
                            <div className="size-12 rounded-full overflow-hidden shrink-0 bg-stone-800">
                              {author.avatar ? (
                                <img
                                  src={author.avatar}
                                  alt={author.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-display font-bold text-gold text-lg bg-gold/10">
                                  {author.name.slice(0, 1).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="space-y-1 overflow-hidden flex-1">
                              <h3 className="font-display font-bold text-sm text-white line-clamp-1">
                                {author.name}
                              </h3>
                              <p className="text-[10px] text-muted-foreground font-sans line-clamp-2">
                                {author.bio || "Storyteller of India's cultural roots."}
                              </p>
                              <div className="text-[9px] text-gold font-sans font-bold flex items-center gap-1 pt-1 uppercase">
                                <BookOpen className="size-3 text-gold" />
                                {author.count} published {author.count === 1 ? "story" : "stories"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* J. Most Loved Stories */}
                  {exploreData?.mostLoved?.length > 0 && (
                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Award className="size-4.5 text-gold" />
                          <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                            Most Loved Stories
                          </h2>
                        </div>
                        <span className="text-[10px] uppercase font-sans tracking-widest text-muted-foreground font-bold">
                          Top reader ratings
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {exploreData.mostLoved.map((story: any) => {
                          const localized = translateStory(story, lang);
                          return (
                            <Link
                              key={story.id}
                              to="/stories/$slug"
                              params={{ slug: story.slug }}
                              className="group bg-neutral-900 border border-neutral-850 hover:border-red-500/40 rounded-2xl overflow-hidden p-4 flex gap-4 transition-all duration-300 hover:shadow-lg"
                            >
                              <div className="size-16 shrink-0 overflow-hidden bg-neutral-950 rounded-lg">
                                {story.image ? (
                                  <img
                                    src={story.image}
                                    alt={localized.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-red-950/20 to-neutral-900" />
                                )}
                              </div>
                              <div className="flex flex-col justify-between flex-1 min-w-0">
                                <h3 className="font-display font-bold text-xs text-neutral-100 group-hover:text-red-500 line-clamp-2 leading-snug transition-colors">
                                  {localized.title}
                                </h3>
                                <div className="flex items-center justify-between text-[9px] text-neutral-400 font-sans">
                                  <span>By {story.authorName || "ISP"}</span>
                                  <span className="text-red-500">❤️ {story.likesCount} likes</span>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {/* I. Hidden Gems */}
                  {exploreData?.hiddenGems?.length > 0 && (
                    <section className="space-y-4 border-t border-white/5 pt-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="size-4.5 text-gold animate-pulse" />
                          <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                            Hidden Gems
                          </h2>
                        </div>
                        <span className="text-[10px] uppercase font-sans tracking-widest text-muted-foreground font-bold">
                          Unexplored accounts
                        </span>
                      </div>
                      <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin snap-x snap-mandatory">
                        {exploreData.hiddenGems.map((story: any) => {
                          const localized = translateStory(story, lang);
                          return (
                            <Link
                              key={story.id}
                              to="/stories/$slug"
                              params={{ slug: story.slug }}
                              className="w-72 flex-shrink-0 group snap-start bg-neutral-900 border border-neutral-850 rounded-2xl overflow-hidden hover:border-red-500/50 hover:shadow-lg transition-all duration-300"
                            >
                              <div className="aspect-[16/10] overflow-hidden relative bg-neutral-950">
                                {story.image ? (
                                  <img
                                    src={story.image}
                                    alt={localized.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-red-950/20 to-neutral-900" />
                                )}
                              </div>
                              <div className="p-4 space-y-1.5">
                                <div className="text-[9px] uppercase tracking-wider text-red-500 font-sans font-bold">
                                  {localized.region}
                                </div>
                                <h3 className="font-display font-bold text-sm text-neutral-100 line-clamp-2 leading-snug group-hover:text-red-500 transition-colors">
                                  {localized.title}
                                </h3>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </section>
                  )}
                </>
              )}

              {/* Main Stories Filtered Grid (always visible when filters are applied or as final backup) */}
              <section className="space-y-6 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                  <div>
                    <h2 className="font-display text-xl font-bold text-white">
                      {activeFiltersApplied ? "Filtered Search Results" : "Latest Stories"}
                    </h2>
                    <p className="text-xs text-muted-foreground font-sans mt-0.5">
                      Found {totalStoriesCount} {totalStoriesCount === 1 ? "story" : "stories"} matched.
                    </p>
                  </div>
                  
                  {/* View Mode Switcher */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 border border-border/40 rounded-full p-1 bg-card/45">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-1.5 rounded-full transition-colors ${
                          viewMode === "grid"
                            ? "bg-primary text-white"
                            : "text-muted-foreground hover:text-white"
                        }`}
                        title="Grid View"
                      >
                        <LayoutGrid className="size-3.5" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-1.5 rounded-full transition-colors ${
                          viewMode === "list"
                            ? "bg-primary text-white"
                            : "text-muted-foreground hover:text-white"
                        }`}
                        title="List View"
                      >
                        <List className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Active filter tags */}
                {activeFiltersApplied && (
                  <div className="flex flex-wrap gap-2">
                    {debouncedSearch && (
                      <span className="bg-primary/20 text-gold border border-primary/30 px-3 py-1 rounded-full text-xs font-sans font-semibold flex items-center gap-1.5">
                        Query: &quot;{debouncedSearch}&quot;
                        <button onClick={() => { setSearchQuery(""); setDebouncedSearch(""); }} className="hover:text-red-400 font-bold text-[10px]">✕</button>
                      </span>
                    )}
                    {selectedState && (
                      <span className="bg-primary/20 text-gold border border-primary/30 px-3 py-1 rounded-full text-xs font-sans font-semibold flex items-center gap-1.5">
                        State: {selectedState}
                        <button onClick={() => handleStateSelect(selectedState)} className="hover:text-red-400 font-bold text-[10px]">✕</button>
                      </span>
                    )}
                    {selectedTheme && (
                      <span className="bg-primary/20 text-gold border border-primary/30 px-3 py-1 rounded-full text-xs font-sans font-semibold flex items-center gap-1.5">
                        Theme: {selectedTheme}
                        <button onClick={() => handleThemeSelect(selectedTheme)} className="hover:text-red-400 font-bold text-[10px]">✕</button>
                      </span>
                    )}
                    {selectedEra && (
                      <span className="bg-primary/20 text-gold border border-primary/30 px-3 py-1 rounded-full text-xs font-sans font-semibold flex items-center gap-1.5">
                        Era: {selectedEra}
                        <button onClick={() => handleEraSelect(selectedEra)} className="hover:text-red-400 font-bold text-[10px]">✕</button>
                      </span>
                    )}
                    {selectedCollection && (
                      <span className="bg-primary/20 text-gold border border-primary/30 px-3 py-1 rounded-full text-xs font-sans font-semibold flex items-center gap-1.5">
                        Collection: {selectedCollection}
                        <button onClick={() => handleCollectionSelect(selectedCollection)} className="hover:text-red-400 font-bold text-[10px]">✕</button>
                      </span>
                    )}
                  </div>
                )}

                {storiesLoading && stories.length === 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="aspect-[4/3] bg-card/25 animate-pulse rounded-2xl border border-border/40" />
                    ))}
                  </div>
                ) : stories.length === 0 ? (
                  <div className="text-center py-24 bg-card/10 rounded-2xl border border-border/40">
                    <BookOpen className="size-10 mx-auto mb-4 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground font-sans max-w-sm mx-auto">
                      No stories match your discovery parameters. Try resetting your search filters to explore further.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {viewMode === "grid" ? (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stories.map((story, i) => (
                          <StoryCard key={story.id} story={story} index={i} />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {stories.map((story, i) => {
                          const localized = translateStory(story, lang);
                          return (
                            <motion.div
                              key={story.id}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.3) }}
                              className="flex flex-col sm:flex-row gap-5 bg-neutral-900 border border-neutral-850 hover:border-red-500/40 rounded-2xl overflow-hidden p-5 group hover:shadow-[0_0_20px_rgba(220,38,38,0.1)] transition-all duration-300"
                            >
                              <Link
                                to="/stories/$slug"
                                params={{ slug: story.slug }}
                                className="w-full sm:w-60 aspect-[16/10] sm:aspect-square md:aspect-[16/10] shrink-0 overflow-hidden bg-neutral-950 rounded-xl relative"
                              >
                                {story.image ? (
                                  <img
                                    src={story.image}
                                    alt={localized.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-red-950/20 to-neutral-900" />
                                )}
                              </Link>
                              <div className="flex-1 flex flex-col justify-between py-1">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-3 text-[10px] text-neutral-450 font-sans uppercase font-bold tracking-wider">
                                    <span className="flex items-center gap-1 text-red-500">
                                      <MapPin className="size-3" />
                                      {localized.region}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 text-neutral-400">
                                      <Clock className="size-3 text-red-500" />
                                      {localized.readTime || "4 min"}
                                    </span>
                                  </div>
                                  <Link to="/stories/$slug" params={{ slug: story.slug }}>
                                    <h3 className="font-display font-bold text-lg sm:text-xl leading-snug text-neutral-100 group-hover:text-red-500 transition-colors">
                                      {highlightText(localized.title, debouncedSearch)}
                                    </h3>
                                  </Link>
                                  <p className="text-xs sm:text-sm text-neutral-300 font-sans line-clamp-3 leading-relaxed">
                                    {highlightText(localized.excerpt, debouncedSearch)}
                                  </p>
                                </div>
                                <div className="flex items-center justify-between border-t border-neutral-800 pt-3 mt-4 text-xs font-sans text-neutral-400">
                                  <span>By {story.authorName || "Contributor"}</span>
                                  <Link
                                    to="/stories/$slug"
                                    params={{ slug: story.slug }}
                                    className="inline-flex items-center gap-1 text-red-500 hover:text-red-400 transition-colors uppercase font-bold tracking-wider text-[10px]"
                                  >
                                    Read Story
                                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                                  </Link>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}

                    {hasMore && (
                      <div className="text-center pt-6">
                        <Button
                          onClick={() => setPage((prev) => prev + 1)}
                          disabled={storiesLoading}
                          className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-sans uppercase tracking-widest text-xs h-12 px-8 shadow-elegant"
                        >
                          {storiesLoading ? "Loading..." : "Load More Stories"}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </section>

            </main>
          </div>
        </div>

        {/* ─── Mobile Bottom Sheet Filters ─── */}
        <AnimatePresence>
          {showMobileFilters && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileFilters(false)}
                className="fixed inset-0 bg-black z-40"
              />
              {/* Bottom Sheet Drawer */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="fixed bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-stone-950 border-t border-white/10 rounded-t-3xl z-50 p-6 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                    <SlidersHorizontal className="size-5 text-gold" />
                    Discovery Filters
                  </h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-1 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* State select */}
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                      State
                    </Label>
                    <select
                      value={selectedState || ""}
                      onChange={(e) => handleStateSelect(e.target.value || "")}
                      className="w-full h-11 bg-stone-900 border border-white/10 text-white rounded-xl px-3 text-sm font-sans outline-none focus:border-gold/30"
                    >
                      <option value="">All States</option>
                      {exploreData?.states?.map((s: any) => (
                        <option key={s.id} value={s.name}>
                          {s.name} ({s.count})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District Search */}
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                      District / City
                    </Label>
                    <Input
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Jaipur, Varanasi"
                      className="h-11 bg-stone-900 border-white/10 text-white rounded-xl text-sm font-sans"
                    />
                  </div>

                  {/* Author Search */}
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                      Author
                    </Label>
                    <Input
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Search author..."
                      className="h-11 bg-stone-900 border-white/10 text-white rounded-xl text-sm font-sans"
                    />
                  </div>

                  {/* Language select */}
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                      Language
                    </Label>
                    <select
                      value={languageFilter}
                      onChange={(e) => setLanguageFilter(e.target.value)}
                      className="w-full h-11 bg-stone-900 border border-white/10 text-white rounded-xl px-3 text-sm font-sans outline-none focus:border-gold/30"
                    >
                      <option value="all">Any Language</option>
                      <option value="en">English Only</option>
                      <option value="hi">Hindi (हिन्दी)</option>
                    </select>
                  </div>

                  {/* Read Time */}
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                      Reading Time
                    </Label>
                    <select
                      value={readTimeFilter}
                      onChange={(e) => setReadTimeFilter(e.target.value)}
                      className="w-full h-11 bg-stone-900 border border-white/10 text-white rounded-xl px-3 text-sm font-sans outline-none focus:border-gold/30"
                    >
                      <option value="all">Any Read Time</option>
                      <option value="short">Short (≤ 3 min)</option>
                      <option value="medium">Medium (4-6 min)</option>
                      <option value="long">Long (&gt; 6 min)</option>
                    </select>
                  </div>

                  {/* Sort order */}
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                      Sort Order
                    </Label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full h-11 bg-stone-900 border border-white/10 text-gold rounded-xl px-3 text-sm font-sans font-bold outline-none focus:border-gold/30"
                    >
                      <option value="latest">Latest Stories</option>
                      <option value="trending">Trending & Popular</option>
                      <option value="alphabetical">Alphabetical</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <Button
                    onClick={handleClearAllFilters}
                    variant="outline"
                    className="flex-1 rounded-xl h-12 text-sm font-sans"
                  >
                    Reset All
                  </Button>
                  <Button
                    onClick={() => setShowMobileFilters(false)}
                    className="flex-1 rounded-xl h-12 text-sm font-sans bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                  >
                    Apply Filters
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </SiteLayout>
  );
}
