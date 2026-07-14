import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, ArrowUpDown, MapPin, User, Compass } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { StoryCard } from "@/components/site/StoryCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { YouMayAlsoLike } from "@/components/site/YouMayAlsoLike";
import { StoryDNA } from "@/components/site/StoryDNA";
import type { Story } from "@/components/site/StoryCard";
import { useStoriesData } from "@/lib/stories-data";
import { useI18nStore, getCommonText, translateStory } from "@/lib/i18n";

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
  head: () => ({
    meta: [
      { title: "Stories — India Story Project" },
      {
        name: "description",
        content: "Browse stories of innovators, changemakers, and unsung heroes across India.",
      },
      { property: "og:title", content: "Stories — India Story Project" },
      {
        property: "og:description",
        content: "Browse stories of innovators, changemakers, and unsung heroes across India.",
      },
    ],
  }),
  component: StoriesList,
});

function StoriesList() {
  const {
    category: queryCategory,
    state: queryState,
    search: querySearch,
    author: queryAuthor,
    tag: queryTag,
    sortBy: querySortBy,
  } = Route.useSearch();
  const { stories: dbStories } = useStoriesData();
  const navigate = useNavigate({ from: Route.fullPath });

  const [query, setQuery] = useState(querySearch || "");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeState, setActiveState] = useState("All");
  const [activeAuthor, setActiveAuthor] = useState("All");
  const [activeTag, setActiveTag] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [visibleCount, setVisibleCount] = useState(9); // Pagination: load 9 initially

  const lang = useI18nStore((s) => s.lang);
  const commonText = getCommonText(lang);

  const { categories: liveCategories } = useStoriesData();
  const categories = liveCategories as readonly string[];
  const states = useMemo(() => {
    return Array.from(new Set(dbStories.map((s) => s.region).filter(Boolean))).sort();
  }, [dbStories]);

  const authorsList = useMemo(() => {
    const list = new Set<string>();
    dbStories.forEach((s) => {
      if (s.authorName) list.add(s.authorName);
    });
    return Array.from(list).sort();
  }, [dbStories]);

  const tagsList = useMemo(() => {
    const list = new Set<string>();
    dbStories.forEach((s) => {
      if (s.tags && Array.isArray(s.tags)) {
        s.tags.forEach((t) => list.add(t));
      }
    });
    return Array.from(list).sort();
  }, [dbStories]);

  // Sync route parameters with local state on parameter change
  useEffect(() => {
    setActiveCategory(queryCategory || "All");
    setActiveState(queryState || "All");
    setActiveAuthor(queryAuthor || "All");
    setActiveTag(queryTag || "All");
    setQuery(querySearch || "");
    setSortBy(querySortBy || "newest");
  }, [queryCategory, queryState, querySearch, queryAuthor, queryTag, querySortBy]);

  const localizedCategories = useMemo(() => {
    const list = [{ value: "All", label: lang === "en" ? "All Themes" : "सभी विषय" }];
    categories.forEach((c) => {
      if (c && c !== "All") {
        list.push({ value: c, label: c });
      }
    });
    return list;
  }, [categories, lang]);

  const filteredAndSorted = useMemo(() => {
    const q = query.toLowerCase().trim();

    // Filter on raw database values first to avoid translation tag mismatches
    let filtered = dbStories;

    // Theme Filter (previously Category)
    if (activeCategory !== "All") {
      filtered = filtered.filter((s) => {
        const storyThemes = Array.isArray(s.themes) ? s.themes : [];
        return storyThemes.some((t) => t.toLowerCase() === activeCategory.toLowerCase());
      });
    }

    // State Filter
    if (activeState !== "All") {
      filtered = filtered.filter((s) => {
        const reg = s.region || "";
        return reg.toLowerCase() === activeState.toLowerCase();
      });
    }

    // Author Filter
    if (activeAuthor !== "All") {
      filtered = filtered.filter((s) => s.authorName === activeAuthor);
    }

    // Tag Filter
    if (activeTag !== "All") {
      filtered = filtered.filter((s) => s.tags && s.tags.includes(activeTag));
    }

    // Map to translated versions
    let result = filtered.map((s) => translateStory(s, lang));

    // Search Query Filter
    if (q) {
      result = result.filter((s) => {
        const themeStr = Array.isArray((s as any).themes) ? (s as any).themes.join(" ") : "";
        return (
          s.title.toLowerCase().includes(q) ||
          s.excerpt.toLowerCase().includes(q) ||
          themeStr.toLowerCase().includes(q) ||
          s.region.toLowerCase().includes(q) ||
          (s.content?.toLowerCase().includes(q) ?? false)
        );
      });
    }

    // Sort Options
    if (sortBy === "alpha") {
      result.sort((a, b) => a.title.localeCompare(b.title));
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
    setVisibleCount(9); // Reset pagination
    void navigate({
      search: (prev) => ({
        ...prev,
        category: val === "All" ? undefined : val,
      }),
    });
  };

  const handleStateChange = (val: string) => {
    setActiveState(val);
    setVisibleCount(9); // Reset pagination
    void navigate({
      search: (prev) => ({
        ...prev,
        state: val === "All" ? undefined : val,
      }),
    });
  };

  const handleAuthorChange = (val: string) => {
    setActiveAuthor(val);
    setVisibleCount(9);
    void navigate({
      search: (prev) => ({
        ...prev,
        author: val === "All" ? undefined : val,
      }),
    });
  };

  const handleTagChange = (val: string) => {
    setActiveTag(val);
    setVisibleCount(9);
    void navigate({
      search: (prev) => ({
        ...prev,
        tag: val === "All" ? undefined : val,
      }),
    });
  };

  const handleSortChange = (val: string) => {
    setSortBy(val);
    setVisibleCount(9);
    void navigate({
      search: (prev) => ({
        ...prev,
        sortBy: val === "newest" ? undefined : val,
      }),
    });
  };

  const handleSearchChange = (val: string) => {
    setQuery(val);
    setVisibleCount(9); // Reset pagination
    void navigate({
      search: (prev) => ({
        ...prev,
        search: val.trim() === "" ? undefined : val,
      }),
    });
  };

  return (
    <SiteLayout>
      <section className="container mx-auto px-6 py-28 md:py-36">
        {/* Header Block */}
        <div className="max-w-3xl border-b border-border/70 pb-8 mb-12">
          <p className="text-xs uppercase tracking-[0.25em] text-gold font-sans font-bold mb-3">
            {lang === "en" ? "The Archive" : "अभिलेखागार"}
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight tracking-tight">
            {lang === "en" ? "Every story, " : "हर कहानी, "}
            <span className="text-primary italic">
              {lang === "en" ? "every corner " : "हर कोना "}
            </span>
            {lang === "en" ? "of India." : "भारत का।"}
          </h1>
          <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed font-sans font-medium">
            {lang === "en"
              ? "A living archive of deep-dives, profiles, and editorial dispatches from the changemakers reshaping the subcontinental landscape."
              : "उपमहाद्वीप के परिदृश्य को नया आकार देने वाले बदलावों की कहानियों, प्रोफाइलों और प्रेषणों का एक जीवित संग्रह।"}
          </p>
        </div>

        {/* Toolbar: Search, Filters, Sort, Language */}
        <div className="flex flex-col lg:flex-row flex-wrap items-stretch gap-4 mb-12 bg-card/45 border border-border/50 p-6">
          {/* Search Box */}
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={commonText.searchPlaceholder}
              className="pl-11 h-12 bg-background border-border rounded-none focus-visible:ring-primary/45 font-sans"
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
                  {st}
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
              className="w-full h-12 pl-11 pr-8 bg-background border border-border rounded-none focus:outline-none focus:border-primary text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans cursor-pointer appearance-none"
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
              className="w-full h-12 pl-11 pr-8 bg-background border border-border rounded-none focus:outline-none focus:border-primary text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans cursor-pointer appearance-none"
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
              className="w-full h-12 pl-11 pr-8 bg-background border border-border rounded-none focus:outline-none focus:border-primary text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans cursor-pointer appearance-none"
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

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-12 pb-4 border-b border-border/40">
          {localizedCategories.map((c) => {
            const isActive = c.value === activeCategory;
            return (
              <button
                key={c.value}
                onClick={() => handleCategoryChange(c.value)}
                className={`px-4 py-2 border text-xs uppercase tracking-wider font-semibold font-sans transition-all rounded-none ${
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

        {/* Premium Masonry Grid Layout using CSS Columns */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 [column-fill:balance] w-full">
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
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="bg-background hover:bg-card text-foreground hover:text-primary border border-border hover:border-gold/50 font-sans uppercase tracking-[0.2em] text-xs h-12 px-8 rounded-none shadow-sm transition-all duration-300"
            >
              {lang === "en" ? "Load More Stories" : "अधिक कहानियाँ लोड करें"}
            </Button>
          </div>
        )}
      </section>

      <StoryDNA />
      <YouMayAlsoLike />
    </SiteLayout>
  );
}
