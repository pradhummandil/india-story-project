import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, Award, Flame, Zap, User } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";

export const Route = createLazyFileRoute("/admin/leaderboard")({
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
          <h1 className="font-display text-2xl font-bold text-foreground tracking-wide">
            Reader Standings
          </h1>
          <p className="text-xs font-sans text-muted-foreground uppercase tracking-wider mt-1 font-bold">
            View user XP points, achievements, and reading stats
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-muted/40 animate-pulse rounded-xl border border-border/40"
              />
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-sm">
            {leaderboard.length === 0 ? (
              <div className="p-8 text-center text-xs font-sans text-muted-foreground">
                No leaderboard logs recorded yet.
              </div>
            ) : (
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground uppercase tracking-wider text-[10px] font-bold">
                    <th className="p-4 w-16 text-center">Rank</th>
                    <th className="p-4">Reader</th>
                    <th className="p-4">Level</th>
                    <th className="p-4">Reading Streak</th>
                    <th className="p-4">Stories Read</th>
                    <th className="p-4 text-right">XP Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-foreground">
                  {leaderboard.map((u, i) => (
                    <tr key={u.userId} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-bold text-center text-muted-foreground">
                        {i === 0 ? (
                          <span className="text-amber-500 text-sm">🥇</span>
                        ) : i === 1 ? (
                          <span className="text-slate-400 text-sm">🥈</span>
                        ) : i === 2 ? (
                          <span className="text-amber-700 text-sm">🥉</span>
                        ) : (
                          i + 1
                        )}
                      </td>
                      <td className="p-4 font-medium">
                        <div className="flex items-center gap-2">
                          {u.avatarUrl ? (
                            <img
                              src={u.avatarUrl}
                              className="size-6 rounded-full object-cover border border-border"
                              alt=""
                            />
                          ) : (
                            <div className="size-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-[10px] text-primary">
                              <User className="size-3" />
                            </div>
                          )}
                          <span className="font-semibold text-foreground">
                            {u.name || "Anonymous Reader"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-semibold">
                        <span className="flex items-center gap-1 text-primary">
                          <Award className="size-3.5 text-primary" /> Level {u.level}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground font-semibold font-mono">
                        <span className="flex items-center gap-1">
                          <Flame className="size-3.5 text-amber-500" /> {u.readingStreak} days
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground font-semibold font-mono">
                        {u.storiesRead} stories
                      </td>
                      <td className="p-4 text-right font-bold text-primary font-mono text-sm">
                        +{u.totalXP} XP
                      </td>
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
