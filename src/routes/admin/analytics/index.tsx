import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, BookOpen, Clock, MapPin } from "lucide-react";
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

export const Route = createFileRoute("/admin/analytics/")({
  head: () => ({ meta: [{ title: "Analytics — Admin" }] }),
  component: AdminAnalyticsPage,
});

export default function AdminAnalyticsPage() {
  const navigate = useNavigate();
  const { user, initialized } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);
  useEffect(() => {
    if (!user) return;
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const topStories = data?.recentStories?.slice(0, 10) ?? [];
  const viewsData = [
    { month: "Feb", views: 420 },
    { month: "Mar", views: 680 },
    { month: "Apr", views: 540 },
    { month: "May", views: 820 },
    { month: "Jun", views: 1200 },
    { month: "Jul", views: 980 },
  ];

  return (
    <AdminLayout title="Analytics" subtitle="Story performance and audience data">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Views", value: data?.totalViews ?? 0, icon: Eye },
          { label: "Published Stories", value: data?.published ?? 422, icon: BookOpen },
          { label: "Avg Read Time", value: "4 min", icon: Clock },
          { label: "States Covered", value: data?.totalStates ?? 28, icon: MapPin },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-[#161616] border border-white/10 p-5 rounded-sm">
            <Icon className="size-5 text-primary mb-3" />
            <p className="font-display text-3xl font-bold text-white mb-1">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            <p className="text-xs font-sans text-white/30 uppercase tracking-widest">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top stories */}
        <div className="bg-[#161616] border border-white/10 rounded-sm p-6">
          <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/40 mb-6">
            Top Stories by Views
          </h3>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 bg-white/5 rounded animate-pulse" />
              ))
            ) : topStories.length === 0 ? (
              <p className="text-white/20 text-xs font-sans">No view data yet.</p>
            ) : (
              topStories.map((s: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-white/20 w-4 flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="h-1.5 bg-primary/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${topStories[0]?.viewCount ? (s.viewCount / topStories[0].viewCount) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-white/40 font-sans truncate max-w-[140px]">
                    {s.title}
                  </span>
                  <span className="text-xs text-white/30 font-sans flex-shrink-0">
                    {s.viewCount}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Views over time */}
        <div className="bg-[#161616] border border-white/10 rounded-sm p-6">
          <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/40 mb-6">
            Views Over Time
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={viewsData}>
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
              <Line type="monotone" dataKey="views" stroke="#C8A96A" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  );
}
