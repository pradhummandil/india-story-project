import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
  Bell,
  ChevronRight,
  TrendingDown,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#161616]/90 border border-white/5 p-5 rounded hover:border-white/15 transition-all relative overflow-hidden group"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-white/40">
          {label}
        </span>
        <div className="size-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
          <Icon className="size-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <h4 className="font-display text-2xl font-bold text-white tracking-tight">{value}</h4>
        {delta && (
          <span
            className={`text-[10px] font-sans font-semibold flex items-center gap-0.5 ${isNegative ? "text-red-400" : "text-emerald-400"}`}
          >
            {isNegative ? <TrendingDown className="size-3" /> : <TrendingUp className="size-3" />}
            {delta}
          </span>
        )}
      </div>
    </motion.div>
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
      .catch(console.error)
      .finally(() => setStatsLoading(false));
  }, [user, session]);

  if (loading || !initialized) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64 text-white/30 font-sans text-xs uppercase tracking-widest animate-pulse">
          Verifying credentials…
        </div>
      </AdminLayout>
    );
  }

  const SkeletonMetricCard = () => (
    <div className="bg-[#161616]/90 border border-white/5 p-5 rounded animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3 w-16 bg-white/10 rounded" />
        <div className="size-8 rounded bg-white/5" />
      </div>
      <div className="h-6 w-12 bg-white/10 rounded" />
    </div>
  );

  const SkeletonList = () => (
    <div className="space-y-3 py-1">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="flex items-center justify-between animate-pulse">
          <div className="h-3 w-32 bg-white/10 rounded" />
          <div className="h-3 w-10 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  );

  const hasNotifications = stats
    ? stats.notifications.pendingSubmissions > 0 || stats.notifications.flaggedCommentsCount > 0
    : false;

  // Format reading time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hrs > 0) return `${hrs}h ${remainingMins}m`;
    return `${mins}m`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Dashboard Title Banner */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-white tracking-wide">
              CMS Analytics Hub
            </h1>
            <p className="text-xs font-sans text-white/50 uppercase tracking-widest mt-1">
              Real-time metrics, curation tools, and moderation status
            </p>
          </div>
          {hasNotifications && stats && (
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded px-3 py-1.5 text-xs text-white">
              <Bell className="size-3.5 text-primary animate-bounce" />
              <span className="font-sans font-semibold">
                {stats.notifications.pendingSubmissions + stats.notifications.flaggedCommentsCount}{" "}
                review items need attention
              </span>
            </div>
          )}
        </div>

        {/* Primary stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {statsLoading || !stats ? (
            <>
              <SkeletonMetricCard />
              <SkeletonMetricCard />
              <SkeletonMetricCard />
              <SkeletonMetricCard />
              <SkeletonMetricCard />
            </>
          ) : (
            <>
              <MetricCard label="Total Stories" value={stats.totalStories} icon={BookOpen} />
              <MetricCard
                label="Published"
                value={stats.published}
                icon={CheckCircle}
                delta="Live"
              />
              <MetricCard label="Drafts" value={stats.draft} icon={FileText} />
              <MetricCard label="Hidden" value={stats.hidden} icon={Eye} />
              <MetricCard
                label="Pending Approval"
                value={stats.pendingSubmissions}
                icon={ShieldAlert}
              />
            </>
          )}
        </div>

        {/* User engagement metrics row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {statsLoading || !stats ? (
            <>
              <SkeletonMetricCard />
              <SkeletonMetricCard />
              <SkeletonMetricCard />
              <SkeletonMetricCard />
              <SkeletonMetricCard />
              <SkeletonMetricCard />
            </>
          ) : (
            <>
              <MetricCard label="Total Users" value={stats.totalUsers} icon={Users} />
              <MetricCard label="Daily Active" value={stats.dailyReaders} icon={TrendingUp} />
              <MetricCard
                label="Total Views"
                value={stats.totalViews.toLocaleString()}
                icon={Eye}
              />
              <MetricCard label="Likes" value={stats.totalLikes.toLocaleString()} icon={Zap} />
              <MetricCard
                label="Comments"
                value={stats.totalComments.toLocaleString()}
                icon={MessageSquare}
              />
              <MetricCard
                label="Reading Time"
                value={formatTime(stats.totalReadingTime)}
                icon={Clock}
              />
            </>
          )}
        </div>

        {/* Charts and Data Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Growth graph */}
          <div className="lg:col-span-2 bg-[#161616] border border-white/10 p-5 rounded">
            <h3 className="font-sans text-xs font-bold text-white/50 uppercase tracking-wider mb-4">
              Story Publishing Trend (Last 6 Months)
            </h3>
            <div className="h-64">
              {statsLoading || !stats ? (
                <div className="h-full flex items-center justify-center animate-pulse text-white/20 text-xs font-sans">
                  Loading trend chart...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.growthCharts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        background: "#111",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 4,
                        color: "white",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#8B0000"
                      strokeWidth={3}
                      dot={{ fill: "#C8A96A" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Trending States list */}
          <div className="bg-[#161616] border border-white/10 p-5 rounded">
            <h3 className="font-sans text-xs font-bold text-white/50 uppercase tracking-wider mb-4">
              Trending States (By Views)
            </h3>
            <div className="space-y-4">
              {statsLoading || !stats ? (
                <SkeletonList />
              ) : stats.trendingStates.length === 0 ? (
                <p className="text-xs text-white/30 font-sans italic py-4">
                  No stories views tracked yet.
                </p>
              ) : (
                stats.trendingStates.map((state, i) => (
                  <div key={state.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-primary font-bold w-4">#{i + 1}</span>
                      <span className="text-xs text-white/80 font-sans font-semibold">
                        {state.name}
                      </span>
                    </div>
                    <span className="text-xs text-white/40 font-mono">
                      {state.viewCount.toLocaleString()} views
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Stories list */}
          <div className="bg-[#161616] border border-white/10 p-5 rounded">
            <h3 className="font-sans text-xs font-bold text-white/50 uppercase tracking-wider mb-4">
              Top Read Stories
            </h3>
            <div className="space-y-4">
              {statsLoading || !stats ? (
                <SkeletonList />
              ) : (
                stats.topStories.map((story) => (
                  <div key={story.slug} className="flex items-center justify-between gap-3">
                    <span className="text-xs font-sans text-white/80 font-semibold truncate max-w-[200px]">
                      {story.title}
                    </span>
                    <span className="text-xs text-gold font-bold font-mono whitespace-nowrap">
                      {story.viewCount.toLocaleString()} views
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Authors */}
          <div className="bg-[#161616] border border-white/10 p-5 rounded">
            <h3 className="font-sans text-xs font-bold text-white/50 uppercase tracking-wider mb-4">
              Top Authors
            </h3>
            <div className="space-y-4">
              {statsLoading || !stats ? (
                <SkeletonList />
              ) : (
                stats.topAuthors.map((author) => (
                  <div key={author.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/80 font-sans font-semibold">{author.name}</p>
                      <p className="text-[10px] text-white/40">
                        {author.storiesCount} stories written
                      </p>
                    </div>
                    <span className="text-xs text-white/50 font-mono font-semibold">
                      {author.viewCount.toLocaleString()} views
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notification Alerts */}
          <div className="bg-[#161616] border border-white/10 p-5 rounded flex flex-col justify-between">
            <div>
              <h3 className="font-sans text-xs font-bold text-white/50 uppercase tracking-wider mb-4">
                Moderation Action Items
              </h3>
              {statsLoading || !stats ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-14 bg-white/5 rounded" />
                  <div className="h-14 bg-white/5 rounded" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded bg-white/5 border border-white/5">
                    <div>
                      <p className="text-xs text-white/80 font-sans font-semibold">
                        Pending Submissions
                      </p>
                      <p className="text-[10px] text-white/40">Contributions awaiting validation</p>
                    </div>
                    <span className="size-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-bold">
                      {stats.notifications.pendingSubmissions}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded bg-white/5 border border-white/5">
                    <div>
                      <p className="text-xs text-white/80 font-sans font-semibold">
                        Flagged Comments
                      </p>
                      <p className="text-[10px] text-white/40">Reports submitted by readers</p>
                    </div>
                    <span className="size-6 rounded-full bg-yellow-500/20 flex items-center justify-center text-xs text-yellow-400 font-bold">
                      {stats.notifications.flaggedCommentsCount}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => void navigate({ to: "/admin/community" })}
              className="mt-4 w-full h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-sans text-white/80 rounded transition-colors gap-1.5"
            >
              Open Moderation Panel <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Latest activity log */}
        <div className="bg-[#161616] border border-white/10 p-5 rounded">
          <h3 className="font-sans text-xs font-bold text-white/50 uppercase tracking-wider mb-4">
            Recent System Activity
          </h3>
          <div className="divide-y divide-white/5">
            {statsLoading || !stats ? (
              <div className="space-y-3 py-2">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex justify-between animate-pulse">
                    <div className="h-3 w-48 bg-white/10 rounded" />
                    <div className="h-3 w-12 bg-white/10 rounded" />
                  </div>
                ))}
              </div>
            ) : stats.activities.length === 0 ? (
              <p className="text-xs text-white/30 font-sans italic py-4">
                No activities logged yet.
              </p>
            ) : (
              stats.activities.map((act, i) => (
                <div key={i} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-white/80 font-sans leading-relaxed">{act.title}</p>
                    <p className="text-[9px] text-white/40 mt-0.5">
                      {new Date(act.time).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/5 text-white/50">
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
