import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
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
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { StoryCard } from "@/components/site/StoryCard";
import { useStoriesData } from "@/lib/stories-data";
import { useI18nStore, translateStory } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { z } from "zod";

const exploreSearchSchema = z.object({
  q: z.string().optional(),
});

export const Route = createFileRoute("/explore")({
  validateSearch: (search) => exploreSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Explore stories by region & theme — India Story Project" },
      {
        name: "description",
        content: "Discover inspiring stories of positive change, innovation, and culture from every state of India.",
      },
    ],
  }),
  component: RouteComponent,
});

// Theme emojis configuration
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
  कहानी: "📖",
};

const THEME_GRADIENTS: Record<string, string> = {
  heritage: "from-amber-950/60 to-stone-900/80",
  innovation: "from-blue-950/60 to-stone-900/80",
  sustainability: "from-emerald-950/60 to-stone-900/80",
  science: "from-indigo-950/60 to-stone-900/80",
  culture: "from-red-950/60 to-stone-900/80",
  environment: "from-teal-950/60 to-stone-900/80",
  history: "from-amber-900/50 to-stone-900/80",
  freedom: "from-orange-950/60 to-stone-900/80",
  food: "from-rose-950/60 to-stone-900/80",
  festival: "from-purple-950/60 to-stone-900/80",
};

function RouteComponent() {
  const { stories, loading } = useStoriesData();
  const lang = useI18nStore((s) => s.lang);
  const navigate = useNavigate({ from: Route.fullPath });

  // Search/Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Extended Filters states
  const [showFilters, setShowFilters] = useState(false);
  const [langFilter, setLangFilter] = useState("all");
  const [readTimeFilter, setReadTimeFilter] = useState("all");
  const [districtQuery, setDistrictQuery] = useState("");
  const [authorQuery, setAuthorQuery] = useState("");

  const search = Route.useSearch();
  const q = search.q;

  // Sync with search parameter if any
  useEffect(() => {
    if (q) setSearchQuery(q);
  }, [q]);

  // Compute states dynamically
  const stateStats = useMemo(() => {
    const counts: Record<string, number> = {};
    stories.forEach((s) => {
      if (s.region && s.region.toLowerCase() !== "india" && s.region.toLowerCase() !== "all") {
        counts[s.region] = (counts[s.region] ?? 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [stories]);

  // Compute themes dynamically from actual stories payload
  const themeStats = useMemo(() => {
    const counts: Record<string, number> = {};
    stories.forEach((s) => {
      const storyThemes = Array.isArray(s.themes)
        ? s.themes
        : typeof s.category === "string" && s.category
          ? [s.category]
          : [];

      storyThemes.forEach((t) => {
        if (t && t.toLowerCase() !== "all") {
          counts[t] = (counts[t] ?? 0) + 1;
        }
      });
    });

    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      emoji: THEME_EMOJIS[name.toLowerCase()] ?? "✨",
      gradient: THEME_GRADIENTS[name.toLowerCase()] ?? "from-stone-950 to-stone-900/80",
    }));
  }, [stories]);

  const toggleTheme = (themeName: string) => {
    if (selectedThemes.includes(themeName)) {
      setSelectedThemes(selectedThemes.filter((t) => t !== themeName));
    } else {
      setSelectedThemes([...selectedThemes, themeName]);
    }
  };

  // Filter stories based on query, state, themes list, language, read time, district, author
  const filteredStories = useMemo(() => {
    return stories.filter((s: any) => {
      const title = s.title.toLowerCase();
      const excerpt = s.excerpt.toLowerCase();
      const content = (s.content ?? "").toLowerCase();
      const query = searchQuery.toLowerCase();

      const storyThemes: string[] = Array.isArray(s.themes)
        ? s.themes
        : typeof s.category === "string" && s.category
          ? [s.category]
          : [];

      const matchesSearch =
        !searchQuery ||
        title.includes(query) ||
        excerpt.includes(query) ||
        content.includes(query) ||
        s.region.toLowerCase().includes(query) ||
        storyThemes.some((t) => t.toLowerCase().includes(query));

      const matchesState = !selectedState || s.region === selectedState;

      // Intersection combination filtering (Must contain all selected themes)
      const matchesThemes =
        selectedThemes.length === 0 ||
        selectedThemes.every((selTheme) =>
          storyThemes.some((t) => t.toLowerCase() === selTheme.toLowerCase())
        );

      const matchesLanguage =
        langFilter === "all" ||
        (s.language || "en").toLowerCase() === langFilter.toLowerCase();

      let matchesReadTime = true;
      const rt = s.readTime || 4;
      if (readTimeFilter === "short") matchesReadTime = rt <= 3;
      else if (readTimeFilter === "medium") matchesReadTime = rt > 3 && rt <= 6;
      else if (readTimeFilter === "long") matchesReadTime = rt > 6;

      const matchesDistrict =
        !districtQuery ||
        (s.district || "").toLowerCase().includes(districtQuery.toLowerCase());

      const matchesAuthor =
        !authorQuery ||
        (s.authorName || "").toLowerCase().includes(authorQuery.toLowerCase());

      return (
        matchesSearch &&
        matchesState &&
        matchesThemes &&
        matchesLanguage &&
        matchesReadTime &&
        matchesDistrict &&
        matchesAuthor
      );
    });
  }, [
    stories,
    searchQuery,
    selectedState,
    selectedThemes,
    langFilter,
    readTimeFilter,
    districtQuery,
    authorQuery,
  ]);

  // Trending stories (sorted by viewCount DESC)
  const trendingStories = useMemo(() => {
    return [...stories]
      .filter((s) => s.viewCount && s.viewCount > 0)
      .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
      .slice(0, 6);
  }, [stories]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void navigate({ search: { q: searchQuery || undefined } });
  };

  return (
    <SiteLayout>
      <div className="bg-background text-foreground min-h-screen">
        {/* ─── Hero Section ─── */}
        <section className="relative overflow-hidden pt-24 pb-12 border-b border-border/40 bg-hero">
          <div className="absolute inset-0 bg-hero opacity-30 pointer-events-none" />
          <div className="absolute -top-40 left-1/4 size-[420px] rounded-full bg-gold/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-56 right-1/4 size-[520px] rounded-full bg-saffron/5 blur-3xl pointer-events-none" />

          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-[10px] uppercase tracking-widest text-gold font-sans font-bold"
              >
                <Compass className="size-3" />
                Discovery Portal
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]"
              >
                Find your next story
                <span className="block italic text-gradient-gold mt-2">by region & theme</span>
              </motion.h1>

              {/* Search Bar */}
              <motion.form
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                onSubmit={handleSearchSubmit}
                className="relative max-w-xl mx-auto"
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search stories, states, themes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-card/65 border-border/80 focus-visible:ring-gold/40 rounded-xl font-sans text-sm shadow-elegant"
                />
              </motion.form>

              <div className="flex justify-center gap-2 mt-4 z-20 relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="rounded-full border-white/20 hover:border-gold/30 bg-black/40 hover:bg-black/60 text-xs font-sans text-white h-9 px-4 gap-2"
                >
                  <Filter className="size-3.5 text-gold" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="max-w-xl mx-auto mt-6 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-5 text-left space-y-4 shadow-xl z-20 relative"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold tracking-wider text-white/50">Language</Label>
                        <select
                          value={langFilter}
                          onChange={(e) => setLangFilter(e.target.value)}
                          className="w-full h-10 bg-background border border-white/10 text-white rounded px-2.5 text-xs font-sans outline-none focus:border-gold/30"
                        >
                          <option value="all">All Languages</option>
                          <option value="en">English</option>
                          <option value="hi">Hindi (हिन्दी)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold tracking-wider text-white/50">Read Time</Label>
                        <select
                          value={readTimeFilter}
                          onChange={(e) => setReadTimeFilter(e.target.value)}
                          className="w-full h-10 bg-background border border-white/10 text-white rounded px-2.5 text-xs font-sans outline-none focus:border-gold/30"
                        >
                          <option value="all">Any Read Time</option>
                          <option value="short">Short (≤ 3 min)</option>
                          <option value="medium">Medium (4-6 min)</option>
                          <option value="long">Long (&gt; 6 min)</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold tracking-wider text-white/50">District</Label>
                        <Input
                          value={districtQuery}
                          onChange={(e) => setDistrictQuery(e.target.value)}
                          placeholder="e.g. Jodhpur"
                          className="h-10 bg-background border-white/10 text-white rounded text-xs font-sans"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold tracking-wider text-white/50">Author</Label>
                        <Input
                          value={authorQuery}
                          onChange={(e) => setAuthorQuery(e.target.value)}
                          placeholder="e.g. Pradhum"
                          className="h-10 bg-background border-white/10 text-white rounded text-xs font-sans"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* ─── Trending Today (Netflix-style scroll) ─── */}
        {trendingStories.length > 0 && !searchQuery && !selectedState && selectedThemes.length === 0 && (
          <section className="container mx-auto px-6 py-12">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="size-4.5 text-gold animate-pulse" />
              <h2 className="font-display text-xl md:text-2xl font-bold">Trending Stories</h2>
            </div>
            {/* Scrollable list wrapper */}
            <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin snap-x snap-mandatory">
              {trendingStories.map((story) => {
                const localized = translateStory(story as any, lang);
                return (
                  <Link
                    key={story.id}
                    to="/stories/$slug"
                    params={{ slug: story.slug }}
                    className="flex-shrink-0 w-72 sm:w-80 group snap-start bg-card/40 border border-border/30 rounded-2xl overflow-hidden hover:border-gold/30 hover:shadow-glow transition-all duration-300"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-muted relative">
                      {story.image ? (
                        <img
                          src={story.image}
                          alt={localized.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-gold/10" />
                      )}
                      <span className="absolute top-3 left-3 bg-black/60 backdrop-blur text-[9px] uppercase tracking-widest text-gold px-2 py-0.5 rounded font-sans font-bold border border-gold/20">
                        {localized.themes?.[0] ?? "Story"}
                      </span>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-[9px] text-muted-foreground font-sans uppercase font-bold tracking-wider">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3 text-gold" />
                          {localized.region}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3 text-gold" />
                          {localized.readTime || "4 min"}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-base leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {localized.title}
                      </h3>
                      <p className="text-xs text-muted-foreground font-sans line-clamp-2">
                        {localized.excerpt}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ─── Browse by State (Chips scroll) ─── */}
        {stateStats.length > 0 && (
          <section className="container mx-auto px-6 py-8 border-t border-border/40">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe2 className="size-4 text-gold" />
                <span className="text-xs uppercase tracking-[0.18em] font-sans font-bold text-gold">Browse by State</span>
              </div>
              {selectedState && (
                <button
                  onClick={() => setSelectedState(null)}
                  className="text-[10px] uppercase tracking-widest font-sans font-bold text-muted-foreground hover:text-foreground"
                >
                  Clear filter
                </button>
              )}
            </div>

            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {stateStats.map((st) => (
                <button
                  key={st.name}
                  onClick={() => setSelectedState(selectedState === st.name ? null : st.name)}
                  className={`flex-shrink-0 px-4 py-2 text-xs font-sans font-semibold rounded-full border transition-all duration-300 ${
                    selectedState === st.name
                      ? "bg-primary border-primary text-primary-foreground shadow-glow"
                      : "bg-card/40 border-border/60 text-muted-foreground hover:border-gold/30 hover:text-foreground"
                  }`}
                >
                  {st.name} <span className="opacity-60 text-[10px] ml-1">({st.count})</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ─── Browse by Themes (Grid) ─── */}
        {themeStats.length > 0 && (
          <section className="container mx-auto px-6 py-10 border-t border-border/40">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-gold" />
                <span className="text-xs uppercase tracking-[0.18em] font-sans font-bold text-gold">Themes & Topics (Multi-Select)</span>
              </div>
              {selectedThemes.length > 0 && (
                <button
                  onClick={() => setSelectedThemes([])}
                  className="text-[10px] uppercase tracking-widest font-sans font-bold text-muted-foreground hover:text-foreground"
                >
                  Reset Themes
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {themeStats.map((cat) => {
                const isSelected = selectedThemes.includes(cat.name);
                return (
                  <button
                    key={cat.name}
                    onClick={() => toggleTheme(cat.name)}
                    className={`relative rounded-2xl border p-5 flex flex-col items-center justify-center text-center gap-2 transition-all duration-300 hover:scale-[1.02] bg-gradient-to-b group ${
                      isSelected
                        ? "border-gold bg-primary/20 shadow-glow"
                        : "border-border/30 bg-card/40 hover:border-gold/30"
                    } ${cat.gradient}`}
                  >
                    <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                      {cat.emoji}
                    </span>
                    <span className="font-sans font-bold text-xs text-white leading-tight">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-white/60 font-sans">{cat.count} stories</span>
                    {isSelected && (
                      <span className="absolute top-2 right-2 bg-gold text-background rounded-full text-[9px] size-4 flex items-center justify-center font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ─── Main Stories Grid ─── */}
        <section className="container mx-auto px-6 py-12 border-t border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display text-2xl font-bold">
                {selectedThemes.length > 0
                  ? `Themes: ${selectedThemes.join(" + ")}`
                  : "Explore Stories"}
              </h2>
              <p className="text-xs text-muted-foreground font-sans mt-1">
                {filteredStories.length} {filteredStories.length === 1 ? "story" : "stories"} found
                {selectedState && ` in ${selectedState}`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Clear filters */}
              {(selectedThemes.length > 0 || selectedState || searchQuery || langFilter !== "all" || readTimeFilter !== "all" || districtQuery || authorQuery) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedThemes([]);
                    setSelectedState(null);
                    setSearchQuery("");
                    setLangFilter("all");
                    setReadTimeFilter("all");
                    setDistrictQuery("");
                    setAuthorQuery("");
                    void navigate({ search: {} });
                  }}
                  className="rounded-full border-border font-sans text-xs h-9"
                >
                  Clear all filters
                </Button>
              )}

              {/* View Switcher */}
              <div className="flex items-center gap-1 border border-border/60 rounded-full p-1 bg-card/45">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-full transition-colors ${
                    viewMode === "grid" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="size-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-full transition-colors ${
                    viewMode === "list" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
                  }`}
                  title="List View"
                >
                  <List className="size-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Active filter tags */}
          {selectedThemes.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedThemes.map((t) => (
                <span
                  key={t}
                  className="bg-primary/20 text-gold border border-primary/40 px-3 py-1 rounded-full text-xs font-sans font-bold flex items-center gap-1.5"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => toggleTheme(t)}
                    className="hover:text-red-400 font-bold text-[10px]"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[4/3] bg-muted/20 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : filteredStories.length === 0 ? (
            <div className="text-center py-20 bg-card/20 rounded-2xl border border-border/30">
              <BookOpen className="size-8 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground font-sans">
                No stories match your search filters. Try selecting another region or theme.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {viewMode === "grid" ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredStories.slice(0, visibleCount).map((story, i) => (
                    <StoryCard key={story.id} story={story} index={i} />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredStories.slice(0, visibleCount).map((story, i) => {
                    const localized = translateStory(story as any, lang);
                    return (
                      <motion.div
                        key={story.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.3) }}
                        className="flex flex-col sm:flex-row gap-5 bg-card/35 border border-border/40 hover:border-gold/30 rounded-2xl overflow-hidden p-4 group hover:shadow-glow transition-all duration-300"
                      >
                        <Link
                          to="/stories/$slug"
                          params={{ slug: story.slug }}
                          className="w-full sm:w-60 aspect-[16/10] sm:aspect-square md:aspect-[16/10] shrink-0 overflow-hidden bg-muted rounded-xl relative"
                        >
                          {story.image ? (
                            <img
                              src={story.image}
                              alt={localized.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-gold/10" />
                          )}
                          <span className="absolute top-3 left-3 bg-black/60 backdrop-blur text-[9px] uppercase tracking-widest text-gold px-2 py-0.5 rounded font-sans font-bold border border-gold/20">
                            {localized.themes?.[0] ?? "Story"}
                          </span>
                        </Link>
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-sans uppercase font-bold tracking-wider">
                              <span className="flex items-center gap-1">
                                <MapPin className="size-3 text-gold" />
                                {localized.region}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="size-3 text-gold" />
                                {localized.readTime || "4 min"}
                              </span>
                            </div>
                            <Link to="/stories/$slug" params={{ slug: story.slug }}>
                              <h3 className="font-display font-bold text-lg sm:text-xl leading-snug text-foreground group-hover:text-primary transition-colors">
                                {localized.title}
                              </h3>
                            </Link>
                            <p className="text-xs sm:text-sm text-muted-foreground font-sans line-clamp-3 leading-relaxed">
                              {localized.excerpt}
                            </p>
                          </div>
                          <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-4 text-xs font-sans text-muted-foreground">
                            <span>By {story.authorName || "Anonymous Contributor"}</span>
                            <Link
                              to="/stories/$slug"
                              params={{ slug: story.slug }}
                              className="inline-flex items-center gap-1 text-gold group-hover:text-white transition-colors uppercase font-bold tracking-wider text-[10px]"
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

              {filteredStories.length > visibleCount && (
                <div className="text-center pt-4">
                  <Button
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                    className="rounded-full bg-primary hover:bg-primary/95 text-primary-foreground font-sans uppercase tracking-[0.18em] text-xs h-12 px-8 shadow-elegant"
                  >
                    Load More Stories
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </SiteLayout>
  );
}
