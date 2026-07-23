import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle,
  FileText,
  Eye,
  Users,
  TrendingUp,
  Clock,
  MessageSquare,
  Zap,
  ShieldAlert,
  ChevronRight,
  TrendingDown,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

export const Route = createLazyFileRoute("/admin/")({
  component: AdminDashboard,
});

type DashboardStats = {
  totalStories: number;
  published: number;
  draft: number;
  hidden: number;
  archived: number;
  pendingSubmissions: number;
  totalUsers: number;
  dailyReaders: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalBookmarks: number;
  totalReadingTime: number;
  topStories: Array<{ title: string; viewCount: number; slug: string }>;
  topAuthors: Array<{ name: string; viewCount: number; storiesCount: number }>;
  trendingStates: Array<{ name: string; viewCount: number; storiesCount: number }>;
  growthCharts: Array<{ month: string; count: number }>;
  activities: Array<{ type: string; title: string; time: string; meta: string }>;
  notifications: {
    pendingSubmissions: number;
    flaggedCommentsCount: number;
  };
};

function MetricCard({
  label,
  value,
  icon: Icon,
  delta,
  isNegative = false,
}: {
  label: string;
  value: string | number;
  icon: any;
  delta?: string;
  isNegative?: boolean;
}) {
  return (
    <div className="bg-card border border-border p-5 rounded-xl hover:border-primary/40 transition-all shadow-sm flex flex-col justify-between h-32 group">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-200">
          <Icon className="size-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-2 mt-auto">
        <h4 className="font-display text-2xl font-bold text-foreground tracking-tight">{value}</h4>
        {delta && (
          <span
            className={`text-[9px] font-sans font-bold uppercase tracking-wider flex items-center gap-0.5 ${
              isNegative ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {isNegative ? <TrendingDown className="size-2.5" /> : <TrendingUp className="size-2.5" />}
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, session, initialized, loading } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);

  useEffect(() => {
    if (!user || !session) return;
    setStatsLoading(true);
    fetch("/api/admin/analytics", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then((data) => setStats(data as DashboardStats))
      .catch((err) => console.error("Failed to load admin stats:", err))
      .finally(() => setStatsLoading(false));
  }, [user, session]);

  if (loading || !initialized) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-96 gap-4 select-none">
          <div className="size-10 rounded-full border-2 border-[#C8A96A] border-t-transparent animate-spin" />
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-white/30">
            Authorizing...
          </span>
        </div>
      </AdminLayout>
    );
  }

  const SkeletonMetricCard = () => (
    <div className="bg-card/50 border border-border p-5 rounded-xl h-32 animate-pulse" />
  );

  const SkeletonList = () => (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-6 bg-muted/40 animate-pulse rounded" />
      ))}
    </div>
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hrs > 0) return `${hrs}h ${remainingMins}m`;
    return `${mins}m`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto select-none">
        
        {/* Title Header Banner */}
        <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-border/60 pb-5 gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-wide">
              Overview Dashboard
            </h1>
            <p className="text-[10px] font-sans text-muted-foreground uppercase tracking-widest mt-1.5 font-bold">
              Real-time site metrics, editorial pipeline stats, and user logs
            </p>
          </div>
          
          {stats && (stats.notifications.pendingSubmissions > 0 || stats.notifications.flaggedCommentsCount > 0) && (
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5 text-xs text-primary">
              <span className="relative flex size-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-primary"></span>
              </span>
              <span className="font-sans font-bold tracking-wide text-[10px] uppercase">
                {stats.notifications.pendingSubmissions + stats.notifications.flaggedCommentsCount} review items need moderation
              </span>
            </div>
          )}
        </div>

        {/* First Row KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statsLoading || !stats ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonMetricCard key={i} />)
          ) : (
            <>
              <MetricCard label="Total Stories" value={stats.totalStories} icon={BookOpen} />
              <MetricCard label="Published" value={stats.published} icon={CheckCircle} delta="Live" />
              <MetricCard label="Drafts" value={stats.draft} icon={FileText} />
              <MetricCard label="Hidden" value={stats.hidden} icon={Eye} />
              <MetricCard label="Submissions" value={stats.pendingSubmissions} icon={ShieldAlert} />
            </>
          )}
        </div>

        {/* Second Row KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {statsLoading || !stats ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonMetricCard key={i} />)
          ) : (
            <>
              <MetricCard label="Total Users" value={stats.totalUsers} icon={Users} />
              <MetricCard label="Daily Active" value={stats.dailyReaders} icon={TrendingUp} />
              <MetricCard label="Total Views" value={stats.totalViews.toLocaleString()} icon={Eye} />
              <MetricCard label="Likes" value={stats.totalLikes.toLocaleString()} icon={Zap} />
              <MetricCard label="Comments" value={stats.totalComments.toLocaleString()} icon={MessageSquare} />
              <MetricCard label="Reading Time" value={formatTime(stats.totalReadingTime)} icon={Clock} />
            </>
          )}
        </div>

        {/* Charts & Trending Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Trend Chart */}
          <div className="lg:col-span-2 bg-card border border-border p-5 rounded-xl shadow-sm">
            <h3 className="text-[10px] font-sans font-bold text-muted-foreground uppercase tracking-widest mb-6">
              Story Publishing Trend (Last 6 Months)
            </h3>
            <div className="h-64">
              {statsLoading || !stats ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-xs font-sans animate-pulse">
                  Loading trend chart...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.growthCharts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fill: "currentColor", fontSize: 10 }} stroke="var(--border)" />
                    <YAxis tick={{ fill: "currentColor", fontSize: 10 }} stroke="var(--border)" />
                    <RechartsTooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        color: "var(--foreground)",
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="var(--primary)"
                      strokeWidth={2.5}
                      dot={{ fill: "var(--primary)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* States list */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col">
            <h3 className="text-[10px] font-sans font-bold text-muted-foreground uppercase tracking-widest mb-6">
              Trending States (By Views)
            </h3>
            <div className="space-y-4 my-auto">
              {statsLoading || !stats ? (
                <SkeletonList />
              ) : stats.trendingStates.length === 0 ? (
                <p className="text-xs text-muted-foreground font-sans italic py-4 text-center">
                  No views registered.
                </p>
              ) : (
                stats.trendingStates.map((state, i) => (
                  <div key={state.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs text-primary font-bold w-4">#{i + 1}</span>
                      <span className="text-xs text-foreground font-sans font-semibold">
                        {state.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {state.viewCount.toLocaleString()} views
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Authors, Stories & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Top read */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
            <h3 className="text-[10px] font-sans font-bold text-muted-foreground uppercase tracking-widest mb-6">
              Top Read Stories
            </h3>
            <div className="space-y-4">
              {statsLoading || !stats ? (
                <SkeletonList />
              ) : (
                stats.topStories.map((story) => (
                  <div key={story.slug} className="flex items-center justify-between gap-3">
                    <span className="text-xs font-sans text-foreground font-semibold truncate max-w-[200px]">
                      {story.title}
                    </span>
                    <span className="text-xs text-primary font-bold font-mono">
                      {story.viewCount.toLocaleString()} views
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Authors list */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
            <h3 className="text-[10px] font-sans font-bold text-muted-foreground uppercase tracking-widest mb-6">
              Top Authors
            </h3>
            <div className="space-y-4">
              {statsLoading || !stats ? (
                <SkeletonList />
              ) : (
                stats.topAuthors.map((author) => (
                  <div key={author.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-foreground font-sans font-semibold">{author.name}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">
                        {author.storiesCount} dispatches published
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono font-medium">
                      {author.viewCount.toLocaleString()} views
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Actions & Alerts */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] font-sans font-bold text-muted-foreground uppercase tracking-widest mb-6">
                Moderation Action Items
              </h3>
              {statsLoading || !stats ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-14 bg-muted/40 rounded-lg" />
                  <div className="h-14 bg-muted/40 rounded-lg" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-lg bg-background border border-border">
                    <div>
                      <p className="text-xs text-foreground font-sans font-semibold">
                        Pending Submissions
                      </p>
                      <p className="text-[9px] text-muted-foreground">User contributions awaiting review</p>
                    </div>
                    <span className="size-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-bold">
                      {stats.notifications.pendingSubmissions}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-lg bg-background border border-border">
                    <div>
                      <p className="text-xs text-foreground font-sans font-semibold">
                        Flagged Comments
                      </p>
                      <p className="text-[9px] text-muted-foreground">Comments flagged by readers</p>
                    </div>
                    <span className="size-6 rounded-full bg-destructive/20 flex items-center justify-center text-xs text-destructive font-bold">
                      {stats.notifications.flaggedCommentsCount}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => void navigate({ to: "/admin/community" })}
              className="mt-6 w-full h-10 flex items-center justify-center bg-primary hover:bg-primary/95 text-primary-foreground font-sans text-xs font-semibold rounded-lg transition-colors gap-1.5 cursor-pointer shadow-sm"
            >
              Open Moderation Panel <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Activity log */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <h3 className="text-[10px] font-sans font-bold text-muted-foreground uppercase tracking-widest mb-6">
            Recent System Activity
          </h3>
          <div className="divide-y divide-border/60">
            {statsLoading || !stats ? (
              <div className="space-y-3 py-2">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex justify-between animate-pulse">
                    <div className="h-3 w-48 bg-muted/40 rounded" />
                    <div className="h-3 w-12 bg-muted/40 rounded" />
                  </div>
                ))}
              </div>
            ) : stats.activities.length === 0 ? (
              <p className="text-xs text-muted-foreground font-sans italic py-4 text-center">
                No activities logged.
              </p>
            ) : (
              stats.activities.map((act, i) => (
                <div key={i} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-foreground font-sans leading-relaxed font-medium">{act.title}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">
                      {new Date(act.time).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground">
                    {act.meta}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
