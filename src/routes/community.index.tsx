import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  MessageSquare,
  Users,
  Trophy,
  Award,
  Flame,
  Pin,
  ChevronRight,
  Volume2,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

export const Route = createFileRoute("/community/")({
  component: CommunityIndexPage,
});

export default function CommunityIndexPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/community/forums")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    {
      label: "Discussions",
      value: data?.stats?.totalTopics ?? 0,
      icon: MessageSquare,
      color: "#C8A96A",
    },
    {
      label: "Community Posts",
      value: data?.stats?.totalPosts ?? 0,
      icon: Flame,
      color: "#C86A6A",
    },
    { label: "Active Groups", value: data?.stats?.totalGroups ?? 0, icon: Users, color: "#6AB4C8" },
    {
      label: "Story Challenges",
      value: data?.stats?.totalChallenges ?? 0,
      icon: Trophy,
      color: "#8BC86A",
    },
  ];

  return (
    <div className="space-y-10">
      {/* ── Hero Section ── */}
      <div className="bg-card border border-border rounded-2xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
        <div className="space-y-4 max-w-xl text-center md:text-left z-10">
          <span className="text-[10px] text-primary font-bold uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded border border-primary/20">
            Topic Portals & Forums
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Documenting Every Local Hero & State
          </h1>
          <p className="text-muted-foreground font-sans text-sm leading-relaxed">
            Welcome to the India Story Project editorial hub. Join writers, researchers, and local
            historians across all states to share knowledge, publish profiles, and run writing
            challenges.
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
            <Link
              to="/community/forums"
              className="bg-primary text-primary-foreground text-[11px] font-sans font-bold uppercase tracking-widest px-5 py-3 rounded hover:bg-primary/95 transition-colors btn-premium"
            >
              Browse Forums
            </Link>
            <Link
              to="/community/challenges"
              className="bg-background border border-border text-foreground text-[11px] font-sans font-bold uppercase tracking-widest px-5 py-3 rounded hover:border-gold/50 transition-colors"
            >
              Writing Competitions
            </Link>
          </div>
        </div>

        <div className="w-full md:w-80 flex flex-col gap-3 z-10 bg-background/50 p-5 border border-border rounded-xl backdrop-blur-sm">
          <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-primary">
            Weekly Leaderboard Top 3
          </p>
          <div className="space-y-2">
            {[
              { rank: 1, name: "Pradhuman Dil", xp: "1,240 XP", label: "👑 Gold Tier" },
              { rank: 2, name: "Aarav Sharma", xp: "980 XP", label: "🥈 Silver Tier" },
              { rank: 3, name: "Diya Patel", xp: "850 XP", label: "🥉 Bronze Tier" },
            ].map((leader) => (
              <div
                key={leader.rank}
                className="flex justify-between items-center text-xs py-1.5 border-b border-border/40"
              >
                <span className="text-foreground font-sans font-bold">{leader.name}</span>
                <span className="text-gold font-mono text-[10px]">{leader.xp}</span>
              </div>
            ))}
          </div>
          <Link
            to="/community/rankings"
            className="text-[10px] uppercase tracking-widest font-sans font-bold text-muted-foreground hover:text-foreground inline-flex items-center gap-1 pt-1"
          >
            Full Rankings <ChevronRight className="size-3" />
          </Link>
        </div>
      </div>

      {/* ── Stats Metric Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-card border border-border p-5 flex items-center gap-4 hover:border-gold/30 transition-all rounded-xl shadow-sm"
            >
              <div className="p-3 bg-muted rounded-lg" style={{ color: stat.color }}>
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-foreground">
                  {loading ? "..." : stat.value}
                </p>
                <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Announcements Banner ── */}
      {!loading && data?.announcements?.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 p-5 rounded-xl flex items-start gap-4 shadow-sm">
          <Volume2 className="size-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <h4 className="text-xs font-sans font-bold uppercase tracking-widest text-foreground">
              Community Announcement: {data.announcements[0].title}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              {data.announcements[0].content}
            </p>
          </div>
        </div>
      )}

      {/* ── main split: discussions, etc. ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pinned / Latest discussions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Pin className="size-4 text-primary" />
              <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-foreground">
                Pinned Announcements & Topics
              </h2>
            </div>
            <Link
              to="/community/forums"
              className="text-[10px] text-muted-foreground hover:text-foreground uppercase tracking-widest font-sans font-bold flex items-center gap-1"
            >
              See Forums <ChevronRight className="size-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
              ))
            ) : data?.pinned?.length === 0 ? (
              <p className="text-muted-foreground text-xs font-sans py-4">No pinned topics in forum.</p>
            ) : (
              data?.pinned?.map((t: any) => (
                <Link
                  key={t.id}
                  to={`/community/topics/${t.id}` as any}
                  className="block bg-card border border-border hover:border-gold/40 p-4 transition-all rounded-xl shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded">
                          Pinned
                        </span>
                        <span className="text-xs font-sans font-bold text-foreground hover:text-primary transition-colors">
                          {t.title}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-sans">
                        Started by {t.user?.name || "Member"} • Category:{" "}
                        {t.category?.name || "General"}
                      </p>
                    </div>
                    <div className="text-right text-[10px] text-muted-foreground font-sans flex-shrink-0">
                      <p className="font-bold text-foreground">{t.replyCount} replies</p>
                      <p>{t.viewCount} views</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Pinned / Latest Discussions end */}
          <div className="flex items-center justify-between border-b border-border/60 pb-3 pt-4">
            <div className="flex items-center gap-2">
              <Flame className="size-4 text-primary" />
              <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-foreground">
                Trending Discussions
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
              ))
            ) : data?.trending?.length === 0 ? (
              <p className="text-muted-foreground text-xs font-sans py-4 col-span-2">
                No trending topics yet.
              </p>
            ) : (
              data?.trending?.map((t: any) => (
                <Link
                  key={t.id}
                  to={`/community/topics/${t.id}` as any}
                  className="block bg-card border border-border hover:border-gold/40 p-4 transition-all rounded-xl shadow-sm flex flex-col justify-between h-28"
                >
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      <span
                        className="text-[8px] font-sans font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm"
                        style={{
                          backgroundColor: `${t.category?.color || "#C8A96A"}15`,
                          color: t.category?.color || "#C8A96A",
                        }}
                      >
                        {t.category?.name || "General"}
                      </span>
                      <span className="text-[8px] text-muted-foreground font-mono">
                        {new Date(t.lastActivityAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    <h3 className="text-xs font-sans font-bold text-foreground line-clamp-2">
                      {t.title}
                    </h3>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border/40 text-[9px] text-muted-foreground font-sans">
                    <span>By {t.user?.name || "Reader"}</span>
                    <span>
                      {t.replyCount} replies • {t.viewCount} views
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Sidebar panels */}
        <div className="space-y-6">
          {/* Groups Directory Link */}
          <div className="bg-card border border-border p-6 space-y-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-foreground">
                Regional Hubs & Groups
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              Connect with fellow storytellers, historians, and editors grouped by Indian states or
              historical themes.
            </p>
            <Link
              to="/community/groups"
              className="inline-flex items-center justify-center bg-background border border-border w-full py-2.5 text-[10px] font-sans font-bold uppercase tracking-widest text-foreground hover:border-gold/50 transition-colors rounded-xl shadow-sm"
            >
              Explore Groups
            </Link>
          </div>

          {/* Active Challenges Link */}
          <div className="bg-card border border-border p-6 space-y-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2">
              <Trophy className="size-4 text-primary" />
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-foreground">
                Live Story Challenges
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              Compete in weekly themed writing challenges to win rare profile badges, XP, and cash
              grants.
            </p>
            <Link
              to="/community/challenges"
              className="inline-flex items-center justify-center bg-background border border-border w-full py-2.5 text-[10px] font-sans font-bold uppercase tracking-widest text-foreground hover:border-gold/50 transition-colors rounded-xl shadow-sm"
            >
              View Challenges
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
