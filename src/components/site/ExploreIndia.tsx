import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, ArrowRight, Sparkles, Route, Users, Globe2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/site/AnimatedCounter";
import { useNavigate } from "@tanstack/react-router";

import { stories } from "@/lib/stories-data";

interface StateNode {
  id: string;
  state: string;
  x: number;
  y: number;
  stories: number;
  hero: string;
  categories: string[];
  preview: string;
  featuredTitle: string;
}

const STATS = [
  { value: 1240, suffix: "+", label: "Stories Collected", icon: BookOpen },
  { value: 28, suffix: "", label: "States Covered", icon: Globe2 },
  { value: 340, suffix: "+", label: "Heroes Featured", icon: Sparkles },
  { value: 95000, suffix: "+", label: "Communities Impacted", icon: Users },
];

function seededNumber(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 2 ** 32;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function stableMapPositionForRegion(region: string) {
  // Deterministic position in the same SVG space as the existing map.
  // Ensure it doesn't crowd too much by clamping to safe margins.
  const rx = seededNumber(`${region}|x`);
  const ry = seededNumber(`${region}|y`);
  const x = clamp(120 + rx * 260 + (ry - 0.5) * 18, 150, 440);
  const y = clamp(70 + ry * 460 + (rx - 0.5) * 22, 95, 540);
  return { x, y };
}

export function ExploreIndia() {
  const navigate = useNavigate();

  const [hovered, setHovered] = useState<StateNode | null>(null);
  const [selected, setSelected] = useState<StateNode | null>(null);
  const [journey, setJourney] = useState(false);

  const nodes = useMemo<StateNode[]>(() => {
    // Group by region to keep the existing “state/node” UX.
    const byRegion = new Map<string, typeof stories>();
    for (const s of stories) {
      const key = s.region || "India";
      const arr = byRegion.get(key) ?? [];
      arr.push(s);
      byRegion.set(key, arr);
    }

    const regions = Array.from(byRegion.keys()).sort((a, b) => a.localeCompare(b));

    return regions.map((region, idx) => {
      const list = byRegion.get(region)!;
      const categories = Array.from(new Set(list.map((s) => s.category).filter(Boolean)));

      const featured = list[0];
      const pos = stableMapPositionForRegion(`${region}|${idx}`);

      return {
        id: region,
        state: region,
        x: pos.x,
        y: pos.y,
        stories: list.length,
        hero: "Featured",
        categories: categories.slice(0, 3),
        preview: featured.excerpt,
        featuredTitle: featured.title,
      };
    });
  }, []);

  const journeyPoints = useMemo(() => nodes.slice(0, Math.min(14, nodes.length)), [nodes]);

  const journeyPath = useMemo(() => {
    if (journeyPoints.length === 0) return "";
    return journeyPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  }, [journeyPoints]);

  return (
    <section className="relative w-full overflow-hidden py-24 md:py-32">
      {/* Ambient backdrop */}
      <div className="absolute inset-0 bg-hero opacity-50 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 size-[480px] rounded-full bg-gold/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 size-[420px] rounded-full bg-saffron/10 blur-3xl pointer-events-none" />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 32 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute size-1 rounded-full bg-gold/40"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.6, 0.1],
            }}
            transition={{
              duration: 6 + (i % 5),
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative container mx-auto px-6">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-xs uppercase tracking-widest text-gold mb-4"
          >
            Explore India
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-display text-4xl md:text-6xl leading-[1.05]"
          >
            Every corner of India <span className="text-gradient-gold italic">has a story</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 text-lg text-muted-foreground leading-relaxed"
          >
            Travel across India through the lives of changemakers, innovators, and everyday heroes.
          </motion.p>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mb-12"
        >
          {STATS.map((s) => (
            <div key={s.label} className="glass rounded-2xl p-5 text-center border border-gold/10">
              <s.icon className="size-5 text-gold mx-auto mb-3" />
              <div className="font-display text-3xl md:text-4xl text-gradient-gold">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-2 text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Journey toggle */}
        <div className="flex justify-center mb-8">
          <motion.button
            onClick={() => setJourney((j) => !j)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`group relative inline-flex items-center gap-3 rounded-full px-6 py-3 text-sm border transition-all ${
              journey
                ? "border-gold/60 bg-gold/10 text-gold shadow-glow"
                : "border-gold/20 bg-card/40 text-foreground hover:border-gold/40"
            }`}
          >
            <Route className="size-4" />
            <span className="uppercase tracking-widest">
              {journey ? "Travelling through India" : "Travel through India"}
            </span>
            <span
              className={`size-2 rounded-full transition-colors ${
                journey ? "bg-gold animate-pulse" : "bg-muted-foreground/50"
              }`}
            />
          </motion.button>
        </div>

        {/* Map + side panel */}
        <div className="relative grid lg:grid-cols-[1.5fr_1fr] gap-6 items-start">
          {/* Map card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative glass rounded-3xl p-4 md:p-8 overflow-hidden border border-gold/10"
          >
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 size-[420px] rounded-full bg-gold/10 blur-3xl pointer-events-none" />

            <svg
              viewBox="0 0 500 600"
              className="relative w-full h-auto"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="exStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="oklch(0.82 0.14 75)" />
                  <stop offset="100%" stopColor="oklch(0.72 0.2 50)" />
                </linearGradient>
                <linearGradient id="exFill" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="oklch(0.82 0.14 75)" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="oklch(0.72 0.2 50)" stopOpacity="0.02" />
                </linearGradient>
                <filter id="exGlow">
                  <feGaussianBlur stdDeviation="3" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <radialGradient id="exDot">
                  <stop offset="0%" stopColor="oklch(0.95 0.16 80)" />
                  <stop offset="100%" stopColor="oklch(0.72 0.2 50)" />
                </radialGradient>
              </defs>

              {/* India outline */}
              <motion.path
                d="M180 60 C 220 50 260 55 295 70 C 330 82 355 100 365 125 C 372 145 360 165 345 178 C 380 185 410 200 425 230 C 440 260 430 295 405 320 C 395 332 380 340 365 345 C 380 370 385 400 375 430 C 365 460 345 485 320 505 C 295 525 265 540 240 550 C 220 558 200 555 195 540 C 188 520 200 500 215 485 C 200 480 188 470 185 455 C 180 435 195 418 210 408 C 195 395 185 378 188 358 C 192 335 215 320 235 318 C 220 305 210 285 215 265 C 222 240 245 225 268 222 C 245 215 225 200 215 178 C 205 155 215 132 232 118 C 215 110 200 95 195 78 C 190 65 175 62 180 60 Z"
                fill="url(#exFill)"
                stroke="url(#exStroke)"
                strokeWidth="1.5"
                filter="url(#exGlow)"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Journey route */}
              <AnimatePresence>
                {journey && (
                  <motion.path
                    key="journey"
                    d={journeyPath}
                    fill="none"
                    stroke="url(#exStroke)"
                    strokeWidth="1.4"
                    strokeDasharray="4 5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.85 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 4, ease: "easeInOut" }}
                  />
                )}
              </AnimatePresence>

              {/* Hotspots */}
              {nodes.map((n, i) => {
                const isHover = hovered?.id === n.id;
                const isActive = selected?.id === n.id;
                const journeyIndex = journey ? i : -1;
                return (
                  <g
                    key={n.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered((c) => (c?.id === n.id ? null : c))}
                    onClick={() => setSelected(n)}
                  >
                    {/* Pulse */}
                    <motion.circle
                      cx={n.x}
                      cy={n.y}
                      r="6"
                      fill="oklch(0.82 0.14 75)"
                      animate={{ r: [6, 18, 6], opacity: [0.55, 0, 0.55] }}
                      transition={{
                        duration: 2.6,
                        repeat: Infinity,
                        delay: (i % 6) * 0.3,
                        ease: "easeOut",
                      }}
                    />
                    {/* Halo on hover/active */}
                    <motion.circle
                      cx={n.x}
                      cy={n.y}
                      r="16"
                      fill="oklch(0.82 0.14 75)"
                      animate={{ opacity: isHover || isActive ? 0.2 : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                    {/* Core */}
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={isActive ? 6 : isHover ? 5.5 : 4}
                      fill="url(#exDot)"
                      stroke="oklch(0.98 0.01 80)"
                      strokeWidth="0.8"
                      style={{ transition: "r 0.3s ease" }}
                    />
                    {/* Journey index marker */}
                    {journey && journeyIndex >= 0 && (
                      <motion.text
                        x={n.x + 9}
                        y={n.y - 8}
                        fontSize="8"
                        fill="oklch(0.9 0.12 75)"
                        fontFamily="serif"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 + journeyIndex * 0.15 }}
                      >
                        {journeyIndex + 1}
                      </motion.text>
                    )}
                    {/* Hit target */}
                    <circle cx={n.x} cy={n.y} r="22" fill="transparent" />
                  </g>
                );
              })}
            </svg>

            {/* Hover tooltip */}
            <AnimatePresence>
              {hovered && !selected && (
                <motion.div
                  key={hovered.id}
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  className="hidden md:block absolute top-6 right-6 max-w-xs glass rounded-2xl p-5 shadow-elegant pointer-events-none border border-gold/20"
                >
                  <div className="flex items-center gap-2 text-xs text-gold mb-2">
                    <MapPin className="size-3.5" />
                    <span className="uppercase tracking-widest">{hovered.state}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                    <span>{hovered.stories} stories</span>
                    <span>{hovered.categories[0]}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">Featured hero</p>
                  <p className="font-display text-lg leading-tight">{hovered.hero}</p>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {hovered.featuredTitle}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Side panel */}
          <div className="lg:sticky lg:top-24">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="relative glass rounded-3xl p-7 border border-gold/20 shadow-glow"
                >
                  <button
                    onClick={() => setSelected(null)}
                    aria-label="Close"
                    className="absolute top-4 right-4 size-8 rounded-full grid place-items-center text-muted-foreground hover:text-foreground hover:bg-background/40 transition"
                  >
                    <X className="size-4" />
                  </button>

                  <div className="flex items-center gap-2 text-xs text-gold mb-3">
                    <MapPin className="size-3.5" />
                    <span className="uppercase tracking-widest">India</span>
                  </div>
                  <h3 className="font-display text-3xl leading-tight">{selected.state}</h3>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-background/30 border border-gold/10 p-4">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Stories
                      </p>
                      <p className="font-display text-2xl text-gradient-gold mt-1">
                        {selected.stories}
                      </p>
                    </div>
                    <div className="rounded-xl bg-background/30 border border-gold/10 p-4">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Featured hero
                      </p>
                      <p className="font-display text-lg mt-1 leading-tight">{selected.hero}</p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      Top categories
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selected.categories.map((c) => (
                        <span
                          key={c}
                          className="text-xs px-3 py-1 rounded-full border border-gold/30 text-gold/90 bg-gold/5"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl bg-background/30 border border-gold/10 p-4">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      Quick preview
                    </p>
                    <p className="font-display text-lg leading-snug mb-1">
                      {selected.featuredTitle}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selected.preview}
                    </p>
                  </div>

                  <Button
                    size="lg"
                    className="mt-6 w-full bg-gradient-to-r from-gold to-saffron text-gold-foreground border-0 shadow-glow"
                    onClick={() => {
                      const story = stories.find((s) => s.region === selected.state);
                      if (!story) return;
                      navigate({ to: `/stories/${story.slug}` });
                    }}
                  >
                    Explore {selected.state}
                    <ArrowRight className="size-4" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass rounded-3xl p-7 border border-gold/10"
                >
                  <p className="text-xs uppercase tracking-widest text-gold mb-3">A living atlas</p>
                  <h3 className="font-display text-2xl leading-tight mb-3">Tap any glowing node</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Each light on the map is a story waiting to be opened — a chef in Lucknow, a
                    weaver in Assam, an engineer in the Himalayas. Hover to preview, tap to enter
                    the state.
                  </p>

                  <div className="mt-6 space-y-2">
                    {nodes.slice(0, 4).map((n, i) => (
                      <motion.button
                        key={n.id}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.06 }}
                        onMouseEnter={() => setHovered(n)}
                        onClick={() => setSelected(n)}
                        className="w-full text-left rounded-xl border border-transparent hover:border-gold/20 hover:bg-background/30 px-3 py-2 transition flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="text-xs text-gold uppercase tracking-widest">
                            {n.state}
                          </div>
                          <div className="text-sm truncate text-muted-foreground">
                            {n.featuredTitle}
                          </div>
                        </div>
                        <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-14 flex justify-center"
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-gold to-saffron text-gold-foreground border-0 shadow-glow px-8"
          >
            Start exploring India
            <ArrowRight className="size-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
