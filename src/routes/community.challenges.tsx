import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, Clock, Award, Star, Flame, Calendar } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

export const Route = createFileRoute("/community/challenges")({
  component: ChallengesPage,
});

// Live ticking Countdown timer component
function ChallengeTimer({ endAt }: { endAt: string }) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(endAt).getTime() - Date.now();
      if (difference <= 0) {
        setTimeLeft("Ended");
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((difference / (1000 * 60)) % 60);
      const secs = Math.floor((difference / 1000) % 60);

      setTimeLeft(`${days}d ${hours}h ${mins}m ${secs}s`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [endAt]);

  return <span className="font-mono tabular-nums">{timeLeft}</span>;
}

export default function ChallengesPage() {
  const { user } = useAuthStore();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState("active");

  const loadChallenges = () => {
    setLoading(true);
    fetch(`/api/community/challenges?status=${statusTab}`)
      .then((r) => r.json())
      .then((d) => setChallenges(d.challenges ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadChallenges();
  }, [statusTab]);

  // Find a featured active challenge
  const featured =
    statusTab === "active" ? challenges.find((c) => c.isFeatured) || challenges[0] : null;
  const listChallenges = featured ? challenges.filter((c) => c.id !== featured.id) : challenges;

  return (
    <div className="space-y-8">
      {/* ── Challenges Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Editorial Writing Challenges
          </h1>
          <p className="text-xs text-muted-foreground font-sans mt-1">
            Participate in storytelling challenges. Document unsung heroes to win unique profile
            badges, XP, and grants.
          </p>
        </div>
      </div>

      {/* ── Status Tabs ── */}
      <div className="flex items-center gap-1.5 border-b border-border/60 pb-0.5">
        {[
          { id: "active", label: "Active Challenges" },
          { id: "upcoming", label: "Upcoming" },
          { id: "past", label: "Archived & Past" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusTab(tab.id)}
            className={`pb-2.5 px-4 text-[10px] font-sans font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-1.5 ${
              statusTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Featured active challenge ── */}
      {featured && (
        <div className="bg-card border border-border p-8 relative overflow-hidden flex flex-col md:flex-row items-start justify-between gap-8 rounded-2xl shadow-sm">
          <div className="space-y-4 max-w-xl z-10">
            <span className="flex items-center gap-1 bg-primary text-white text-[8px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm w-fit">
              <Star className="size-3 fill-white" /> Featured Competition
            </span>
            <h2 className="font-display text-3xl font-bold text-white leading-tight">
              {featured.title}
            </h2>
            <p className="text-xs text-white/50 leading-relaxed font-sans line-clamp-3">
              {featured.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-3 text-[10px] font-sans uppercase tracking-widest text-white/30">
              <div className="space-y-1">
                <p className="text-white/20">Theme Tag</p>
                <p className="font-bold text-primary">{featured.theme || "Open State Topic"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-white/20">Reward prize</p>
                <p className="font-bold text-white/70">{featured.prize || "+500 XP & Badge"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-white/20">Time Remaining</p>
                <p className="font-bold text-emerald-400">
                  <ChallengeTimer endAt={featured.endAt} />
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to={`/community/challenges/${featured.id}` as any}
                className="inline-block bg-primary text-white text-[11px] font-sans font-bold uppercase tracking-widest px-5 py-3 hover:bg-primary/95 transition-colors rounded-sm"
              >
                Join Competition
              </Link>
            </div>
          </div>

          <div className="w-full md:w-fit z-10 flex flex-col gap-2 bg-white/3 p-5 border border-white/5 backdrop-blur-sm self-stretch justify-center items-center text-center">
            <Trophy className="size-8 text-primary" />
            <h4 className="text-xs font-sans font-bold uppercase tracking-widest text-white">
              Win Badge
            </h4>
            <div className="p-3 rounded-full bg-white/5 border border-white/8 flex items-center justify-center my-1">
              <Award className="size-7 text-primary" />
            </div>
            <p className="text-[9px] text-white/30 uppercase tracking-widest font-sans font-bold">
              Exclusive Achievement
            </p>
          </div>
        </div>
      )}

      {/* ── Challenges Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 bg-muted rounded-2xl animate-pulse" />
          ))
        ) : listChallenges.length === 0 && !featured ? (
          <div className="text-center py-12 bg-card border border-border rounded-2xl text-muted-foreground text-xs font-sans col-span-full shadow-sm">
            No writing challenges active in this category. Check upcoming or archived challenges.
          </div>
        ) : (
          listChallenges.map((c) => (
            <div
              key={c.id}
              className="bg-card border border-border p-5 flex flex-col justify-between h-48 rounded-2xl hover:border-gold/40 shadow-sm transition-all"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[8px] font-sans font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                    {c.theme || "Writing Challenge"}
                  </span>
                  {statusTab === "active" && (
                    <span className="text-[8px] font-sans font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Clock className="size-2.5" />
                      <ChallengeTimer endAt={c.endAt} />
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <Link
                    to={`/community/challenges/${c.id}` as any}
                    className="text-xs font-sans font-bold text-foreground hover:text-primary transition-colors block truncate"
                  >
                    {c.title}
                  </Link>
                  <p className="text-[10px] text-muted-foreground font-sans line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/40">
                <span className="text-[9px] text-muted-foreground font-sans flex items-center gap-1">
                  <Flame className="size-3 text-primary" /> {c.entries?.length ?? 0} entries
                </span>
                <Link
                  to={`/community/challenges/${c.id}` as any}
                  className="bg-background border border-border px-3 py-1 text-[9px] font-sans font-bold uppercase tracking-widest text-foreground hover:border-gold/50 transition-colors rounded-lg"
                >
                  {statusTab === "past" ? "View Leaderboard" : "Enter"}
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
