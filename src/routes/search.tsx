import { useState, useEffect, useRef, useCallback } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";

import { z } from "zod";
import { SiteLayout } from "@/components/site/Layout";
import { SearchResultCard, type SearchStory } from "@/components/site/SearchResultCard";
import { useI18nStore } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

// ============================================================
// Route search params schema
// ============================================================
const searchParamsSchema = z.object({
  q:           z.string().optional().default(""),
  page:        z.coerce.number().int().positive().optional().default(1),
  sort:        z.string().optional().default("newest"),
  state:       z.string().optional().default(""),
  theme:       z.string().optional().default(""),
  author:      z.string().optional().default(""),
  minReadTime: z.coerce.number().optional(),
  maxReadTime: z.coerce.number().optional(),
});

export const Route = createFileRoute("/search")({
  validateSearch: (search) => searchParamsSchema.parse(search),
  component: SearchPage,
});

// ============================================================
// Sort options
// ============================================================
const SORT_OPTIONS = [
  { value: "newest",   label: "Newest First" },
  { value: "oldest",   label: "Oldest First" },
  { value: "views",    label: "Most Viewed" },
  { value: "trending", label: "Trending" },
  { value: "az",       label: "A → Z" },
  { value: "za",       label: "Z → A" },
];

const READ_TIME_OPTIONS = [
  { label: "Any length", min: undefined, max: undefined },
  { label: "Under 3 min",  min: undefined, max: 3 },
  { label: "3–7 min",      min: 3,        max: 7 },
  { label: "Over 7 min",   min: 7,        max: undefined },
];

// ============================================================
// Skeleton loader
// ============================================================
function SearchSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Loading results">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-0 border border-border/30 overflow-hidden">
          <div className="w-48 h-32 bg-white/5 shrink-0" />
          <div className="flex-1 p-5 space-y-3">
            <div className="flex gap-2">
              <div className="h-4 w-16 bg-white/5 rounded-sm" />
              <div className="h-4 w-24 bg-white/5 rounded-sm" />
            </div>
            <div className="h-5 w-3/4 bg-white/5 rounded" />
            <div className="h-4 w-full bg-white/5 rounded" />
            <div className="h-4 w-2/3 bg-white/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Empty state
// ============================================================
function EmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  const lang = useI18nStore((s) => s.lang);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="relative mb-6">
        <div className="size-20 rounded-full bg-card border border-border/50 flex items-center justify-center">
          <Search className="size-8 text-muted-foreground/40" />
        </div>
        <div className="absolute -top-1 -right-1 size-6 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
          <span className="text-gold text-xs font-bold">0</span>
        </div>
      </div>
      <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
        {lang === "en" ? "No stories found" : "कोई कहानी नहीं मिली"}
      </h2>
      <p className="text-sm text-muted-foreground font-sans max-w-sm mb-6">
        {lang === "en"
          ? `We couldn't find any stories matching "${query}". Try different keywords, or explore by theme or state.`
          : `"${query}" से मेल खाने वाली कोई कहानी नहीं मिली।`}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button
          onClick={onClear}
          variant="outline"
          className="font-sans text-xs uppercase tracking-widest rounded-none"
        >
          <X className="size-3 mr-2" />
          {lang === "en" ? "Clear search" : "खोज साफ़ करें"}
        </Button>
      </div>
    </motion.div>
  );
}

// ============================================================
// Main search page component
// ============================================================
function SearchPage() {
  const searchParams = Route.useSearch();
  const navigate     = useNavigate();
  const lang         = useI18nStore((s) => s.lang);

  const [inputValue, setInputValue] = useState(searchParams.q ?? "");
  const [results,    setResults]    = useState<SearchStory[]>([]);
  const [total,      setTotal]      = useState(0);
  const [pageCount,  setPageCount]  = useState(0);
  const [facets,     setFacets]     = useState<{ states: any[]; themes: any[] }>({ states: [], themes: [] });
  const [loading,    setLoading]    = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen,    setSortOpen]    = useState(false);

  const abortRef   = useRef<AbortController | null>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const q      = searchParams.q ?? "";
  const page   = searchParams.page ?? 1;
  const sort   = searchParams.sort ?? "newest";
  const state  = searchParams.state ?? "";
  const theme  = searchParams.theme ?? "";
  const author = searchParams.author ?? "";
  const minRT  = searchParams.minReadTime;
  const maxRT  = searchParams.maxReadTime;

  // ── Update URL params ─────────────────────────────────────
  const updateSearch = useCallback(
    (updates: Partial<typeof searchParams>) => {
      navigate({
        to: "/search",
        search: { ...searchParams, page: 1, ...updates },
        replace: false,
      });
    },
    [navigate, searchParams],
  );

  // ── Fetch results whenever URL search params change ───────
  useEffect(() => {
    // Auto-focus input on mount
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setInputValue(q);
  }, [q]);

  // ── Dynamic page title for SEO ────────────────────────────
  useEffect(() => {
    const title = q
      ? `Search results for "${q}" — India Story Project`
      : "Search Stories — India Story Project";
    document.title = title;
    const descEl = document.querySelector("meta[name='description']");
    const desc = q
      ? `Explore ${q}-related stories from across India's regions, authors, and themes.`
      : "Search thousands of inspiring stories from India's changemakers, artists, and innovators.";
    if (descEl) descEl.setAttribute("content", desc);
    return () => { document.title = "India Story Project"; };
  }, [q]);


  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const params = new URLSearchParams();
    params.set("mode",  "results");
    params.set("page",  String(page));
    params.set("limit", "20");
    if (q)     params.set("q",      q);
    if (sort)  params.set("sort",   sort);
    if (state) params.set("state",  state);
    if (theme) params.set("theme",  theme);
    if (author)params.set("author", author);
    if (minRT) params.set("minReadTime", String(minRT));
    if (maxRT) params.set("maxReadTime", String(maxRT));

    setLoading(true);

    fetch(`/api/search?${params.toString()}`, { signal: ac.signal })
      .then((r) => r.json())
      .then((data) => {
        if (!ac.signal.aborted) {
          setResults(data.stories ?? []);
          setTotal(data.total ?? 0);
          setPageCount(data.pageCount ?? 0);
          setFacets(data.facets ?? { states: [], themes: [] });
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error("Search fetch failed:", err);
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false);
      });

    return () => ac.abort();
  }, [q, page, sort, state, theme, author, minRT, maxRT]);

  // ── Input debounce → update URL ───────────────────────────
  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateSearch({ q: value, page: 1 });
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    updateSearch({ q: inputValue, page: 1 });
  };

  const clearSearch = () => {
    setInputValue("");
    updateSearch({ q: "", state: "", theme: "", author: "", minReadTime: undefined, maxReadTime: undefined, page: 1 });
    inputRef.current?.focus();
  };

  const clearFilter = (key: string) => {
    updateSearch({ [key]: "", page: 1 });
  };

  const activeFilters = [
    state  && { key: "state",  label: state },
    theme  && { key: "theme",  label: theme },
    author && { key: "author", label: author },
    (minRT || maxRT) && { key: "readTime", label: `${minRT ?? ""}–${maxRT ?? "∞"} min` },
  ].filter(Boolean) as { key: string; label: string }[];

  const currentSort = SORT_OPTIONS.find((o) => o.value === sort) ?? SORT_OPTIONS[0];

  return (
    <SiteLayout>
      {/* SEO heading (visually hidden) */}
      <h1 className="sr-only">
        {q ? `Search results for "${q}"` : "Search Stories — India Story Project"}
      </h1>

      {/* ── Sticky Search Header ─────────────────────────── */}
      <div className="sticky top-[56px] z-40 bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            {/* Back button */}
            <button
              type="button"
              onClick={() => window.history.back()}
              className="shrink-0 size-9 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="size-4" />
            </button>

            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <input
                ref={inputRef}
                type="search"
                id="search-input"
                name="q"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={lang === "en" ? "Search stories, themes, authors, states..." : "कहानियां, विषय, लेखक, राज्य खोजें..."}
                className="w-full h-10 pl-9 pr-10 bg-card border border-border/50 text-foreground text-sm font-sans rounded-none focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 placeholder:text-muted-foreground transition-colors"
                autoComplete="off"
                aria-label="Search"
                enterKeyHint="search"
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 size-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Sort dropdown */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setSortOpen((o) => !o)}
                className="h-10 px-3 border border-border/50 text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-border flex items-center gap-1.5 transition-colors whitespace-nowrap"
                aria-label="Sort results"
                aria-expanded={sortOpen}
              >
                {currentSort.label}
                <ChevronDown className={`size-3 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute right-0 top-full mt-1 z-50 w-44 bg-card border border-border/70 shadow-xl py-1"
                    role="listbox"
                    aria-label="Sort options"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        aria-selected={sort === opt.value}
                        onClick={() => { updateSearch({ sort: opt.value, page: 1 }); setSortOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-xs font-sans font-medium transition-colors ${
                          sort === opt.value
                            ? "text-primary bg-primary/5 font-bold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Filters toggle */}
            <button
              type="button"
              onClick={() => setFiltersOpen((o) => !o)}
              className={`shrink-0 h-10 px-3 border flex items-center gap-1.5 text-xs font-sans font-semibold uppercase tracking-widest transition-colors ${
                filtersOpen || activeFilters.length > 0
                  ? "border-gold/60 text-gold bg-gold/5"
                  : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
              }`}
              aria-label="Toggle filters"
              aria-expanded={filtersOpen}
            >
              <SlidersHorizontal className="size-3.5" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilters.length > 0 && (
                <span className="size-4 rounded-full bg-gold text-black text-[9px] font-bold flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </button>
          </form>

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {activeFilters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => clearFilter(f.key)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-sans font-semibold bg-gold/10 border border-gold/30 text-gold rounded-full hover:bg-gold/20 transition-colors"
                >
                  {f.label}
                  <X className="size-2.5" />
                </button>
              ))}
              <button
                type="button"
                onClick={() => updateSearch({ state: "", theme: "", author: "", minReadTime: undefined, maxReadTime: undefined })}
                className="text-[10px] font-sans font-semibold text-muted-foreground hover:text-foreground px-2 py-1 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* ── Filters Panel ───────────────────────────────── */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border/40"
            >
              <div className="container mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* State filter */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2 font-sans">
                    State
                  </label>
                  <select
                    value={state}
                    onChange={(e) => updateSearch({ state: e.target.value, page: 1 })}
                    className="w-full h-9 px-2 bg-card border border-border/50 text-xs font-sans text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                    aria-label="Filter by state"
                  >
                    <option value="">All States</option>
                    {facets.states.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name} ({s.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Theme filter */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2 font-sans">
                    Theme
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => updateSearch({ theme: e.target.value, page: 1 })}
                    className="w-full h-9 px-2 bg-card border border-border/50 text-xs font-sans text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                    aria-label="Filter by theme"
                  >
                    <option value="">All Themes</option>
                    {facets.themes.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name} ({t.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort filter (mobile) */}
                <div className="sm:hidden">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2 font-sans">
                    Sort
                  </label>
                  <select
                    value={sort}
                    onChange={(e) => updateSearch({ sort: e.target.value, page: 1 })}
                    className="w-full h-9 px-2 bg-card border border-border/50 text-xs font-sans text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                    aria-label="Sort results"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* Reading time filter */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2 font-sans">
                    Reading Time
                  </label>
                  <select
                    value={minRT !== undefined || maxRT !== undefined ? `${minRT ?? ""}:${maxRT ?? ""}` : ""}
                    onChange={(e) => {
                      if (!e.target.value) {
                        updateSearch({ minReadTime: undefined, maxReadTime: undefined, page: 1 });
                        return;
                      }
                      const [mn, mx] = e.target.value.split(":");
                      updateSearch({
                        minReadTime: mn ? parseInt(mn) : undefined,
                        maxReadTime: mx ? parseInt(mx) : undefined,
                        page: 1,
                      });
                    }}
                    className="w-full h-9 px-2 bg-card border border-border/50 text-xs font-sans text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                    aria-label="Filter by reading time"
                  >
                    {READ_TIME_OPTIONS.map((o) => (
                      <option key={o.label} value={o.min !== undefined || o.max !== undefined ? `${o.min ?? ""}:${o.max ?? ""}` : ""}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear filters */}
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      updateSearch({ state: "", theme: "", author: "", minReadTime: undefined, maxReadTime: undefined });
                      setFiltersOpen(false);
                    }}
                    className="text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Results Area ──────────────────────────────────── */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Results header */}
        {!loading && q && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-sans text-muted-foreground">
              {total > 0 ? (
                <>
                  <span className="text-foreground font-semibold">{total.toLocaleString()}</span>
                  {" "}
                  {lang === "en" ? `stor${total === 1 ? "y" : "ies"} matching` : "कहानियां मिलीं"}
                  {" "}
                  <span className="text-gold font-semibold">&ldquo;{q}&rdquo;</span>
                </>
              ) : (
                <>No results for <span className="text-gold font-semibold">&ldquo;{q}&rdquo;</span></>
              )}
            </p>
            {pageCount > 1 && (
              <p className="text-[11px] font-sans text-muted-foreground">
                Page {page} of {pageCount}
              </p>
            )}
          </div>
        )}

        {/* Empty query state — show trending searches */}
        {!loading && !q && (
          <div className="py-8">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="size-4 text-gold" />
              <h2 className="font-display text-xl font-bold">
                {lang === "en" ? "Popular Searches" : "लोकप्रिय खोजें"}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground font-sans mb-4">
              {lang === "en"
                ? "Type in the search box above to find stories from across India."
                : "भारत भर की कहानियां खोजने के लिए ऊपर खोज बॉक्स में टाइप करें।"}
            </p>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && <SearchSkeleton />}

        {/* Results grid */}
        {!loading && results.length > 0 && (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {results.map((story, i) => (
                <SearchResultCard key={story.id} story={story} query={q} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty state */}
        {!loading && q && results.length === 0 && (
          <EmptyState query={q} onClear={clearSearch} />
        )}

        {/* Pagination */}
        {!loading && pageCount > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10 pt-6 border-t border-border/50">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => updateSearch({ page: page - 1 })}
              className="h-9 px-4 border border-border/50 text-xs font-sans font-semibold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:border-border transition-colors"
              aria-label="Previous page"
            >
              ← Prev
            </button>

            {/* Page number buttons (show up to 5 around current) */}
            {Array.from({ length: pageCount }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pageCount || Math.abs(p - page) <= 2)
              .map((p, idx, arr) => (
                <>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span key={`ellipsis-${p}`} className="text-muted-foreground text-xs font-sans px-1">
                      …
                    </span>
                  )}
                  <button
                    key={p}
                    type="button"
                    onClick={() => updateSearch({ page: p })}
                    className={`size-9 border text-xs font-sans font-bold transition-colors ${
                      p === page
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                    aria-label={`Page ${p}`}
                    aria-current={p === page ? "page" : undefined}
                  >
                    {p}
                  </button>
                </>
              ))}

            <button
              type="button"
              disabled={page >= pageCount}
              onClick={() => updateSearch({ page: page + 1 })}
              className="h-9 px-4 border border-border/50 text-xs font-sans font-semibold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:border-border transition-colors"
              aria-label="Next page"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
