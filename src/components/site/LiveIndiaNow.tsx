import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, MapPin, Sparkles, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { regionDots } from "@/lib/contributor-store";

interface FeedItem {
  id: string;
  kind: string;
  emoji: string;
  region: string;
  title: string;
  ts: number;
}

const seedFeed: Omit<FeedItem, "id" | "ts">[] = [
  { kind: "New story", emoji: "✨", region: "Rajasthan", title: "Desert water warriors revive ancient stepwells" },
  { kind: "Environmental hero", emoji: "🌿", region: "Assam", title: "The forest woman replanting 1,400 acres" },
  { kind: "Women empowerment", emoji: "👩", region: "Madhya Pradesh", title: "Self-help collective ships across 12 states" },
  { kind: "Rural innovation", emoji: "🚜", region: "Karnataka", title: "Solar microgrid powers 9 remote villages" },
  { kind: "Heritage revival", emoji: "🪔", region: "Tamil Nadu", title: "Bronze artisans train Gen-Z apprentices" },
  { kind: "Climate action", emoji: "🌊", region: "Kerala", title: "Fisherfolk-led coral restoration takes off" },
  { kind: "Youth changemaker", emoji: "🚀", region: "Punjab", title: "Teen builds open-source crop advisor in Punjabi" },
  { kind: "Community builder", emoji: "❤️", region: "Bihar", title: "Free night school crosses 5,000 learners" },
  { kind: "Innovation", emoji: "💡", region: "Gujarat", title: "Frugal cold-chain saves harvests across 30 mandis" },
  { kind: "Bharat traveler", emoji: "🇮🇳", region: "Uttarakhand", title: "Trekker-journalists map disappearing villages" },
];

function timeAgo(ts: number) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

function useNow(intervalMs = 15000) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}

export function LiveIndiaNow() {
  const [feed, setFeed] = useState<FeedItem[]>(() =>
    seedFeed.slice(0, 4).map((s, i) => ({
      ...s,
      id: `seed-${i}`,
      ts: Date.now() - (i + 1) * 1000 * 60 * (3 + i),
    })),
  );
  const [pulse, setPulse] = useState<string | null>(null);
  const [stats, setStats] = useState({ stories: 1284, states: 27, communities: 612, contributors: 348 });

  useNow(20000);

  // Push a new feed item every ~6s
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      const next = seedFeed[(Date.now() + i++) % seedFeed.length];
      const item: FeedItem = { ...next, id: crypto.randomUUID(), ts: Date.now() };
      setFeed((f) => [item, ...f].slice(0, 6));
      setPulse(next.region);
      setStats((s) => ({
        ...s,
        stories: s.stories + 1,
        contributors: s.contributors + (Math.random() > 0.6 ? 1 : 0),
        communities: s.communities + (Math.random() > 0.7 ? 1 : 0),
      }));
    }, 6000);
    return () => clearInterval(id);
  }, []);

  // Soft illumination rotates independently
  useEffect(() => {
    const id = setInterval(() => {
      const r = regionDots[Math.floor(Math.random() * regionDots.length)];
      setPulse(r.region);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const statCards = useMemo(
    () => [
      { icon: Sparkles, label: "Stories this month", value: stats.stories.toLocaleString() },
      { icon: MapPin, label: "States covered", value: `${stats.states} / 28` },
      { icon: Users, label: "Communities impacted", value: stats.communities.toLocaleString() },
      { icon: Activity, label: "Active contributors", value: stats.contributors.toLocaleString() },
    ],
    [stats],
  );

  return (
    <section className="container mx-auto px-6 py-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold mb-3 flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inset-0 rounded-full bg-gold animate-ping" />
              <span className="relative rounded-full bg-gold size-2" />
            </span>
            Live · Right now
          </p>
          <h2 className="font-display text-4xl md:text-5xl max-w-2xl leading-tight">
            India is changing <span className="text-gradient-gold italic">right now</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl">
            A living signal of stories surfacing across Bharat — updated as our contributors discover them.
          </p>
        </div>
        <Button
          size="lg"
          className="bg-gradient-to-r from-gold to-saffron text-gold-foreground border-0 self-start md:self-auto"
          onClick={() => document.getElementById("live-map")?.scrollIntoView({ behavior: "smooth", block: "center" })}
        >
          Discover what's happening now
          <ArrowRight className="size-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className="glass rounded-2xl p-5 relative overflow-hidden hover-lift"
          >
            <div className="absolute -top-10 -right-10 size-32 rounded-full bg-gold/10 blur-3xl" />
            <div className="relative">
              <s.icon className="size-4 text-gold mb-3" />
              <motion.div
                key={s.value}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-3xl"
              >
                {s.value}
              </motion.div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div id="live-map" className="grid lg:grid-cols-[1.1fr_1fr] gap-6">
        {/* Map */}
        <div className="glass rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-hero opacity-20 pointer-events-none" />
          {/* Ambient particles */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 14 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute size-1 rounded-full bg-gold/40"
                style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%` }}
                animate={{ opacity: [0.1, 0.7, 0.1], y: [0, -8, 0] }}
                transition={{ duration: 4 + (i % 5), repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>

          <div className="relative aspect-[3/4] rounded-2xl border border-border/40 overflow-hidden bg-gradient-to-b from-background/40 to-background/10">
            <div className="absolute inset-0 grid place-items-center opacity-[0.07]">
              <span className="font-display text-[12rem] leading-none">भा</span>
            </div>
            {regionDots.map((d) => {
              const active = pulse === d.region;
              return (
                <button
                  key={d.region}
                  onClick={() => setPulse(d.region)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: `${d.x}%`, top: `${d.y}%` }}
                  aria-label={d.region}
                >
                  {active && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0.8 }}
                      animate={{ scale: 4, opacity: 0 }}
                      transition={{ duration: 2.2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-gold/40"
                      style={{ width: 14, height: 14, marginLeft: -7, marginTop: -7 }}
                    />
                  )}
                  <span
                    className={`relative block rounded-full transition-all ${
                      active
                        ? "bg-gradient-to-br from-gold to-saffron shadow-glow scale-150"
                        : "bg-foreground/40 group-hover:bg-gold"
                    }`}
                    style={{ width: 8, height: 8 }}
                  />
                  {active && (
                    <motion.span
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute left-3 top-0 whitespace-nowrap text-[10px] tracking-wider uppercase text-gold"
                    >
                      {d.region}
                    </motion.span>
                  )}
                </button>
              );
            })}

            {/* Pulse card */}
            <AnimatePresence mode="wait">
              {pulse && (
                <motion.div
                  key={pulse}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.4 }}
                  className="absolute bottom-4 left-4 right-4 glass rounded-xl p-3 border border-gold/20"
                >
                  <p className="text-[10px] uppercase tracking-widest text-gold">Story pulse</p>
                  <p className="font-display text-base mt-0.5">A new story is forming in {pulse}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Feed */}
        <div className="glass rounded-3xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-gold" />
              <h3 className="font-display text-xl">Live story activity</h3>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Streaming</span>
          </div>

          <div className="relative space-y-2 max-h-[460px] overflow-hidden">
            <AnimatePresence initial={false}>
              {feed.map((f) => (
                <motion.div
                  key={f.id}
                  layout
                  initial={{ opacity: 0, x: -20, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ type: "spring", stiffness: 220, damping: 24 }}
                  onMouseEnter={() => setPulse(f.region)}
                  className="group flex items-start gap-3 p-3 rounded-xl border border-border/40 bg-background/30 hover:border-gold/30 transition-colors cursor-pointer"
                >
                  <div className="size-10 rounded-lg grid place-items-center bg-gradient-to-br from-gold/15 to-saffron/10 border border-gold/20 text-lg">
                    {f.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold/90">
                      <span>{f.kind}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">{f.region}</span>
                    </div>
                    <p className="text-sm mt-0.5 leading-snug truncate group-hover:text-gold transition-colors">
                      {f.title}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{timeAgo(f.ts)}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
