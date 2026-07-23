import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, Trophy, Sparkles, Star, ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

export const Route = createFileRoute("/community/rankings")({
  component: RankingsPage,
});

export default function RankingsPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState("global");
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRankings = () => {
    setLoading(true);
    fetch(`/api/community/rankings?tab=${tab}`)
      .then((r) => r.json())
      .then((d) => setRankings(d.rankings ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRankings();
  }, [tab]);

  // podium mapping: 2nd place (idx 1), 1st place (idx 0), 3rd place (idx 2)
  const podium = rankings.slice(0, 3);
  const tableData = rankings.slice(3);

  return (
    <div className="space-y-8">
      {/* ── Rankings Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Contributor Leaderboards & XP
          </h1>
          <p className="text-xs text-muted-foreground font-sans mt-1">
            Track reading streaks, editorial posts, writing achievements, and forum participation
            XP.
          </p>
        </div>
      </div>

      {/* ── Rankings Tabs ── */}
      <div className="flex items-center gap-1.5 border-b border-border/60 pb-0.5 overflow-x-auto scrollbar-none">
        {[
          { id: "global", label: "Global XP Leaders" },
          { id: "weekly", label: "Weekly Hot" },
          { id: "monthly", label: "Monthly Top" },
          { id: "writers", label: "Top Writers" },
          { id: "commenters", label: "Top Commenters" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`pb-2.5 px-4 text-[10px] font-sans font-bold uppercase tracking-widest border-b-2 transition-colors flex-shrink-0 ${
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-44 bg-muted rounded-xl" />
          <div className="h-44 bg-muted rounded-xl" />
        </div>
      ) : rankings.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-2xl text-muted-foreground text-xs font-sans shadow-sm">
          No rankings data available. Join discussion boards to start earning XP!
        </div>
      ) : (
        <div className="space-y-8">
          {/* ── Top 3 Podium ── */}
          {podium.length > 0 && (
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto items-end pt-6">
              {/* 2nd place (Left) */}
              {podium[1] && (
                <div className="bg-card border border-border p-4 rounded-2xl flex flex-col items-center justify-between h-40 text-center relative order-1 shadow-sm">
                  <span className="text-[10px] text-slate-700 dark:text-slate-300 font-sans font-bold absolute -top-3 bg-muted border border-border px-2 py-0.5 rounded-full">
                    #2 Silver
                  </span>
                  <div className="size-10 rounded-full bg-muted border border-border flex items-center justify-center font-bold text-foreground text-xs mt-2">
                    {podium[1].name?.[0] || podium[1].user?.name?.[0] || "M"}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-foreground font-sans font-bold truncate max-w-[100px]">
                      {podium[1].name || podium[1].user?.name}
                    </p>
                    <p className="text-[9px] text-gold font-mono font-bold">
                      {podium[1].totalXP ??
                        podium[1].weeklyXP ??
                        podium[1].monthlyXP ??
                        podium[1].viewCount ??
                        0} XP
                    </p>
                  </div>
                </div>
              )}

              {/* 1st place (Center) */}
              {podium[0] && (
                <div className="bg-card border-2 border-amber-500/50 p-5 rounded-2xl flex flex-col items-center justify-between h-48 text-center relative order-2 shadow-md">
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-sans font-bold absolute -top-3.5 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="size-3 fill-amber-500 text-amber-500" /> #1 Gold
                  </span>
                  <div className="size-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm mt-2">
                    {podium[0].name?.[0] || podium[0].user?.name?.[0] || "M"}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-foreground font-sans font-bold truncate max-w-[120px]">
                      {podium[0].name || podium[0].user?.name}
                    </p>
                    <p className="text-[10px] text-primary font-mono font-bold">
                      {podium[0].totalXP ??
                        podium[0].weeklyXP ??
                        podium[0].monthlyXP ??
                        podium[0].viewCount ??
                        0} XP
                    </p>
                  </div>
                </div>
              )}

              {/* 3rd place (Right) */}
              {podium[2] && (
                <div className="bg-card border border-border p-4 rounded-2xl flex flex-col items-center justify-between h-36 text-center relative order-3 shadow-sm">
                  <span className="text-[10px] text-amber-800 dark:text-amber-400 font-sans font-bold absolute -top-3 bg-muted border border-border px-2 py-0.5 rounded-full">
                    #3 Bronze
                  </span>
                  <div className="size-10 rounded-full bg-muted border border-border flex items-center justify-center font-bold text-foreground text-xs mt-2">
                    {podium[2].name?.[0] || podium[2].user?.name?.[0] || "M"}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-foreground font-sans font-bold truncate max-w-[100px]">
                      {podium[2].name || podium[2].user?.name}
                    </p>
                    <p className="text-[9px] text-gold font-mono font-bold">
                      {podium[2].totalXP ??
                        podium[2].weeklyXP ??
                        podium[2].monthlyXP ??
                        podium[2].viewCount ??
                        0} XP
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Table Listings ── */}
          {tableData.length > 0 && (
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="grid grid-cols-12 bg-muted/60 px-6 py-3 border-b border-border text-[9px] font-sans font-bold uppercase tracking-widest text-muted-foreground">
                <div className="col-span-2">Rank</div>
                <div className="col-span-6">Contributor / Reader</div>
                <div className="col-span-2 text-right">Score / XP</div>
                <div className="col-span-2 text-right">Level</div>
              </div>
              <div className="divide-y divide-border/60">
                {tableData.map((row, i) => {
                  const rank = i + 4;
                  const name = row.name || row.user?.name || "Reader";
                  const score = row.totalXP ?? row.weeklyXP ?? row.monthlyXP ?? row.viewCount ?? 0;
                  const level = row.level ?? row.user?.level ?? 1;

                  const isCurrentUser = user && (row.id === user.id || row.userId === user.id);

                  return (
                    <div
                      key={row.id || i}
                      className={`grid grid-cols-12 px-6 py-3.5 items-center font-sans text-xs ${
                        isCurrentUser ? "bg-primary/5 border-y border-primary/20" : ""
                      }`}
                    >
                      <div className="col-span-2 font-mono font-bold text-muted-foreground">#{rank}</div>
                      <div className="col-span-6 flex items-center gap-2">
                        <div className="size-6 rounded-full bg-muted border border-border flex items-center justify-center text-[9px] font-bold text-foreground">
                          {name[0]}
                        </div>
                        <span className="text-foreground font-bold truncate max-w-[150px]">
                          {name}
                        </span>
                      </div>
                      <div className="col-span-2 text-right font-mono font-bold text-foreground">
                        {score.toLocaleString()}
                      </div>
                      <div className="col-span-2 text-right font-mono text-muted-foreground">
                        Lvl {level}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
