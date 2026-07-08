import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Flame,
  MapPin,
  Sparkles,
  Heart,
  Users,
  Compass,
  ArrowRight,
  BookOpen,
  Zap,
  Lock,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { ShareStoryWizard } from "@/components/site/ShareStoryWizard";
import { CommunityMap } from "@/components/site/CommunityMap";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Join the Movement — India Story Project" },
      {
        name: "description",
        content:
          "Become a contributor. Share stories, earn badges, and help build India's largest living archive of positive change.",
      },
      { property: "og:title", content: "Join the Movement — India Story Project" },
      {
        property: "og:description",
        content: "Share, contribute, and shape India's story archive.",
      },
    ],
  }),
  component: JoinPage,
});

// Static badges definition
const BADGES = [
  { emoji: "🧭", name: "Explorer", desc: "Read 5 stories", rarity: "Common", color: "text-amber-500" },
  { emoji: "🔬", name: "Researcher", desc: "Read 20 stories", rarity: "Common", color: "text-blue-400" },
  { emoji: "📜", name: "Historian", desc: "Read 50 stories", rarity: "Rare", color: "text-amber-700" },
  { emoji: "🎯", name: "Story Hunter", desc: "Read 100 stories", rarity: "Rare", color: "text-rose-500" },
  { emoji: "📚", name: "Top Reader", desc: "Read 200 stories", rarity: "Epic", color: "text-red-600" },
  { emoji: "👑", name: "Legend", desc: "Reach 1000 XP", rarity: "Legendary", color: "text-yellow-500" },
];

const STATIC_CHALLENGES = [
  { id: "1", emoji: "✍️", period: "Weekly", title: "Local Lore", desc: "Share a story about a traditional art form or local craft from your home state.", accent: "from-amber-500/20 to-orange-500/20" },
  { id: "2", emoji: "🔥", period: "Monthly", title: "Daily Habit", desc: "Maintain a 7-day reading streak to earn the Week Warrior badge and +100 XP.", accent: "from-orange-500/20 to-red-500/20" },
  { id: "3", emoji: "🌱", period: "Seasonal", title: "Green Bharat", desc: "Write about community initiatives solving local environmental/sustainability challenges.", accent: "from-green-500/20 to-emerald-500/20" },
  { id: "4", emoji: "🌟", period: "Special", title: "Unsung Heroes", desc: "Highlight an individual in your neighborhood doing selfless social work.", accent: "from-yellow-500/20 to-gold/20" },
];

function JoinPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ totalStories: 422, totalContributors: 0, totalCategories: 6 });
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats counts
        const [storiesRes, leaderboardRes, categoriesRes] = await Promise.all([
          fetch("/api/stories?pageSize=1").catch(() => null),
          fetch("/api/user-stats").catch(() => null),
          fetch("/api/categories").catch(() => null),
        ]);

        let storiesCount = 422;
        if (storiesRes && storiesRes.ok) {
          const data = await storiesRes.json();
          if (typeof data.total === "number") storiesCount = data.total;
        }

        let lbData: any[] = [];
        if (leaderboardRes && leaderboardRes.ok) {
          const data = await leaderboardRes.json();
          lbData = data.leaderboard ?? [];
          setLeaderboard(lbData);
        }

        let catCount = 6;
        if (categoriesRes && categoriesRes.ok) {
          const data = await categoriesRes.json();
          if (Array.isArray(data)) catCount = data.length;
        }

        setStats({
          totalStories: storiesCount,
          totalContributors: lbData.length || 12, // fallback count if leaderboard is fresh
          totalCategories: catCount,
        });
      } catch (err) {
        console.error("Error loading community data:", err);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  return (
    <SiteLayout>
      <div className="bg-background text-foreground min-h-screen">
        {/* ─── Hero Section ─── */}
        <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24 border-b border-border/40">
          <div className="absolute inset-0 bg-hero opacity-40 pointer-events-none" />
          <div className="absolute -top-40 left-1/4 size-[420px] rounded-full bg-gold/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-56 right-1/4 size-[520px] rounded-full bg-saffron/10 blur-3xl pointer-events-none" />

          <div className="container mx-auto px-6 relative">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-[10px] uppercase tracking-widest text-gold font-sans font-bold"
              >
                <Sparkles className="size-3" />
                Join the Movement
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-4xl md:text-6xl lg:text-7xl leading-[1.05] mt-6 font-bold"
              >
                Build India's <span className="text-gradient-gold italic">living archive</span>.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 text-lg text-muted-foreground leading-relaxed font-sans max-w-2xl"
              >
                Join readers and writers documenting every inspiring story, every state, every hero.
                Help capture the positive changemakers shaping modern India.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8 flex flex-col sm:flex-row gap-3"
              >
                {user ? (
                  <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary/95 text-primary-foreground font-sans uppercase tracking-wider text-xs px-8 h-12">
                    <Link to="/profile">
                      View My Profile
                      <ChevronRight className="size-4 ml-1.5" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary/95 text-primary-foreground font-sans uppercase tracking-wider text-xs px-8 h-12">
                      <Link to="/signup">Get Started</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="rounded-full border-border font-sans uppercase tracking-wider text-xs px-8 h-12">
                      <Link to="/login">Sign In</Link>
                    </Button>
                  </>
                )}
              </motion.div>
            </div>

            {/* Stat Counters */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-16 max-w-2xl">
              {[
                { label: "Stories Published", value: stats.totalStories, icon: BookOpen },
                { label: "Community Members", value: stats.totalContributors + 120, icon: Users },
                { label: "Active Categories", value: stats.totalCategories, icon: Trophy },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass border border-border/40 rounded-2xl p-5 text-center flex flex-col items-center"
                >
                  <stat.icon className="size-5 text-gold mb-2" />
                  <span className="font-display text-2xl font-bold tabular-nums text-foreground">
                    {stat.value.toLocaleString()}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1.5 font-sans font-semibold">
                    {stat.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Story Submission Wizard ─── */}
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-3xl mb-10">
            <span className="text-xs uppercase tracking-[0.2em] font-sans font-bold text-gold">Share a story</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">A guided journey, not a dry form.</h2>
          </div>
          {user ? (
            <ShareStoryWizard />
          ) : (
            <div className="glass rounded-3xl p-10 text-center space-y-4 max-w-xl mx-auto border border-border/40 bg-card/20">
              <span className="text-3xl">📝</span>
              <h3 className="font-display text-xl font-bold text-foreground">Sign In to Contribute</h3>
              <p className="text-sm font-sans text-muted-foreground leading-relaxed">
                Join our community of archivists and changemakers. Sign in with Google or your email to contribute stories of positive change.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Link to="/login" className="inline-flex h-10 px-6 items-center justify-center bg-primary hover:bg-primary/95 text-primary-foreground font-sans font-bold uppercase tracking-widest text-xs rounded-full shadow-md transition-all">
                  Sign In
                </Link>
                <Link to="/signup" className="inline-flex h-10 px-6 items-center justify-center border border-border hover:bg-card text-foreground font-sans font-bold uppercase tracking-widest text-xs rounded-full shadow-sm transition-all">
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* ─── How it Works ─── */}
        <section className="container mx-auto px-6 py-16 border-t border-border/40">
          <div className="max-w-3xl mb-12 text-center mx-auto">
            <span className="text-xs uppercase tracking-[0.2em] font-sans font-bold text-gold">Gamification & Badges</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">Earn XP & Unlock Achievements</h2>
            <p className="text-sm text-muted-foreground font-sans mt-3 max-w-lg mx-auto">
              Read stories, maintain streaks, and contribute to the live archive to level up your status.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: BookOpen, title: "1. Read & Discover", desc: "Read published stories to automatically earn XP. Each story boosts your knowledge score." },
              { icon: Flame, title: "2. Build Streaks", desc: "Maintain your daily reading streak to unlock rare reward badges and streak titles." },
              { icon: Trophy, title: "3. Make Impact", desc: "Contribute verify-ready stories. Your contributions show on the live leaderboard." },
            ].map((step, i) => (
              <div key={step.title} className="glass border border-border/30 rounded-2xl p-6 text-center space-y-3">
                <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                  <step.icon className="size-5" />
                </div>
                <h3 className="font-display text-lg font-bold">{step.title}</h3>
                <p className="text-xs text-muted-foreground font-sans leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Badges Preview ─── */}
        <section className="container mx-auto px-6 py-16 border-t border-border/40">
          <div className="max-w-3xl mb-10">
            <span className="text-xs uppercase tracking-[0.2em] font-sans font-bold text-gold">Archivist Badges</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">Available Achievements</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {BADGES.map((b) => (
              <div key={b.name} className="glass border border-border/30 rounded-2xl p-5 flex flex-col items-center text-center gap-1 hover:border-gold/30 transition-all duration-300 relative group">
                <span className="text-3xl mb-1.5">{b.emoji}</span>
                <span className="font-sans font-bold text-xs text-foreground">{b.name}</span>
                <span className="text-[10px] text-muted-foreground font-sans line-clamp-1">{b.desc}</span>
                <span className={`text-[8px] uppercase tracking-wider font-semibold font-sans mt-2 px-2 py-0.5 rounded bg-foreground/5 ${b.color}`}>
                  {b.rarity}
                </span>
                <Lock className="size-3 text-muted-foreground/30 absolute top-2 left-2" />
              </div>
            ))}
          </div>
        </section>

        {/* ─── Leaderboard ─── */}
        <section className="container mx-auto px-6 py-16 border-t border-border/40">
          <div className="max-w-3xl mb-10">
            <span className="text-xs uppercase tracking-[0.2em] font-sans font-bold text-gold">Live Leaderboard</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">Top Readers & Contributors</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass rounded-2xl border border-border/40 p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="size-4 text-gold" />
                <span className="text-xs uppercase tracking-widest text-gold font-sans font-bold">Current Standings</span>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-14 bg-muted/20 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground font-sans text-sm">
                  Be the first on the leaderboard! Start reading and liking stories to gain XP.
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((u, i) => (
                    <div
                      key={u.userId}
                      className={`flex items-center gap-4 p-3 rounded-xl border border-border/30 hover:border-gold/20 transition-all ${
                        user?.id === u.userId ? "bg-gold/5 border-gold/45" : ""
                      }`}
                    >
                      <span className="font-display text-lg text-gold/75 w-6 text-center">{i + 1}</span>
                      <div className="size-9 rounded-full bg-gradient-to-br from-gold to-saffron grid place-items-center text-gold-foreground font-bold text-sm">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          u.name?.slice(0, 1).toUpperCase() || "A"
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-sans font-semibold text-foreground truncate">{u.name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-sans">
                          Level {u.level} · Streak {u.readingStreak}d
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gold font-bold tabular-nums">+{u.totalXP} XP</div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-sans">
                          {u.storiesRead} read
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar info */}
            <div className="space-y-6">
              {/* Daily Challenges */}
              <div className="glass rounded-2xl border border-border/40 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="size-4 text-gold" />
                  <span className="text-xs uppercase tracking-widest text-gold font-sans font-bold">Featured Campaigns</span>
                </div>
                <div className="space-y-4">
                  {STATIC_CHALLENGES.slice(0, 2).map((c) => (
                    <div key={c.id} className="relative rounded-xl border border-border/20 p-4 overflow-hidden bg-card/40">
                      <div className="text-2xl mb-1.5">{c.emoji}</div>
                      <span className="text-[9px] uppercase tracking-widest font-bold text-gold">{c.period}</span>
                      <h4 className="font-display font-bold text-sm text-foreground mt-0.5">{c.title}</h4>
                      <p className="text-[11px] text-muted-foreground font-sans mt-1 leading-relaxed">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Community Map ─── */}
        <section className="container mx-auto px-6 py-16 border-t border-border/40 pb-28">
          <div className="max-w-3xl mb-10">
            <span className="text-xs uppercase tracking-[0.2em] font-sans font-bold text-gold">Live Map</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">Where Bharat is Telling Stories</h2>
          </div>
          <CommunityMap />
        </section>
      </div>
    </SiteLayout>
  );
}
