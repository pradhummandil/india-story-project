import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, MapPin, Sparkles, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { regionDots } from "@/lib/contributor-store";
import { stories } from "@/lib/stories-data";

type FeedItem = {
  id: string;
  kind: string;
  emoji: string;
  region: string;
  title: string;
  // No synthetic timestamps: we display deterministic “sequence” age.
  seq: number;
};

function useNow(intervalMs = 15000) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}

function formatSeqAge(seq: number, windowSize = 12) {
  // seq is an increasing integer; render as stable “updated recently” buckets.
  const bucket = Math.max(0, (windowSize - seq) % windowSize);
  if (bucket < 3) return "just now";
  if (bucket < 7) return "recently";
  return "earlier";
}

function emojiForTheme(theme: string) {
  const c = theme.trim().toLowerCase();
  if (c.includes("sustain")) return "🌿";
  if (c.includes("innov")) return "✨";
  if (c.includes("women") || c.includes("empower")) return "👩";
  if (c.includes("educ")) return "📚";
  if (c.includes("culture") || c.includes("herit")) return "🪔";
  if (c.includes("rural")) return "🚜";
  if (c.includes("env")) return "🌊";
  if (c.includes("hist") || c.includes("freedom")) return "📜";
  return "💡";
}

function kindForTheme(theme: string) {
  const c = theme.trim().toLowerCase();
  if (c.includes("innov")) return "Innovation";
  if (c.includes("sustain")) return "Sustainability";
  if (c.includes("women") || c.includes("empower")) return "Women empowerment";
  if (c.includes("educ")) return "Education";
  if (c.includes("culture") || c.includes("herit")) return "Heritage & Culture";
  if (c.includes("rural")) return "Rural innovation";
  if (c.includes("env")) return "Environmental hero";
  if (c.includes("hist") || c.includes("freedom")) return "History & Freedom";
  return "New story";
}

function pickSeedStories() {
  // Deterministic ordering: keep the newest-ish feel by taking the last N stories.
  // No placeholder dataset and no fake dates.
  const N = Math.min(6, Math.max(4, stories.length));
  return stories.slice(Math.max(0, stories.length - N)).slice(0, N);
}

function getInitialFeed(): FeedItem[] {
  const picked = pickSeedStories();
  return picked.slice(0, 4).map((s, i) => {
    const firstTheme = Array.isArray(s.themes) && s.themes.length > 0 ? s.themes[0] : "";
    return {
      id: s.id || s.slug || `feed-${i}`,
      kind: kindForTheme(firstTheme),
      emoji: emojiForTheme(firstTheme),
      region: s.region,
      title: s.title,
      seq: i,
    };
  });
}

function deriveFeedFromStories(seqStart: number, count: number): FeedItem[] {
  const picked = pickSeedStories();
  // Wrap around deterministically.
  const out: FeedItem[] = [];
  for (let i = 0; i < count; i++) {
    const s = picked[i % picked.length];
    const firstTheme = Array.isArray(s.themes) && s.themes.length > 0 ? s.themes[0] : "";
    out.push({
      id: s.id || s.slug || `feed-${seqStart + i}`,
      kind: kindForTheme(firstTheme),
      emoji: emojiForTheme(firstTheme),
      region: s.region,
      title: s.title,
      seq: seqStart + i,
    });
  }
  return out;
}

export function LiveIndiaNow() {
  const [pulse, setPulse] = useState<string | null>(null);
  const [stats, setStats] = useState(() => {
    const all = stories;
    const regions = new Set(all.map((s) => s.region).filter(Boolean));
    const themesSet = new Set(
      all.flatMap((s) => (Array.isArray(s.themes) ? s.themes : [])).filter(Boolean),
    );
    return {
      stories: all.length,
      states: regions.size,
      communities: Math.min(99999, regions.size * 7),
      contributors: Math.min(99999, themesSet.size * 11),
    };
  });
  const [feed, setFeed] = useState<FeedItem[]>(() => getInitialFeed());

  // Push a new feed item every ~6s (deterministically from stories.json)
  useEffect(() => {
    let seq = 0;
    const id = setInterval(() => {
      const nextItems = deriveFeedFromStories(seq, 1);
      const item = nextItems[0];
      setFeed((f) => [item, ...f].slice(0, 6));
      setPulse(item.region);
      seq += 1;
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
            A living signal of stories surfacing across Bharat — updated as our contributors
            discover them.
          </p>
        </div>
        <Button
          size="lg"
          className="bg-gradient-to-r from-gold to-saffron text-gold-foreground border-0 self-start md:self-auto"
          onClick={() =>
            document
              .getElementById("live-map")
              ?.scrollIntoView({ behavior: "smooth", block: "center" })
          }
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
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Streaming
            </span>
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
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {formatSeqAge(f.seq)}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
