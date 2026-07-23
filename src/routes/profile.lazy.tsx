import { createLazyFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { PremiumLoader } from "@/components/common/PremiumLoader";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
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
  Award,
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
  FolderOpen,
  Users,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteLayout } from "@/components/site/Layout";
import { useAuthStore } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase-client";
import { useI18nStore, uiText } from "@/lib/i18n";
import { UserAvatar } from "@/components/common/UserAvatar";

export const Route = createLazyFileRoute("/profile")({
  component: ProfilePage,
});

// ─── Badge definitions ─────────────────────────────────────────────────────

const BADGE_DEFINITIONS = [
  {
    slug: "explorer",
    name: "Explorer",
    icon: "🧭",
    color: "#C8A96A",
    desc: "Read 5 stories",
    threshold: 5,
    field: "storiesRead",
    rarity: "common",
  },
  {
    slug: "researcher",
    name: "Researcher",
    icon: "🔬",
    color: "#6AB4C8",
    desc: "Read 20 stories",
    threshold: 20,
    field: "storiesRead",
    rarity: "common",
  },
  {
    slug: "historian",
    name: "Historian",
    icon: "📜",
    color: "#8B7355",
    desc: "Read 50 stories",
    threshold: 50,
    field: "storiesRead",
    rarity: "rare",
  },
  {
    slug: "story-hunter",
    name: "Story Hunter",
    icon: "🎯",
    color: "#C86A6A",
    desc: "Read 100 stories",
    threshold: 100,
    field: "storiesRead",
    rarity: "rare",
  },
  {
    slug: "top-reader",
    name: "Top Reader",
    icon: "📚",
    color: "#8B0000",
    desc: "Read 200 stories",
    threshold: 200,
    field: "storiesRead",
    rarity: "epic",
  },
  {
    slug: "streak-7",
    name: "Week Warrior",
    icon: "🔥",
    color: "#FF6B35",
    desc: "7-day reading streak",
    threshold: 7,
    field: "readingStreak",
    rarity: "common",
  },
  {
    slug: "streak-30",
    name: "Monthly Legend",
    icon: "⚡",
    color: "#FFB800",
    desc: "30-day reading streak",
    threshold: 30,
    field: "readingStreak",
    rarity: "epic",
  },
  {
    slug: "bookmarker",
    name: "Curator",
    icon: "🔖",
    color: "#6AC8A9",
    desc: "Bookmark 10 stories",
    threshold: 10,
    field: "bookmarksCount",
    rarity: "common",
  },
  {
    slug: "legend",
    name: "Legend",
    icon: "👑",
    color: "#C8A96A",
    desc: "Reach 1000 XP",
    threshold: 1000,
    field: "totalXP",
    rarity: "legendary",
  },
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

type Tab = "overview" | "reading" | "badges" | "collections" | "following" | "edit";

function ProfilePage() {
  const navigate = useNavigate();
  const { user, session, signOut, loading, initialized, profile } = useAuthStore();
  const lang = useI18nStore((s) => s.lang);
  const profText = uiText[lang]?.profile || uiText.en.profile;

  const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "overview", label: profText.overview, icon: User },
    { id: "reading", label: profText.history, icon: BookOpen },
    { id: "badges", label: profText.badges, icon: Trophy },
    { id: "collections", label: profText.collections, icon: FolderOpen },
    { id: "following", label: lang === "hi" ? "अनुसरण (फॉलोइंग)" : "Following", icon: Heart },
    { id: "edit", label: profText.editProfile, icon: Edit3 },
  ];

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [readingSubTab, setReadingSubTab] = useState("continue");
  const [stats, setStats] = useState<UserStats | null>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [likes, setLikes] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [progressList, setProgressList] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Collections & Following & Preferences state
  const [collections, setCollections] = useState<any[]>([]);
  const [followedAuthors, setFollowedAuthors] = useState<any[]>([]);
  const [newColName, setNewColName] = useState("");
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [editingColName, setEditingColName] = useState("");
  const [favTheme, setFavTheme] = useState("dark");
  const [favState, setFavState] = useState("en-normal");
  const [prefSaving, setPrefSaving] = useState(false);
  const [prefSaved, setPrefSaved] = useState(false);

  // Sub-counts
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [continueCount, setContinueCount] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);
  const [submissionsCount, setSubmissionsCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followedThemesList, setFollowedThemesList] = useState<string[]>([]);
  const [followedStatesList, setFollowedStatesList] = useState<string[]>([]);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const hasInitializedForm = useRef(false);

  useEffect(() => {
    setAvatarUrl(profile?.avatarUrl || null);
  }, [profile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Invalid file type. Only JPG, JPEG, PNG, and WEBP are supported.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image is too large. Max size is 5MB.");
      return;
    }

    setUploadError(null);
    setUploadingAvatar(true);
    setUploadProgress(0);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 300, 300);

          canvas.toBlob((blob) => {
            if (blob) {
              uploadAvatarBlob(blob, file.name);
            } else {
              setUploadError("Failed to crop image.");
              setUploadingAvatar(false);
            }
          }, "image/jpeg", 0.85);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const uploadAvatarBlob = (blob: Blob, originalName: string) => {
    if (!session) return;

    const formData = new FormData();
    formData.append("file", blob, originalName);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/profile/avatar");
    xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    });

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const resData = JSON.parse(xhr.responseText);
          const secureUrl = resData.avatarUrl;
          if (secureUrl) {
            setAvatarUrl(secureUrl);
            setUploadingAvatar(false);
            setUploadProgress(100);
            setSuccessMessage("Avatar updated successfully.");
            await useAuthStore.getState().refreshProfile();
            refetchData();
          } else {
            setUploadError("Upload succeeded but URL was missing.");
            setUploadingAvatar(false);
          }
        } catch {
          setUploadError("Failed to parse server response.");
          setUploadingAvatar(false);
        }
      } else {
        try {
          const errData = JSON.parse(xhr.responseText);
          setUploadError(errData.error || `Upload failed with status: ${xhr.status}`);
        } catch {
          setUploadError(`Upload failed with status: ${xhr.status}`);
        }
        setUploadingAvatar(false);
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    };

    xhr.onerror = () => {
      setUploadError("Network error during upload.");
      setUploadingAvatar(false);
    };

    xhr.send(formData);
  };

  const handleRemoveAvatar = async () => {
    if (!session || !avatarUrl) return;
    setUploadingAvatar(true);
    setUploadError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/profile/avatar", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (res.ok) {
        setAvatarUrl(null);
        setSuccessMessage("Avatar removed successfully.");
        await useAuthStore.getState().refreshProfile();
        refetchData();
      } else {
        const errJson = await res.json();
        setUploadError(errJson.error || "Failed to remove avatar.");
      }
    } catch (err: any) {
      setUploadError(err.message || "Network error removing avatar.");
    } finally {
      setUploadingAvatar(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Edit form state
  const [name, setName] = useState(user?.user_metadata?.name ?? "");
  const [bio, setBio] = useState(user?.user_metadata?.bio ?? "");
  const [website, setWebsite] = useState(user?.user_metadata?.website ?? "");
  const [twitter, setTwitter] = useState(user?.user_metadata?.twitter ?? "");
  const [instagram, setInstagram] = useState(user?.user_metadata?.instagram ?? "");
  const [linkedin, setLinkedin] = useState(user?.user_metadata?.linkedin ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const refetchData = useCallback(() => {
    if (!user || !session) return;
    const token = session.access_token;

    setStatsLoading(true);
    // Load core stats & profile details
    fetch("/api/user-stats/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.stats) {
          setStats(d.stats);
        }
        if (d.userProfile) {
          setAvatarUrl(d.userProfile.avatarUrl || null);
          if (!hasInitializedForm.current) {
            setName(d.userProfile.name || "");
            setBio(d.userProfile.bio || "");
            setWebsite(d.userProfile.website || "");
            setTwitter(d.userProfile.twitter || "");
            setInstagram(d.userProfile.instagram || "");
            setLinkedin(d.userProfile.linkedin || "");
            hasInitializedForm.current = true;
          }
        }
        // Cache tab counts
        setBookmarksCount(d.bookmarksCount ?? 0);
        setLikesCount(d.likesCount ?? 0);
        setCommentsCount(d.commentsCount ?? 0);
        setContinueCount(d.continueCount ?? 0);
        setHistoryCount(d.historyCount ?? 0);
        setSubmissionsCount(d.submissionsCount ?? 0);

        if (d.userProfile) {
          setFavTheme(d.userProfile.favoriteTheme || "dark");
          setFavState(d.userProfile.favoriteState || "en-normal");
        }
        setStatsLoading(false);
      })
      .catch(() => setStatsLoading(false));

    // Load followed authors, themes, and states
    fetch("/api/authors", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((res) => {
        if (Array.isArray(res)) {
          const list = res.filter((a: any) => a.followed);
          setFollowedAuthors(list);
          setFollowingCount(list.length);
        } else if (res && typeof res === "object") {
          if (Array.isArray(res.authors)) {
            setFollowedAuthors(res.authors.filter((a: any) => a.followed));
          }
          setFollowingCount(res.totalFollows ?? 0);
          if (Array.isArray(res.followedThemes)) setFollowedThemesList(res.followedThemes);
          if (Array.isArray(res.followedStates)) setFollowedStatesList(res.followedStates);
        }
      })
      .catch(console.error);

    // Load collections
    fetch("/api/collections", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.collections) {
          setCollections(d.collections);
        }
      })
      .catch(console.error);

    // Load recent bookmarks for overview tab
    fetch("/api/bookmarks", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.bookmarks) setBookmarks(d.bookmarks);
      })
      .catch(() => {});
  }, [user, session]);

  // Lazy load specific lists based on sub-tab activation
  useEffect(() => {
    if (!user || !session) return;
    const token = session.access_token;

    if (activeTab === "reading") {
      if (readingSubTab === "bookmarks") {
        fetch("/api/bookmarks", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.bookmarks) {
              setBookmarks(d.bookmarks);
              setBookmarksCount(d.bookmarks.length);
            }
          });
      } else if (readingSubTab === "likes") {
        fetch("/api/likes", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.likes) {
              setLikes(d.likes);
              setLikesCount(d.likes.length);
            }
          });
      } else if (readingSubTab === "comments") {
        fetch("/api/comments", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.comments) {
              setComments(d.comments);
              setCommentsCount(d.comments.length);
            }
          });
      } else if (readingSubTab === "continue" || readingSubTab === "history") {
        fetch("/api/reading-progress", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.progress) {
              setProgressList(d.progress);
              setContinueCount(
                d.progress.filter((p: any) => !p.completed && p.progressPercent > 0).length,
              );
              setHistoryCount(d.progress.length);
            }
          });
      } else if (readingSubTab === "submissions") {
        fetch("/api/submissions", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.submissions) {
              setSubmissions(d.submissions);
              setSubmissionsCount(d.submissions.length);
            }
          });
      }
    }
  }, [activeTab, readingSubTab, user, session]);

  // Sync on tab change
  useEffect(() => {
    if (user && session) {
      refetchData();
    }
  }, [activeTab, user, session, refetchData]);

  // Sync on Cross-tab BroadcastChannel updates
  useEffect(() => {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel("isp-profile-updates");
    channel.onmessage = () => {
      refetchData();
    };

    return () => {
      channel.close();
    };
  }, [refetchData]);

  if (!initialized && loading) {
    return <PremiumLoader />;
  }

  if (initialized && !user) {
    return (
      <SiteLayout>
        <div className="container mx-auto px-6 py-24 text-center space-y-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold">
            {lang === "hi" ? "प्रोफ़ाइल देखने के लिए साइन इन करें" : "Sign in to View Your Profile"}
          </h2>
          <p className="text-sm text-muted-foreground font-sans max-w-md mx-auto">
            {lang === "hi"
              ? "अपनी पठन प्रगति, बैज, सहेजी गई कहानियों और प्राथमिकताओं को प्रबंधित करने के लिए साइन इन करें।"
              : "Access your reading history, badges, bookmarked stories, and account settings."}
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-full bg-primary text-white text-xs uppercase tracking-wider font-sans font-bold hover:bg-primary/90 transition-colors shadow-sm"
            >
              {lang === "hi" ? "साइन इन करें" : "Sign In"}
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2.5 rounded-full border border-border text-foreground text-xs uppercase tracking-wider font-sans font-bold hover:bg-card transition-colors shadow-sm"
            >
              {lang === "hi" ? "खाता बनाएं" : "Create Account"}
            </Link>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (!user) {
    return null;
  }

  const userEmail = user.email ?? "";
  const displayName = name || (userEmail ? userEmail.split("@")[0] : "User");
  const xpToNextLevel = (stats?.level ?? 1) * 500;
  const rawXP = stats?.totalXP ?? 0;
  const xpProgress = !isNaN(rawXP) ? Math.min(100, Math.max(0, ((rawXP % 500) / 500) * 100)) : 0;

  const role = profile?.role?.toLowerCase();
  const earnedBadges = BADGE_DEFINITIONS.filter((b) => {
    if (!stats) return false;
    const val = (stats[b.field as keyof UserStats] as number) ?? 0;
    return val >= b.threshold;
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // 1. Update Supabase auth user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: { name, bio, website, twitter, instagram, linkedin },
    });
    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    // 2. Sync changes with the database Profile and UserProfile tables
    try {
      if (session) {
        const res = await fetch("/api/auth/profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ name, bio, website, twitter, instagram, linkedin }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to sync profile changes with server.");
        }
      }
      setSaved(true);
      refetchData();
    } catch (err: any) {
      setError(err.message || "Failed to sync profile changes with database.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaved(false), 3000);
    }
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
              <div className="size-28 md:size-36 rounded-full border-4 border-background bg-card overflow-hidden shadow-xl relative">
                <UserAvatar src={avatarUrl} name={displayName} email={user?.email} size="xl" className="size-full !border-0 text-3xl md:text-4xl" />
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white px-2">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider mb-1">Uploading</span>
                    <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-gold transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <span className="text-[9px] font-mono mt-1">{uploadProgress}%</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarChange}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-1 right-1 size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow disabled:opacity-50 cursor-pointer"
                title="Change avatar"
              >
                <Camera className="size-3.5" />
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar}
                  className="absolute bottom-1 -left-1 size-8 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/90 transition-colors shadow disabled:opacity-50 cursor-pointer"
                  title="Remove avatar"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>

            {/* Name + Role */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground truncate">
                  {displayName}
                </h1>
                {uploadError && (
                  <span className="text-xs text-destructive font-sans font-semibold flex items-center gap-1">
                    ⚠️ {uploadError}
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="underline text-gold hover:text-saffron font-bold uppercase tracking-wider text-[10px] ml-1 cursor-pointer"
                    >
                      Retry
                    </button>
                  </span>
                )}
                {successMessage && (
                  <span className="text-xs text-emerald-600 font-sans font-semibold flex items-center gap-1">
                    ✓ {successMessage}
                  </span>
                )}
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
                  {stats.readingStreak > 0 && (
                    <span className="flex items-center gap-1 bg-amber-950/35 border border-amber-500/25 px-2.5 py-0.5 rounded text-amber-400 text-[10px] font-sans font-bold uppercase tracking-wider">
                      <Flame className="size-3 text-amber-500 fill-amber-500 animate-pulse" />
                      {stats.readingStreak} Day Streak
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {(role === "admin" || role === "superadmin") && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 border border-primary/30 bg-primary/8 px-3 py-2 text-xs font-sans font-semibold text-primary hover:bg-primary/15 transition-colors rounded-full animate-pulse cursor-pointer"
                >
                  <Shield className="size-3.5" />
                  Admin CMS
                </Link>
              )}
              {role === "editor" && (
                <Link
                  to="/editor"
                  className="flex items-center gap-1.5 border border-primary/30 bg-primary/8 px-3 py-2 text-xs font-sans font-semibold text-primary hover:bg-primary/15 transition-colors rounded-full animate-pulse cursor-pointer"
                >
                  <Shield className="size-3.5" />
                  Editor Workspace
                </Link>
              )}
              {role === "author" && (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 border border-primary/30 bg-primary/8 px-3 py-2 text-xs font-sans font-semibold text-primary hover:bg-primary/15 transition-colors rounded-full animate-pulse cursor-pointer"
                >
                  <Shield className="size-3.5" />
                  Author Dashboard
                </Link>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="gap-1.5 rounded-full border-border font-sans text-xs hover:border-destructive/50 hover:text-destructive text-foreground"
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
                {
                  label: lang === "hi" ? "पढ़ी गई कहानियाँ" : "Stories Read",
                  value: stats.storiesRead,
                  icon: BookOpen,
                  color: "text-primary",
                },
                {
                  label: profText.readingStreak,
                  value: `${stats.readingStreak}${lang === "hi" ? "द" : "d"}`,
                  icon: Flame,
                  color: "text-orange-500",
                },
                {
                  label: profText.readingTime,
                  value: formatReadingTime((stats as any).totalReadingTime || 0),
                  icon: Clock,
                  color: "text-sky-500",
                },
                {
                  label: profText.totalXP,
                  value: `${stats.totalXP} XP`,
                  icon: Award,
                  color: "text-gold",
                },
                {
                  label: lang === "hi" ? "अर्जित बैज" : "Badges Earned",
                  value: earnedBadges.length,
                  icon: Trophy,
                  color: "text-purple-500",
                },
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

          {/* ── Tabs Layout & Sidebar ── */}
          <div className="flex flex-col md:flex-row gap-8 pb-24">
            {/* Sidebar */}
            <aside className="w-full md:w-64 shrink-0 bg-card/60 border border-border/50 p-4 rounded-xl flex flex-col gap-1 h-fit shadow-sm">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-muted-foreground px-3 mb-3">
                My Space
              </span>
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-sans font-semibold tracking-wider uppercase rounded-lg transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <tab.icon className="size-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </aside>

            {/* Tab Content */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-card/60 border border-border/50 rounded-xl p-6 lg:p-8 shadow-sm"
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
                          { label: "Stories Liked", value: stats.storiesLiked ?? 0, icon: Heart },
                          { label: "Bookmarks", value: stats.bookmarksCount ?? 0, icon: BookMarked },
                          {
                            label: "Longest Streak",
                            value: `${stats.longestStreak ?? 0}d`,
                            icon: TrendingUp,
                          },
                          { label: "Weekly XP", value: stats.weeklyXP ?? 0, icon: BarChart2 },
                        ].map((s) => (
                          <div key={s.label} className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-xs text-muted-foreground font-sans">
                              <s.icon className="size-3.5" />
                              {s.label}
                            </span>
                            <span className="text-sm font-bold font-sans tabular-nums">
                              {s.value}
                            </span>
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
                        Joined{" "}
                        {new Date(user.created_at ?? Date.now()).toLocaleDateString("en-IN", {
                          month: "long",
                          year: "numeric",
                        })}
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
                      { id: "continue", label: "Continue", count: continueCount },
                      { id: "bookmarks", label: "Bookmarks", count: bookmarksCount },
                      { id: "likes", label: "Likes", count: likesCount },
                      { id: "history", label: "History", count: historyCount },
                      { id: "comments", label: "Comments", count: commentsCount },
                      { id: "submissions", label: "Submissions", count: submissionsCount },
                    ].map((sub) => {
                      const isActive = readingSubTab === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => {
                            setReadingSubTab(sub.id);
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
                    const activeSub = readingSubTab;

                    // CONTINUE READING
                    if (activeSub === "continue") {
                      const list = progressList.filter(
                        (p) => !p.completed && p.progressPercent > 0,
                      );
                      return (
                        <div className="space-y-4">
                          <h3 className="font-display text-lg font-bold text-foreground">
                            Continue Reading
                          </h3>
                          {list.length === 0 ? (
                            <div className="bg-card/30 border border-border/40 rounded-xl p-10 text-center">
                              <BookOpen className="size-8 text-muted-foreground/30 mx-auto mb-3" />
                              <p className="text-sm text-muted-foreground font-sans">
                                No stories in progress. Start reading from the homepage or Explore
                                tab!
                              </p>
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
                                        <img
                                          src={p.story.image}
                                          alt={p.story?.title}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-border/40">
                                          <div
                                            className="h-full bg-primary"
                                            style={{ width: `${p.progressPercent}%` }}
                                          />
                                        </div>
                                      </div>
                                    )}
                                    <div className="p-4">
                                      <p className="text-[10px] text-gold uppercase tracking-widest font-sans mb-1">
                                        {p.story?.category}
                                      </p>
                                      <h4 className="text-sm font-display font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                                        {p.story?.title}
                                      </h4>
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
                          <h3 className="font-display text-lg font-bold text-foreground">
                            Bookmarks
                          </h3>
                          {bookmarks.length === 0 ? (
                            <div className="bg-card/30 border border-border/40 rounded-xl p-10 text-center">
                              <BookMarked className="size-8 text-muted-foreground/30 mx-auto mb-3" />
                              <p className="text-sm text-muted-foreground font-sans">
                                No bookmarks saved yet.
                              </p>
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
                                      <img
                                        src={b.story.image}
                                        alt={b.story?.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                      />
                                    </div>
                                  )}
                                  <div className="p-4">
                                    <p className="text-[10px] text-gold uppercase tracking-widest font-sans mb-1">
                                      {b.story?.category}
                                    </p>
                                    <h4 className="text-sm font-display font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                                      {b.story?.title}
                                    </h4>
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
                          <h3 className="font-display text-lg font-bold text-foreground">
                            Liked Stories
                          </h3>
                          {likes.length === 0 ? (
                            <div className="bg-card/30 border border-border/40 rounded-xl p-10 text-center">
                              <Heart className="size-8 text-muted-foreground/30 mx-auto mb-3" />
                              <p className="text-sm text-muted-foreground font-sans">
                                No liked stories yet.
                              </p>
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
                                      <img
                                        src={l.story.image}
                                        alt={l.story?.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                      />
                                    </div>
                                  )}
                                  <div className="p-4">
                                    <p className="text-[10px] text-gold uppercase tracking-widest font-sans mb-1">
                                      {l.story?.category}
                                    </p>
                                    <h4 className="text-sm font-display font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                                      {l.story?.title}
                                    </h4>
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
                          <h3 className="font-display text-lg font-bold text-foreground">
                            Reading History
                          </h3>
                          {progressList.length === 0 ? (
                            <div className="bg-card/30 border border-border/40 rounded-xl p-10 text-center">
                              <Clock className="size-8 text-muted-foreground/30 mx-auto mb-3" />
                              <p className="text-sm text-muted-foreground font-sans">
                                No reading history yet.
                              </p>
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
                                    <img
                                      src={p.story.image}
                                      alt={p.story?.title}
                                      className="size-14 rounded-lg object-cover flex-shrink-0"
                                    />
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-display font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                      {p.story?.title}
                                    </h4>
                                    <div className="flex items-center gap-3 text-xs font-sans text-muted-foreground mt-1">
                                      <span className="text-gold uppercase tracking-widest text-[9px] font-bold">
                                        {p.story?.category}
                                      </span>
                                      <span>•</span>
                                      <span>
                                        {p.completed ? "Completed" : `${p.progressPercent}% read`}
                                      </span>
                                      <span>•</span>
                                      <span>
                                        {new Date(p.lastReadAt).toLocaleDateString("en-IN")}
                                      </span>
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
                          <h3 className="font-display text-lg font-bold text-foreground">
                            My Comments
                          </h3>
                          {comments.length === 0 ? (
                            <div className="bg-card/30 border border-border/40 rounded-xl p-10 text-center">
                              <MessageSquare className="size-8 text-muted-foreground/30 mx-auto mb-3" />
                              <p className="text-sm text-muted-foreground font-sans">
                                You haven't commented on any stories yet.
                              </p>
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
                                    <span className="text-[10px] text-muted-foreground font-sans">
                                      {new Date(c.createdAt).toLocaleDateString("en-IN")}
                                    </span>
                                    <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-muted border border-border/50 uppercase tracking-widest text-muted-foreground">
                                      {c.status}
                                    </span>
                                  </div>
                                  <p className="text-sm font-sans text-foreground mt-2 italic">
                                    "{c.content}"
                                  </p>
                                  <p className="text-xs font-sans text-muted-foreground mt-3">
                                    On:{" "}
                                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                      {c.storyTitle}
                                    </span>
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
                          <h3 className="font-display text-lg font-bold text-foreground">
                            My Submissions
                          </h3>
                          {submissions.length === 0 ? (
                            <div className="bg-card/30 border border-border/40 rounded-xl p-10 text-center">
                              <UploadCloud className="size-8 text-muted-foreground/30 mx-auto mb-3" />
                              <p className="text-sm text-muted-foreground font-sans">
                                You haven't submitted any stories yet. Head to the Contributor Hub
                                to write your first story!
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {submissions.map((s: any) => (
                                <div
                                  key={s.id}
                                  className="bg-card/30 border border-border/40 rounded-xl p-4 space-y-3"
                                >
                                  <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-display font-bold text-foreground">
                                      {s.title}
                                    </h4>
                                    <span
                                      className={`text-[10px] font-sans px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                                        s.status === "Approved"
                                          ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                          : s.status === "Rejected"
                                            ? "bg-destructive/10 text-destructive border border-destructive/20"
                                            : "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                                      }`}
                                    >
                                      {s.status}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground font-sans line-clamp-2">
                                    {s.excerpt}
                                  </p>
                                  <div className="flex justify-between items-center text-[10px] font-sans text-muted-foreground border-t border-border/20 pt-2">
                                    <span>
                                      Submitted on{" "}
                                      {new Date(s.createdAt).toLocaleDateString("en-IN")}
                                    </span>
                                    <span>Category: {s.categoryName}</span>
                                  </div>
                                  {s.adminNotes && (
                                    <div className="bg-muted/50 border border-border/40 p-3 rounded-lg text-xs font-sans text-muted-foreground">
                                      <strong className="text-foreground">
                                        Moderator Feedback:
                                      </strong>{" "}
                                      {s.adminNotes}
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
                    <h2 className="font-display text-xl font-bold mb-1">Achievements</h2>
                    <p className="text-sm text-muted-foreground font-sans">
                      {earnedBadges.length} of {BADGE_DEFINITIONS.length} badges earned
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {BADGE_DEFINITIONS.map((badge) => {
                      const earned = earnedBadges.some((b) => b.slug === badge.slug);
                      const currentVal = stats
                        ? ((stats[badge.field as keyof UserStats] as number) ?? 0)
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

              {/* ── Collections Tab ── */}
              {activeTab === "collections" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <h3 className="font-display text-lg font-bold text-white">My Collections</h3>
                      <p className="text-xs text-muted-foreground font-sans">
                        Organize your bookmarked stories into custom list folders
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Collection name..."
                        value={newColName}
                        onChange={(e) => setNewColName(e.target.value)}
                        className="h-10 text-xs font-sans max-w-xs"
                      />
                      <Button
                        onClick={async () => {
                          if (!newColName.trim() || !session) return;
                          try {
                            const res = await fetch("/api/collections", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${session.access_token}`,
                              },
                              body: JSON.stringify({ name: newColName }),
                            });
                            const out = await res.json();
                            if (out.success) {
                              setNewColName("");
                              refetchData();
                            }
                          } catch {}
                        }}
                        className="h-10 px-4 bg-primary hover:bg-primary/90 text-white font-sans text-xs uppercase tracking-wider font-bold"
                      >
                        Create Folder
                      </Button>
                    </div>
                  </div>

                  {collections.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {collections.map((col) => (
                        <div
                          key={col.id}
                          className="bg-card/45 border border-border p-5 rounded-lg space-y-4"
                        >
                          <div className="flex justify-between items-center border-b border-border/40 pb-3">
                            <div className="flex items-center gap-2 flex-1 mr-2">
                              <FolderOpen className="size-5 text-gold shrink-0" />
                              {editingColId === col.id ? (
                                <div className="flex items-center gap-1 flex-1">
                                  <Input
                                    type="text"
                                    value={editingColName}
                                    onChange={(e) => setEditingColName(e.target.value)}
                                    className="h-8 text-xs font-sans bg-background"
                                    autoFocus
                                  />
                                  <Button
                                    size="sm"
                                    onClick={async () => {
                                      if (!editingColName.trim() || !session) return;
                                      try {
                                        const res = await fetch("/api/collections", {
                                          method: "PATCH",
                                          headers: {
                                            "Content-Type": "application/json",
                                            Authorization: `Bearer ${session.access_token}`,
                                          },
                                          body: JSON.stringify({
                                            collectionId: col.id,
                                            name: editingColName.trim(),
                                          }),
                                        });
                                        if (res.ok) {
                                          setEditingColId(null);
                                          refetchData();
                                        }
                                      } catch {}
                                    }}
                                    className="h-8 px-2 bg-gold hover:bg-gold/90 text-black text-xs"
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingColId(null)}
                                    className="h-8 px-2 text-xs"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-sm text-white">{col.name}</h4>
                                  <button
                                    onClick={() => {
                                      setEditingColId(col.id);
                                      setEditingColName(col.name);
                                    }}
                                    className="text-muted-foreground hover:text-gold transition-colors p-1"
                                    title="Rename Collection"
                                  >
                                    <Edit3 className="size-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={async () => {
                                if (!session) return;
                                if (
                                  !confirm(
                                    "Are you sure you want to delete this collection? Stories inside will not be deleted.",
                                  )
                                )
                                  return;
                                try {
                                  const res = await fetch("/api/collections", {
                                    method: "DELETE",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer ${session.access_token}`,
                                    },
                                    body: JSON.stringify({ collectionId: col.id }),
                                  });
                                  if (res.ok) refetchData();
                                } catch {}
                              }}
                              className="text-muted-foreground hover:text-red-400 transition-colors p-1"
                              title="Delete Collection"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>

                          <div className="space-y-2">
                            {col.stories && col.stories.length > 0 ? (
                              col.stories.map((story: any) => (
                                <div
                                  key={story.id}
                                  className="flex justify-between items-center text-xs"
                                >
                                  <Link
                                    to="/stories/$slug"
                                    params={{ slug: story.slug }}
                                    className="text-white hover:text-gold transition-colors font-medium font-sans truncate max-w-xs"
                                  >
                                    {story.title}
                                  </Link>
                                  <button
                                    onClick={async () => {
                                      if (!session) return;
                                      try {
                                        const res = await fetch("/api/collections", {
                                          method: "DELETE",
                                          headers: {
                                            "Content-Type": "application/json",
                                            Authorization: `Bearer ${session.access_token}`,
                                          },
                                          body: JSON.stringify({
                                            collectionId: col.id,
                                            storyId: story.id,
                                          }),
                                        });
                                        if (res.ok) refetchData();
                                      } catch {}
                                    }}
                                    className="text-muted-foreground/60 hover:text-white transition-colors"
                                  >
                                    <X className="size-3" />
                                  </button>
                                </div>
                              ))
                            ) : (
                              <p className="text-[11px] text-muted-foreground/80 italic font-sans">
                                Empty collection folder. Add bookmarks from story pages!
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 border border-dashed border-border/50 text-xs text-muted-foreground uppercase tracking-widest">
                      No collections created.
                    </div>
                  )}
                </div>
              )}

              {/* ── Following Tab ── */}
              {activeTab === "following" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-display text-lg font-bold text-white">Following ({followingCount})</h3>
                      <p className="text-xs text-muted-foreground font-sans">
                        Authors, Themes, and States you follow for instant notifications & personalized recommendations
                      </p>
                    </div>
                  </div>

                  {/* Followed Themes & States */}
                  {(followedThemesList.length > 0 || followedStatesList.length > 0) && (
                    <div className="bg-card/45 border border-border p-4 rounded-lg space-y-3">
                      <h4 className="text-xs font-bold text-gold uppercase tracking-wider">Followed Themes & Regional Hubs</h4>
                      <div className="flex flex-wrap gap-2">
                        {followedThemesList.map((t) => (
                          <div key={t} className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-xs px-2.5 py-1 rounded-full text-white">
                            <span>🎭 Theme: {t}</span>
                            <button
                              onClick={async () => {
                                if (!session) return;
                                await fetch("/api/authors/follow", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
                                  body: JSON.stringify({ themeId: t }),
                                });
                                refetchData();
                              }}
                              className="text-muted-foreground hover:text-red-400 font-bold ml-1"
                              title="Unfollow Theme"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {followedStatesList.map((s) => (
                          <div key={s} className="flex items-center gap-1.5 bg-gold/10 border border-gold/20 text-xs px-2.5 py-1 rounded-full text-gold">
                            <span>📍 State: {s}</span>
                            <button
                              onClick={async () => {
                                if (!session) return;
                                await fetch("/api/authors/follow", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
                                  body: JSON.stringify({ stateName: s }),
                                });
                                refetchData();
                              }}
                              className="text-muted-foreground hover:text-red-400 font-bold ml-1"
                              title="Unfollow State"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {followedAuthors.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {followedAuthors.map((author) => (
                        <div
                          key={author.id}
                          className="bg-card/45 border border-border p-4 rounded-lg flex items-start gap-4"
                        >
                          {author.avatar ? (
                            <img
                              src={author.avatar}
                              alt={author.name}
                              className="size-12 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="size-12 rounded-full bg-primary/25 border border-primary/25 text-white font-sans text-sm font-bold flex items-center justify-center shrink-0">
                              {author.name[0]}
                            </div>
                          )}
                          <div className="flex-1 space-y-2">
                            <div>
                              <h4 className="font-bold text-xs text-white hover:underline">
                                <Link to="/authors/$id" params={{ id: author.id }}>
                                  {author.name}
                                </Link>
                              </h4>
                              <p className="text-[10px] text-muted-foreground line-clamp-1">
                                {author.bio || "India Story Contributor"}
                              </p>
                            </div>

                            <button
                              onClick={async () => {
                                if (!session) return;
                                try {
                                  const res = await fetch("/api/authors/follow", {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer ${session.access_token}`,
                                    },
                                    body: JSON.stringify({ authorId: author.id }),
                                  });
                                  if (res.ok) refetchData();
                                } catch {}
                              }}
                              className="bg-primary/10 border border-primary/25 hover:bg-primary/20 text-gold text-[9px] uppercase tracking-wider font-bold px-2 py-0.5"
                            >
                              Unfollow
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 border border-dashed border-border/50 text-xs text-muted-foreground uppercase tracking-widest">
                      You are not following any authors yet.
                    </div>
                  )}
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
                          {
                            id: "website",
                            label: "Website URL",
                            Icon: Globe,
                            value: website,
                            setter: setWebsite,
                            placeholder: "https://yoursite.com",
                          },
                          {
                            id: "twitter",
                            label: "Twitter Handle",
                            Icon: Twitter,
                            value: twitter,
                            setter: setTwitter,
                            placeholder: "@handle",
                          },
                          {
                            id: "instagram",
                            label: "Instagram",
                            Icon: Instagram,
                            value: instagram,
                            setter: setInstagram,
                            placeholder: "@handle",
                          },
                          {
                            id: "linkedin",
                            label: "LinkedIn URL",
                            Icon: Linkedin,
                            value: linkedin,
                            setter: setLinkedin,
                            placeholder: "linkedin.com/in/...",
                          },
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

                  {/* Site Preferences Settings */}
                  <div className="mt-8 pt-8 border-t border-border/50 space-y-4">
                    <p className="text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                      Site Preferences
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans text-xs">
                      <div>
                        <label className="block font-bold text-white/60 mb-1">Color Theme</label>
                        <select
                          value={favTheme}
                          onChange={(e) => setFavTheme(e.target.value)}
                          className="w-full bg-[#1e1e1e] text-white border border-border px-3 py-2 rounded focus:outline-none"
                        >
                          <option value="dark">Dark Accents</option>
                          <option value="light">Light Editorial</option>
                          <option value="sepia">Warm Sepia</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-white/60 mb-1">Language</label>
                        <select
                          value={favState.split("-")[0]}
                          onChange={(e) =>
                            setFavState(`${e.target.value}-${favState.split("-")[1] || "normal"}`)
                          }
                          className="w-full bg-[#1e1e1e] text-white border border-border px-3 py-2 rounded focus:outline-none"
                        >
                          <option value="en">English</option>
                          <option value="hi">हिंदी (Hindi)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-white/60 mb-1">Text Size</label>
                        <select
                          value={favState.split("-")[1] || "normal"}
                          onChange={(e) =>
                            setFavState(`${favState.split("-")[0] || "en"}-${e.target.value}`)
                          }
                          className="w-full bg-[#1e1e1e] text-white border border-border px-3 py-2 rounded focus:outline-none"
                        >
                          <option value="normal">Normal</option>
                          <option value="large">Large Reading Font</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={async () => {
                          if (!session) return;
                          setPrefSaving(true);
                          setPrefSaved(false);
                          try {
                            const res = await fetch("/api/auth/profile", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${session.access_token}`,
                              },
                              body: JSON.stringify({
                                favoriteTheme: favTheme,
                                favoriteState: favState,
                              }),
                            });
                            if (res.ok) {
                              setPrefSaved(true);
                              // Instantly apply class overrides for theme/font-size
                              if (favTheme === "light") {
                                document.documentElement.classList.remove("dark");
                              } else {
                                document.documentElement.classList.add("dark");
                              }
                              setTimeout(() => setPrefSaved(false), 2000);
                            }
                          } catch {}
                          setPrefSaving(false);
                        }}
                        disabled={prefSaving}
                        className="h-10 px-4 bg-primary hover:bg-primary/90 text-white font-sans text-xs uppercase tracking-wider font-bold rounded-none"
                      >
                        {prefSaving ? "Saving preferences..." : "Save Preferences"}
                      </Button>
                      {prefSaved && (
                        <span className="text-xs text-gold flex items-center font-bold">
                          Preferences saved!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Account Danger / Compliance Actions */}
                  <div className="mt-8 pt-8 border-t border-border/50 space-y-4">
                    <p className="text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                      Account Utilities & Privacy
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={async () => {
                          if (!session) return;
                          try {
                            const res = await fetch("/api/auth/export-history", {
                              headers: { Authorization: `Bearer ${session.access_token}` },
                            });
                            const blob = await res.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = "india-story-reading-history.json";
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                          } catch {
                            toast.error("Failed to export logs.");
                          }
                        }}
                        className="h-10 px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-sans text-xs uppercase font-bold tracking-wider rounded-none"
                      >
                        Export Reading History
                      </Button>
                      <Button
                        onClick={async () => {
                          if (!session) return;
                          if (
                            !confirm(
                              "⚠️ WARNING: Deleting your account will wipe all bookmarks, collections, comments, claps, and reading streaks forever. This action is irreversible. Proceed?",
                            )
                          )
                            return;
                          try {
                            const res = await fetch("/api/auth/delete-account", {
                              method: "POST",
                              headers: { Authorization: `Bearer ${session.access_token}` },
                            });
                            const out = await res.json();
                            if (out.success) {
                              toast.success("Your account data was completely deleted.");
                              await signOut();
                              void navigate({ to: "/" });
                            } else {
                              toast.error(out.error || "Failed to delete account.");
                            }
                          } catch {
                            toast.error("An error occurred during account deletion.");
                          }
                        }}
                        className="h-10 px-4 bg-red-950/40 border border-red-500/35 hover:bg-red-900/40 text-red-400 font-sans text-xs uppercase font-bold tracking-wider rounded-none"
                      >
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  </div>
</SiteLayout>
  );
}
