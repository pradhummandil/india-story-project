import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Share2,
  User,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Twitter,
  Facebook,
  Linkedin,
  Calendar,
  BookMarked,
  Heart,
  CheckCircle2,
  BookOpen,
  Minus,
  Plus,
  Copy,
  Languages,
  Maximize2,
  Minimize2,
  Check,
  Flame,
  MessageSquare,
  Award,
  HelpCircle,
  Bookmark,
  Headphones,
  Dna,
  Sparkles,
  Youtube,
  ExternalLink,
  Minimize,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { StoryCard } from "@/components/site/StoryCard";
import type { Story } from "@/components/site/StoryCard";
import { useI18nStore, translateStory, getCommonText } from "@/lib/i18n";
import { stories, useStoriesData } from "@/lib/stories-data";
import { getStoryAuthor, getOptimizedImageUrl, getResponsiveSrcSet, sanitizeStoryContent } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";
import { useAudioStore } from "@/lib/audio-store";

// Digital Story Reading 4.0 Components
import { StoryHero } from "@/components/story-reader/StoryHero";
import { StoryChapterTimeline, Chapter } from "@/components/story-reader/StoryChapterTimeline";
import { StoryHighlightPanel } from "@/components/story-reader/StoryHighlightPanel";
import { StoryRhythmContent } from "@/components/story-reader/StoryRhythmContent";
import { StoryReaderBar, ReaderTheme } from "@/components/story-reader/StoryReaderBar";
import { StoryTextSelectionToolbar } from "@/components/story-reader/StoryTextSelectionToolbar";
import { StoryAuthorSpotlight } from "@/components/story-reader/StoryAuthorSpotlight";
import { StoryImpactCounters } from "@/components/story-reader/StoryImpactCounters";
import { NetflixStoryCarousel } from "@/components/story-reader/NetflixStoryCarousel";
import { CinematicEnding } from "@/components/story-reader/CinematicEnding";

export function StoryDetail({ story }: { story: Story }) {
  const { stories: dbStories } = useStoriesData();
  const activeStories = dbStories.length > 0 ? dbStories : stories;
  const [scrollProgress, setScrollProgress] = useState(0);

  // i18n Translation Support
  const lang = useI18nStore((s) => s.lang);
  const localizedStory = translateStory(story, lang);
  const { session } = useAuthStore();

  // Font size & theme controls
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");
  const fontSizeClass = { sm: "text-base md:text-lg", md: "text-lg md:text-xl", lg: "text-xl md:text-2xl" }[fontSize];
  const [fontFamily, setFontFamily] = useState<"serif" | "sans">("serif");

  const [readerTheme, setReaderTheme] = useState<ReaderTheme>("obsidian");
  const themeClasses: Record<ReaderTheme, string> = {
    ivory: "bg-[#FAF7F2] text-[#1A1816]",
    obsidian: "bg-[#09090B] text-[#FAF7F2]",
    sepia: "bg-[#F8F1E5] text-[#3C2F1D]",
    maroon: "bg-[#2D0B14] text-[#FDF2F4]",
  };

  // Engagement states
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isZen, setIsZen] = useState(false);

  // Keyboard shortcut: Press Escape to exit Zen Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isZen) {
        setIsZen(false);
        toast.info("Exited Zen Mode");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZen]);

  // Chapters & Active Chapter
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapterId, setActiveChapterId] = useState<string>("chapter-intro");

  const handleRegisterChapters = useCallback((chaps: Chapter[]) => {
    setChapters((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(chaps)) return prev;
      return chaps;
    });
  }, []);

  // Track global scroll position (Throttled via requestAnimationFrame)
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (totalHeight > 0) {
            const pct = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
            setScrollProgress(pct);

            for (const ch of chapters) {
              const el = document.getElementById(ch.id);
              if (el) {
                const rect = el.getBoundingClientRect();
                if (rect.top <= 280 && rect.bottom >= 100) {
                  setActiveChapterId((prev) => (prev !== ch.id ? ch.id : prev));
                  break;
                }
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [chapters]);

  // Load engagement state
  useEffect(() => {
    const loadEngagement = async () => {
      try {
        const likeRes = await fetch(`/api/likes?storyId=${story.id}`, {
          headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
        });
        if (likeRes.ok) {
          const data = await likeRes.json();
          setLikeCount(data.count ?? 0);
          setIsLiked(data.liked ?? false);
        }
      } catch {
        /* ignore */
      }
    };

    void loadEngagement();
  }, [story.id, story.slug, session]);

  const handleToggleBookmark = async () => {
    if (!session) {
      toast.error("Please login to bookmark stories");
      return;
    }
    const next = !isBookmarked;
    setIsBookmarked(next);
    toast.success(next ? "Added to your reading list" : "Removed from bookmarks");
    try {
      await fetch("/api/bookmarks", {
        method: next ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ storyId: story.id }),
      });
    } catch {
      /* ignore */
    }
  };

  const handleToggleLike = async () => {
    const next = !isLiked;
    setIsLiked(next);
    setLikeCount((c) => (next ? c + 1 : Math.max(0, c - 1)));
    try {
      await fetch("/api/likes", {
        method: next ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: session ? `Bearer ${session.access_token}` : "",
        },
        body: JSON.stringify({ storyId: story.id }),
      });
    } catch {
      /* ignore */
    }
  };

  const handleSelectChapter = (id: string) => {
    setActiveChapterId(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Sidebar visible ONLY after Hero threshold (scrollProgress > 12%)
  const isPastHero = scrollProgress > 12;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen ${themeClasses[readerTheme]} transition-colors duration-500 relative selection:bg-[#D32F2F] selection:text-white overflow-x-hidden`}
    >
      {/* Top Thin Premium Progress Line */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-black/30 z-50 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#D32F2F] via-[#D4AF37] to-[#D32F2F] transition-all duration-100 shadow-md shadow-[#D4AF37]/40"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Persistent Floating Exit Zen Mode Button (Always visible when in Zen Mode) */}
      <AnimatePresence>
        {isZen && (
          <motion.button
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            onClick={() => setIsZen(false)}
            className="fixed top-6 right-6 z-[99999] px-4 py-2 rounded-full bg-[#D32F2F] text-white font-bold text-xs shadow-2xl shadow-[#D32F2F]/50 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20"
          >
            <Minimize className="w-4 h-4" />
            <span>Exit Zen Mode (ESC)</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Left Sticky Vertical Chapter Timeline (ONLY visible AFTER Hero section and NOT in Zen mode) */}
      {!isZen && (
        <StoryChapterTimeline
          chapters={chapters}
          activeChapterId={activeChapterId}
          scrollProgress={scrollProgress}
          onSelectChapter={handleSelectChapter}
          visible={isPastHero}
        />
      )}

      {/* Right Sticky Reader Highlights & Notes Panel (ONLY visible AFTER Hero section and NOT in Zen mode) */}
      {!isZen && (
        <StoryHighlightPanel
          storyId={story.id}
          storyTitle={localizedStory.title}
          authorName={localizedStory.authorName || "India Story Project"}
          visible={isPastHero}
        />
      )}

      {/* Text Selection Menu for Highlighting / Quotes / Dictionary / Citations */}
      <StoryTextSelectionToolbar
        storyId={story.id}
        storyTitle={localizedStory.title}
        authorName={localizedStory.authorName || "India Story Project"}
        onBookmarkToggle={handleToggleBookmark}
        isBookmarked={isBookmarked}
      />

      {/* 1. Ultra-Cinematic Hero Section (Starts at top: 0 with 0px cropping and NO top black gap) */}
      <StoryHero
        story={localizedStory}
        onBookmarkToggle={handleToggleBookmark}
        isBookmarked={isBookmarked}
        onLikeToggle={handleToggleLike}
        isLiked={isLiked}
        likeCount={likeCount}
      />

      {/* Floating Reader Controls Bar (Atmosphere, Font size, Font family, Zen Toggle - Rendered below Hero) */}
      <StoryReaderBar
        theme={readerTheme}
        onThemeChange={setReaderTheme}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        fontFamily={fontFamily}
        onFontFamilyChange={setFontFamily}
        isZen={isZen}
        onZenToggle={() => setIsZen(!isZen)}
      />

      {/* Main Container */}
      <main className="container mx-auto px-4 lg:px-12 py-8 max-w-6xl space-y-16">
        {/* 2. Rhythmic Story Content & Media Flow */}
        <StoryRhythmContent
          story={localizedStory}
          fontSizeClass={fontSizeClass}
          fontFamily={fontFamily}
          activeChapterId={activeChapterId}
          onChapterRegister={handleRegisterChapters}
        />

        {/* 3. Storyteller Spotlight & Bio Card */}
        <StoryAuthorSpotlight story={localizedStory} />

        {/* 4. Real-time Impact & Reader Counters */}
        <StoryImpactCounters story={localizedStory} likeCount={likeCount} />

        {/* 5. Netflix-Style Handpicked Recommendation Carousel */}
        <NetflixStoryCarousel stories={activeStories} currentStoryId={story.id} />

        {/* 6. Cinematic Ending & Story Finale */}
        <CinematicEnding
          story={localizedStory}
          onLikeToggle={handleToggleLike}
          isLiked={isLiked}
          likeCount={likeCount}
        />
      </main>
    </motion.div>
  );
}
