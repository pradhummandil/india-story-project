import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { openGlobalSearch } from "@/components/common/GlobalSearch";
import { Search, ArrowUpDown, MapPin, User, Compass, SlidersHorizontal, X, Filter, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SiteLayout } from "@/components/site/Layout";
import { StoryCard } from "@/components/site/StoryCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { YouMayAlsoLike } from "@/components/site/YouMayAlsoLike";
import { StoryDNA } from "@/components/site/StoryDNA";
import type { Story } from "@/components/site/StoryCard";
import { useStoriesData } from "@/lib/stories-data";
import { useI18nStore, getCommonText, translateStory, translateThemeName, translateStateName } from "@/lib/i18n";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

type StoriesSearch = {
  category?: string;
  state?: string;
  search?: string;
  author?: string;
  tag?: string;
  sortBy?: string;
};

export const Route = createFileRoute("/stories/")({
  validateSearch: (search: Record<string, unknown>): StoriesSearch => {
    return {
      category: (search.category as string) || undefined,
      state: (search.state as string) || undefined,
      search: (search.search as string) || undefined,
      author: (search.author as string) || undefined,
      tag: (search.tag as string) || undefined,
      sortBy: (search.sortBy as string) || undefined,
    };
  },
  component: StoriesPage,
});

function StoriesPage() {
  const { category, state, search, author, tag, sortBy: initialSort } = Route.useSearch();
  const navigate = useNavigate({ from: Route.id });
  const lang = useI18nStore((s) => s.lang);
  const commonText = getCommonText(lang);

  const { stories: dbStories, themes } = useStoriesData();

  const [activeCategory, setActiveCategory] = useState<string>(category || "All");
  const [activeState, setActiveState] = useState<string>(state || "All");
  const [activeAuthor, setActiveAuthor] = useState<string>(author || "All");
  const [activeTag, setActiveTag] = useState<string>(tag || "All");
  const [sortBy, setSortBy] = useState<string>(initialSort || "newest");
  const [query, setQuery] = useState<string>(search || "");

  const [visibleCount, setVisibleCount] = useState<number>(12);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Manage scroll lock when mobile filter drawer opens/closes
  useEffect(() => {
    if (mobileFilterOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }
    return () => {
      if (mobileFilterOpen) unlockScroll();
    };
  }, [mobileFilterOpen]);

  // Sync state with URL search params when they change externally
  useEffect(() => {
    if (category !== undefined) setActiveCategory(category);
    if (state !== undefined) setActiveState(state);
    if (search !== undefined) setQuery(search);
    if (author !== undefined) setActiveAuthor(author);
    if (tag !== undefined) setActiveTag(tag);
    if (initialSort !== undefined) setSortBy(initialSort);
  }, [category, state, search, author, tag, initialSort]);

  // Derived unique lists for dropdowns
  const states = useMemo(() => {
    const set = new Set<string>();
    dbStories.forEach((s) => {
      if (s.region && s.region.toLowerCase() !== "india") set.add(s.region);
    });
    return Array.from(set).sort();
  }, [dbStories]);

  const authorsList = useMemo(() => {
    const set = new Set<string>();
    dbStories.forEach((s) => {
      if (
        s.authorName &&
        s.authorName.trim() !== "" &&
        s.authorName.toLowerCase() !== "india story project" &&
        s.authorName.toLowerCase() !== "unknown"
      ) {
        set.add(s.authorName);
      }
    });
    return Array.from(set).sort();
  }, [dbStories]);

  const tagsList = useMemo(() => {
    const set = new Set<string>();
    dbStories.forEach((s) => {
      if (Array.isArray(s.tags)) {
        s.tags.forEach((t) => set.add(t));
      }
    });
    return Array.from(set).sort();
  }, [dbStories]);

  const localizedCategories = useMemo(() => {
    const list = ["All", ...themes];
    return list.map((cat) => ({
      value: cat,
      label: cat === "All" ? (lang === "en" ? "All Stories" : "सभी कहानियाँ") : translateThemeName(cat, lang),
    }));
  }, [themes, lang]);

  // Filter & Sort Pipeline
  const filteredAndSorted = useMemo(() => {
    let filtered = [...dbStories];

    // Filter by Category
    if (activeCategory !== "All") {
      filtered = filtered.filter((s) => {
        const themeList = Array.isArray(s.themes)
          ? s.themes
          : typeof s.themes === "string"
            ? [s.themes]
            : [];
        return themeList.some((t) => t.toLowerCase() === activeCategory.toLowerCase());
      });
    }

    // Filter by State
    if (activeState !== "All") {
      filtered = filtered.filter(
        (s) => s.region && s.region.toLowerCase() === activeState.toLowerCase(),
      );
    }

    // Filter by Author
    if (activeAuthor !== "All") {
      filtered = filtered.filter(
        (s) => s.authorName && s.authorName.toLowerCase() === activeAuthor.toLowerCase(),
      );
    }

    // Filter by Tag
    if (activeTag !== "All") {
      filtered = filtered.filter(
        (s) => Array.isArray(s.tags) && s.tags.some((t) => t.toLowerCase() === activeTag.toLowerCase()),
      );
    }

    // Search Query Filter
    if (query.trim() !== "") {
      const q = query.toLowerCase();
      filtered = filtered.filter((s) => {
        const themeStr = Array.isArray(s.themes) ? s.themes.join(" ") : s.themes || "";
        const tagsStr = Array.isArray(s.tags) ? s.tags.join(" ") : "";
        const districtStr = (s as any).district || "";
        const keywordsStr = (s as any).seoKeywords || "";

        return (
          (s.title?.toLowerCase().includes(q) ?? false) ||
          (s.titleHi?.toLowerCase().includes(q) ?? false) ||
          (s.excerpt?.toLowerCase().includes(q) ?? false) ||
          (s.excerptHi?.toLowerCase().includes(q) ?? false) ||
          (s.content?.toLowerCase().includes(q) ?? false) ||
          (s.contentHi?.toLowerCase().includes(q) ?? false) ||
          themeStr.toLowerCase().includes(q) ||
          (s.region?.toLowerCase().includes(q) ?? false) ||
          (s.authorName?.toLowerCase().includes(q) ?? false) ||
          tagsStr.toLowerCase().includes(q) ||
          districtStr.toLowerCase().includes(q) ||
          keywordsStr.toLowerCase().includes(q)
        );
      });
    }

    // Map to translated versions
    let result = filtered.map((s) => translateStory(s, lang));

    // Sort Options
    if (sortBy === "alpha") {
      result.sort((a, b) => (a?.title || "").localeCompare(b?.title || ""));
    } else if (sortBy === "readTime") {
      result.sort((a, b) => {
        const t1 = parseInt(a.readTime) || 0;
        const t2 = parseInt(b.readTime) || 0;
        return t2 - t1; // Longest read first
      });
    } else if (sortBy === "oldest") {
      result.sort((a, b) => {
        const d1 = a.publishedAt
          ? new Date(a.publishedAt).getTime()
          : a.createdAt
            ? new Date(a.createdAt).getTime()
            : 0;
        const d2 = b.publishedAt
          ? new Date(b.publishedAt).getTime()
          : b.createdAt
            ? new Date(b.createdAt).getTime()
            : 0;
        return d1 - d2;
      });
    } else if (sortBy === "views") {
      result.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    } else {
      // Default: newest
      result.sort((a, b) => {
        const d1 = a.publishedAt
          ? new Date(a.publishedAt).getTime()
          : a.createdAt
            ? new Date(a.createdAt).getTime()
            : 0;
        const d2 = b.publishedAt
          ? new Date(b.publishedAt).getTime()
          : b.createdAt
            ? new Date(b.createdAt).getTime()
            : 0;
        return d2 - d1;
      });
    }

    return result;
  }, [query, activeCategory, activeState, activeAuthor, activeTag, sortBy, dbStories, lang]);

  // Paginated list
  const paginatedStories = useMemo(() => {
    return filteredAndSorted.slice(0, visibleCount);
  }, [filteredAndSorted, visibleCount]);

  const handleCategoryChange = (val: string) => {
    setActiveCategory(val);
    setVisibleCount(12);
    void navigate({
      search: (prev) => ({
        ...prev,
        category: val === "All" ? undefined : val,
      }),
    });
  };

  const handleStateChange = (val: string) => {
    setActiveState(val);
    setVisibleCount(12);
    void navigate({
      search: (prev) => ({
        ...prev,
        state: val === "All" ? undefined : val,
      }),
    });
  };

  const handleAuthorChange = (val: string) => {
    setActiveAuthor(val);
    setVisibleCount(12);
    void navigate({
      search: (prev) => ({
        ...prev,
        author: val === "All" ? undefined : val,
      }),
    });
  };

  const handleTagChange = (val: string) => {
    setActiveTag(val);
    setVisibleCount(12);
    void navigate({
      search: (prev) => ({
        ...prev,
        tag: val === "All" ? undefined : val,
      }),
    });
  };

  const handleSortChange = (val: string) => {
    setSortBy(val);
    setVisibleCount(12);
    void navigate({
      search: (prev) => ({
        ...prev,
        sortBy: val === "newest" ? undefined : val,
      }),
    });
  };

  const activeFilterCount =
    (activeState !== "All" ? 1 : 0) +
    (activeAuthor !== "All" ? 1 : 0) +
    (activeTag !== "All" ? 1 : 0) +
    (sortBy !== "newest" ? 1 : 0);

  return (
    <SiteLayout>
      <section className="container mx-auto px-6 pt-20 pb-12 md:py-36">
        {/* Header Block */}
        <div className="max-w-3xl border-b border-border/70 pb-6 mb-8 md:mb-12">
          <p className="text-xs uppercase tracking-[0.25em] text-gold font-sans font-bold mb-2 md:mb-3">
            {lang === "en" ? "The Archive" : "अभिलेखागार"}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold leading-tight tracking-tight">
            {lang === "en" ? "Every story, " : "हर कहानी, "}
            <span className="text-primary italic">
              {lang === "en" ? "every corner " : "हर कोना "}
            </span>
            {lang === "en" ? "of India." : "भारत का।"}
          </h1>
          <p className="mt-3 md:mt-4 text-xs md:text-base text-muted-foreground leading-relaxed font-sans font-medium">
            {lang === "en"
              ? "A living archive of deep-dives, profiles, and editorial dispatches from the changemakers reshaping the subcontinental landscape."
              : "उपमहाद्वीप के परिदृश्य को नया आकार देने वाले बदलावों की कहानियों, प्रोफाइलों और प्रेषणों का एक जीवित संग्रह।"}
          </p>
        </div>

        {/* ── Mobile Filter Trigger Bar (lg:hidden) ── */}
        <div className="flex lg:hidden items-center gap-2 mb-4">
          <div onClick={openGlobalSearch} className="flex-1 relative cursor-pointer">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              readOnly
              placeholder={commonText.searchPlaceholder}
              className="pl-10 h-11 bg-background border-border rounded-xl text-xs cursor-pointer"
            />
          </div>
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="h-11 px-4 rounded-xl border border-primary/40 bg-primary/10 text-primary text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 shrink-0 cursor-pointer min-h-[44px]"
          >
            <SlidersHorizontal className="size-4" />
            <span>{lang === "en" ? "Filter" : "फ़िल्टर"}</span>
            {activeFilterCount > 0 && (
              <span className="size-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* ── Mobile Category Chips (lg:hidden) ── */}
        <div className="flex lg:hidden overflow-x-auto gap-2 mb-8 pb-2 -mx-6 px-6">
          {localizedCategories.map((c) => {
            const isActive = c.value === activeCategory;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => handleCategoryChange(c.value)}
                className={`px-3.5 py-2 border text-xs font-semibold font-sans whitespace-nowrap rounded-full shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary border-primary text-primary-foreground shadow-sm"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* ── Desktop Toolbar: Search, Filters, Sort (hidden lg:flex) ── */}
        <div className="hidden lg:flex flex-row flex-wrap items-stretch gap-4 mb-12 bg-card/45 border border-border/50 p-6">
          {/* Search Box */}
          <div
            onClick={openGlobalSearch}
            className="flex-1 min-w-[240px] relative cursor-pointer"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              readOnly
              placeholder={commonText.searchPlaceholder}
              className="pl-11 h-12 bg-background border-border rounded-none focus-visible:ring-0 font-sans cursor-pointer"
            />
          </div>

          {/* State Filter Dropdown */}
          <div className="min-w-[180px] relative flex items-center">
            <MapPin className="absolute left-4 size-4 text-gold/80" />
            <select
              value={activeState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full h-12 pl-11 pr-8 bg-background border border-border rounded-none focus:outline-none focus:border-primary text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans cursor-pointer appearance-none"
            >
              <option value="All">{lang === "en" ? "All States" : "सभी राज्य"}</option>
              {states.map((st) => (
                <option key={st} value={st}>
                  {translateStateName(st, lang)}
                </option>
              ))}
            </select>
          </div>

          {/* Author Filter Dropdown */}
          <div className="min-w-[180px] relative flex items-center">
            <User className="absolute left-4 size-4 text-gold/80" />
            <select
              value={activeAuthor}
              onChange={(e) => handleAuthorChange(e.target.value)}
              className="w-full h-12 pl-11 pr-8 bg-background border border-border rounded-none focus:outline-none focus:border-primary text-xs font-semibold tracking-wider text-muted-foreground font-sans cursor-pointer appearance-none"
            >
              <option value="All">{lang === "en" ? "All Authors" : "सभी लेखक"}</option>
              {authorsList.map((auth) => (
                <option key={auth} value={auth}>
                  {auth}
                </option>
              ))}
            </select>
          </div>

          {/* Tag Filter Dropdown */}
          <div className="min-w-[180px] relative flex items-center">
            <Compass className="absolute left-4 size-4 text-gold/80" />
            <select
              value={activeTag}
              onChange={(e) => handleTagChange(e.target.value)}
              className="w-full h-12 pl-11 pr-8 bg-background border border-border rounded-none focus:outline-none focus:border-primary text-xs font-semibold tracking-wider text-muted-foreground font-sans cursor-pointer appearance-none"
            >
              <option value="All">{lang === "en" ? "All Tags" : "सभी टैग"}</option>
              {tagsList.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="min-w-[180px] relative flex items-center">
            <ArrowUpDown className="absolute left-4 size-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full h-12 pl-11 pr-8 bg-background border border-border rounded-none focus:outline-none focus:border-primary text-xs font-semibold tracking-wider text-muted-foreground font-sans cursor-pointer appearance-none"
            >
              <option value="newest">{lang === "en" ? "Sort: Newest" : "क्रम: नवीनतम"}</option>
              <option value="oldest">{lang === "en" ? "Sort: Oldest" : "क्रम: सबसे पुराना"}</option>
              <option value="views">
                {lang === "en" ? "Sort: Most Viewed" : "क्रम: सबसे लोकप्रिय"}
              </option>
              <option value="readTime">
                {lang === "en" ? "Sort: Reading Time" : "क्रम: पठन समय"}
              </option>
              <option value="alpha">
                {lang === "en" ? "Sort: Alphabetical" : "क्रम: वर्णमाला"}
              </option>
            </select>
          </div>

          {/* Active stats display */}
          <div className="flex items-center justify-end px-2 text-[11px] text-muted-foreground font-sans font-bold uppercase tracking-wider min-w-[100px]">
            {filteredAndSorted.length} {lang === "en" ? "Found" : "मिले"}
          </div>
        </div>

        {/* Desktop Category chips */}
        <div className="hidden lg:flex flex-wrap gap-2 mb-12 pb-4 border-b border-border/40">
          {localizedCategories.map((c) => {
            const isActive = c.value === activeCategory;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => handleCategoryChange(c.value)}
                className={`px-4 py-2 border text-xs font-semibold font-sans transition-all rounded-none cursor-pointer ${
                  lang === "en" ? "uppercase tracking-wider" : ""
                } ${
                  isActive
                    ? "bg-primary border-primary text-primary-foreground shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-gold/45"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* High Density 4-Column Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4.5 sm:gap-5 items-stretch w-full">
          {paginatedStories.map((s, i) => (
            <StoryCard key={s.id} story={s} index={i} />
          ))}
        </div>

        {filteredAndSorted.length === 0 && (
          <div className="text-center py-20 text-muted-foreground font-sans text-sm font-bold uppercase tracking-widest border border-dashed border-border p-8">
            {commonText.noStories}
          </div>
        )}

        {/* Pagination / Load More Button */}
        {filteredAndSorted.length > visibleCount && (
          <div className="text-center mt-16 pt-8 border-t border-border/40">
            <Button
              onClick={() => setVisibleCount((prev) => prev + 12)}
              className="bg-background hover:bg-card text-foreground hover:text-primary border border-border hover:border-gold/50 font-sans uppercase tracking-[0.2em] text-xs h-12 px-8 rounded-none shadow-sm transition-all duration-300 min-h-[44px]"
            >
              {lang === "en" ? "Load More Stories" : "अधिक कहानियाँ लोड करें"}
            </Button>
          </div>
        )}
      </section>

      {/* ── Mobile Filter Bottom Sheet Modal ── */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-[99999] flex items-end justify-center lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="relative z-10 w-full max-h-[85vh] bg-[#141414] border-t border-neutral-800 rounded-t-3xl p-6 overflow-y-auto space-y-5 text-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <h3 className="font-display text-lg font-bold flex items-center gap-2">
                  <SlidersHorizontal className="size-4 text-gold" />
                  {lang === "en" ? "Filter & Sort Stories" : "फ़िल्टर एवं क्रमबद्ध करें"}
                </h3>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-2 text-neutral-400 hover:text-white rounded-full bg-white/5 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Filter Options inside Drawer */}
              <div className="space-y-4 pt-2 font-sans">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-gold block">
                    {lang === "en" ? "State / Region" : "राज्य / क्षेत्र"}
                  </label>
                  <select
                    value={activeState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full h-12 px-4 bg-neutral-900 border border-neutral-800 text-white rounded-xl text-xs font-semibold outline-none"
                  >
                    <option value="All">{lang === "en" ? "All States" : "सभी राज्य"}</option>
                    {states.map((st) => (
                      <option key={st} value={st}>{translateStateName(st, lang)}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-gold block">
                    {lang === "en" ? "Author" : "लेखक"}
                  </label>
                  <select
                    value={activeAuthor}
                    onChange={(e) => handleAuthorChange(e.target.value)}
                    className="w-full h-12 px-4 bg-neutral-900 border border-neutral-800 text-white rounded-xl text-xs font-semibold outline-none"
                  >
                    <option value="All">{lang === "en" ? "All Authors" : "सभी लेखक"}</option>
                    {authorsList.map((auth) => (
                      <option key={auth} value={auth}>{auth}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-gold block">
                    {lang === "en" ? "Tag / Topic" : "टैग"}
                  </label>
                  <select
                    value={activeTag}
                    onChange={(e) => handleTagChange(e.target.value)}
                    className="w-full h-12 px-4 bg-neutral-900 border border-neutral-800 text-white rounded-xl text-xs font-semibold outline-none"
                  >
                    <option value="All">{lang === "en" ? "All Tags" : "सभी टैग"}</option>
                    {tagsList.map((tag) => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-gold block">
                    {lang === "en" ? "Sort Order" : "क्रम प्रकार"}
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full h-12 px-4 bg-neutral-900 border border-neutral-800 text-white rounded-xl text-xs font-semibold outline-none"
                  >
                    <option value="newest">{lang === "en" ? "Sort: Newest" : "क्रम: नवीनतम"}</option>
                    <option value="oldest">{lang === "en" ? "Sort: Oldest" : "क्रम: सबसे पुराना"}</option>
                    <option value="views">{lang === "en" ? "Sort: Most Viewed" : "क्रम: सबसे लोकप्रिय"}</option>
                    <option value="readTime">{lang === "en" ? "Sort: Reading Time" : "क्रम: पठन समय"}</option>
                    <option value="alpha">{lang === "en" ? "Sort: Alphabetical" : "क्रम: वर्णमाला"}</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex gap-3">
                <Button
                  type="button"
                  onClick={() => {
                    handleStateChange("All");
                    handleAuthorChange("All");
                    handleTagChange("All");
                    handleSortChange("newest");
                  }}
                  variant="outline"
                  className="w-1/3 h-12 border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white text-xs font-bold uppercase rounded-xl"
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-2/3 h-12 bg-primary text-primary-foreground font-bold text-xs uppercase rounded-xl"
                >
                  {lang === "en" ? `Apply (${filteredAndSorted.length})` : `लागू करें (${filteredAndSorted.length})`}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <StoryDNA />
      <YouMayAlsoLike />
    </SiteLayout>
  );
}
