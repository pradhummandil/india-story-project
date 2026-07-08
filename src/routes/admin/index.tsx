import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle,
  FileText,
  Eye,
  Users,
  FolderOpen,
  TrendingUp,
  ArrowUpRight,
  Clock,
  MapPin,
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Admin Dashboard — India Story Project" }],
  }),
  component: AdminDashboard,
});

type DashboardStats = {
  totalStories: number;
  published: number;
  draft: number;
  archived: number;
  totalViews: number;
  totalAuthors: number;
  totalCategories: number;
  recentStories: Array<{
    title: string;
    status: string;
    category: string;
    viewCount: number;
    createdAt: string;
  }>;
};

const CHART_COLORS = ["#8B0000", "#C8A96A", "#D97706", "#4B5563", "#1F2937"];

function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  color = "primary",
}: {
  label: string;
  value: number | string;
  icon: any;
  delta?: string;
  color?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-[#161616] border border-white/10 p-6 rounded-sm hover:border-white/20 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="size-10 bg-primary/15 border border-primary/20 flex items-center justify-center rounded-sm">
          <Icon className="size-5 text-primary" />
        </div>
        {delta && (
          <span className="text-xs font-sans text-emerald-400 flex items-center gap-1">
            <TrendingUp className="size-3" />
            {delta}
          </span>
        )}
      </div>
      <p className="font-display text-3xl font-bold text-white mb-1">{value.toLocaleString()}</p>
      <p className="text-xs font-sans text-white/40 uppercase tracking-widest">{label}</p>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, loading, initialized } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Auth guard
  useEffect(() => {
    if (initialized && !user) {
      void navigate({ to: "/login" });
    }
  }, [user, initialized, navigate]);

  // Fetch stats
  useEffect(() => {
    if (!user) return;
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((data) => setStats(data as DashboardStats))
      .catch(console.error)
      .finally(() => setStatsLoading(false));
  }, [user]);

  if (loading || !initialized) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center h-64 text-white/30 font-sans text-xs uppercase tracking-widest animate-pulse">
          Loading…
        </div>
      </AdminLayout>
    );
  }

  if (!user) return null;

  // Chart placeholder data (replace with real data from stats)
  const storiesPerMonth = [
    { month: "Feb", stories: 12 },
    { month: "Mar", stories: 18 },
    { month: "Apr", stories: 24 },
    { month: "May", stories: 15 },
    { month: "Jun", stories: 32 },
    { month: "Jul", stories: 28 },
  ];

  const categoryData = [{ name: "कहानी", value: stats?.totalStories ?? 422 }];

  return (
    <AdminLayout title="Dashboard" subtitle="Overview of India Story Project">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Stories" value={stats?.totalStories ?? 422} icon={BookOpen} />
        <StatCard
          label="Published"
          value={stats?.published ?? 422}
          icon={CheckCircle}
          delta="+12 this month"
        />
        <StatCard label="Draft" value={stats?.draft ?? 0} icon={FileText} />
        <StatCard label="Total Views" value={stats?.totalViews ?? 0} icon={Eye} />
        <StatCard label="Authors" value={stats?.totalAuthors ?? 1} icon={Users} />
        <StatCard label="Categories" value={stats?.totalCategories ?? 2} icon={FolderOpen} />
        <StatCard label="Avg Read Time" value="4 min" icon={Clock} />
        <StatCard label="States Covered" value="28" icon={MapPin} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Stories per month */}
        <div className="lg:col-span-2 bg-[#161616] border border-white/10 p-6 rounded-sm">
          <h3 className="font-sans text-sm font-semibold text-white/70 uppercase tracking-widest mb-6">
            Stories Published Per Month
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={storiesPerMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="month"
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#1a1a1a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 0,
                  color: "white",
                }}
              />
              <Bar dataKey="stories" fill="#8B0000" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category distribution */}
        <div className="bg-[#161616] border border-white/10 p-6 rounded-sm">
          <h3 className="font-sans text-sm font-semibold text-white/70 uppercase tracking-widest mb-6">
            Category Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                dataKey="value"
              >
                {categoryData.map((_, index) => (
                  <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#1a1a1a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 0,
                  color: "white",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent stories table */}
      <div className="bg-[#161616] border border-white/10 rounded-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h3 className="font-sans text-sm font-semibold text-white/70 uppercase tracking-widest">
            Recent Stories
          </h3>
          <a
            href="/admin/stories"
            className="text-xs text-primary hover:text-gold font-sans flex items-center gap-1 transition-colors"
          >
            View all <ArrowUpRight className="size-3" />
          </a>
        </div>
        {statsLoading ? (
          <div className="p-8 text-center text-white/20 font-sans text-xs">Loading…</div>
        ) : (
          <div className="divide-y divide-white/5">
            {(stats?.recentStories ?? []).slice(0, 8).map((story, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-6 py-3 hover:bg-white/3 transition-colors"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm font-sans text-white/80 truncate">{story.title}</p>
                  <p className="text-xs text-white/30 font-sans mt-0.5">{story.category}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span
                    className={`text-[10px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 ${
                      story.status === "Published"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {story.status}
                  </span>
                  <span className="text-xs text-white/30 font-sans w-16 text-right">
                    {story.viewCount} views
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
