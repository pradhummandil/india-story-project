import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import {
  Eye,
  Users,
  BookOpen,
  Clock,
  Globe,
  MapPin,
  TrendingUp,
  Flame,
  Activity,
  BarChart2,
  Wifi,
  Monitor,
  Smartphone,
  Radio,
  Search,
  Share2,
  RefreshCw,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export const Route = createLazyFileRoute("/admin/analytics/")({
  component: EnterpriseAnalyticsPage,
});

// ─── Color palette for charts ────────────────────────────────────────────────
const CHART_COLORS = [
  "#C8A96A",
  "#8B0000",
  "#6AB4C8",
  "#C86A6A",
  "#8BC86A",
  "#C8A06A",
  "#6A8BC8",
  "#C86AB4",
];
const TRAFFIC_COLORS: Record<string, string> = {
  google: "#4285F4",
  facebook: "#1877F2",
  instagram: "#E4405F",
  twitter: "#1DA1F2",
  search: "#34A853",
  direct: "#C8A96A",
  referral: "#8B0000",
  email: "#9C27B0",
  youtube: "#FF0000",
  linkedin: "#0077B5",
  whatsapp: "#25D366",
};

type Period = "daily" | "weekly" | "monthly" | "yearly";

const PERIODS: { id: Period; label: string }[] = [
  { id: "daily", label: "Today" },
  { id: "weekly", label: "7 Days" },
  { id: "monthly", label: "30 Days" },
  { id: "yearly", label: "12 Months" },
];

// ─── Metric Card Component ───────────────────────────────────────────────────
function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  color = "#C8A96A",
  loading = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color?: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-card border border-border/80 p-5 space-y-3 relative overflow-hidden group hover:border-primary/40 transition-colors rounded-xl shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <Icon
          className="size-4 text-muted-foreground group-hover:text-primary transition-colors"
          style={{ color }}
        />
      </div>
      {loading ? (
        <div className="h-8 w-24 bg-muted/60 rounded animate-pulse" />
      ) : (
        <p className="font-display text-3xl font-bold text-foreground tabular-nums">
          {typeof value === "number" ? value.toLocaleString("en-IN") : value}
        </p>
      )}
      {sub && <p className="text-[10px] text-muted-foreground font-sans font-medium">{sub}</p>}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5"
        style={{ backgroundColor: color, opacity: 0.6 }}
      />
    </div>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────
function SectionHeader({
  title,
  icon: Icon,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <Icon className="size-4 text-primary" />
      <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function EnterpriseAnalyticsPage() {
  const navigate = useNavigate();
  const { user, session, initialized } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("monthly");
  const [liveCount, setLiveCount] = useState<number>(0);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = session?.access_token;
      const headers: any = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/admin/analytics?period=${period}`, { headers });
      const json = await res.json();
      setData(json);
      setLiveCount(json.pageViewMetrics?.liveVisitors ?? 0);
      setLastRefresh(new Date());
    } catch (e) {
      console.error("Analytics fetch error", e);
    } finally {
      setLoading(false);
    }
  }, [user, session, period]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Auto-refresh live count every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`/api/admin/analytics?period=daily`)
        .then((r) => r.json())
        .then((d) => setLiveCount(d.pageViewMetrics?.liveVisitors ?? 0))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const pv = data?.pageViewMetrics;
  const hasPV = pv !== null && pv !== undefined;

  const topStories = data?.topStories ?? [];
  const topAuthors = data?.topAuthors ?? [];
  const topThemes = data?.topThemes ?? [];
  const topVideos = data?.topVideos ?? [];
  const trendingStates = data?.trendingStates ?? [];
  const timeSeries = data?.timeSeries ?? [];
  const activities = data?.activities ?? [];

  return (
    <AdminLayout
      title="Enterprise Analytics"
      subtitle="Real-time intelligence platform for editorial decisions"
    >
      {/* ── Controls Row ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 bg-muted/40 p-1 border border-border/60 rounded-xl">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-4 py-2 text-[10px] font-sans font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                period === p.id
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {/* Live counter */}
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-sans font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              {liveCount} Live
            </span>
          </div>
          <button
            onClick={() => void fetchData()}
            disabled={loading}
            className="flex items-center gap-1.5 bg-card border border-border px-3 py-1.5 text-[10px] font-sans font-bold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors rounded-lg cursor-pointer shadow-xs"
          >
            <RefreshCw className={`size-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <span className="text-[9px] text-muted-foreground font-sans font-medium">
            Updated {lastRefresh.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* ── Tier 1: Hero Metrics Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
        <MetricCard
          label="Total Views"
          value={data?.totalViews ?? 0}
          icon={Eye}
          color="#C8A96A"
          loading={loading}
          sub="All time story views"
        />
        <MetricCard
          label="Unique Visitors"
          value={hasPV ? pv.uniqueVisitors : "—"}
          icon={Users}
          color="#6AB4C8"
          loading={loading}
          sub={period}
        />
        <MetricCard
          label="Returning Readers"
          value={hasPV ? pv.returningReaders : "—"}
          icon={RefreshCw}
          color="#8BC86A"
          loading={loading}
          sub="Same session origin"
        />
        <MetricCard
          label="Live Visitors"
          value={liveCount}
          icon={Wifi}
          color="#C86A6A"
          loading={false}
          sub="Active last 5 min"
        />
        <MetricCard
          label="Completion Rate"
          value={hasPV ? `${pv.completionRate}%` : "—"}
          icon={TrendingUp}
          color="#C8A06A"
          loading={loading}
          sub="95%+ scroll depth"
        />
        <MetricCard
          label="Avg Session"
          value={hasPV ? `${Math.round(pv.avgSession / 60)}m ${pv.avgSession % 60}s` : "—"}
          icon={Clock}
          color="#6A8BC8"
          loading={loading}
          sub="Time on page"
        />
      </div>

      {/* ── Tier 2: Secondary Metrics ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <MetricCard
          label="Published Stories"
          value={data?.published ?? 0}
          icon={BookOpen}
          color="#C8A96A"
          loading={loading}
        />
        <MetricCard
          label="Registered Readers"
          value={data?.totalUsers ?? 0}
          icon={Users}
          color="#6AB4C8"
          loading={loading}
        />
        <MetricCard
          label="Active Today"
          value={data?.dailyReaders ?? 0}
          icon={Activity}
          color="#8BC86A"
          loading={loading}
        />
        <MetricCard
          label="Avg Scroll Depth"
          value={hasPV ? `${pv.avgScrollDepth}%` : "—"}
          icon={BarChart2}
          color="#C86A6A"
          loading={loading}
        />
      </div>

      {/* ── Time Series Chart ── */}
      <div className="bg-card border border-border/80 p-6 mb-6 rounded-xl shadow-sm">
        <SectionHeader
          title={`Traffic Trends (${PERIODS.find((p) => p.id === period)?.label})`}
          icon={TrendingUp}
        />
        {timeSeries.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={timeSeries} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C8A96A" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#C8A96A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6AB4C8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6AB4C8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#666666", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "#666666", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.1)",
                  color: "#1a1a1a",
                  fontSize: 11,
                  borderRadius: 8,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                }}
                labelStyle={{ color: "#C8A96A", fontWeight: "bold" }}
              />
              <Legend wrapperStyle={{ color: "#666666", fontSize: 10 }} />
              <Area
                type="monotone"
                dataKey="views"
                name="Page Views"
                stroke="#C8A96A"
                strokeWidth={2}
                fill="url(#gradViews)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="visitors"
                name="Unique Visitors"
                stroke="#6AB4C8"
                strokeWidth={2}
                fill="url(#gradVisitors)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-60 flex items-center justify-center text-muted-foreground text-xs font-sans">
            No time-series data available
          </div>
        )}
      </div>

      {/* ── Row 2: Traffic Sources + Device Breakdown + Geo ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Traffic Sources */}
        <div className="bg-card border border-border/80 p-6 rounded-xl shadow-sm">
          <SectionHeader title="Traffic Sources" icon={Share2} />
          {hasPV && pv.trafficSources?.length > 0 ? (
            <div className="space-y-2.5">
              {pv.trafficSources.map((s: any) => {
                const max = pv.trafficSources[0]?.count || 1;
                const pct = Math.round((s.count / max) * 100);
                const color = TRAFFIC_COLORS[s.source] || "#C8A96A";
                return (
                  <div key={s.source}>
                    <div className="flex justify-between text-[10px] font-sans mb-1">
                      <span className="text-foreground uppercase tracking-wider font-bold">
                        {s.source}
                      </span>
                      <span className="text-muted-foreground tabular-nums font-mono">{s.count.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-muted/60 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2.5">
              {[
                { source: "google", count: 0 },
                { source: "facebook", count: 0 },
                { source: "instagram", count: 0 },
                { source: "twitter", count: 0 },
                { source: "direct", count: 0 },
                { source: "search", count: 0 },
              ].map((s) => (
                <div key={s.source} className="flex justify-between text-[10px] font-sans">
                  <span className="text-muted-foreground uppercase tracking-wider font-semibold">{s.source}</span>
                  <span className="text-muted-foreground/60 font-mono">Tracking active</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Device Breakdown Pie */}
        <div className="bg-card border border-border/80 p-6 rounded-xl shadow-sm">
          <SectionHeader title="Device Breakdown" icon={Monitor} />
          {hasPV && pv.devices?.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pv.devices.map((d: any) => ({ name: d.type, value: d.count }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pv.devices.map((_: any, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid rgba(0,0,0,0.1)",
                    color: "#1a1a1a",
                    fontSize: 11,
                    borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                  }}
                />
                <Legend wrapperStyle={{ color: "#666666", fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Monitor className="size-8 text-muted-foreground/40" />
              <div className="text-center space-y-1">
                {[
                  { icon: Monitor, label: "Desktop" },
                  { icon: Smartphone, label: "Mobile" },
                ].map(({ icon: I, label }) => (
                  <div key={label} className="flex items-center gap-2 text-[10px]">
                    <I className="size-3" />
                    <span className="uppercase tracking-wider font-semibold text-foreground">{label}</span>
                    <span className="text-muted-foreground/60 font-mono">— tracking active</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Geographic — Countries */}
        <div className="bg-card border border-border/80 p-6 rounded-xl shadow-sm">
          <SectionHeader title="Top Countries" icon={Globe} />
          {hasPV && pv.countries?.length > 0 ? (
            <div className="space-y-2.5">
              {pv.countries.slice(0, 8).map((c: any, i: number) => {
                const max = pv.countries[0]?.count || 1;
                const pct = Math.round((c.count / max) * 100);
                return (
                  <div key={c.name || i}>
                    <div className="flex justify-between text-[10px] font-sans mb-1">
                      <span className="text-foreground font-bold">{c.name || "Unknown"}</span>
                      <span className="text-muted-foreground tabular-nums font-mono">{c.count.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-muted/60 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-[10px] text-muted-foreground font-sans space-y-1">
              <p className="font-medium">Geo-IP tracking will populate once</p>
              <p className="text-muted-foreground/60 font-mono">the PageView table is migrated.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 3: States + Cities ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* India States */}
        <div className="bg-[#141414] border border-white/8 p-6">
          <SectionHeader title="Top States (Readers)" icon={MapPin} />
          {hasPV && pv.states?.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {pv.states.slice(0, 10).map((s: any, i: number) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-[10px] font-sans py-1 border-b border-white/5"
                >
                  <span className="text-white/60">{s.name || "Unknown"}</span>
                  <span className="text-white/40 tabular-nums font-mono">
                    {s.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {/* Show states by story coverage */}
              <div className="grid grid-cols-2 gap-2">
                {trendingStates.slice(0, 10).map((s: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-[10px] font-sans py-1 border-b border-white/5"
                  >
                    <span className="text-white/60">{s.name}</span>
                    <span className="text-white/40 tabular-nums">
                      {s.viewCount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-white/20 mt-2">
                *Story coverage views (reader geo pending)
              </p>
            </div>
          )}
        </div>

        {/* Top Stories by Views */}
        <div className="bg-[#141414] border border-white/8 p-6">
          <SectionHeader title="Top Stories by Views" icon={Eye} />
          <div className="space-y-2.5">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-7 bg-white/5 rounded animate-pulse" />
              ))
            ) : topStories.length > 0 ? (
              topStories.slice(0, 8).map((s: any, i: number) => {
                const max = topStories[0]?.viewCount || 1;
                const pct = Math.round((s.viewCount / max) * 100);
                return (
                  <div key={s.slug || i} className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-white/20 w-4 flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary/70 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[9px] text-white/40 font-sans truncate max-w-[120px]">
                      {s.title}
                    </span>
                    <span className="text-[9px] text-white/25 font-mono flex-shrink-0">
                      {(s.viewCount || 0).toLocaleString()}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-white/20 text-xs font-sans">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 4: Top Themes + Top Authors + Top Videos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Top Themes */}
        <div className="bg-[#141414] border border-white/8 p-6">
          <SectionHeader title="Top Themes" icon={Flame} />
          {hasPV && topThemes.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={topThemes.slice(0, 7)}
                layout="vertical"
                margin={{ left: 0, right: 20 }}
              >
                <XAxis
                  type="number"
                  tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1a1a1a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                    fontSize: 10,
                  }}
                />
                <Bar dataKey="viewCount" name="Views" fill="#C8A96A" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="space-y-2">
              {topThemes.slice(0, 7).map((t: any, i: number) => (
                <div
                  key={i}
                  className="flex justify-between text-[10px] font-sans py-1 border-b border-white/5"
                >
                  <span className="text-white/60">{t.name}</span>
                  <span className="text-white/40">{(t.viewCount || 0).toLocaleString()} views</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Authors */}
        <div className="bg-[#141414] border border-white/8 p-6">
          <SectionHeader title="Top Authors" icon={Users} />
          <div className="space-y-3">
            {topAuthors.slice(0, 6).map((a: any, i: number) => (
              <div key={a.id || i} className="flex items-center gap-3">
                <span className="text-[9px] font-mono text-white/20 w-4">{i + 1}</span>
                {a.avatar ? (
                  <img
                    src={a.avatar}
                    alt={a.name}
                    className="size-7 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="size-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-[9px] text-white font-bold">
                    {a.name?.[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-white/70 font-sans font-bold truncate">{a.name}</p>
                  <p className="text-[9px] text-white/30 font-sans">{a.storiesCount} stories</p>
                </div>
                <span className="text-[9px] text-white/30 font-mono tabular-nums">
                  {(a.viewCount || 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Videos */}
        <div className="bg-[#141414] border border-white/8 p-6">
          <SectionHeader title="Top Videos" icon={Radio} />
          <div className="space-y-2.5">
            {topVideos.length > 0 ? (
              topVideos.slice(0, 6).map((v: any, i: number) => (
                <div
                  key={v.id || i}
                  className="flex justify-between items-center text-[10px] font-sans py-1 border-b border-white/5"
                >
                  <span className="text-[9px] font-mono text-white/20 mr-2">{i + 1}</span>
                  <span className="text-white/60 flex-1 truncate">{v.title}</span>
                  <span className="text-white/30 tabular-nums ml-2">
                    {(v.viewCount || 0).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-white/20 text-xs font-sans italic">No video data available</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Browser + Search CTR ── */}
      {hasPV && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Browser breakdown */}
          <div className="bg-[#141414] border border-white/8 p-6">
            <SectionHeader title="Browser Distribution" icon={Search} />
            <div className="grid grid-cols-2 gap-3">
              {pv.browsers?.slice(0, 6).map((b: any, i: number) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-[10px] font-sans py-1 border-b border-white/5"
                >
                  <span className="text-white/60 font-bold capitalize">{b.name}</span>
                  <span className="text-white/40 tabular-nums">{b.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Engagement metrics */}
          <div className="bg-[#141414] border border-white/8 p-6">
            <SectionHeader title="Engagement Metrics" icon={Activity} />
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Completion Rate", value: `${pv.completionRate}%`, color: "#8BC86A" },
                { label: "Avg Scroll Depth", value: `${pv.avgScrollDepth}%`, color: "#C8A96A" },
                {
                  label: "Avg Session",
                  value: `${Math.round(pv.avgSession / 60)}m ${pv.avgSession % 60}s`,
                  color: "#6AB4C8",
                },
                {
                  label: "Returning Rate",
                  value:
                    pv.uniqueVisitors > 0
                      ? `${Math.round((pv.returningReaders / pv.uniqueVisitors) * 100)}%`
                      : "0%",
                  color: "#C86A6A",
                },
              ].map((m) => (
                <div key={m.label} className="bg-white/5 p-3 space-y-1">
                  <p className="text-[9px] font-sans uppercase tracking-widest text-white/30">
                    {m.label}
                  </p>
                  <p className="font-display text-xl font-bold" style={{ color: m.color }}>
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Real-time Activity Feed ── */}
      <div className="bg-[#141414] border border-white/8 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-gold" />
            <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-white/60">
              Activity Feed
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] text-emerald-400 font-sans font-bold">LIVE</span>
          </div>
        </div>
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {activities.length > 0 ? (
            activities.map((a: any, i: number) => {
              const typeColors: Record<string, string> = {
                story: "#C8A96A",
                comment: "#6AB4C8",
                like: "#C86A6A",
                submission: "#8BC86A",
              };
              return (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-white/5">
                  <span
                    className="size-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: typeColors[a.type] || "#C8A96A" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-white/60 font-sans leading-relaxed">{a.title}</p>
                    <p className="text-[9px] text-white/25 font-sans mt-0.5">
                      {new Date(a.time).toLocaleString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <span
                    className="text-[8px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.5 flex-shrink-0"
                    style={{
                      color: typeColors[a.type] || "#C8A96A",
                      backgroundColor: `${typeColors[a.type] || "#C8A96A"}15`,
                    }}
                  >
                    {a.meta}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-white/20 text-xs font-sans italic">No recent activity</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
