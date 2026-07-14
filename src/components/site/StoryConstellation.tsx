import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import { stories } from "@/lib/stories-data";

type Node = {
  id: string;
  title: string;
  state: string;
  category: string; // primary theme
  summary: string;
  x: number; // 0-100
  y: number; // 0-100
  size?: number;
  slug: string;
};

function seededNumber(seed: string) {
  // Simple deterministic hash -> [0,1)
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 2 ** 32;
}

function colorForCategory(category: string) {
  // Deterministic color per category without a whitelist.
  const r = seededNumber(`r|${category}`);
  const hue = Math.round(20 + r * 330); // 20..350
  const chroma = Math.round(12 + seededNumber(`c|${category}`) * 12); // 12..24
  const light = Math.round(52 + seededNumber(`l|${category}`) * 20); // 52..72
  const alpha = 1;
  return `oklch(${(light / 100).toFixed(2)} ${(chroma / 100).toFixed(2)} ${hue} / ${alpha})`;
}

function dedupeEdges(edges: [string, string][]) {
  const seen = new Set<string>();
  return edges.filter(([a, b]) => {
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function StoryConstellation() {
  const navigate = useNavigate();

  const nodesAndEdges = useMemo(() => {
    // Keep the exact same visual layout: 11 nodes like the original component.
    const pick = stories.slice(0, 11);

    const nodes: Node[] = pick.map((s, idx) => {
      const rx = seededNumber(`${s.region}|x|${idx}`);
      const ry = seededNumber(`${s.region}|y|${idx}`);
      const baseX = 10 + rx * 80; // 10..90
      const baseY = 12 + ry * 76; // 12..88

      // Preserve a similar spread by nudging around a few anchor positions.
      const anchors = [22, 14, 28, 20, 52, 46, 58, 74, 80, 74, 68];
      const x = Math.max(6, Math.min(94, baseX * 0.85 + anchors[idx] * 0.15));
      const y = Math.max(6, Math.min(94, baseY * 0.85 + (idx % 2 ? 22 : 18) * 0.15));

      return {
        id: s.id || s.slug || `c-${idx}`,
        title: s.title,
        state: s.region,
        category: (
          Array.isArray((s as any).themes) && (s as any).themes.length > 0
            ? (s as any).themes[0]
            : (s as any).category ?? "Culture"
        ) as Node["category"],

        summary: s.excerpt,
        x,
        y,
        size: 11 + Math.round(seededNumber(`${s.slug}|size`) * 6),
        slug: s.slug,
      };
    });

    const byCategory = new Map<string, Node[]>();

    nodes.forEach((n) => {
      const arr = byCategory.get(n.category) ?? [];
      arr.push(n);
      byCategory.set(n.category, arr);
    });

    const edges: [string, string][] = [];
    // Connections: connect within same category and also cross-connect by index adjacency.
    nodes.forEach((n, i) => {
      const same = byCategory.get(n.category) ?? [];
      if (same.length > 1) {
        const target = same[(i + 1) % same.length];
        if (target && target.id !== n.id) edges.push([n.id, target.id]);
      }
      const adj = nodes[(i + 2) % nodes.length];
      if (adj) edges.push([n.id, adj.id]);
    });

    return { nodes, edges: dedupeEdges(edges) };
  }, []);

  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<Node | null>(null);

  const { nodes, edges } = nodesAndEdges;

  const findNode = (id: string) => nodes.find((n) => n.id === id)!;

  const connectedIds = (id: string | null) => {
    if (!id) return new Set<string>();
    const set = new Set<string>();
    edges.forEach(([a, b]) => {
      if (a === id) set.add(b);
      if (b === id) set.add(a);
    });
    return set;
  };

  const activeId = hovered ?? selected?.id ?? null;
  const connected = connectedIds(activeId);

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* Background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-white/60"
            style={{
              left: `${(i * 73) % 100}%`,
              top: `${(i * 41) % 100}%`,
              width: i % 7 === 0 ? 2 : 1,
              height: i % 7 === 0 ? 2 : 1,
            }}
            animate={{
              opacity: [0.1, 0.6, 0.1],
              y: [0, i % 2 === 0 ? -6 : 6, 0],
            }}
            transition={{
              duration: 6 + (i % 5),
              repeat: Infinity,
              delay: (i * 0.13) % 4,
              ease: "easeInOut",
            }}
          />
        ))}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, color-mix(in oklab, var(--gold) 8%, transparent), transparent 70%)",
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-gold mb-4">Story Constellation</p>
          <h2 className="font-display text-4xl md:text-6xl leading-tight">
            Every Story Connects To{" "}
            <span className="italic text-gradient-gold">Something Bigger</span>
          </h2>
          <p className="mt-5 text-muted-foreground text-lg">
            Explore the hidden connections shaping India's future.
          </p>
        </motion.div>

        {/* Category legend */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {Array.from(new Set(nodes.map((n) => n.category)))
            .slice(0, 7)
            .map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground"
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ background: colorForCategory(c) }}
                />
                {c}
              </span>
            ))}
        </div>

        {/* Constellation canvas */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2 }}
          className="relative glass rounded-3xl overflow-hidden border-gold/15"
          style={{ aspectRatio: "16 / 10" }}
          onClick={() => setSelected(null)}
        >
          {/* SVG connections */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            <defs>
              <linearGradient id="edgeGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="var(--saffron)" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {edges.map(([a, b], i) => {
              const A = findNode(a);
              const B = findNode(b);
              const isActive = activeId && (a === activeId || b === activeId);
              return (
                <motion.line
                  key={`${a}-${b}`}
                  x1={A.x}
                  y1={A.y}
                  x2={B.x}
                  y2={B.y}
                  stroke={isActive ? "var(--gold)" : "url(#edgeGrad)"}
                  strokeWidth={isActive ? 0.25 : 0.1}
                  strokeOpacity={activeId && !isActive ? 0.06 : 0.55}
                  strokeDasharray="0.6 0.8"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{
                    pathLength: {
                      duration: 1.8,
                      delay: 0.5 + i * 0.06,
                      ease: [0.16, 1, 0.3, 1],
                    },
                    opacity: { duration: 0.6, delay: 0.5 + i * 0.06 },
                    strokeOpacity: {
                      duration: 0.4,
                      ease: "easeOut",
                    },
                    stroke: { duration: 0.4 },
                  }}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((n, i) => {
            const isActive = activeId === n.id;

            const isConnected = connected.has(n.id);
            const dim = activeId && !isActive && !isConnected;
            const color = colorForCategory(n.category);

            return (
              <motion.button
                key={n.id}
                type="button"
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer outline-none"
                style={{ left: `${n.x}%`, top: `${n.y}%` }}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                onMouseEnter={() => setHovered(n.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(n);
                }}
                animate={{
                  y: [0, -6, 0, 4, 0],
                  x: [0, i % 2 === 0 ? 2 : -2, 0],
                  opacity: dim ? 0.22 : 1,
                }}
                transition={{
                  default: {
                    duration: 0.9,
                    delay: 0.6 + i * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  },
                  y: {
                    duration: 8 + (i % 5),
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.25,
                  },
                  x: {
                    duration: 10 + (i % 4),
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.3,
                  },
                  opacity: { duration: 0.5, ease: "easeOut" },
                }}
              >
                {/* Pulse */}
                <motion.span
                  className="absolute inset-0 rounded-full"
                  style={{
                    width: n.size,
                    height: n.size,
                    background: color,
                    transform: "translate(-50%, -50%)",
                    left: "50%",
                    top: "50%",
                  }}
                  animate={{ scale: [1, 2.4, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{
                    duration: 3 + (i % 3),
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
                {/* Star core */}
                <motion.span
                  className="block rounded-full relative"
                  style={{
                    width: n.size,
                    height: n.size,
                    background: color,
                    boxShadow: `0 0 16px ${color}, 0 0 32px ${color}`,
                  }}
                  animate={{ scale: isActive ? 1.55 : 1 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />

                {/* Hover card */}
                <AnimatePresence>
                  {hovered === n.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-1/2 top-full mt-4 -translate-x-1/2 w-64 glass rounded-xl p-4 text-left z-20 pointer-events-none shadow-elegant"
                    >
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest mb-2">
                        <span className="size-1.5 rounded-full" style={{ background: color }} />
                        <span style={{ color }}>{n.category}</span>
                        <span className="text-muted-foreground">· {n.state}</span>
                      </div>
                      <div className="font-display text-base leading-snug">{n.title}</div>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                        {n.summary}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}

          {/* Selected story panel */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="absolute top-4 right-4 bottom-4 w-[88%] sm:w-80 glass rounded-2xl p-6 z-30 overflow-y-auto shadow-elegant border-gold/30"
              >
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="absolute top-3 right-3 size-7 rounded-full grid place-items-center hover:bg-accent/10 transition-colors"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest mb-3">
                  <span
                    className="size-1.5 rounded-full"
                    style={{ background: colorForCategory(selected.category) }}
                  />
                  <span style={{ color: colorForCategory(selected.category) }}>
                    {selected.category}
                  </span>
                  <span className="text-muted-foreground">· {selected.state}</span>
                </div>
                <h3 className="font-display text-2xl leading-tight">{selected.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {selected.summary}
                </p>

                <button
                  onClick={() => navigate({ to: `/stories/${selected.slug}` })}
                  className="mt-5 inline-flex items-center gap-2 text-sm text-gold hover:gap-3 transition-all"
                >
                  Read story
                  <ArrowRight className="size-4" />
                </button>

                <div className="mt-7 pt-5 border-t border-border">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                    Connected Stories
                  </p>
                  <div className="space-y-2">
                    {Array.from(connectedIds(selected.id)).map((cid) => {
                      const c = findNode(cid);
                      return (
                        <button
                          key={cid}
                          type="button"
                          onClick={() => setSelected(c)}
                          className="w-full text-left p-3 rounded-lg border border-border hover:border-gold/40 hover:bg-accent/5 transition-all group"
                        >
                          <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest mb-1">
                            <span
                              className="size-1 rounded-full"
                              style={{ background: colorForCategory(c.category) }}
                            />

                            <span className="text-muted-foreground">{c.state}</span>
                          </div>
                          <div className="font-display text-sm leading-snug group-hover:text-gradient-gold transition-colors">
                            {c.title}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-6 tracking-wider">
          Hover a star to preview · Click to explore connections
        </p>
      </div>
    </section>
  );
}
