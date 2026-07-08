import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, Award, Flame, Zap, User } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";

export const Route = createFileRoute("/admin/leaderboard")({
  head: () => ({ meta: [{ title: "User Leaderboard — Admin" }] }),
  component: AdminLeaderboardPage,
});

export default function AdminLeaderboardPage() {
  const navigate = useNavigate();
  const { user, session, initialized } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);

  useEffect(() => {
    if (!user || !session) return;
    setLoading(true);
    fetch("/api/user-stats", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then((data) => setLeaderboard(data.leaderboard || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, session]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-wide">Reader Standings</h1>
          <p className="text-xs font-sans text-white/50 uppercase tracking-widest mt-1">View user XP points, achievements, and reading stats</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-[#161616] animate-pulse rounded border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="bg-[#161616] border border-white/10 rounded overflow-hidden">
            {leaderboard.length === 0 ? (
              <div className="p-8 text-center text-sm font-sans text-white/40">No leaderboard logs recorded yet.</div>
            ) : (
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-white/60 uppercase tracking-wider text-[10px]">
                    <th className="p-4 font-bold w-16 text-center">Rank</th>
                    <th className="p-4 font-bold">Reader</th>
                    <th className="p-4 font-bold">Level</th>
                    <th className="p-4 font-bold">Reading Streak</th>
                    <th className="p-4 font-bold">Stories Read</th>
                    <th className="p-4 font-bold text-right">XP Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {leaderboard.map((u, i) => (
                    <tr key={u.userId} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold text-center text-white/40">
                        {i === 0 ? (
                          <span className="text-yellow-500 text-sm">🥇</span>
                        ) : i === 1 ? (
                          <span className="text-white/70 text-sm">🥈</span>
                        ) : i === 2 ? (
                          <span className="text-amber-700 text-sm">🥉</span>
                        ) : (
                          i + 1
                        )}
                      </td>
                      <td className="p-4 font-medium">
                        <div className="flex items-center gap-2">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} className="size-6 rounded-full object-cover" alt="" />
                          ) : (
                            <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center font-bold text-[10px] text-primary">
                              <User className="size-3" />
                            </div>
                          )}
                          <span className="font-semibold text-white">{u.name || "Anonymous Reader"}</span>
                        </div>
                      </td>
                      <td className="p-4 font-semibold">
                        <span className="flex items-center gap-1">
                          <Award className="size-3.5 text-gold" /> Level {u.level}
                        </span>
                      </td>
                      <td className="p-4 text-white/70 font-semibold font-mono">
                        <span className="flex items-center gap-1">
                          <Flame className="size-3.5 text-orange-500" /> {u.readingStreak} days
                        </span>
                      </td>
                      <td className="p-4 text-white/50 font-semibold font-mono">{u.storiesRead} stories</td>
                      <td className="p-4 text-right font-bold text-gold font-mono text-sm">+{u.totalXP} XP</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
