import { motion } from "framer-motion";
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
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { StoryCard } from "@/components/site/StoryCard";
import type { Story } from "@/components/site/StoryCard";
import { useI18nStore, translateStory, getCommonText } from "@/lib/i18n";
import { stories, useStoriesData } from "@/lib/stories-data";
import { getStoryAuthor } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";

export function StoryDetail({ story }: { story: Story }) {
  const { stories: dbStories } = useStoriesData();
  const activeStories = dbStories.length > 0 ? dbStories : stories;
  const [scrollProgress, setScrollProgress] = useState(0);
  const lang = useI18nStore((s) => s.lang);
  const localizedStory = translateStory(story, lang);
  const commonText = getCommonText(lang);
  const { session } = useAuthStore();

  // Font size control
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");
  const fontSizeClass = { sm: "text-base", md: "text-lg", lg: "text-xl" }[fontSize];

  // Engagement state
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [engagementLoaded, setEngagementLoaded] = useState(false);
  const progressSavedAt = useRef<number>(0);

  const authorName = getStoryAuthor(story.slug);
  const dateStr = lang === "en" ? "India Dispatch" : "भारतीय प्रेषण";

  // Load initial engagement state
  useEffect(() => {
    const loadEngagement = async () => {
      // Load like count (public)
      try {
        const likeRes = await fetch(`/api/likes?storyId=${story.id}`, {
          headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
        });
        if (likeRes.ok) {
          const data = await likeRes.json();
          setLikeCount(data.count ?? 0);
          setIsLiked(data.liked ?? false);
        }
      } catch {/* ignore */}

      // Load bookmark state (authenticated only)
      if (session) {
        try {
          const bkRes = await fetch("/api/bookmarks", {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          if (bkRes.ok) {
            const data = await bkRes.json();
            const bookmarks: any[] = data.bookmarks ?? [];
            setIsBookmarked(bookmarks.some((b: any) => b.storyId === story.id || b.story?.slug === story.slug));
          }
        } catch {/* ignore */}
      }
      setEngagementLoaded(true);
    };
    void loadEngagement();
  }, [story.id, story.slug, session]);

  // Save reading progress every 10% milestone
  const saveProgress = useCallback(
    async (percent: number) => {
      if (!session || !story.id) return;
      const milestone = Math.floor(percent / 10) * 10;
      if (milestone <= progressSavedAt.current) return;
      progressSavedAt.current = milestone;
      try {
        await fetch("/api/reading-progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ storyId: story.id, progressPercent: milestone }),
        });
      } catch {/* ignore */}
    },
    [session, story.id],
  );

  const handleToggleBookmark = async () => {
    if (!session) return;
    const next = !isBookmarked;
    setIsBookmarked(next);
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
      setIsBookmarked(!next); // revert on error
    }
  };

  const handleToggleLike = async () => {
    if (!session) return;
    const next = !isLiked;
    setIsLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ storyId: story.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setLikeCount(data.count ?? likeCount);
        setIsLiked(data.liked ?? next);
      }
    } catch {
      setIsLiked(!next);
      setLikeCount((c) => c + (next ? -1 : 1));
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const pct = (window.scrollY / totalScroll) * 100;
        setScrollProgress(pct);
        void saveProgress(pct);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [saveProgress]);

  // Increment view count on mount
  useEffect(() => {
    void fetch(`/api/stories/${story.slug}`, { method: "POST" }).catch((err) =>
      console.error("Failed to register view count hit:", err),
    );
  }, [story.slug]);

  const isHindiUnavailable = lang === "hi" && !story.contentHi;

  // Related Stories (same category, up to 3)
  const related = activeStories
    .filter((s) => s.slug !== story.slug && s.category === story.category)
    .slice(0, 3)
    .map((s) => translateStory(s, lang));

  // Previous and Next Stories (Retention navigation)
  const currentIndex = activeStories.findIndex((s) => s.slug === story.slug);

  const prevIndex =
    activeStories.length > 0
      ? (currentIndex - 1 + activeStories.length) % activeStories.length
      : -1;
  const prevStory = prevIndex >= 0 ? activeStories[prevIndex] : null;
  const localizedPrevStory = prevStory ? translateStory(prevStory, lang) : null;

  const nextIndex = activeStories.length > 0 ? (currentIndex + 1) % activeStories.length : -1;
  const nextStory = nextIndex >= 0 ? activeStories[nextIndex] : null;
  const localizedNextStory = nextStory ? translateStory(nextStory, lang) : null;

  const shareStory = (platform: string) => {
    const url = `${window.location.origin}/stories/${story.slug}`;
    const title = story.title;
    const text = `Check out this inspiring story: ${title}`;

    let shareUrl = "";
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-background text-foreground"
    >
      {/* Sticky Progress Bar at the very top of the window */}
      <div className="fixed top-0 left-0 w-full h-[4px] bg-white/10 z-[99] pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-gold to-saffron transition-all duration-75"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 1. Cinematic Cover Header (Full Screen height minus navbar) */}
      <div className="relative h-[85vh] w-full overflow-hidden bg-black">
        {story.image ? (
          <>
            <motion.img
              src={story.image}
              alt={story.imageAlt ?? story.title}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.45] saturate-[0.8]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-black/10 to-black/50 z-10" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 to-stone-900" />
        )}

        {/* Back Link Overlay */}
        <div className="absolute top-28 left-6 z-20">
          <Link
            to="/stories"
            className="inline-flex items-center gap-2 text-white hover:text-gold transition-colors font-sans uppercase text-xs tracking-widest font-bold border border-white/20 bg-black/40 backdrop-blur-md px-4 py-2 hover:bg-black/60 duration-300"
          >
            <ArrowLeft className="size-4" />
            {commonText.backToStories}
          </Link>
        </div>

        {/* Floating title block at bottom of cinematic image */}
        <div className="absolute inset-x-0 bottom-0 z-15 py-16">
          <div className="max-w-5xl mx-auto px-6">
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-4 text-xs uppercase tracking-[0.2em] font-bold text-gold border border-gold/40 bg-black/45 px-3 py-1 font-sans"
            >
              {localizedStory.category}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl md:text-7xl font-display font-bold text-white leading-[1.08] tracking-tight text-pretty max-w-4xl"
            >
              {localizedStory.title}
            </motion.h1>
          </div>
        </div>
      </div>

      {/* 2. Editorial Metadata Row */}
      <div className="border-b border-border/60 bg-card py-6">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-between gap-6 text-[11px] text-muted-foreground font-sans uppercase font-bold tracking-wider">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-foreground/90">
              <User className="size-3.5 text-gold" />
              <span>
                {lang === "en"
                  ? `By ${story.authorName || authorName}`
                  : `लेखक: ${story.authorName || authorName}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-3.5 text-gold" />
              <span>{localizedStory.region}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-3.5 text-gold" />
              <span>{localizedStory.readTime || "3 min read"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="size-3.5 text-gold" />
              <span>{dateStr}</span>
            </div>
          </div>

          {/* Engagement Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Font size */}
            <div className="flex items-center gap-1 border border-border/50 rounded-full px-2 py-1">
              <button
                onClick={() => setFontSize("sm")}
                className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${fontSize === "sm" ? "bg-primary text-primary-foreground" : "hover:text-foreground"}`}
                aria-label="Small font"
              >
                A
              </button>
              <button
                onClick={() => setFontSize("md")}
                className={`text-xs px-1.5 py-0.5 rounded transition-colors ${fontSize === "md" ? "bg-primary text-primary-foreground" : "hover:text-foreground"}`}
                aria-label="Medium font"
              >
                A
              </button>
              <button
                onClick={() => setFontSize("lg")}
                className={`text-sm px-1.5 py-0.5 rounded transition-colors ${fontSize === "lg" ? "bg-primary text-primary-foreground" : "hover:text-foreground"}`}
                aria-label="Large font"
              >
                A
              </button>
            </div>

            {/* Like button */}
            <button
              onClick={handleToggleLike}
              disabled={!session}
              className={`flex items-center gap-1.5 border rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wider transition-all duration-200 ${
                isLiked
                  ? "border-red-500/40 bg-red-500/10 text-red-500"
                  : "border-border/50 hover:border-red-400/40 hover:text-red-400"
              } ${!session ? "opacity-50 cursor-not-allowed" : ""}`}
              title={session ? undefined : "Sign in to like stories"}
            >
              <Heart className={`size-3.5 ${isLiked ? "fill-current" : ""}`} />
              {likeCount > 0 ? likeCount : "Like"}
            </button>

            {/* Bookmark button */}
            <button
              onClick={handleToggleBookmark}
              disabled={!session}
              className={`flex items-center gap-1.5 border rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wider transition-all duration-200 ${
                isBookmarked
                  ? "border-gold/50 bg-gold/10 text-gold"
                  : "border-border/50 hover:border-gold/40 hover:text-gold"
              } ${!session ? "opacity-50 cursor-not-allowed" : ""}`}
              title={session ? undefined : "Sign in to bookmark stories"}
            >
              <BookMarked className={`size-3.5 ${isBookmarked ? "fill-current" : ""}`} />
              {isBookmarked ? "Saved" : "Save"}
            </button>

            {/* Share */}
            <span className="flex items-center gap-1.5">
              <Share2 className="size-3.5 text-gold" /> {lang === "en" ? "SHARE" : "साझा"}:
            </span>
            <button onClick={() => shareStory("twitter")} className="hover:text-primary transition-colors" aria-label="Share on Twitter">
              TW
            </button>
            <span className="text-muted-foreground/30">|</span>
            <button onClick={() => shareStory("facebook")} className="hover:text-primary transition-colors" aria-label="Share on Facebook">
              FB
            </button>
            <span className="text-muted-foreground/30">|</span>
            <button onClick={() => shareStory("linkedin")} className="hover:text-primary transition-colors" aria-label="Share on LinkedIn">
              LN
            </button>
            <span className="text-muted-foreground/30">|</span>
            <button
              onClick={() => shareStory("whatsapp")}
              className="hover:text-primary transition-colors"
            >
              WA
            </button>
          </div>
        </div>
      </div>

      {/* 3. Story Main Section with Sticky Share Sidebar */}
      <div className="max-w-5xl mx-auto px-6 py-20 relative">
        <div className="grid lg:grid-cols-[100px_1fr] gap-12">
          {/* Sticky left share banner on large screens */}
          <div className="hidden lg:block">
            <div className="sticky top-32 flex flex-col items-center gap-4">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-muted-foreground/80 rotate-90 my-8">
                SHARE
              </span>
              <button
                onClick={() => shareStory("twitter")}
                className="size-10 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-gold transition-all duration-300 shadow-sm"
                title="Share on Twitter"
              >
                <Share2 className="size-4" />
              </button>
              <button
                onClick={() => shareStory("facebook")}
                className="size-10 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-gold transition-all duration-300 shadow-sm"
                title="Share on Facebook"
              >
                FB
              </button>
              <button
                onClick={() => shareStory("whatsapp")}
                className="size-10 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-gold transition-all duration-300 shadow-sm"
                title="Share on WhatsApp"
              >
                WA
              </button>
            </div>
          </div>

          {/* Article Main */}
          <article className="max-w-3xl">
            {/* English Fallback Notice */}
            {isHindiUnavailable && (
              <div className="mb-8 p-4 bg-primary/5 border border-primary/20 text-xs font-sans text-gold leading-relaxed flex items-center gap-3">
                <span className="size-2 rounded-full bg-primary animate-pulse" />
                <span>यह कहानी अभी केवल अंग्रेजी में उपलब्ध है।</span>
              </div>
            )}

            {/* Story Excerpt / Pull quote */}
            <div className="border-l-4 border-primary pl-6 py-1.5 mb-12">
              <p className="text-xl md:text-2xl font-display font-semibold italic leading-relaxed text-muted-foreground/90 text-pretty">
                {localizedStory.excerpt}
              </p>
            </div>

            {/* Dropcapped Rich Text Content */}
            <div className={`prose prose-neutral max-w-none ${fontSizeClass}`}>
              <p className="text-lg md:text-xl text-foreground/90 leading-relaxed font-sans font-normal whitespace-pre-wrap first-letter:text-7xl first-letter:font-display first-letter:font-bold first-letter:float-left first-letter:mr-3.5 first-letter:text-primary first-letter:leading-[0.8] first-letter:mt-1.5">
                {localizedStory.content}
              </p>
            </div>

            {/* Author Bio Section */}
            <div className="mt-16 pt-12 border-t border-border/50 flex items-start gap-6">
              {story.authorAvatar ? (
                <img
                  src={story.authorAvatar}
                  alt={story.authorName || authorName}
                  className="size-16 rounded-full object-cover border border-border/60 shrink-0"
                />
              ) : (
                <div className="size-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <User className="size-8 text-primary/60" />
                </div>
              )}
              <div className="space-y-2">
                <h4 className="font-display text-xl font-bold text-foreground">
                  {story.authorName || authorName}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                  {story.authorBio ||
                    (lang === "en"
                      ? "India Story Project Staff Writer. Dedicated to exploring deep human-interest chronicles across the subcontinent."
                      : "इंडिया स्टोरी प्रोजेक्ट स्टाफ लेखक। उपमहाद्वीप के विभिन्न क्षेत्रों से मानवीय सरोकारों से जुड़ी कहानियों की खोज के लिए समर्पित।")}
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* 4. Previous and Next Stories retention blocks */}
      <section className="bg-card/40 border-t border-b border-border/60 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* Previous link */}
            {localizedPrevStory && prevStory && (
              <div className="flex flex-col items-start text-left border-b md:border-b-0 md:border-r border-border/50 pb-8 md:pb-0 md:pr-8 justify-between">
                <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-bold text-accent flex items-center gap-1.5 mb-2">
                  <ChevronLeft className="size-3.5" />
                  {lang === "en" ? "Previous Story" : "पिछली कहानी"}
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-bold leading-snug hover:text-primary transition-colors flex-1 mb-3">
                  <Link to="/stories/$slug" params={{ slug: prevStory.slug }}>
                    {localizedPrevStory.title}
                  </Link>
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4 font-sans">
                  {localizedPrevStory.excerpt}
                </p>
              </div>
            )}

            {/* Next link */}
            {localizedNextStory && nextStory && (
              <div className="flex flex-col items-start md:items-end text-left md:text-right pl-0 md:pl-8 justify-between">
                <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-bold text-accent flex items-center gap-1.5 mb-2 self-start md:self-end">
                  {lang === "en" ? "Next Story" : "अगली कहानी"}
                  <ChevronRight className="size-3.5" />
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-bold leading-snug hover:text-primary transition-colors flex-1 mb-3">
                  <Link to="/stories/$slug" params={{ slug: nextStory.slug }}>
                    {localizedNextStory.title}
                  </Link>
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4 font-sans">
                  {localizedNextStory.excerpt}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. Related Stories Grid */}
      {related.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 py-24">
          <h3 className="font-display text-3xl font-bold mb-10 border-b border-border pb-4 tracking-tight">
            {commonText.relatedStories}
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {related.map((s, i) => (
              <StoryCard key={s.id} story={s} index={i} />
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
