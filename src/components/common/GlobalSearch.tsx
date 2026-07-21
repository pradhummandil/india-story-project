import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import {
  Search,
  History,
  TrendingUp,
  BookOpen,
  User,
  Compass,
  MapPin,
  Play,
  Sparkles,
  Tag,
  Mic,
  MicOff,
  Trash2,
  X,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useI18nStore } from "@/lib/i18n";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";

// ============================================================
// Global search state manager for external triggers
// ============================================================
let openSearchGlobal: (() => void) | null = null;
export function openGlobalSearch() {
  openSearchGlobal?.();
}

// ============================================================
// GlobalSearch component — command-palette overlay
// ============================================================
export function GlobalSearch() {
  const [open,         setOpen]         = useState(false);
  const [query,        setQuery]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [results,      setResults]      = useState<any>(null);
  const [history,      setHistory]      = useState<string[]>([]);
  const [speechActive, setSpeechActive] = useState(false);

  const { user, session } = useAuthStore();
  const lang              = useI18nStore((s) => s.lang);
  const navigate          = useNavigate();
  const location          = useLocation();

  const abortRef    = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Register global open trigger ─────────────────────────
  useEffect(() => {
    openSearchGlobal = () => setOpen(true);
    return () => { openSearchGlobal = null; };
  }, []);

  // ── Keyboard shortcuts: Ctrl+K / Cmd+K / "/" ─────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "/" && document.activeElement === document.body) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ── Load history when overlay opens ──────────────────────
  useEffect(() => {
    if (open) {
      loadHistory();
      fetchSuggestions(""); // pre-warm with popular stories
    } else {
      setQuery("");
      setResults(null);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Close on route change ─────────────────────────────────
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // ── Debounced search on query change ─────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch suggestions — single request with AbortController ─
  const fetchSuggestions = useCallback(async (q: string) => {
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    try {
      const params = new URLSearchParams({ mode: "suggestions" });
      if (q.trim()) params.set("q", q.trim());

      const res = await fetch(`/api/search?${params.toString()}`, { signal: ac.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!ac.signal.aborted) setResults(data);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("GlobalSearch fetch failed:", err.message);
      }
    } finally {
      if (!ac.signal.aborted) setLoading(false);
    }
  }, []);

  // ── Search history management ─────────────────────────────
  const loadHistory = async () => {
    const local = localStorage.getItem("isp_recent_searches");
    const localList: string[] = local ? JSON.parse(local) : [];

    if (!session || !user) {
      setHistory(localList.slice(0, 8));
      return;
    }
    try {
      const res = await fetch("/api/search/history", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const serverList = (data.history ?? []).map((h: any) => h.query as string);
        const merged = Array.from(new Set([...serverList, ...localList])).slice(0, 10);
        setHistory(merged);
      } else {
        setHistory(localList.slice(0, 8));
      }
    } catch {
      setHistory(localList.slice(0, 8));
    }
  };

  const saveToHistory = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    const clean = searchQuery.trim();
    const local = localStorage.getItem("isp_recent_searches");
    const localList: string[] = local ? JSON.parse(local) : [];
    const updated = Array.from(new Set([clean, ...localList])).slice(0, 12);
    localStorage.setItem("isp_recent_searches", JSON.stringify(updated));
    setHistory(updated.slice(0, 8));

    if (session && user) {
      try {
        await fetch("/api/search/history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ query: clean }),
        });
      } catch {}
    }
  };

  const clearHistory = async () => {
    localStorage.removeItem("isp_recent_searches");
    setHistory([]);
    if (session && user) {
      try {
        await fetch("/api/search/history", {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
      } catch {}
    }
  };

  // ── Navigation helpers ────────────────────────────────────
  const handleSelect = (type: string, payload: any) => {
    const term = query.trim() || payload.title || payload.name || "";
    void saveToHistory(term);
    setOpen(false);

    switch (type) {
      case "story":    return void navigate({ to: "/stories/$slug", params: { slug: payload.slug } });
      case "theme":    return void navigate({ to: "/theme/$slug",   params: { slug: payload.slug } });
      case "author":   return void navigate({ to: "/authors/$id",   params: { id:   payload.id   } });
      case "video":    return void navigate({ to: "/videos/$slug",  params: { slug: payload.slug } });
      case "webStory": return void navigate({ to: "/web-stories/$slug", params: { slug: payload.slug } });
      case "state":    return void navigate({ to: "/stories", search: { state: payload.name } as any });
      case "tag":      return void navigate({ to: "/stories", search: { tag:   payload.name } as any });
      case "query":    return void navigate({ to: "/search", search: { q: payload as string, page: 1, sort: "newest", state: "", theme: "", author: "" } });
    }
  };

  // Navigate to full /search page (Enter key or "See all results" CTA)
  const navigateToSearch = (q: string) => {
    const term = q.trim();
    if (!term) return;
    void saveToHistory(term);
    setOpen(false);
    void navigate({ to: "/search", search: { q: term, page: 1, sort: "newest", state: "", theme: "", author: "" } });
  };

  // Handle Enter key in CommandInput
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      e.preventDefault();
      navigateToSearch(query);
    }
  };

  // ── Voice search ─────────────────────────────────────────
  const startVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice search is not supported in this browser.");
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = lang === "hi" ? "hi-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setSpeechActive(true);
    recognition.start();
    recognition.onresult = (event: any) => { setQuery(event.results[0][0].transcript); setSpeechActive(false); };
    recognition.onerror  = () => setSpeechActive(false);
    recognition.onend    = () => setSpeechActive(false);
  };

  // ── Query highlight helper ────────────────────────────────
  const highlightText = (text?: string, search?: string): React.ReactNode => {
    if (!text) return "";
    if (!search?.trim()) return <span>{text}</span>;
    try {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const parts = text.split(new RegExp(`(${escaped})`, "gi"));
      return (
        <span>
          {parts.map((part, i) =>
            part.toLowerCase() === search.toLowerCase() ? (
              <span key={i} className="text-gold font-bold bg-gold/10 px-0.5 rounded">
                {part}
              </span>
            ) : part,
          )}
        </span>
      );
    } catch {
      return <span>{text}</span>;
    }
  };

  const hasResults = results && (
    (results.stories?.length  > 0) ||
    (results.themes?.length   > 0) ||
    (results.authors?.length  > 0) ||
    (results.videos?.length   > 0) ||
    (results.webStories?.length > 0) ||
    (results.states?.length   > 0) ||
    (results.tags?.length     > 0)
  );

  // ── Render ────────────────────────────────────────────────
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      {/* Search input row */}
      <div className="flex items-center border-b border-border/30 px-3 relative bg-card">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-gold" />
        <CommandInput
          placeholder={
            lang === "hi"
              ? "कहानियां, लेखक, विषय या राज्य खोजें... (Ctrl+K)"
              : "Search stories, authors, themes, states... (Ctrl+K)"
          }
          value={query}
          onValueChange={setQuery}
          onKeyDown={handleKeyDown}
          className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none text-foreground placeholder:text-muted-foreground focus:ring-0 focus:outline-none focus:border-0"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="p-1 hover:bg-muted rounded-full mr-1 text-muted-foreground hover:text-foreground"
            aria-label="Clear"
          >
            <X className="size-3.5" />
          </button>
        )}
        <button
          onClick={startVoiceSearch}
          className={`p-1.5 rounded-full hover:bg-muted transition-colors ${
            speechActive ? "text-primary bg-primary/10 animate-pulse" : "text-muted-foreground hover:text-foreground"
          }`}
          title={lang === "hi" ? "आवाज द्वारा खोजें" : "Voice Search"}
          aria-label="Voice search"
        >
          {speechActive ? <MicOff className="size-4" /> : <Mic className="size-4" />}
        </button>
      </div>

      <CommandList className="max-h-[70vh] overflow-y-auto bg-background text-foreground custom-scrollbar scroll-smooth">
        {/* Loading skeleton */}
        {loading && (
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-1/3 rounded" />
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-4 w-1/4 rounded pt-3" />
            <Skeleton className="h-10 w-full rounded" />
          </div>
        )}

        {/* No results message */}
        {!loading && results && query && !hasResults && (
          <CommandEmpty className="py-12 text-center text-sm font-sans text-muted-foreground">
            {lang === "hi"
              ? "कोई परिणाम नहीं मिला। कृपया दूसरे शब्दों का प्रयास करें।"
              : "No matches found. Try different keywords."}
          </CommandEmpty>
        )}

        {/* ── Suggestions (empty query) ─────────────────── */}
        {!loading && (!query || results?.isSuggestions) && (
          <>
            {/* Recent searches */}
            {history.length > 0 && (
              <CommandGroup
                heading={
                  <div className="flex items-center justify-between text-[10px] tracking-wider uppercase font-bold text-muted-foreground/80 py-1">
                    <span>{lang === "hi" ? "हाल की खोजें" : "Recent Searches"}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); void clearHistory(); }}
                      className="text-[9px] hover:text-primary transition-colors flex items-center gap-1 font-sans cursor-pointer text-muted-foreground/60 font-semibold"
                    >
                      <Trash2 className="size-3" />
                      {lang === "hi" ? "इतिहास साफ करें" : "Clear"}
                    </button>
                  </div>
                }
              >
                <div className="flex flex-wrap gap-2 p-2">
                  {history.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(h)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full bg-card hover:bg-muted border border-border/40 text-foreground transition-all font-sans cursor-pointer"
                    >
                      <History className="size-3 text-muted-foreground" />
                      <span>{h}</span>
                    </button>
                  ))}
                </div>
              </CommandGroup>
            )}

            {/* Trending searches */}
            {results?.trending && results.trending.length > 0 && (
              <CommandGroup
                heading={
                  <div className="text-[10px] tracking-wider uppercase font-bold text-muted-foreground/80 py-1 flex items-center gap-1">
                    <TrendingUp className="size-3.5 text-gold" />
                    <span>{lang === "hi" ? "प्रचलित खोजें" : "Trending Searches"}</span>
                  </div>
                }
              >
                <div className="flex flex-wrap gap-2 p-2">
                  {results.trending.map((t: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setQuery(t)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full bg-gold/5 hover:bg-gold/15 border border-gold/20 text-gold transition-all font-sans font-bold cursor-pointer"
                    >
                      <span>#{t}</span>
                    </button>
                  ))}
                </div>
              </CommandGroup>
            )}

            {/* Popular themes */}
            {results?.themes && results.themes.length > 0 && (
              <CommandGroup heading={lang === "hi" ? "लोकप्रिय विषय" : "Popular Themes"}>
                <div className="flex flex-wrap gap-2 p-2">
                  {results.themes.map((theme: any) => (
                    <CommandItem
                      key={theme.id}
                      onSelect={() => handleSelect("theme", theme)}
                      className="px-3 py-1.5 text-xs rounded-full bg-card hover:bg-muted border border-border/40 text-foreground transition-all cursor-pointer inline-flex items-center gap-1 font-sans font-medium"
                    >
                      <Compass className="size-3 text-gold" />
                      <span>{theme.name}</span>
                    </CommandItem>
                  ))}
                </div>
              </CommandGroup>
            )}

            {/* Popular authors */}
            {results?.authors && results.authors.length > 0 && (
              <CommandGroup heading={lang === "hi" ? "लोकप्रिय लेखक" : "Popular Authors"}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                  {results.authors.map((author: any) => (
                    <CommandItem
                      key={author.id}
                      onSelect={() => handleSelect("author", author)}
                      className="flex items-center gap-3 p-2 rounded-lg bg-card hover:bg-muted border border-border/40 cursor-pointer text-left"
                    >
                      {author.avatar ? (
                        <img src={author.avatar} alt={author.name} className="size-8 rounded-full object-cover border border-border/40" />
                      ) : (
                        <div className="size-8 rounded-full bg-gold/10 flex items-center justify-center font-display text-sm font-bold text-gold">
                          {author.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{author.name}</p>
                        {author.bio && <p className="text-[10px] text-muted-foreground truncate">{author.bio}</p>}
                      </div>
                    </CommandItem>
                  ))}
                </div>
              </CommandGroup>
            )}
          </>
        )}

        {/* ── Active search results ─────────────────────── */}
        {!loading && query && results && !results.isSuggestions && hasResults && (
          <>
            {/* Stories */}
            {results.stories?.length > 0 && (
              <CommandGroup heading={lang === "hi" ? "कहानियां" : "Stories"}>
                <div className="space-y-1">
                  {results.stories.map((story: any) => (
                    <CommandItem
                      key={story.id}
                      onSelect={() => handleSelect("story", story)}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted cursor-pointer text-left"
                    >
                      {story.images?.[0]?.imageUrl && (
                        <div className="size-12 rounded bg-muted overflow-hidden shrink-0">
                          <img src={story.images[0].imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-[9px] uppercase tracking-wider text-gold font-sans font-bold">
                          <span>{story.author?.name}</span>
                          <span>•</span>
                          <span>{story.state?.name}</span>
                        </div>
                        <h4 className="font-display text-xs md:text-sm font-bold text-foreground line-clamp-1 mt-0.5">
                          {highlightText(lang === "hi" && story.titleHi ? story.titleHi : story.title, query)}
                        </h4>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">
                          {lang === "hi" && story.excerptHi ? story.excerptHi : story.excerpt}
                        </p>
                      </div>
                    </CommandItem>
                  ))}
                </div>
              </CommandGroup>
            )}

            {/* Videos */}
            {results.videos?.length > 0 && (
              <CommandGroup heading={lang === "hi" ? "वीडियो" : "Videos"}>
                <div className="space-y-1">
                  {results.videos.map((video: any) => (
                    <CommandItem
                      key={video.id}
                      onSelect={() => handleSelect("video", video)}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted cursor-pointer text-left"
                    >
                      {video.thumbnail && (
                        <div className="w-16 aspect-video rounded bg-muted overflow-hidden shrink-0 relative flex items-center justify-center">
                          <img src={video.thumbnail} alt="" className="absolute inset-0 size-full object-cover" />
                          <div className="relative size-6 rounded-full bg-black/60 flex items-center justify-center">
                            <Play className="size-2.5 text-white fill-white ml-0.5" />
                          </div>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display text-xs md:text-sm font-bold text-foreground line-clamp-1">
                          {highlightText(lang === "hi" && video.titleHi ? video.titleHi : video.title, query)}
                        </h4>
                      </div>
                    </CommandItem>
                  ))}
                </div>
              </CommandGroup>
            )}

            {/* Web Stories */}
            {results.webStories?.length > 0 && (
              <CommandGroup heading={lang === "hi" ? "वेब स्टोरीज" : "Web Stories"}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-2">
                  {results.webStories.map((ws: any) => (
                    <CommandItem
                      key={ws.id}
                      onSelect={() => handleSelect("webStory", ws)}
                      className="group relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer flex flex-col justify-end p-3 text-left border border-border/40 hover:border-gold/50"
                    >
                      <img src={ws.coverImage} alt="" className="absolute inset-0 size-full object-cover filter brightness-[0.7]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                      <h4 className="relative z-10 font-display text-[10px] sm:text-xs font-bold leading-tight text-white line-clamp-3">
                        {lang === "hi" && ws.titleHi ? ws.titleHi : ws.title}
                      </h4>
                    </CommandItem>
                  ))}
                </div>
              </CommandGroup>
            )}

            {/* Themes */}
            {results.themes?.length > 0 && (
              <CommandGroup heading={lang === "hi" ? "विषय" : "Themes"}>
                <div className="flex flex-wrap gap-2 p-2">
                  {results.themes.map((theme: any) => (
                    <CommandItem
                      key={theme.id}
                      onSelect={() => handleSelect("theme", theme)}
                      className="px-3 py-1.5 text-xs rounded-full bg-card hover:bg-muted border border-border/40 text-foreground transition-all cursor-pointer inline-flex items-center gap-1 font-sans font-medium"
                    >
                      <Compass className="size-3 text-gold" />
                      <span>{highlightText(theme.name, query)}</span>
                    </CommandItem>
                  ))}
                </div>
              </CommandGroup>
            )}

            {/* Authors */}
            {results.authors?.length > 0 && (
              <CommandGroup heading={lang === "hi" ? "लेखक" : "Authors"}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                  {results.authors.map((author: any) => (
                    <CommandItem
                      key={author.id}
                      onSelect={() => handleSelect("author", author)}
                      className="flex items-center gap-3 p-2 rounded-lg bg-card hover:bg-muted border border-border/40 cursor-pointer text-left"
                    >
                      {author.avatar ? (
                        <img src={author.avatar} alt={author.name} className="size-8 rounded-full object-cover border border-border/40" />
                      ) : (
                        <div className="size-8 rounded-full bg-gold/10 flex items-center justify-center font-display text-sm font-bold text-gold">
                          {author.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {highlightText(author.name, query)}
                        </p>
                        {author.bio && <p className="text-[10px] text-muted-foreground truncate">{author.bio}</p>}
                      </div>
                    </CommandItem>
                  ))}
                </div>
              </CommandGroup>
            )}

            {/* States */}
            {results.states?.length > 0 && (
              <CommandGroup heading={lang === "hi" ? "राज्य" : "States"}>
                <div className="flex flex-wrap gap-2 p-2">
                  {results.states.map((s: any) => (
                    <CommandItem
                      key={s.id}
                      onSelect={() => handleSelect("state", s)}
                      className="px-3 py-1.5 text-xs rounded-full bg-card hover:bg-muted border border-border/40 text-foreground transition-all cursor-pointer inline-flex items-center gap-1 font-sans font-medium"
                    >
                      <MapPin className="size-3 text-gold" />
                      <span>{highlightText(s.name, query)}</span>
                    </CommandItem>
                  ))}
                </div>
              </CommandGroup>
            )}

            {/* Tags */}
            {results.tags?.length > 0 && (
              <CommandGroup heading={lang === "hi" ? "टैग्स" : "Tags"}>
                <div className="flex flex-wrap gap-2 p-2">
                  {results.tags.map((tag: any) => (
                    <CommandItem
                      key={tag.id}
                      onSelect={() => handleSelect("tag", tag)}
                      className="px-3 py-1.5 text-xs rounded-full bg-card hover:bg-muted border border-border/40 text-foreground transition-all cursor-pointer inline-flex items-center gap-1 font-sans font-medium"
                    >
                      <Tag className="size-3 text-gold" />
                      <span>#{highlightText(tag.name, query)}</span>
                    </CommandItem>
                  ))}
                </div>
              </CommandGroup>
            )}

            {/* ── "See all results" CTA ─────────────────── */}
            <div className="border-t border-border/30 p-3">
              <button
                onClick={() => navigateToSearch(query)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/40 text-primary transition-all group"
              >
                <span className="text-xs font-sans font-bold uppercase tracking-widest">
                  {lang === "en"
                    ? `See all results for "${query}"`
                    : `"${query}" के सभी परिणाम देखें`}
                </span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </>
        )}

        {/* ── "Search for" CTA when typing ────────────── */}
        {!loading && query && !results && (
          <div className="border-t border-border/30 p-3">
            <button
              onClick={() => navigateToSearch(query)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/40 text-primary transition-all group"
            >
              <span className="text-xs font-sans font-bold uppercase tracking-widest">
                {lang === "en" ? `Search for "${query}"` : `"${query}" खोजें`}
              </span>
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </CommandList>
    </CommandDialog>
  );
}
