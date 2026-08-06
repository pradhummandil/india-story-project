import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useLocation, useNavigate, Link } from "@tanstack/react-router";
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
  Clock,
  ChevronRight,
  Flame,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useI18nStore } from "@/lib/i18n";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import { toast } from "sonner";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { stories as clientStories, useStoriesData } from "@/lib/stories-data";

// ============================================================
// Global search state manager for external triggers
// ============================================================
let openSearchGlobal: (() => void) | null = null;
export function openGlobalSearch() {
  openSearchGlobal?.();
}

// Helper to filter out raw SQL strings or malformed history entries
function sanitizeHistoryItem(item: string): string | null {
  if (!item || typeof item !== "string") return null;
  const clean = item.trim();
  if (!clean || clean.length < 2 || clean.length > 80) return null;
  if (/LIKE|SELECT|FROM|WHERE|INSERT|DELETE|UPDATE|%/i.test(clean)) return null;
  return clean;
}

// ============================================================
// GlobalSearch component — Ultra-Premium Search Modal & Story Engine
// ============================================================
export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [speechActive, setSpeechActive] = useState(false);

  const { user, session } = useAuthStore();
  const lang = useI18nStore((s) => s.lang);
  const isHindi = lang === "hi";
  const navigate = useNavigate();
  const location = useLocation();

  const { stories: dbStories } = useStoriesData();
  const allAvailableStories = useMemo(() => (dbStories.length > 0 ? dbStories : clientStories), [dbStories]);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Register global open trigger
  useEffect(() => {
    openSearchGlobal = () => setOpen(true);
    return () => {
      openSearchGlobal = null;
    };
  }, []);

  // Keyboard shortcuts: Ctrl+K / Cmd+K / "/"
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

  // Manage scroll lock & pre-warm history/suggestions when modal opens
  useEffect(() => {
    if (open) {
      lockScroll();
      if (typeof document !== "undefined") {
        document.body.style.touchAction = "auto";
      }
      loadHistory();
      fetchSuggestions("");
    } else {
      unlockScroll();
      setQuery("");
      setResults(null);
    }
    return () => {
      if (open) unlockScroll();
    };
  }, [open]);

  // Close modal on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Debounced search trigger
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Fetch API suggestions with server & local fallback
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
        /* silent fallback */
      }
    } finally {
      if (!ac.signal.aborted) setLoading(false);
    }
  }, []);

  // Filter client stories locally for instant, zero-latency story suggestions
  const localSuggestedStories = useMemo(() => {
    if (!query.trim()) {
      return allAvailableStories.slice(0, 4);
    }
    const q = query.toLowerCase().trim();
    return allAvailableStories
      .filter((s) => {
        const title = isHindi ? (s.titleHindi || s.title) : s.title;
        const excerpt = isHindi ? (s.excerptHindi || s.excerpt) : s.excerpt;
        const region = s.region || "";
        const author = s.authorName || "";
        return (
          title.toLowerCase().includes(q) ||
          excerpt.toLowerCase().includes(q) ||
          region.toLowerCase().includes(q) ||
          author.toLowerCase().includes(q)
        );
      })
      .slice(0, 6);
  }, [allAvailableStories, query, isHindi]);

  // Search history management
  const loadHistory = async () => {
    const local = localStorage.getItem("isp_recent_searches");
    let localList: string[] = local ? JSON.parse(local) : [];
    localList = localList.map(sanitizeHistoryItem).filter(Boolean) as string[];

    if (!session || !user) {
      setHistory(localList.slice(0, 6));
      return;
    }
    try {
      const res = await fetch("/api/search/history", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const serverList = (data.history ?? [])
          .map((h: any) => sanitizeHistoryItem(h.query as string))
          .filter(Boolean) as string[];

        const merged = Array.from(new Set([...serverList, ...localList])).slice(0, 8);
        setHistory(merged);
      } else {
        setHistory(localList.slice(0, 6));
      }
    } catch {
      setHistory(localList.slice(0, 6));
    }
  };

  const saveToHistory = async (searchQuery: string) => {
    const clean = sanitizeHistoryItem(searchQuery);
    if (!clean) return;

    const local = localStorage.getItem("isp_recent_searches");
    const localList: string[] = local ? JSON.parse(local) : [];
    const updated = Array.from(new Set([clean, ...localList])).slice(0, 10);
    localStorage.setItem("isp_recent_searches", JSON.stringify(updated));
    setHistory(updated.slice(0, 6));

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

  // Navigation handlers
  const handleSelectStory = (slug: string, title: string) => {
    void saveToHistory(title);
    setOpen(false);
    void navigate({ to: "/stories/$slug", params: { slug } });
  };

  const navigateToSearch = (q: string) => {
    const clean = sanitizeHistoryItem(q) || q.trim();
    if (!clean) return;
    void saveToHistory(clean);
    setOpen(false);
    void navigate({ to: "/search", search: { q: clean, page: 1, sort: "newest", state: "", theme: "", author: "" } });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      e.preventDefault();
      navigateToSearch(query);
    }
  };

  // Voice search
  const startVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Voice search is not supported in this browser.");
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = isHindi ? "hi-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setSpeechActive(true);
    recognition.start();
    recognition.onresult = (event: any) => {
      setQuery(event.results[0][0].transcript);
      setSpeechActive(false);
    };
    recognition.onerror = () => setSpeechActive(false);
    recognition.onend = () => setSpeechActive(false);
  };

  // Highlight matching search query text
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
              <span key={i} className="text-[#D32F2F] font-bold bg-[#D32F2F]/10 px-1 rounded">
                {part}
              </span>
            ) : (
              part
            )
          )}
        </span>
      );
    } catch {
      return <span>{text}</span>;
    }
  };

  const popularTags = [
    isHindi ? "संस्कृति" : "Culture",
    isHindi ? "विरासत" : "Heritage",
    isHindi ? "पर्यावरण" : "Environment",
    isHindi ? "शिल्प कला" : "Craftsmanship",
    isHindi ? "महिला सशक्तीकरण" : "Women Empowerment",
    isHindi ? "नवचार" : "Innovation",
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <div className="bg-[#FFFDF9] border border-[#E5DFD3] rounded-2xl shadow-2xl overflow-hidden select-none">
        {/* Top Search Input Row */}
        <div className="flex items-center border-b border-[#EAE4D8] px-4 py-1.5 bg-[#FFFDF9] relative">
          <Search className="mr-3 h-5 w-5 shrink-0 text-[#D32F2F]" />
          <CommandInput
            placeholder={
              isHindi
                ? "कहानियां, लेखक, विषय या राज्य खोजें... (Ctrl+K)"
                : "Search stories, authors, themes, states... (Ctrl+K)"
            }
            value={query}
            onValueChange={setQuery}
            onKeyDown={handleKeyDown}
            className="flex h-12 w-full rounded-md bg-transparent text-sm text-[#1A1816] placeholder-[#8C827A] outline-none border-none focus:ring-0"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 hover:bg-[#F2ECE1] rounded-full mr-2 text-[#8C827A] hover:text-[#1A1816] transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={startVoiceSearch}
            className={`p-2 rounded-full transition-all cursor-pointer ${
              speechActive
                ? "text-[#D32F2F] bg-[#D32F2F]/10 animate-pulse"
                : "text-[#8C827A] hover:bg-[#F2ECE1] hover:text-[#1A1816]"
            }`}
            title={isHindi ? "आवाज द्वारा खोजें" : "Voice Search"}
            aria-label="Voice search"
          >
            {speechActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        {/* Scrollable Command List */}
        <CommandList
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          className="max-h-[72vh] overflow-y-auto bg-[#FAF7F2] text-[#1A1816] custom-scrollbar p-2"
        >
          {/* 1. RECENT SEARCHES & TRENDING TAGS (When Query is Empty) */}
          {!query && (
            <div className="space-y-4 p-2">
              {history.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-[#8C827A] pb-2">
                    <span className="flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-[#D32F2F]" />
                      {isHindi ? "हाल की खोजें" : "Recent Searches"}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void clearHistory();
                      }}
                      className="text-[9px] text-[#8C827A] hover:text-[#D32F2F] transition-colors flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      {isHindi ? "साफ करें" : "Clear"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {history.map((h, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setQuery(h)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full bg-[#FFFFFF] hover:bg-[#D32F2F] hover:text-white border border-[#E5DFD3] text-[#1A1816] transition-all font-sans cursor-pointer shadow-sm"
                      >
                        <History className="w-3 h-3 opacity-60" />
                        <span>{h}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Tags */}
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#8C827A] pb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#D32F2F]" />
                  <span>{isHindi ? "लोकप्रिय विषय" : "Popular Themes"}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setQuery(tag)}
                      className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-full bg-[#D32F2F]/10 hover:bg-[#D32F2F] hover:text-white border border-[#D32F2F]/20 text-[#D32F2F] transition-all font-semibold cursor-pointer"
                    >
                      <span>#{tag}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. LIVE STORY SUGGESTIONS SECTION (Rich Visual Cards) */}
          <div className="mt-2 pt-2 border-t border-[#EAE4D8]">
            <div className="px-3 py-2 flex items-center justify-between text-[11px] font-serif font-bold text-[#D32F2F] uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D32F2F]" />
                {query
                  ? isHindi
                    ? `"${query}" के लिए सुझाई गई कहानियां`
                    : `Suggested Stories for "${query}"`
                  : isHindi
                  ? "विशेष सुझाई गई कहानियां"
                  : "Recommended Featured Stories"}
              </span>
              <span className="text-[10px] font-mono text-[#8C827A]">
                {localSuggestedStories.length} {isHindi ? "परिणाम" : "Stories"}
              </span>
            </div>

            {localSuggestedStories.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8C827A]">
                {isHindi ? "कोई कहानी नहीं मिली" : "No matching stories found"}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 p-1">
                {localSuggestedStories.map((s) => {
                  const title = isHindi ? (s.titleHindi || s.title) : s.title;
                  const excerpt = isHindi ? (s.excerptHindi || s.excerpt) : s.excerpt;
                  const image = s.image;
                  const author = s.authorName || "India Story Project";

                  return (
                    <div
                      key={s.id}
                      onClick={() => handleSelectStory(s.slug, title)}
                      className="group flex items-center gap-3.5 p-3 rounded-2xl bg-[#FFFFFF] hover:bg-[#FFFDF9] border border-[#EAE4D8] hover:border-[#D32F2F]/40 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#F4EFE6] shrink-0 border border-[#E5DFD3]">
                        <img
                          src={image}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      {/* Content Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-[10px] text-[#D32F2F] font-semibold">
                          <span>{s.region || "India"}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-[#8C827A]">
                            <Clock className="w-3 h-3 text-[#D4AF37]" />
                            {s.readTime || "5 min read"}
                          </span>
                        </div>

                        <h4 className="text-xs md:text-sm font-serif font-bold text-[#1A1816] group-hover:text-[#D32F2F] transition-colors truncate leading-snug mt-0.5">
                          {highlightText(title, query)}
                        </h4>

                        <p className="text-[11px] font-sans text-[#6B625B] truncate mt-0.5">
                          {excerpt}
                        </p>
                      </div>

                      <ChevronRight className="w-4 h-4 text-[#8C827A] group-hover:text-[#D32F2F] group-hover:translate-x-1 transition-all shrink-0 mr-1" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. SEE ALL RESULTS CTA FOOTER */}
          {query.trim() && (
            <div className="mt-4 pt-3 border-t border-[#EAE4D8]">
              <button
                type="button"
                onClick={() => navigateToSearch(query)}
                className="w-full flex items-center justify-between px-5 py-3 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white transition-all shadow-md group cursor-pointer"
              >
                <span className="text-xs font-serif font-bold tracking-wide">
                  {isHindi ? `"${query}" के सभी विस्तृत परिणाम देखें` : `See All Results for "${query}"`}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </CommandList>
      </div>
    </CommandDialog>
  );
}
