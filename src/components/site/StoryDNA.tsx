import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dna, Sparkles, MapPin, HeartHandshake, Target, Users, Wand2 } from "lucide-react";
import { stories } from "@/lib/stories-data";
import { deriveDNA, getConnections } from "@/lib/story-dna";
import type { Story } from "@/components/site/StoryCard";

const EASE = [0.22, 1, 0.36, 1] as const;

function Trait({
  icon: Icon,
  label,
  value,
  delay = 0,
}: {
  icon: typeof Sparkles;
  label: string;
  value: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className="flex items-start gap-3 p-3 rounded-xl bg-foreground/[0.03] border border-border/40"
    >
      <span className="size-8 grid place-items-center rounded-lg bg-gradient-to-br from-gold/20 to-saffron/10 text-gold shrink-0">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground truncate">{value}</p>
      </div>
    </motion.div>
  );
}

export function StoryDNA() {
  const [selectedId, setSelectedId] = useState<string>(stories[0]?.id ?? "");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const story = useMemo(() => stories.find((s) => s.id === selectedId) ?? stories[0], [selectedId]);
  const dna = useMemo(() => deriveDNA(story), [story]);
  const connections = useMemo(() => getConnections(story.id, 6), [story]);

  // Position nodes around a circle
  const nodes = useMemo(() => {
    const r = 38;
    return connections.map((c, i) => {
      const a = (i / connections.length) * Math.PI * 2 - Math.PI / 2;
      return {
        ...c,
        x: 50 + Math.cos(a) * r,
        y: 50 + Math.sin(a) * r,
      };
    });
  }, [connections]);

  return (
    <section className="container mx-auto px-6 py-16 md:py-24">
      <div className="max-w-2xl mb-10">
        <p className="text-xs uppercase tracking-widest text-gold mb-3 flex items-center gap-2">
          <Dna className="size-3.5" /> Story DNA Engine
        </p>
        <h2 className="font-display text-4xl md:text-5xl leading-[1.05]">
          Explore the <span className="text-gradient-gold italic">DNA</span> of change.
        </h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Every story carries a unique signature — its theme, impact, region, and emotion. Follow
          the threads to discover a living network of connected change across India.
        </p>
      </div>

      <div className="grid lg:grid-cols-[420px_1fr] gap-6">
        {/* DNA Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={story.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="glass rounded-3xl p-6 relative overflow-hidden"
          >
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{ background: story.gradient }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background/90 pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase tracking-[0.25em] text-gold">
                  DNA Profile
                </span>
                <span className="text-[10px] tracking-widest text-muted-foreground">
                  #{story.id.padStart(4, "0")}
                </span>
              </div>
              <h3 className="font-display text-2xl leading-tight mb-1">{story.title}</h3>
              <p className="text-xs text-muted-foreground mb-5">
                {story.region} · {story.readTime}
              </p>

              {/* DNA helix bar */}
              <div className="mb-5 h-2 rounded-full overflow-hidden bg-foreground/5 relative">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{ duration: 0.9, ease: EASE }}
                  className="absolute inset-0 bg-gradient-to-r from-gold via-saffron to-gold"
                />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Trait icon={Sparkles} label="Theme" value={dna.theme} delay={0.05} />
                <Trait icon={MapPin} label="Region" value={dna.region} delay={0.1} />
                <Trait icon={Target} label="Impact Type" value={dna.impactType} delay={0.15} />
                <Trait icon={Users} label="Beneficiary" value={dna.beneficiary} delay={0.2} />
                <Trait icon={HeartHandshake} label="Emotion" value={dna.emotion} delay={0.25} />
              </div>

              <div className="mt-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  SDG alignment
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {dna.sdgs.map((g) => (
                    <span
                      key={g.id}
                      className="text-[11px] px-2.5 py-1 rounded-full glass text-foreground/90"
                    >
                      SDG {g.id} · {g.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Graph */}
        <div className="glass rounded-3xl p-4 md:p-6 relative overflow-hidden min-h-[480px]">
          <div className="absolute inset-0 bg-hero opacity-20 pointer-events-none" />
          {/* floating particles */}
          {Array.from({ length: 14 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute size-1 rounded-full bg-gold/40"
              style={{ left: `${(i * 53) % 100}%`, top: `${(i * 37) % 100}%` }}
              animate={{ y: [0, -10, 0], opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 4 + (i % 5), repeat: Infinity, delay: i * 0.2 }}
            />
          ))}

          <div className="relative flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-widest text-gold">Connected Stories</p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))}
                className="size-8 rounded-full glass text-sm hover:text-gold transition-colors"
                aria-label="Zoom out"
              >
                −
              </button>
              <button
                onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}
                className="size-8 rounded-full glass text-sm hover:text-gold transition-colors"
                aria-label="Zoom in"
              >
                +
              </button>
            </div>
          </div>

          <div className="relative aspect-square max-h-[460px] mx-auto">
            <motion.div
              className="absolute inset-0"
              animate={{ scale: zoom }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            >
              {/* SVG connections */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="oklch(0.85 0.15 80)" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="oklch(0.7 0.18 40)" stopOpacity="0.15" />
                  </linearGradient>
                </defs>
                {nodes.map((n) => {
                  const active = hoveredId === n.story.id;
                  return (
                    <motion.line
                      key={n.story.id}
                      x1={50}
                      y1={50}
                      x2={n.x}
                      y2={n.y}
                      stroke="url(#edge)"
                      strokeWidth={active ? 0.6 : 0.3}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: active ? 1 : 0.5 }}
                      transition={{ duration: 0.9, ease: EASE }}
                    />
                  );
                })}
              </svg>

              {/* Center node */}
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 160, damping: 14 }}
              >
                <div className="relative">
                  <span className="absolute inset-0 rounded-full bg-gold/30 blur-xl animate-pulse" />
                  <div
                    className="relative size-24 rounded-full grid place-items-center text-center px-3 shadow-glow border border-gold/40"
                    style={{ background: story.gradient }}
                  >
                    <span className="font-display text-[11px] leading-tight text-foreground/95 line-clamp-3">
                      {story.title}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Connection nodes */}
              {nodes.map((n, i) => {
                const active = hoveredId === n.story.id;
                return (
                  <motion.button
                    key={n.story.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.15 + i * 0.06,
                      type: "spring",
                      stiffness: 180,
                      damping: 14,
                    }}
                    onMouseEnter={() => setHoveredId(n.story.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => setSelectedId(n.story.id)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group"
                    style={{ left: `${n.x}%`, top: `${n.y}%` }}
                  >
                    <span
                      className={`absolute inset-0 rounded-full bg-gold/20 blur-md transition-opacity ${active ? "opacity-100" : "opacity-0"}`}
                    />
                    <div
                      className={`relative size-14 rounded-full grid place-items-center border transition-all ${
                        active ? "border-gold scale-110 shadow-glow" : "border-border/50"
                      }`}
                      style={{ background: n.story.gradient }}
                    >
                      <span className="text-[9px] font-medium text-foreground/95 text-center px-1 line-clamp-2 leading-tight">
                        {n.story.region}
                      </span>
                    </div>
                    <AnimatePresence>
                      {active && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-44 glass rounded-xl p-2.5 text-left z-10"
                        >
                          <p className="text-[11px] font-display leading-tight mb-1 line-clamp-2">
                            {n.story.title}
                          </p>
                          <p className="text-[10px] text-gold">
                            {n.reasons.slice(0, 2).join(" · ")}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Intelligence layer */}
      <div className="mt-6 grid md:grid-cols-4 gap-3">
        {[
          {
            label: "Related Heroes",
            icon: Users,
            items: connections.filter((c) => c.reasons.includes("Similar mission")).slice(0, 2),
          },
          {
            label: "Similar Transformations",
            icon: Wand2,
            items: connections.filter((c) => c.reasons.includes("Same impact area")).slice(0, 2),
          },
          {
            label: "Similar Innovations",
            icon: Sparkles,
            items: connections
              .filter((c) => c.story.category === "Innovation" || c.story.category === "Science")
              .slice(0, 2),
          },
          {
            label: "Similar Communities",
            icon: HeartHandshake,
            items: connections
              .filter(
                (c) => c.reasons.includes("Same beneficiary") || c.reasons.includes("Same state"),
              )
              .slice(0, 2),
          },
        ].map((col) => (
          <div key={col.label} className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3 text-gold">
              <col.icon className="size-3.5" />
              <p className="text-[10px] uppercase tracking-[0.2em]">{col.label}</p>
            </div>
            <div className="space-y-2">
              {col.items.length === 0 && (
                <p className="text-xs text-muted-foreground">Keep exploring to surface more.</p>
              )}
              {col.items.map((c) => (
                <button
                  key={c.story.id}
                  onClick={() => setSelectedId(c.story.id)}
                  className="block text-left w-full p-2 rounded-lg hover:bg-foreground/5 transition-colors"
                >
                  <p className="text-sm font-display leading-tight line-clamp-2">{c.story.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{c.story.region}</p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center text-xs text-muted-foreground">
        Click any node to jump into its DNA. The network keeps unfolding — endlessly.
      </div>
    </section>
  );
}
