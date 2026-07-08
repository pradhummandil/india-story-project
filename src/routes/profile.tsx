import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Camera,
  LogOut,
  Shield,
  BookOpen,
  Edit3,
  Globe,
  Twitter,
  Instagram,
  Linkedin,
  BookMarked,
  Heart,
  TrendingUp,
  Flame,
  Star,
  Zap,
  Trophy,
  Calendar,
  BarChart2,
  CheckCircle2,
  Lock,
  ExternalLink,
  Save,
  X,
  MessageSquare,
  UploadCloud,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteLayout } from "@/components/site/Layout";
import { useAuthStore } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase-client";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "My Profile — India Story Project" }],
  }),
  component: ProfilePage,
});

// ─── Badge definitions ─────────────────────────────────────────────────────

const BADGE_DEFINITIONS = [
  { slug: "explorer", name: "Explorer", icon: "🧭", color: "#C8A96A", desc: "Read 5 stories", threshold: 5, field: "storiesRead", rarity: "common" },
  { slug: "researcher", name: "Researcher", icon: "🔬", color: "#6AB4C8", desc: "Read 20 stories", threshold: 20, field: "storiesRead", rarity: "common" },
  { slug: "historian", name: "Historian", icon: "📜", color: "#8B7355", desc: "Read 50 stories", threshold: 50, field: "storiesRead", rarity: "rare" },
  { slug: "story-hunter", name: "Story Hunter", icon: "🎯", color: "#C86A6A", desc: "Read 100 stories", threshold: 100, field: "storiesRead", rarity: "rare" },
  { slug: "top-reader", name: "Top Reader", icon: "📚", color: "#8B0000", desc: "Read 200 stories", threshold: 200, field: "storiesRead", rarity: "epic" },
  { slug: "streak-7", name: "Week Warrior", icon: "🔥", color: "#FF6B35", desc: "7-day reading streak", threshold: 7, field: "readingStreak", rarity: "common" },
  { slug: "streak-30", name: "Monthly Legend", icon: "⚡", color: "#FFB800", desc: "30-day reading streak", threshold: 30, field: "readingStreak", rarity: "epic" },
  { slug: "bookmarker", name: "Curator", icon: "🔖", color: "#6AC8A9", desc: "Bookmark 10 stories", threshold: 10, field: "bookmarksCount", rarity: "common" },
  { slug: "legend", name: "Legend", icon: "👑", color: "#C8A96A", desc: "Reach 1000 XP", threshold: 1000, field: "totalXP", rarity: "legendary" },
];

const RARITY_COLORS: Record<string, string> = {
  common: "border-border/50 bg-card/50",
  rare: "border-blue-500/30 bg-blue-500/5",
  epic: "border-purple-500/30 bg-purple-500/5",
  legendary: "border-gold/50 bg-gold/5",
};

type UserStats = {
  storiesRead: number;
  storiesLiked: number;
  bookmarksCount: number;
  readingStreak: number;
  longestStreak: number;
  totalXP: number;
  level: number;
  weeklyXP: number;
};

type Tab = "overview" | "reading" | "badges" | "edit";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "overview", label: "Overview", icon: User },
  { id: "reading", label: "Reading", icon: BookOpen },
  { id: "badges", label: "Badges", icon: Trophy },
  { id: "edit", label: "Edit Profile", icon: Edit3 },
];

function ProfilePage() {
  const navigate = useNavigate();
  const { user, session, signOut, loading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<UserStats | null>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [likes, setLikes] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [progressList, setProgressList] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Edit form state
  const [name, setName] = useState(user?.user_metadata?.name ?? "");
  const [bio, setBio] = useState(user?.user_metadata?.bio ?? "");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      void navigate({ to: "/login" });
    }
  }, [user, loading, navigate]);

  const refetchData = useCallback(() => {
    if (!user || !session) return;
    const token = session.access_token;

    // Load stats
    fetch("/api/user-stats/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.userStat) {
          setStats({
            ...d.userStat,
            role: d.role,
          });
        }
        setStatsLoading(false);
      })
      .catch(() => setStatsLoading(false));

    // Load bookmarks
    fetch("/api/bookmarks", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.bookmarks) setBookmarks(d.bookmarks);
      })
      .catch(() => {});

    // Load likes
    fetch("/api/likes", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.likes) setLikes(d.likes);
      })
      .catch(() => {});

    // Load comments
    fetch("/api/comments", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.comments) setComments(d.comments);
      })
      .catch(() => {});

    // Load reading progress
    fetch("/api/reading-progress", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.progress) setProgressList(d.progress);
      })
      .catch(() => {});

    // Load submissions
    fetch("/api/submissions", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.submissions) setSubmissions(d.submissions);
      })
      .catch(() => {});
  }, [user, session]);

  // Sync on tab change
  useEffect(() => {
    if (user && session) {
      refetchData();
    }
  }, [activeTab, user, session, refetchData]);

  // Sync on focus & Cross-tab BroadcastChannel updates
  useEffect(() => {
    const handleFocus = () => {
      refetchData();
    };
    window.addEventListener("focus", handleFocus);

    const channel = new BroadcastChannel("isp-profile-updates");
    channel.onmessage = () => {
      refetchData();
    };

    return () => {
      window.removeEventListener("focus", handleFocus);
      channel.close();
    };
  }, [refetchData]);

  if (loading || !user) {
    return (
      <SiteLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground font-sans text-xs uppercase tracking-widest animate-pulse">
            Loading profile…
          </div>
        </div>
      </SiteLayout>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const userEmail = user.email ?? "";
  const displayName = (user.user_metadata?.name as string) || userEmail.split("@")[0];
  const xpToNextLevel = (stats?.level ?? 1) * 500;
  const xpProgress = stats ? Math.min(100, ((stats.totalXP % 500) / 500) * 100) : 0;

  const earnedBadges = BADGE_DEFINITIONS.filter((b) => {
    if (!stats) return false;
    const val = stats[b.field as keyof UserStats] as number ?? 0;
    return val >= b.threshold;
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({
      data: { name, bio, website, twitter, instagram, linkedin },
    });
    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSignOut = async () => {
    await signOut();
    void navigate({ to: "/" });
  };

  // Helper to format reading time
  const formatReadingTime = (seconds: number) => {
    if (!seconds) return "0m";
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hrs > 0) {
      return `${hrs}h ${remainingMins}m`;
    }
    return `${mins}m`;
  };

  return (
    <SiteLayout>
      <div className="min-h-screen bg-background">
        {/* ── Cover Image ── */}
        <div className="relative w-full h-48 md:h-72 bg-gradient-to-br from-primary/30 via-gold/20 to-background overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
          <div className="absolute inset-0 bg-hero opacity-40" />
          {/* Decorative pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, hsl(var(--gold)) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(var(--primary)) 0%, transparent 50%)",
            }}
          />
        </div>

        {/* ── Profile Header ── */}
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="relative -mt-16 md:-mt-20 flex flex-col sm:flex-row sm:items-end gap-4 mb-8">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="size-28 md:size-36 rounded-full border-4 border-background bg-card overflow-hidden shadow-xl">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <User className="size-12 text-primary/50" />
                  </div>
                )}
              </div>
              <button
                className="absolute bottom-1 right-1 size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow"
                title="Change avatar (coming soon)"
              >
                <Camera className="size-3.5" />
              </button>
            </div>

            {/* Name + Role */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground truncate">
                  {displayName}
                </h1>
                {stats && stats.level >= 5 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/15 border border-gold/30 text-xs font-sans font-bold text-gold uppercase tracking-wider">
                    <CheckCircle2 className="size-3" />
                    Verified Reader
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-sans truncate">{userEmail}</p>

              {/* Level badge */}
              {stats && (
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1.5 text-xs font-sans font-bold text-gold uppercase tracking-wider">
                    <Zap className="size-3.5" />
                    Level {stats.level}
                  </span>
                  <div className="flex-1 max-w-32 h-1.5 bg-border/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gold rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-sans tabular-nums">
                    {stats.totalXP} / {xpToNextLevel} XP
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {(user.app_metadata?.role === "Admin" ||
                user.app_metadata?.role === "SuperAdmin" ||
                (stats as any)?.role === "admin" ||
                (stats as any)?.role === "superadmin" ||
                (stats as any)?.role === "editor") && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 border border-primary/30 bg-primary/8 px-3 py-2 text-xs font-sans font-semibold text-primary hover:bg-primary/15 transition-colors rounded-full animate-pulse"
                >
                  <Shield className="size-3.5" />
                  Admin Dashboard
                </Link>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="gap-1.5 rounded-full border-border font-sans text-xs hover:border-destructive/50 hover:text-destructive"
              >
                <LogOut className="size-3.5" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* ── Stats row ── */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
              {[
                { label: "Stories Read", value: stats.storiesRead, icon: BookOpen, color: "text-primary" },
                { label: "Reading Streak", value: `${stats.readingStreak}d`, icon: Flame, color: "text-orange-500" },
                { label: "Reading Time", value: formatReadingTime((stats as any).totalReadingTime || 0), icon: Clock, color: "text-sky-500" },
                { label: "Total XP", value: stats.totalXP.toLocaleString(), icon: Zap, color: "text-gold" },
                { label: "Badges Earned", value: earnedBadges.length, icon: Trophy, color: "text-purple-500" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-card/60 border border-border/50 rounded-xl p-4 flex flex-col gap-1"
                >
                  <stat.icon className={`size-4 ${stat.color} mb-1`} />
                  <span className="font-display text-xl font-bold text-foreground tabular-nums">
                    {stat.value}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest font-sans text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* ── Tabs ── */}
          <div className="flex gap-1 mb-8 border-b border-border/50 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-sans font-semibold uppercase tracking-widest whitespace-nowrap transition-colors relative ${
                  activeTab === tab.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="size-3.5" />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="profile-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </button>
            ))}
          </div>

          {/* ── Tab Content ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="pb-24"
            >
              {/* ── Overview Tab ── */}
              {activeTab === "overview" && (
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Bio + social */}
                  <div className="md:col-span-2 space-y-6">
                    <div className="bg-card/50 border border-border/50 rounded-xl p-6">
                      <h2 className="font-display text-lg font-bold mb-3">About</h2>
                      <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                        {(user.user_metadata?.bio as string) ||
                          "No bio yet. Click Edit Profile to add one."}
                      </p>
                      {/* Social links */}
                      <div className="flex flex-wrap gap-3 mt-4">
                        {(user.user_metadata?.website as string) && (
                          <a
                            href={user.user_metadata?.website as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Globe className="size-3.5" />
                            Website
                            <ExternalLink className="size-2.5" />
                          </a>
                        )}
                        {(user.user_metadata?.twitter as string) && (
                          <a
                            href={`https://twitter.com/${user.user_metadata?.twitter as string}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Twitter className="size-3.5" />
                            Twitter
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Recent bookmarks */}
                    {bookmarks.length > 0 && (
                      <div className="bg-card/50 border border-border/50 rounded-xl p-6">
                        <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                          <BookMarked className="size-4 text-gold" />
                          Recent Bookmarks
                        </h2>
                        <div className="space-y-3">
                          {bookmarks.slice(0, 4).map((b: any) => (
                            <Link
                              key={b.id}
                              to="/stories/$slug"
                              params={{ slug: b.story?.slug || b.storyId }}
                              className="flex items-center gap-3 group"
                            >
                              {b.story?.image && (
                                <img
                                  src={b.story.image}
                                  alt={b.story?.title}
                                  className="size-10 rounded-lg object-cover flex-shrink-0"
                                />
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-sans font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                  {b.story?.title || "Story"}
                                </p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                  {b.story?.category || ""}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right sidebar */}
                  <div className="space-y-5">
                    {/* Extended stats */}
                    {stats && (
                      <div className="bg-card/50 border border-border/50 rounded-xl p-5 space-y-4">
                        <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-muted-foreground">
                          Reading Stats
                        </h3>
                        {[
                          { label: "Stories Liked", value: stats.storiesLiked, icon: Heart },
                          { label: "Bookmarks", value: stats.bookmarksCount, icon: BookMarked },
                          { label: "Longest Streak", value: `${stats.longestStreak}d`, icon: TrendingUp },
                          { label: "Weekly XP", value: stats.weeklyXP, icon: BarChart2 },
                        ].map((s) => (
                          <div key={s.label} className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-xs text-muted-foreground font-sans">
                              <s.icon className="size-3.5" />
                              {s.label}
                            </span>
                            <span className="text-sm font-bold font-sans tabular-nums">{s.value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Account info */}
                    <div className="bg-card/50 border border-border/50 rounded-xl p-5 space-y-3">
                      <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-muted-foreground">
                        Account
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-sans">
                        <Shield className="size-3.5 text-primary" />
                        <span className="text-foreground font-medium">
                          {user.app_metadata?.role || "Reader"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-sans text-muted-foreground">
                        <Calendar className="size-3.5" />
                        Joined {new Date(user.created_at ?? Date.now()).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Reading Tab ── */}
              {activeTab === "reading" && (
                <div className="space-y-6">
                  {/* Sub-tabs Selector */}
                  <div className="flex gap-2 border-b border-border/30 pb-3 overflow-x-auto">
                    {[
                      { id: "continue", label: "Continue", count: progressList.filter(p => !p.completed && p.progressPercent > 0).length },
                      { id: "bookmarks", label: "Bookmarks", count: bookmarks.length },
                      { id: "likes", label: "Likes", count: likes.length },
                      { id: "history", label: "History", count: progressList.length },
                      { id: "comments", label: "Comments", count: comments.length },
                      { id: "submissions", label: "Submissions", count: submissions.length },
                    ].map((sub) => {
                      const isActive = (window as any).readingSubTab === sub.id || (!(window as any).readingSubTab && sub.id === "continue");
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => {
                            (window as any).readingSubTab = sub.id;
                            setActiveTab("reading"); // trigger rerender
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-all ${
                            isActive
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40"
                          }`}
                        >
                          {sub.label} <span className="text-[10px] opacity-75">({sub.count})</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Sub-tab content */}
                  {(() => {
                    const activeSub = (window as any).readingSubTab || "continue";

                    // CONTINUE READING
                    if (activeSub === "continue") {
                      const list = progressList.filter(p => !p.completed && p.progressPercent > 0);
                      return (
                        <div className="space-y-4">
                          <h3 className="font-display text-lg font-bold text-foreground">Continue Reading</h3>
                          {list.length === 0 ? (
                            <div className="bg-card/30 border border-border/40 rounded-xl p-10 text-center">
                              <BookOpen className="size-8 text-muted-foreground/30 mx-auto mb-3" />
                              <p className="text-sm text-muted-foreground font-sans">No stories in progress. Start reading from the homepage or Explore tab!</p>
                            </div>
                          ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {list.map((p: any) => (
                                <Link
                                  key={p.id}
                                  to="/stories/$slug"
                                  params={{ slug: p.story?.slug || p.storyId }}
                                  className="group bg-card/50 border border-border/40 rounded-xl overflow-hidden hover:border-border transition-colors flex flex-col justify-between"
                                >
                                  <div>
                                    {p.story?.image && (
                                      <div className="aspect-video overflow-hidden relative">
                                        <img src={p.story.image} alt={p.story?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-border/40">
                                          <div className="h-full bg-primary" style={{ width: `${p.progressPercent}%` }} />
                                        </div>
                                      </div>
                                    )}
                                    <div className="p-4">
                                      <p className="text-[10px] text-gold uppercase tracking-widest font-sans mb-1">{p.story?.category}</p>
                                      <h4 className="text-sm font-display font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">{p.story?.title}</h4>
                                    </div>
                                  </div>
                                  <div className="px-4 pb-4 flex justify-between items-center text-[10px] font-sans text-muted-foreground">
                                    <span>{p.progressPercent}% completed</span>
                                    <span>Resume reading</span>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // BOOKMARKS
                    if (activeSub === "bookmarks") {
                      return (
                        <div className="space-y-4">
                          <h3 className="font-display text-lg font-bold text-foreground">Bookmarks</h3>
                          {bookmarks.length === 0 ? (
                            <div className="bg-card/30 border border-border/40 rounded-xl p-10 text-center">
                              <BookMarked className="size-8 text-muted-foreground/30 mx-auto mb-3" />
                              <p className="text-sm text-muted-foreground font-sans">No bookmarks saved yet.</p>
                            </div>
                          ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {bookmarks.map((b: any) => (
                                <Link
                                  key={b.id}
                                  to="/stories/$slug"
                                  params={{ slug: b.story?.slug || b.storyId }}
                                  className="group bg-card/50 border border-border/40 rounded-xl overflow-hidden hover:border-border transition-colors"
                                >
                                  {b.story?.image && (
                                    <div className="aspect-video overflow-hidden">
                                      <img src={b.story.image} alt={b.story?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                  )}
                                  <div className="p-4">
                                    <p className="text-[10px] text-gold uppercase tracking-widest font-sans mb-1">{b.story?.category}</p>
                                    <h4 className="text-sm font-display font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">{b.story?.title}</h4>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // LIKES
                    if (activeSub === "likes") {
                      return (
                        <div className="space-y-4">
                          <h3 className="font-display text-lg font-bold text-foreground">Liked Stories</h3>
                          {likes.length === 0 ? (
                            <div className="bg-card/30 border border-border/40 rounded-xl p-10 text-center">
                              <Heart className="size-8 text-muted-foreground/30 mx-auto mb-3" />
                              <p className="text-sm text-muted-foreground font-sans">No liked stories yet.</p>
                            </div>
                          ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {likes.map((l: any) => (
                                <Link
                                  key={l.id}
                                  to="/stories/$slug"
                                  params={{ slug: l.story?.slug || l.storyId }}
                                  className="group bg-card/50 border border-border/40 rounded-xl overflow-hidden hover:border-border transition-colors"
                                >
                                  {l.story?.image && (
                                    <div className="aspect-video overflow-hidden">
                                      <img src={l.story.image} alt={l.story?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                  )}
                                  <div className="p-4">
                                    <p className="text-[10px] text-gold uppercase tracking-widest font-sans mb-1">{l.story?.category}</p>
                                    <h4 className="text-sm font-display font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">{l.story?.title}</h4>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // HISTORY
                    if (activeSub === "history") {
                      return (
                        <div className="space-y-4">
                          <h3 className="font-display text-lg font-bold text-foreground">Reading History</h3>
                          {progressList.length === 0 ? (
                            <div className="bg-card/30 border border-border/40 rounded-xl p-10 text-center">
                              <Clock className="size-8 text-muted-foreground/30 mx-auto mb-3" />
                              <p className="text-sm text-muted-foreground font-sans">No reading history yet.</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {progressList.map((p: any) => (
                                <Link
                                  key={p.id}
                                  to="/stories/$slug"
                                  params={{ slug: p.story?.slug || p.storyId }}
                                  className="flex items-center gap-4 bg-card/30 hover:bg-card/60 border border-border/40 rounded-xl p-3 group transition-colors"
                                >
                                  {p.story?.image && (
                                    <img src={p.story.image} alt={p.story?.title} className="size-14 rounded-lg object-cover flex-shrink-0" />
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-display font-bold text-foreground truncate group-hover:text-primary transition-colors">{p.story?.title}</h4>
                                    <div className="flex items-center gap-3 text-xs font-sans text-muted-foreground mt-1">
                                      <span className="text-gold uppercase tracking-widest text-[9px] font-bold">{p.story?.category}</span>
                                      <span>•</span>
                                      <span>{p.completed ? "Completed" : `${p.progressPercent}% read`}</span>
                                      <span>•</span>
                                      <span>{new Date(p.lastReadAt).toLocaleDateString("en-IN")}</span>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // COMMENTS
                    if (activeSub === "comments") {
                      return (
                        <div className="space-y-4">
                          <h3 className="font-display text-lg font-bold text-foreground">My Comments</h3>
                          {comments.length === 0 ? (
                            <div className="bg-card/30 border border-border/40 rounded-xl p-10 text-center">
                              <MessageSquare className="size-8 text-muted-foreground/30 mx-auto mb-3" />
                              <p className="text-sm text-muted-foreground font-sans">You haven't commented on any stories yet.</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {comments.map((c: any) => (
                                <Link
                                  key={c.id}
                                  to="/stories/$slug"
                                  params={{ slug: c.storySlug }}
                                  className="block bg-card/30 hover:bg-card/60 border border-border/40 rounded-xl p-4 group transition-colors"
                                >
                                  <div className="flex justify-between items-start">
                                    <span className="text-[10px] text-muted-foreground font-sans">{new Date(c.createdAt).toLocaleDateString("en-IN")}</span>
                                    <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-muted border border-border/50 uppercase tracking-widest text-muted-foreground">{c.status}</span>
                                  </div>
                                  <p className="text-sm font-sans text-foreground mt-2 italic">"{c.content}"</p>
                                  <p className="text-xs font-sans text-muted-foreground mt-3">
                                    On: <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{c.storyTitle}</span>
                                  </p>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // SUBMISSIONS
                    if (activeSub === "submissions") {
                      return (
                        <div className="space-y-4">
                          <h3 className="font-display text-lg font-bold text-foreground">My Submissions</h3>
                          {submissions.length === 0 ? (
                            <div className="bg-card/30 border border-border/40 rounded-xl p-10 text-center">
                              <UploadCloud className="size-8 text-muted-foreground/30 mx-auto mb-3" />
                              <p className="text-sm text-muted-foreground font-sans">You haven't submitted any stories yet. Head to the Contributor Hub to write your first story!</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {submissions.map((s: any) => (
                                <div key={s.id} className="bg-card/30 border border-border/40 rounded-xl p-4 space-y-3">
                                  <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-display font-bold text-foreground">{s.title}</h4>
                                    <span className={`text-[10px] font-sans px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                                      s.status === "Approved" ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                                      s.status === "Rejected" ? "bg-destructive/10 text-destructive border border-destructive/20" :
                                      "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                                    }`}>
                                      {s.status}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground font-sans line-clamp-2">{s.excerpt}</p>
                                  <div className="flex justify-between items-center text-[10px] font-sans text-muted-foreground border-t border-border/20 pt-2">
                                    <span>Submitted on {new Date(s.createdAt).toLocaleDateString("en-IN")}</span>
                                    <span>Category: {s.categoryName}</span>
                                  </div>
                                  {s.adminNotes && (
                                    <div className="bg-muted/50 border border-border/40 p-3 rounded-lg text-xs font-sans text-muted-foreground">
                                      <strong className="text-foreground">Moderator Feedback:</strong> {s.adminNotes}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return null;
                  })()}
                </div>
              )}

              {/* ── Badges Tab ── */}
              {activeTab === "badges" && (
                <div>
                  <div className="mb-6">
                    <h2 className="font-display text-xl font-bold mb-1">
                      Achievements
                    </h2>
                    <p className="text-sm text-muted-foreground font-sans">
                      {earnedBadges.length} of {BADGE_DEFINITIONS.length} badges earned
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {BADGE_DEFINITIONS.map((badge) => {
                      const earned = earnedBadges.some((b) => b.slug === badge.slug);
                      const currentVal = stats
                        ? (stats[badge.field as keyof UserStats] as number ?? 0)
                        : 0;
                      const progress = Math.min(100, (currentVal / badge.threshold) * 100);

                      return (
                        <motion.div
                          key={badge.slug}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`relative rounded-xl border p-5 flex flex-col items-center gap-2 text-center transition-all ${
                            earned
                              ? RARITY_COLORS[badge.rarity]
                              : "border-border/30 bg-card/30 opacity-50 grayscale"
                          }`}
                        >
                          {earned && (
                            <div
                              className="absolute top-2 right-2 w-2 h-2 rounded-full"
                              style={{ backgroundColor: badge.color }}
                            />
                          )}
                          <span className="text-3xl">{badge.icon}</span>
                          <span className="font-sans font-bold text-xs text-foreground">
                            {badge.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-sans leading-snug">
                            {badge.desc}
                          </span>
                          {!earned && (
                            <div className="w-full h-1 bg-border/40 rounded-full overflow-hidden mt-1">
                              <div
                                className="h-full bg-gold/50 rounded-full"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          )}
                          <span
                            className="text-[9px] uppercase tracking-widest font-bold"
                            style={{ color: badge.color }}
                          >
                            {badge.rarity}
                          </span>
                          {!earned && (
                            <Lock className="size-3 text-muted-foreground/50 absolute top-2 left-2" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Edit Tab ── */}
              {activeTab === "edit" && (
                <div className="max-w-xl">
                  <form onSubmit={handleSave} className="space-y-5">
                    <div>
                      <label
                        htmlFor="edit-name"
                        className="block text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-2"
                      >
                        Display Name
                      </label>
                      <Input
                        id="edit-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="h-12 rounded-lg border-border bg-background font-sans"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="edit-email"
                        className="block text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-2"
                      >
                        Email
                      </label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={userEmail}
                        disabled
                        className="h-12 rounded-lg border-border bg-muted font-sans opacity-60 cursor-not-allowed"
                      />
                      <p className="text-xs text-muted-foreground font-sans mt-1">
                        Email changes require re-verification.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="edit-bio"
                        className="block text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-2"
                      >
                        Bio
                      </label>
                      <textarea
                        id="edit-bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself…"
                        rows={4}
                        className="w-full border border-border bg-background rounded-lg px-3 py-3 text-sm font-sans text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>

                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                        Social Links
                      </p>
                      <div className="space-y-3">
                        {[
                          { id: "website", label: "Website URL", Icon: Globe, value: website, setter: setWebsite, placeholder: "https://yoursite.com" },
                          { id: "twitter", label: "Twitter Handle", Icon: Twitter, value: twitter, setter: setTwitter, placeholder: "@handle" },
                          { id: "instagram", label: "Instagram", Icon: Instagram, value: instagram, setter: setInstagram, placeholder: "@handle" },
                          { id: "linkedin", label: "LinkedIn URL", Icon: Linkedin, value: linkedin, setter: setLinkedin, placeholder: "linkedin.com/in/..." },
                        ].map((field) => (
                          <div key={field.id} className="relative">
                            <field.Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                              id={`edit-${field.id}`}
                              type="text"
                              value={field.value}
                              onChange={(e) => field.setter(e.target.value)}
                              placeholder={field.placeholder}
                              className="h-11 pl-10 rounded-lg border-border bg-background font-sans text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {error && (
                      <p className="text-xs text-destructive font-sans bg-destructive/8 border border-destructive/20 px-3 py-2 rounded-lg">
                        {error}
                      </p>
                    )}
                    {saved && (
                      <p className="text-xs text-primary font-sans bg-primary/8 border border-primary/20 px-3 py-2 rounded-lg flex items-center gap-2">
                        <CheckCircle2 className="size-3.5" />
                        Profile updated successfully.
                      </p>
                    )}

                    <Button
                      id="profile-save-btn"
                      type="submit"
                      disabled={saving}
                      className="h-12 px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-sans uppercase tracking-[0.2em] text-xs btn-premium gap-2"
                    >
                      <Save className="size-4" />
                      {saving ? "Saving…" : "Save Changes"}
                    </Button>
                  </form>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </SiteLayout>
  );
}
