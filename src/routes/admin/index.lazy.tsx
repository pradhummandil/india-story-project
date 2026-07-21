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
    <div className="bg-[#121212] border border-white/5 p-5 rounded-lg hover:border-white/15 transition-all shadow-sm flex flex-col justify-between h-32 group">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-sans font-black uppercase tracking-wider text-white/40">
          {label}
        </span>
        <div className="size-8 rounded-lg bg-[#C8A96A]/5 border border-[#C8A96A]/10 flex items-center justify-center text-[#C8A96A] group-hover:scale-105 transition-transform duration-200">
          <Icon className="size-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-2 mt-auto">
        <h4 className="font-display text-2xl font-bold text-white tracking-tight">{value}</h4>
        {delta && (
          <span
            className={`text-[9px] font-sans font-black uppercase tracking-wider flex items-center gap-0.5 ${
              isNegative ? "text-red-400" : "text-emerald-400"
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
      .catch(console.error)
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
    <div className="bg-[#121212] border border-white/5 p-5 rounded-lg h-32 flex flex-col justify-between animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3 w-16 bg-white/5 rounded" />
        <div className="size-8 rounded-lg bg-white/5" />
      </div>
      <div className="h-6 w-12 bg-white/5 rounded mt-auto" />
    </div>
  );

  const SkeletonList = () => (
    <div className="space-y-4 py-1">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="flex items-center justify-between animate-pulse">
          <div className="h-3.5 w-32 bg-white/5 rounded" />
          <div className="h-3.5 w-10 bg-white/5 rounded" />
        </div>
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
        <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-white/5 pb-5 gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-white tracking-wide">
              Overview Dashboard
            </h1>
            <p className="text-[10px] font-sans text-white/40 uppercase tracking-widest mt-1.5 font-bold">
              Real-time site metrics, editorial pipeline stats, and user logs
            </p>
          </div>
          
          {stats && (stats.notifications.pendingSubmissions > 0 || stats.notifications.flaggedCommentsCount > 0) && (
            <div className="inline-flex items-center gap-2 bg-[#C8A96A]/10 border border-[#C8A96A]/20 rounded-lg px-3 py-1.5 text-xs text-[#C8A96A]">
              <span className="relative flex size-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C8A96A] opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-[#C8A96A]"></span>
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
          <div className="lg:col-span-2 bg-[#121212] border border-white/5 p-5 rounded-lg">
            <h3 className="text-[10px] font-sans font-black text-white/40 uppercase tracking-widest mb-6">
              Story Publishing Trend (Last 6 Months)
            </h3>
            <div className="h-64">
              {statsLoading || !stats ? (
                <div className="h-full flex items-center justify-center text-white/20 text-xs font-sans animate-pulse">
                  Loading trend chart...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.growthCharts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} stroke="rgba(255,255,255,0.1)" />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} stroke="rgba(255,255,255,0.1)" />
                    <RechartsTooltip
                      contentStyle={{
                        background: "#161616",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 8,
                        color: "white",
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#C8A96A"
                      strokeWidth={2.5}
                      dot={{ fill: "#C8A96A" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* States list */}
          <div className="bg-[#121212] border border-white/5 p-5 rounded-lg flex flex-col">
            <h3 className="text-[10px] font-sans font-black text-white/40 uppercase tracking-widest mb-6">
              Trending States (By Views)
            </h3>
            <div className="space-y-4 my-auto">
              {statsLoading || !stats ? (
                <SkeletonList />
              ) : stats.trendingStates.length === 0 ? (
                <p className="text-xs text-white/30 font-sans italic py-4 text-center">
                  No views registered.
                </p>
              ) : (
                stats.trendingStates.map((state, i) => (
                  <div key={state.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs text-[#C8A96A] font-bold w-4">#{i + 1}</span>
                      <span className="text-xs text-white/80 font-sans font-medium">
                        {state.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-white/40 font-mono">
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
          <div className="bg-[#121212] border border-white/5 p-5 rounded-lg">
            <h3 className="text-[10px] font-sans font-black text-white/40 uppercase tracking-widest mb-6">
              Top Read Stories
            </h3>
            <div className="space-y-4">
              {statsLoading || !stats ? (
                <SkeletonList />
              ) : (
                stats.topStories.map((story) => (
                  <div key={story.slug} className="flex items-center justify-between gap-3">
                    <span className="text-xs font-sans text-white/80 font-medium truncate max-w-[200px]">
                      {story.title}
                    </span>
                    <span className="text-xs text-[#C8A96A] font-bold font-mono">
                      {story.viewCount.toLocaleString()} views
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Authors list */}
          <div className="bg-[#121212] border border-white/5 p-5 rounded-lg">
            <h3 className="text-[10px] font-sans font-black text-white/40 uppercase tracking-widest mb-6">
              Top Authors
            </h3>
            <div className="space-y-4">
              {statsLoading || !stats ? (
                <SkeletonList />
              ) : (
                stats.topAuthors.map((author) => (
                  <div key={author.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/80 font-sans font-medium">{author.name}</p>
                      <p className="text-[9px] text-white/30 mt-0.5">
                        {author.storiesCount} dispatches published
                      </p>
                    </div>
                    <span className="text-xs text-white/50 font-mono font-medium">
                      {author.viewCount.toLocaleString()} views
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Actions & Alerts */}
          <div className="bg-[#121212] border border-white/5 p-5 rounded-lg flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] font-sans font-black text-white/40 uppercase tracking-widest mb-6">
                Moderation Action Items
              </h3>
              {statsLoading || !stats ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-14 bg-white/5 rounded-lg" />
                  <div className="h-14 bg-white/5 rounded-lg" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-lg bg-white/5 border border-white/5">
                    <div>
                      <p className="text-xs text-white/80 font-sans font-semibold">
                        Pending Submissions
                      </p>
                      <p className="text-[9px] text-white/30">User contributions awaiting review</p>
                    </div>
                    <span className="size-6 rounded-full bg-[#C8A96A]/20 flex items-center justify-center text-xs text-[#C8A96A] font-bold">
                      {stats.notifications.pendingSubmissions}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-lg bg-white/5 border border-white/5">
                    <div>
                      <p className="text-xs text-white/80 font-sans font-semibold">
                        Flagged Comments
                      </p>
                      <p className="text-[9px] text-white/30">Comments flagged by readers</p>
                    </div>
                    <span className="size-6 rounded-full bg-red-500/20 flex items-center justify-center text-xs text-red-400 font-bold">
                      {stats.notifications.flaggedCommentsCount}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => void navigate({ to: "/admin/community" })}
              className="mt-6 w-full h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/8 text-xs font-sans text-white/85 rounded-lg transition-colors gap-1.5 cursor-pointer"
            >
              Open Moderation Panel <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Activity log */}
        <div className="bg-[#121212] border border-white/5 p-5 rounded-lg">
          <h3 className="text-[10px] font-sans font-black text-white/40 uppercase tracking-widest mb-6">
            Recent System Activity
          </h3>
          <div className="divide-y divide-white/5">
            {statsLoading || !stats ? (
              <div className="space-y-3 py-2">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex justify-between animate-pulse">
                    <div className="h-3 w-48 bg-white/5 rounded" />
                    <div className="h-3 w-12 bg-white/5 rounded" />
                  </div>
                ))}
              </div>
            ) : stats.activities.length === 0 ? (
              <p className="text-xs text-white/30 font-sans italic py-4 text-center">
                No activities logged.
              </p>
            ) : (
              stats.activities.map((act, i) => (
                <div key={i} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-white/85 font-sans leading-relaxed">{act.title}</p>
                    <p className="text-[9px] text-white/30 mt-0.5">
                      {new Date(act.time).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-white/5 border border-white/5 text-white/40">
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
