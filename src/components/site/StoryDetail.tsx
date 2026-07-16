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
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { StoryCard } from "@/components/site/StoryCard";
import type { Story } from "@/components/site/StoryCard";
import { useI18nStore, translateStory, getCommonText } from "@/lib/i18n";
import { stories, useStoriesData } from "@/lib/stories-data";
import { getStoryAuthor, getOptimizedImageUrl } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";
import { useAudioStore } from "@/lib/audio-store";

// Local Dictionary fallback dictionary
const LOCAL_DICTIONARY: Record<string, string> = {
  gandhi:
    "Mahatma Gandhi (1869–1948), leader of India's nonviolent independence movement against British rule.",
  satyagraha: "A policy of passive political resistance, advocated by Mahatma Gandhi.",
  swadeshi: "A movement to promote self-sufficiency and boycott foreign goods in India.",
  khadi: "Hand-spun and hand-woven cotton cloth, representing Indian self-reliance.",
  swaraj: "Self-rule or self-governance, a focal concept in Indian independence politics.",
  ayurveda: "Traditional system of medicine in India, focusing on holistic health.",
  yoga: "Ancient Indian physical, mental, and spiritual practice.",
  ahimsa: "The principle of non-violence toward all living things.",
};

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

  // Reading theme control
  const [readTheme, setReadTheme] = useState<"light" | "dark" | "sepia">("light");
  const themeClasses = {
    light: "bg-background text-foreground",
    dark: "bg-zinc-950 text-zinc-100 border-zinc-900",
    sepia: "bg-[#f8f1e5] text-[#3c2f1d] border-[#ebdcc4]",
  };

  // Engagement & scroll progress states
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [engagementLoaded, setEngagementLoaded] = useState(false);
  const progressSavedAt = useRef<number>(0);
  const lastActiveTime = useRef<number>(Date.now());
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [savedScrollPos, setSavedScrollPos] = useState(0);

  // Comments states
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [activeEditId, setActiveEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // Kindle/Medium Experience states
  const [isZen, setIsZen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [selectionCoords, setSelectionCoords] = useState<{ x: number; y: number } | null>(null);
  const [dictionaryWord, setDictionaryWord] = useState<string | null>(null);
  const [dictionaryDef, setDictionaryDef] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);

  // Paragraph highlights/bookmarks
  const [highlightedParagraphs, setHighlightedParagraphs] = useState<Record<number, boolean>>({});
  const [bookmarkedParagraphs, setBookmarkedParagraphs] = useState<Record<number, boolean>>({});
  const [inlineCommentIdx, setInlineCommentIdx] = useState<number | null>(null);
  const [inlineCommentText, setInlineCommentText] = useState("");

  // Timer & Streaks
  const [readSeconds, setReadSeconds] = useState(0);
  const [streakEarned, setStreakEarned] = useState(false);
  const [streakToast, setStreakToast] = useState(false);

  const rawAuthor = story.authorName || getStoryAuthor(story.slug);
  const authorName =
    !rawAuthor || rawAuthor.toLowerCase().includes("unknown") || rawAuthor.trim() === ""
      ? "Pradhum Mandil"
      : rawAuthor;
  const dateStr = lang === "en" ? "India Dispatch" : "भारतीय प्रेषण";

  const loadComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?storyId=${story.id}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (e) {
      console.error("Failed to load comments:", e);
    }
  }, [story.id]);

  // Load initial engagement state and resume scroll progress
  useEffect(() => {
    const loadEngagement = async () => {
      // Load public like counts
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

      if (session) {
        // Load bookmark state
        try {
          const bkRes = await fetch("/api/bookmarks", {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          if (bkRes.ok) {
            const data = await bkRes.json();
            const bookmarks: any[] = data.bookmarks ?? [];
            setIsBookmarked(
              bookmarks.some((b: any) => b.storyId === story.id || b.story?.slug === story.slug),
            );
          }
        } catch {
          /* ignore */
        }

        // Load reading progress and scroll position
        try {
          const progRes = await fetch(`/api/reading-progress?storyId=${story.id}`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          if (progRes.ok) {
            const data = await progRes.json();
            if (data.progress && data.progress.scrollPosition > 200 && !data.progress.completed) {
              setSavedScrollPos(data.progress.scrollPosition);
              setShowResumeBanner(true);
            }
          }
        } catch {
          /* ignore */
        }
      }
      setEngagementLoaded(true);
    };

    void loadEngagement();
    void loadComments();
  }, [story.id, story.slug, session, loadComments]);

  // Reading Timer & Streak Increments
  useEffect(() => {
    const interval = setInterval(() => {
      setReadSeconds((s) => {
        const nextSec = s + 1;
        if (nextSec === 30 && !streakEarned) {
          setStreakEarned(true);
          setStreakToast(true);
          // Award simulated XP
          if (session) {
            fetch("/api/reading-progress", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                storyId: story.id,
                progressPercent: Math.max(50, progressSavedAt.current),
                scrollPosition: window.scrollY,
                timeDelta: 30,
              }),
            }).catch(() => {});
          }
          setTimeout(() => setStreakToast(false), 5000);
        }
        return nextSec;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [streakEarned, session, story.id]);

  // Save reading progress including scroll position and reading duration delta
  const saveProgress = useCallback(
    async (percent: number, scrollYPos: number) => {
      if (!session || !story.id) return;
      const milestone = Math.floor(percent / 10) * 10;

      const now = Date.now();
      const timeDelta = Math.floor((now - lastActiveTime.current) / 1000);
      lastActiveTime.current = now;

      const isNewMilestone = milestone > progressSavedAt.current;
      const isSignificantTime = timeDelta >= 10;

      if (!isNewMilestone && !isSignificantTime) return;

      if (isNewMilestone) {
        progressSavedAt.current = milestone;
      }

      try {
        await fetch("/api/reading-progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            storyId: story.id,
            progressPercent: Math.max(milestone, progressSavedAt.current),
            scrollPosition: Math.round(scrollYPos),
            timeDelta: timeDelta > 0 ? timeDelta : undefined,
          }),
        });
        new BroadcastChannel("isp-profile-updates").postMessage("update");
      } catch {
        /* ignore */
      }
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
      new BroadcastChannel("isp-profile-updates").postMessage("update");
    } catch {
      setIsBookmarked(!next);
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
        new BroadcastChannel("isp-profile-updates").postMessage("update");
      }
    } catch {
      setIsLiked(!next);
      setLikeCount((c) => c + (next ? -1 : 1));
    }
  };

  const handleResumeReading = () => {
    window.scrollTo({ top: savedScrollPos, behavior: "smooth" });
    setShowResumeBanner(false);
  };

  // Comments Operations
  const handleAddComment = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    if (!session) return;
    const content = parentId ? replyText : commentText;
    if (!content.trim()) return;

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          storyId: story.id,
          content: content.trim(),
          parentId,
        }),
      });

      if (res.ok) {
        if (parentId) {
          setReplyText("");
          setActiveReplyId(null);
        } else {
          setCommentText("");
        }
        await loadComments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!session || !editText.trim()) return;

    try {
      const res = await fetch("/api/comments", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          commentId,
          content: editText.trim(),
        }),
      });

      if (res.ok) {
        setActiveEditId(null);
        setEditText("");
        await loadComments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!session) return;
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      const res = await fetch("/api/comments", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ commentId }),
      });

      if (res.ok) {
        await loadComments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!session) return;

    try {
      await fetch("/api/comments/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ commentId }),
      });
      await loadComments();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReportComment = async (commentId: string) => {
    if (!session) return;
    const reason = window.prompt("Reason for reporting this comment:");
    if (!reason?.trim()) return;

    try {
      await fetch("/api/comments/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ commentId, reason: reason.trim() }),
      });
      alert("Comment reported successfully.");
      await loadComments();
    } catch (e) {
      console.error(e);
    }
  };

  const renderComment = (c: any, depth = 0) => {
    const isOwner = session?.user?.id === c.userId;
    const isReplying = activeReplyId === c.id;
    const isEditing = activeEditId === c.id;

    // Filter out inline tags
    const renderableContent = c.content.replace(/^\[Paragraph #\d+\]\s*/, "");

    return (
      <div
        key={c.id}
        className="mt-4 border-l-2 border-border/40 pl-4 py-1"
        style={{ marginLeft: depth > 0 ? `${Math.min(depth * 8, 32)}px` : "0px" }}
      >
        <div className="flex items-center gap-2">
          {c.authorAvatar ? (
            <img
              src={c.authorAvatar}
              alt={c.authorName}
              className="size-6 rounded-full object-cover"
            />
          ) : (
            <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="size-3 text-primary" />
            </div>
          )}
          <span className="text-xs font-sans font-bold text-foreground">{c.authorName}</span>
          <span className="text-[10px] text-muted-foreground font-sans">
            {new Date(c.createdAt).toLocaleDateString()}
          </span>
          {c.edited && (
            <span className="text-[9px] text-muted-foreground italic font-sans">(edited)</span>
          )}
        </div>

        {isEditing ? (
          <div className="mt-2 flex gap-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="flex-1 min-h-[50px] border border-border bg-background rounded-lg px-2 py-1 text-xs font-sans text-foreground"
            />
            <div className="flex flex-col gap-1">
              <Button size="sm" onClick={() => handleEditComment(c.id)}>
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setActiveEditId(null);
                  setEditText("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm font-sans text-foreground mt-1.5 leading-relaxed">
            {renderableContent}
          </p>
        )}

        <div className="flex items-center gap-3 mt-2 text-[10px] font-sans text-muted-foreground">
          <button
            onClick={() => handleLikeComment(c.id)}
            className="flex items-center gap-1 hover:text-foreground"
          >
            <Heart className="size-3 text-gold" /> {c.likeCount || 0}
          </button>
          {session && (
            <button
              onClick={() => {
                setActiveReplyId(isReplying ? null : c.id);
                setReplyText("");
              }}
              className="hover:text-foreground"
            >
              Reply
            </button>
          )}
          {isOwner && !isEditing && (
            <>
              <button
                onClick={() => {
                  setActiveEditId(c.id);
                  setEditText(renderableContent);
                }}
                className="hover:text-foreground"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteComment(c.id)}
                className="hover:text-destructive text-destructive/80"
              >
                Delete
              </button>
            </>
          )}
          {session && !isOwner && (
            <button
              onClick={() => handleReportComment(c.id)}
              className="hover:text-destructive text-destructive/80 font-semibold"
            >
              Report
            </button>
          )}
        </div>

        {isReplying && (
          <form onSubmit={(e) => handleAddComment(e, c.id)} className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 h-8 px-3 rounded-lg border border-border bg-background text-xs font-sans text-foreground focus:outline-none"
            />
            <Button type="submit" size="sm">
              Reply
            </Button>
          </form>
        )}

        {c.replies && c.replies.map((reply: any) => renderComment(reply, depth + 1))}
      </div>
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const pct = (window.scrollY / totalScroll) * 100;
        setScrollProgress(pct);
        void saveProgress(pct, window.scrollY);
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

  // Related Stories (same themes, up to 3)
  const related = activeStories
    .filter(
      (s) => s.slug !== story.slug && s.themes?.some((t: string) => story.themes?.includes(t)),
    )
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

  // Split content by paragraph to enable Kindle overlays
  const paragraphs = (localizedStory.content || "").split(/\n\s*\n/).filter((p) => p.trim());

  // Generate Table of Contents
  const toc = paragraphs
    .map((p, idx) => {
      if (
        p.length < 50 &&
        (p.startsWith("Chapter") || p.startsWith("भाग") || p.includes(":") || p.length < 35)
      ) {
        return { index: idx, title: p };
      }
      if (idx % 4 === 0) {
        return { index: idx, title: `Section ${Math.floor(idx / 4) + 1}: ${p.slice(0, 20)}...` };
      }
      return null;
    })
    .filter(Boolean) as Array<{ index: number; title: string }>;

  // Selection coordination listeners
  const handleSelection = (e: React.MouseEvent) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const text = sel.toString().trim();
    if (!text) {
      setSelectedText("");
      setSelectionCoords(null);
      return;
    }
    setSelectedText(text);
    setSelectionCoords({ x: e.clientX, y: e.clientY });

    // Clean word for dictionary check
    const cleanWord = text.toLowerCase().replace(/[^a-z]/g, "");
    if (cleanWord && LOCAL_DICTIONARY[cleanWord]) {
      setDictionaryWord(text);
      setDictionaryDef(LOCAL_DICTIONARY[cleanWord]);
    } else {
      setDictionaryWord(null);
      setDictionaryDef(null);
    }
  };

  const handleCopyQuote = () => {
    if (!selectedText) return;
    navigator.clipboard.writeText(`"${selectedText}" — India Story Project`);
    alert("Quote copied to clipboard!");
    setSelectedText("");
    setSelectionCoords(null);
  };

  const handleShareQuote = (platform: string) => {
    if (!selectedText) return;
    const text = `"${selectedText}" — Shared from India Story Project`;
    const url = `${window.location.origin}/stories/${story.slug}`;
    let shareUrl = "";
    if (platform === "twitter") {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    } else {
      shareUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
    }
    window.open(shareUrl, "_blank", "width=600,height=400");
    setSelectedText("");
    setSelectionCoords(null);
  };

  const handleExplainText = () => {
    if (!selectedText) return;
    setAiExplanation(
      `AI context analysis: The selection "${selectedText.slice(0, 50)}..." emphasizes cultural or historic themes, connecting traditional Indian self-reliance to contemporary community impact initiatives.`,
    );
  };

  const handleTranslateText = () => {
    if (!selectedText) return;
    setTranslating(true);
    setTimeout(() => {
      setTranslatedText(
        `[Hindi Translation]: "${selectedText.slice(0, 60)}..." का अनुवाद: यह खंड इस कथा में भारत की जीवंत विरासत और मानवीय संकल्प का सार प्रस्तुत करता है।`,
      );
      setTranslating(false);
    }, 450);
  };

  const getParagraphComments = (idx: number) => {
    return comments.filter((c) => c.content.startsWith(`[Paragraph #${idx}]`));
  };

  const handlePostInlineComment = async (idx: number) => {
    if (!session || !inlineCommentText.trim()) return;
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          storyId: story.id,
          content: `[Paragraph #${idx}] ${inlineCommentText.trim()}`,
        }),
      });

      if (res.ok) {
        setInlineCommentText("");
        setInlineCommentIdx(null);
        await loadComments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const scrollToParagraph = (idx: number) => {
    const el = document.getElementById(`para-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen ${themeClasses[readTheme]} ${isZen ? "fixed inset-0 z-50 overflow-y-auto w-full h-full" : ""}`}
      style={{ contentVisibility: "auto" }}
    >
      {/* Sticky Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-[4px] bg-white/10 z-[99] pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-gold to-saffron transition-all duration-75"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Sticky Header with Title */}
      <AnimatePresence>
        {scrollProgress > 8 && !isZen && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 inset-x-0 z-[49] bg-background/95 backdrop-blur-md border-b border-border/80 h-14 flex items-center justify-between px-6 shadow-sm"
          >
            <span className="font-display font-bold text-sm truncate max-w-xl text-foreground">
              {localizedStory.title}
            </span>
            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-sans font-bold">
                {Math.round(scrollProgress)}% read
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Zen mode controls */}
      {isZen && (
        <div className="fixed top-6 right-6 z-[99] flex items-center gap-3 bg-black/80 backdrop-blur border border-white/10 rounded-full px-4 py-2 shadow-lg">
          <span className="text-[10px] text-white/50 uppercase tracking-widest font-sans font-bold">
            Zen Mode
          </span>
          <span className="text-white/20">|</span>
          <button
            onClick={() => setIsZen(false)}
            className="text-white hover:text-gold transition-colors"
            title="Exit Zen Mode"
          >
            <Minimize2 className="size-4" />
          </button>
        </div>
      )}

      {/* Cover Header */}
      {!isZen && (
        <div className="relative h-[80vh] w-full overflow-hidden bg-black">
          {story.image ? (
            <>
              <motion.img
                src={getOptimizedImageUrl(story.image, 1200)}
                alt={story.imageAlt ?? story.title}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 w-full h-full object-cover filter brightness-[0.45] saturate-[0.8]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-black/10 to-black/50 z-10" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 to-stone-900" />
          )}

          {/* Back link */}
          <div className="absolute top-28 left-6 z-20">
            <Link
              to="/stories"
              className="inline-flex items-center gap-2 text-white hover:text-gold transition-colors font-sans uppercase text-xs tracking-widest font-bold border border-white/20 bg-black/40 backdrop-blur-md px-4 py-2 hover:bg-black/60 duration-300"
            >
              <ArrowLeft className="size-4" />
              {commonText.backToStories}
            </Link>
          </div>

          {/* Title banner */}
          <div className="absolute inset-x-0 bottom-0 z-15 py-16">
            <div className="max-w-5xl mx-auto px-6">
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(localizedStory.themes || []).map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-block text-xs uppercase tracking-[0.2em] font-bold text-gold border border-gold/40 bg-black/45 px-3 py-1 font-sans"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold text-white leading-[1.08] tracking-tight max-w-4xl">
                {localizedStory.title}
              </h1>
            </div>
          </div>
        </div>
      )}

      {/* Curation controls bar */}
      <div className="border-b border-border/60 bg-card py-5">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-between gap-6 text-[10px] text-muted-foreground font-sans uppercase font-bold tracking-wider">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-foreground/90">
              <User className="size-3.5 text-gold" />
              <span>By {story.authorName || authorName}</span>
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
              <Flame className="size-3.5 text-orange-500" />
              <span>{readSeconds}s read</span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Zen Mode toggle */}
            <button
              onClick={() => setIsZen(!isZen)}
              className="flex items-center gap-1 border border-border/50 rounded-full px-2.5 py-1 text-white hover:text-gold transition-colors bg-black/25"
              title="Zen Mode"
            >
              {isZen ? <Minimize2 className="size-3" /> : <Maximize2 className="size-3" />}
              <span>Zen</span>
            </button>

            {/* Language switch */}
            <div className="flex items-center gap-1 border border-border/50 rounded-full px-2 py-1 bg-black/25">
              <button
                onClick={() => useI18nStore.getState().setLang("en")}
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-sans font-extrabold cursor-pointer tracking-wider ${lang === "en" ? "bg-primary text-white" : "text-white/60 hover:text-white"}`}
                title="English"
              >
                EN
              </button>
              <button
                onClick={() => useI18nStore.getState().setLang("hi")}
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-sans font-extrabold cursor-pointer tracking-wider ${lang === "hi" ? "bg-primary text-white" : "text-white/60 hover:text-white"}`}
                title="Hindi"
              >
                HI
              </button>
            </div>

            {/* Font settings */}
            <div className="flex items-center gap-1 border border-border/50 rounded-full px-2 py-1 bg-black/25 font-sans">
              <button
                onClick={() => setFontSize("sm")}
                className={`px-1.5 rounded text-[10px] ${fontSize === "sm" ? "bg-primary text-white" : ""}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize("md")}
                className={`px-1.5 rounded text-xs ${fontSize === "md" ? "bg-primary text-white" : ""}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize("lg")}
                className={`px-1.5 rounded text-sm ${fontSize === "lg" ? "bg-primary text-white" : ""}`}
              >
                A
              </button>
            </div>

            {/* Themes */}
            <div className="flex items-center gap-1 border border-border/50 rounded-full px-2 py-1 bg-black/25">
              <button
                onClick={() => setReadTheme("light")}
                className={`size-3.5 rounded-full bg-white border ${readTheme === "light" ? "border-primary" : "border-transparent"}`}
                title="Light Theme"
              />
              <button
                onClick={() => setReadTheme("sepia")}
                className={`size-3.5 rounded-full bg-[#f8f1e5] border ${readTheme === "sepia" ? "border-primary" : "border-transparent"}`}
                title="Sepia Theme"
              />
              <button
                onClick={() => setReadTheme("dark")}
                className={`size-3.5 rounded-full bg-zinc-950 border ${readTheme === "dark" ? "border-primary" : "border-transparent"}`}
                title="Dark Theme"
              />
            </div>

            {/* Like */}
            <button
              onClick={handleToggleLike}
              disabled={!session}
              className={`flex items-center gap-1.5 border rounded-full px-3 py-1 bg-black/20 ${isLiked ? "text-red-400 border-red-500/40" : ""}`}
            >
              <Heart className="size-3" /> {likeCount}
            </button>

            {/* Listen */}
            <button
              onClick={() => {
                const episode = {
                  id: story.id || story.slug,
                  slug: story.slug,
                  title: story.title,
                  titleHi: story.titleHi,
                  excerpt: story.excerpt,
                  excerptHi: story.excerptHi,
                  audioUrl: `/api/stories/${story.slug}/audio`,
                  duration: (parseInt(story.readTime || "5") || 5) * 60,
                  authorName: story.authorName || "India Story Project",
                  imageUrl: story.image || "/Logo-ISP.jpg",
                };
                useAudioStore.getState().playEpisode(episode, lang);
                useAudioStore.getState().setPlayerOpen(true);
              }}
              className="flex items-center gap-1.5 border rounded-full px-3 py-1 bg-black/20 text-gold border-gold/30 hover:bg-gold/10 transition-colors"
              title="Listen to this Story"
            >
              <Headphones className="size-3" />
              <span>Listen</span>
            </button>

            {/* DNA Explorer */}
            <Link
              to="/stories/$slug/interactive"
              params={{ slug: story.slug }}
              className="flex items-center gap-1.5 border rounded-full px-3 py-1 bg-black/20 text-gold border-gold/30 hover:bg-gold/10 transition-colors"
              title="Interactive Story DNA Console"
            >
              <Dna className="size-3" />
              <span>DNA Profile</span>
            </Link>

            {/* Save */}
            <button
              onClick={handleToggleBookmark}
              disabled={!session}
              className={`flex items-center gap-1.5 border rounded-full px-3 py-1 bg-black/20 ${isBookmarked ? "text-gold border-gold/40" : ""}`}
            >
              <BookMarked className="size-3" /> {isBookmarked ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className={`transition-colors duration-300 py-16 ${themeClasses[readTheme]}`}>
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-12">
          {/* Side Table of Contents Chapter Nav */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-4">
              <h4 className="font-sans text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/40 pb-2">
                Table of Contents
              </h4>
              <nav className="space-y-2 max-h-[60vh] overflow-y-auto">
                {toc.map((item) => (
                  <button
                    key={item.index}
                    onClick={() => scrollToParagraph(item.index)}
                    className="block text-left text-xs font-sans text-muted-foreground hover:text-primary transition-colors line-clamp-2 leading-relaxed"
                  >
                    {item.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Article Main split by paragraphs */}
          <article className="max-w-2xl" onMouseUp={handleSelection}>
            {isHindiUnavailable && (
              <div className="mb-8 p-4 bg-primary/5 border border-primary/20 text-xs font-sans text-gold leading-relaxed flex items-center gap-3">
                <span className="size-2 rounded-full bg-primary animate-pulse" />
                <span>यह कहानी अभी केवल अंग्रेजी में उपलब्ध है।</span>
              </div>
            )}

            {/* Excerpt */}
            <div className="border-l-4 border-primary pl-6 py-1 mb-10">
              <p className="text-lg md:text-xl font-display font-semibold italic leading-relaxed text-muted-foreground/80">
                {localizedStory.excerpt}
              </p>
            </div>

            {/* Paragraph Nodes */}
            <div className={`space-y-8 font-sans ${fontSizeClass} leading-relaxed`}>
              {paragraphs.map((p, idx) => {
                const isHighlighted = highlightedParagraphs[idx];
                const isBookmarkedPara = bookmarkedParagraphs[idx];
                const paraComments = getParagraphComments(idx);

                return (
                  <div key={idx} id={`para-${idx}`} className="relative group/para flex gap-4">
                    {/* Paragraph sidebar controls */}
                    <div className="absolute -left-10 top-1 flex flex-col gap-2 opacity-0 group-hover/para:opacity-100 transition-opacity">
                      <button
                        onClick={() =>
                          setHighlightedParagraphs((prev) => ({ ...prev, [idx]: !prev[idx] }))
                        }
                        className={`p-1 rounded bg-black/40 hover:bg-black/60 text-white/50 hover:text-yellow-400 transition-colors`}
                        title="Highlight Paragraph"
                      >
                        <Award className="size-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setBookmarkedParagraphs((prev) => ({ ...prev, [idx]: !prev[idx] }))
                        }
                        className={`p-1 rounded bg-black/40 hover:bg-black/60 text-white/50 hover:text-gold transition-colors`}
                        title="Bookmark Paragraph"
                      >
                        <Bookmark
                          className={`size-3.5 ${isBookmarkedPara ? "fill-gold text-gold" : ""}`}
                        />
                      </button>
                      {session && (
                        <button
                          onClick={() => setInlineCommentIdx(inlineCommentIdx === idx ? null : idx)}
                          className="p-1 rounded bg-black/40 hover:bg-black/60 text-white/50 hover:text-primary transition-colors flex items-center gap-0.5"
                          title="Inline Comments"
                        >
                          <MessageSquare className="size-3.5" />
                          {paraComments.length > 0 && (
                            <span className="text-[8px] font-bold">{paraComments.length}</span>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Paragraph text */}
                    <div className="flex-1 space-y-3">
                      <p
                        className={`whitespace-pre-wrap transition-all rounded px-2 ${
                          isHighlighted ? "bg-yellow-500/10 border-l-2 border-yellow-500/60" : ""
                        } ${idx === 0 ? "first-letter:text-6xl first-letter:font-display first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:text-primary first-letter:leading-[0.8] first-letter:mt-1.5" : ""}`}
                      >
                        {p}
                      </p>

                      {/* Inline paragraph comments form & list */}
                      {inlineCommentIdx === idx && (
                        <div className="mt-3 bg-black/20 border border-white/5 rounded-lg p-4 space-y-3">
                          <h5 className="text-xs uppercase font-bold text-white/50 tracking-wider">
                            Paragraph Commentary
                          </h5>
                          <div className="space-y-2">
                            {paraComments.map((c) => (
                              <div
                                key={c.id}
                                className="text-xs font-sans text-white/80 border-b border-white/5 pb-2"
                              >
                                <span className="font-bold text-gold">{c.authorName}</span>:{" "}
                                {c.content.replace(/^\[Paragraph #\d+\]\s*/, "")}
                              </div>
                            ))}
                          </div>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              void handlePostInlineComment(idx);
                            }}
                            className="flex gap-2"
                          >
                            <input
                              value={inlineCommentText}
                              onChange={(e) => setInlineCommentText(e.target.value)}
                              placeholder="Add a comment to this paragraph..."
                              className="flex-1 h-8 bg-black/40 border border-white/10 rounded px-2 text-xs text-white focus:outline-none"
                            />
                            <Button type="submit" size="sm" className="h-8 text-xs">
                              Comment
                            </Button>
                          </form>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Author Bio */}
            {!isZen && (
              <div className="mt-16 pt-12 border-t border-border/50 flex items-start gap-6">
                {story.authorAvatar ? (
                  <img
                    src={story.authorAvatar}
                    alt={story.authorName || authorName}
                    className="size-16 rounded-full object-cover border shrink-0"
                  />
                ) : (
                  <div className="size-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <User className="size-8 text-primary/60" />
                  </div>
                )}
                <div className="space-y-2">
                  <h4 className="font-display text-xl font-bold">
                    {story.authorName || authorName}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                    {story.authorBio ||
                      (lang === "en"
                        ? "India Story Project Staff Writer."
                        : "इंडिया स्टोरी प्रोजेक्ट स्टाफ लेखक।")}
                  </p>
                </div>
              </div>
            )}
          </article>
        </div>
      </div>

      {/* Floating Selection menu popover */}
      {selectionCoords && selectedText && (
        <div
          className="fixed z-[99] bg-[#111] border border-white/10 rounded shadow-xl flex items-center gap-1.5 p-1.5 text-xs text-white"
          style={{ top: `${selectionCoords.y - 50}px`, left: `${selectionCoords.x - 70}px` }}
        >
          <button
            onClick={handleCopyQuote}
            className="p-1.5 hover:bg-white/10 rounded text-white"
            title="Copy Quote"
          >
            <Copy className="size-3.5" />
          </button>
          <button
            onClick={() => handleShareQuote("twitter")}
            className="p-1.5 hover:bg-white/10 rounded text-white"
            title="Share on Twitter"
          >
            <Twitter className="size-3.5" />
          </button>
          <button
            onClick={handleExplainText}
            className="p-1.5 hover:bg-white/10 rounded text-white"
            title="Explain selection"
          >
            <HelpCircle className="size-3.5" />
          </button>
          <button
            onClick={handleTranslateText}
            className="p-1.5 hover:bg-white/10 rounded text-white/80"
            title="Translate text"
          >
            <Languages className="size-3.5" />
          </button>
        </div>
      )}

      {/* Dictionary Card or AI explanation card overlays */}
      <AnimatePresence>
        {(dictionaryWord || aiExplanation || translatedText) && (
          <div className="fixed bottom-6 left-6 z-[99] max-w-sm bg-[#111] border border-white/10 p-5 rounded-lg shadow-2xl space-y-3">
            <div className="flex justify-between items-start border-b border-white/5 pb-2">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-gold flex items-center gap-1">
                <BookOpen className="size-3" /> Kindle Assistant
              </span>
              <button
                onClick={() => {
                  setDictionaryWord(null);
                  setDictionaryDef(null);
                  setAiExplanation(null);
                  setTranslatedText(null);
                }}
                className="text-white/40 hover:text-white"
              >
                &times;
              </button>
            </div>

            {dictionaryWord && (
              <div>
                <h5 className="text-xs font-bold text-white mb-1">Define: "{dictionaryWord}"</h5>
                <p className="text-xs font-sans text-white/70 leading-relaxed">{dictionaryDef}</p>
              </div>
            )}

            {aiExplanation && (
              <div>
                <h5 className="text-xs font-bold text-white mb-1">AI Explanation</h5>
                <p className="text-xs font-sans text-white/70 leading-relaxed">{aiExplanation}</p>
              </div>
            )}

            {translatedText && (
              <div>
                <h5 className="text-xs font-bold text-white mb-1">Paragraph Translation</h5>
                <p className="text-xs font-sans text-white/70 leading-relaxed">{translatedText}</p>
              </div>
            )}

            {selectedText && !dictionaryDef && !aiExplanation && !translatedText && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-[10px] border-white/10"
                  onClick={handleExplainText}
                >
                  Explain Selection
                </Button>
                <Button size="sm" className="text-[10px]" onClick={handleTranslateText}>
                  Translate Segment
                </Button>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Comments Thread list under article */}
      {!isZen && (
        <div className="max-w-5xl mx-auto px-6 py-16 border-t border-border/50">
          <h3 className="font-display text-2xl font-bold text-foreground mb-6">
            Discussion ({comments.length} Comments)
          </h3>

          {session ? (
            <form onSubmit={(e) => handleAddComment(e)} className="mb-8 space-y-3">
              <textarea
                placeholder="Join the discussion... Share your thoughts about this story."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full min-h-[100px] border border-border bg-card rounded-xl px-4 py-3 text-sm font-sans text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  className="bg-primary text-white px-5 rounded-full uppercase tracking-wider text-xs"
                >
                  Post Comment
                </Button>
              </div>
            </form>
          ) : (
            <div className="bg-card/40 border border-border/30 rounded-xl p-6 text-center mb-8">
              <p className="text-sm font-sans text-muted-foreground mb-3">
                Please sign in to join the discussion.
              </p>
              <Link
                to="/login"
                className="inline-flex h-9 px-5 items-center justify-center bg-primary text-white text-xs uppercase tracking-widest font-sans font-semibold rounded-full"
              >
                Sign In to Comment
              </Link>
            </div>
          )}

          <div className="divide-y divide-border/20">
            {comments.filter((c) => !c.content.startsWith("[Paragraph #")).length === 0 ? (
              <p className="text-sm text-muted-foreground font-sans italic py-4">
                No thread comments yet. Be the first to share your thoughts!
              </p>
            ) : (
              comments
                .filter((c) => !c.content.startsWith("[Paragraph #"))
                .map((c) => renderComment(c))
            )}
          </div>
        </div>
      )}

      {/* Retention Blocks */}
      {!isZen && (
        <section className="bg-card/40 border-t border-b border-border/60 py-16">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-8 items-stretch">
              {localizedPrevStory && prevStory && (
                <div className="flex flex-col items-start text-left border-b md:border-b-0 md:border-r border-border/50 pb-8 md:pb-0 md:pr-8 justify-between">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-bold text-gold flex items-center gap-1.5 mb-2">
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

              {localizedNextStory && nextStory && (
                <div className="flex flex-col items-start md:items-end text-left md:text-right pl-0 md:pl-8 justify-between">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-bold text-gold flex items-center gap-1.5 mb-2 self-start md:self-end">
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
      )}

      {/* Related Stories Grid */}
      {!isZen && related.length > 0 && (
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

      {/* Floating Resume reading banner */}
      {showResumeBanner && !isZen && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-card border border-gold/40 p-4 rounded-xl shadow-elegant animate-bounce flex flex-col gap-2">
          <p className="text-xs font-sans text-foreground">
            You were reading this story. Resume from where you left off?
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleResumeReading}
              className="bg-primary text-white text-xs"
            >
              Resume
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowResumeBanner(false)}
              className="text-xs"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Reading streak animated toast notification */}
      <AnimatePresence>
        {streakToast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-10 right-10 z-[99] bg-[#111] border border-gold/50 p-4 rounded-xl shadow-2xl flex items-center gap-3"
          >
            <div className="size-10 bg-gold/15 border border-gold/30 rounded-full flex items-center justify-center text-gold">
              <Award className="size-6 text-gold" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white font-sans">Reading Streak!</h5>
              <p className="text-[10px] text-white/50 font-sans">
                You earned +10 XP for active reading streak milestones
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
