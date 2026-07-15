import React, { useEffect, useState, useRef } from "react";
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

// Global search state manager for triggers
let openSearchGlobal: (() => void) | null = null;
export function openGlobalSearch() {
  openSearchGlobal?.();
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [speechActive, setSpeechActive] = useState(false);

  const { user, session } = useAuthStore();
  const lang = useI18nStore((s) => s.lang);
  const navigate = useNavigate();
  const location = useLocation();

  // Register global open trigger
  useEffect(() => {
    openSearchGlobal = () => {
      setOpen(true);
    };
    return () => {
      openSearchGlobal = null;
    };
  }, []);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K and /)
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

  // Sync open state changes
  useEffect(() => {
    if (open) {
      loadHistory();
      fetchResults(""); // Load suggestions
    } else {
      setQuery("");
      setDebouncedQuery("");
    }
  }, [open, session]);

  // Debounce input search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 180);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch search results on debounced query changes
  useEffect(() => {
    fetchResults(debouncedQuery);
  }, [debouncedQuery]);

  // Close search dialog on route transition
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const loadHistory = async () => {
    // 1. Load guest local storage history
    const local = localStorage.getItem("isp_recent_searches");
    const localList: string[] = local ? JSON.parse(local) : [];

    if (!session || !user) {
      setHistory(localList.slice(0, 8));
      return;
    }

    // 2. Load synced database history if logged in
    try {
      const res = await fetch("/api/search/history", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const serverList = (data.history || []).map((h: any) => h.query);
        // Merge list
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
    if (!searchQuery || !searchQuery.trim()) return;
    const cleanQuery = searchQuery.trim();

    // 1. Update local storage history
    const local = localStorage.getItem("isp_recent_searches");
    const localList: string[] = local ? JSON.parse(local) : [];
    const updatedLocal = Array.from(new Set([cleanQuery, ...localList])).slice(0, 12);
    localStorage.setItem("isp_recent_searches", JSON.stringify(updatedLocal));

    setHistory(updatedLocal.slice(0, 8));

    // 2. Save/sync server search history if logged in
    if (session && user) {
      try {
        await fetch("/api/search/history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ query: cleanQuery }),
        });
      } catch (err) {
        console.error("Failed to sync search history to database:", err);
      }
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
      } catch (err) {
        console.error("Failed to clear server search history:", err);
      }
    }
  };

  const fetchResults = async (searchVal: string) => {
    setLoading(true);
    try {
      const url = `/api/search?query=${encodeURIComponent(searchVal)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (err) {
      console.error("Failed to fetch global search results:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (type: string, payload: any) => {
    const queryTerm = query.trim() || payload.title || payload.name || "";
    saveToHistory(queryTerm);
    setOpen(false);

    if (type === "story") {
      void navigate({ to: "/stories/$slug", params: { slug: payload.slug } });
    } else if (type === "theme") {
      void navigate({ to: "/theme/$slug", params: { slug: payload.slug } });
    } else if (type === "author") {
      void navigate({ to: "/authors/$id", params: { id: payload.id } });
    } else if (type === "video") {
      void navigate({ to: "/videos/$slug", params: { slug: payload.slug } });
    } else if (type === "webStory") {
      void navigate({ to: "/web-stories/$slug", params: { slug: payload.slug } });
    } else if (type === "state") {
      void navigate({ to: "/stories", search: { state: payload.name } as any });
    } else if (type === "tag") {
      void navigate({ to: "/stories", search: { tag: payload.name } as any });
    } else if (type === "query") {
      setQuery(payload);
    }
  };

  // Voice Search handler placeholders
  const startVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice search is not supported in this browser.");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang === "hi" ? "hi-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setSpeechActive(true);
    recognition.start();

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setQuery(speechToText);
      setSpeechActive(false);
    };

    recognition.onerror = () => {
      setSpeechActive(false);
    };

    recognition.onend = () => {
      setSpeechActive(false);
    };
  };

  const highlightText = (text?: string, search?: string) => {
    if (!text) return "";
    if (!search || !search.trim()) return <span>{text}</span>;

    const regex = new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <span key={i} className="text-gold font-bold bg-gold/10 px-0.5 rounded">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      {/* Search Input Container with Voice option */}
      <div className="flex items-center border-b border-border/30 px-3 relative bg-card">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-gold" />
        <CommandInput
          placeholder={
            lang === "hi"
              ? "कहानियां, लेखक, विषय या राज्य खोजें... (Ctrl+K)"
              : "Search stories, authors, themes, or states... (Ctrl+K)"
          }
          value={query}
          onValueChange={setQuery}
          className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none text-foreground placeholder:text-muted-foreground focus:ring-0 focus:outline-none focus:border-0"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="p-1 hover:bg-muted rounded-full mr-2 text-muted-foreground hover:text-foreground"
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
        >
          {speechActive ? <MicOff className="size-4" /> : <Mic className="size-4" />}
        </button>
      </div>

      <CommandList className="max-h-[75vh] overflow-y-auto bg-background text-foreground custom-scrollbar scroll-smooth">
        {loading && (
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-1/3 rounded" />
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-4 w-1/4 rounded pt-3" />
            <Skeleton className="h-10 w-full rounded" />
          </div>
        )}

        {/* Dynamic empty/no results state */}
        {!loading && results && Object.values(results).every((arr: any) => !Array.isArray(arr) || arr.length === 0) && (
          <CommandEmpty className="py-12 text-center text-sm font-sans text-muted-foreground">
            {lang === "hi"
              ? "कोई परिणाम नहीं मिला। कृपया दूसरे शब्दों का प्रयास करें।"
              : "No matches found. Try searching for a different keyword."}
          </CommandEmpty>
        )}

        {/* Search Recommendations / Popular elements */}
        {!loading && (!query || results?.isSuggestions) && (
          <>
            {/* Recent Searches */}
            {history.length > 0 && (
              <CommandGroup
                heading={
                  <div className="flex items-center justify-between text-[10px] tracking-wider uppercase font-bold text-muted-foreground/80 py-1">
                    <span>{lang === "hi" ? "हाल की खोजें" : "Recent Searches"}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        void clearHistory();
                      }}
                      className="text-[9px] hover:text-primary transition-colors flex items-center gap-1 font-sans cursor-pointer text-muted-foreground/60 font-semibold"
                    >
                      <Trash2 className="size-3" />
                      {lang === "hi" ? "इतिहास साफ करें" : "Clear History"}
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

            {/* Trending Searches */}
            {results?.trending && results.trending.length > 0 && (
              <CommandGroup
                heading={
                  <div className="text-[10px] tracking-wider uppercase font-bold text-muted-foreground/80 py-1 flex items-center gap-1">
                    <TrendingUp className="size-3.5 text-gold" />
                    <span>{lang === "hi" ? "प्रचलित खोजें" : "Trending searches"}</span>
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

            {/* Popular Themes */}
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

            {/* Popular Authors */}
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
                        <img
                          src={author.avatar}
                          alt={author.name}
                          className="size-8 rounded-full object-cover border border-border/40"
                        />
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

        {/* Search Results matching keyword */}
        {!loading && query && results && !results.isSuggestions && (
          <>
            {/* Stories */}
            {results.stories && results.stories.length > 0 && (
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
                          <img
                            src={story.images[0].imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
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
            {results.videos && results.videos.length > 0 && (
              <CommandGroup heading={lang === "hi" ? "वीडियो रिपोर्ट्स" : "Videos"}>
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
            {results.webStories && results.webStories.length > 0 && (
              <CommandGroup heading={lang === "hi" ? "वेब स्टोरीज" : "Web Stories"}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-2">
                  {results.webStories.map((webStory: any) => (
                    <CommandItem
                      key={webStory.id}
                      onSelect={() => handleSelect("webStory", webStory)}
                      className="group relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer flex flex-col justify-end p-3 text-left border border-border/40 hover:border-gold/50"
                    >
                      <img
                        src={webStory.coverImage}
                        alt=""
                        className="absolute inset-0 size-full object-cover filter brightness-[0.7]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                      <h4 className="relative z-10 font-display text-[10px] sm:text-xs font-bold leading-tight text-white line-clamp-3">
                        {lang === "hi" && webStory.titleHi ? webStory.titleHi : webStory.title}
                      </h4>
                    </CommandItem>
                  ))}
                </div>
              </CommandGroup>
            )}

            {/* Themes */}
            {results.themes && results.themes.length > 0 && (
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
            {results.authors && results.authors.length > 0 && (
              <CommandGroup heading={lang === "hi" ? "लेखक" : "Authors"}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                  {results.authors.map((author: any) => (
                    <CommandItem
                      key={author.id}
                      onSelect={() => handleSelect("author", author)}
                      className="flex items-center gap-3 p-2 rounded-lg bg-card hover:bg-muted border border-border/40 cursor-pointer text-left"
                    >
                      {author.avatar ? (
                        <img
                          src={author.avatar}
                          alt={author.name}
                          className="size-8 rounded-full object-cover border border-border/40"
                        />
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
            {results.states && results.states.length > 0 && (
              <CommandGroup heading={lang === "hi" ? "राज्य" : "States"}>
                <div className="flex flex-wrap gap-2 p-2">
                  {results.states.map((state: any) => (
                    <CommandItem
                      key={state.id}
                      onSelect={() => handleSelect("state", state)}
                      className="px-3 py-1.5 text-xs rounded-full bg-card hover:bg-muted border border-border/40 text-foreground transition-all cursor-pointer inline-flex items-center gap-1 font-sans font-medium"
                    >
                      <MapPin className="size-3 text-gold" />
                      <span>{highlightText(state.name, query)}</span>
                    </CommandItem>
                  ))}
                </div>
              </CommandGroup>
            )}

            {/* Tags */}
            {results.tags && results.tags.length > 0 && (
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
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
