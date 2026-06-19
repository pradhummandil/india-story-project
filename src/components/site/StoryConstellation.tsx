import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";

type Node = {
  id: string;
  title: string;
  state: string;
  category:
    | "Innovation"
    | "Sustainability"
    | "Women Empowerment"
    | "Education"
    | "Culture"
    | "Rural Development"
    | "Environment";
  summary: string;
  x: number; // 0-100
  y: number; // 0-100
  size?: number;
};

const nodes: Node[] = [
  { id: "n1", title: "The Weaver Who Revived a Forgotten Loom", state: "Assam", category: "Culture", summary: "A 400-year-old weaving tradition, brought back to life thread by thread.", x: 18, y: 22, size: 14 },
  { id: "n2", title: "Coding Schools in the Himalayas", state: "Uttarakhand", category: "Education", summary: "Tribal youth shipping software from a remote mountain village.", x: 38, y: 14, size: 12 },
  { id: "n3", title: "The Silent Revolution of Millet Farmers", state: "Telangana", category: "Sustainability", summary: "Smallholder farmers reshaping India's food future.", x: 62, y: 28, size: 14 },
  { id: "n4", title: "Designing a Made-in-India Spacecraft", state: "Karnataka", category: "Innovation", summary: "The engineers behind India's most ambitious private mission.", x: 82, y: 20, size: 13 },
  { id: "n5", title: "Healing Waters of the Ganges", state: "Uttar Pradesh", category: "Environment", summary: "Scientists and saints uniting to restore a sacred river.", x: 28, y: 52, size: 12 },
  { id: "n6", title: "Lighting Up 200 Villages", state: "Bihar", category: "Rural Development", summary: "Solar microgrids changing nightfall across the plains.", x: 50, y: 46, size: 15 },
  { id: "n7", title: "Daughters of the Loom", state: "Tamil Nadu", category: "Women Empowerment", summary: "A cooperative of 1,200 women redefining textile labor.", x: 72, y: 58, size: 13 },
  { id: "n8", title: "Reimagining Royal Awadhi Cuisine", state: "Uttar Pradesh", category: "Culture", summary: "Three centuries of Nawabi recipes meet modern fine dining.", x: 14, y: 74, size: 11 },
  { id: "n9", title: "Forests Grown by Children", state: "Meghalaya", category: "Environment", summary: "Village schools planted a quarter-million native trees.", x: 42, y: 80, size: 12 },
  { id: "n10", title: "The Seed Bank of Wayanad", state: "Kerala", category: "Sustainability", summary: "Preserving 700 native varieties for the next century.", x: 64, y: 74, size: 13 },
  { id: "n11", title: "A Drone For Every Farmer", state: "Punjab", category: "Innovation", summary: "Affordable aerial tech reshaping smallholder agriculture.", x: 86, y: 68, size: 12 },
];

// Connections by shared theme / cross-pollination
const edges: [string, string][] = [
  ["n1", "n7"], ["n1", "n8"],
  ["n2", "n4"], ["n2", "n6"],
  ["n3", "n10"], ["n3", "n6"],
  ["n4", "n11"],
  ["n5", "n9"], ["n5", "n6"],
  ["n6", "n11"],
  ["n7", "n10"], ["n7", "n8"],
  ["n9", "n10"],
];

const categoryColors: Record<Node["category"], string> = {
  Innovation: "oklch(0.78 0.16 60)",
  Sustainability: "oklch(0.78 0.14 140)",
  "Women Empowerment": "oklch(0.7 0.18 350)",
  Education: "oklch(0.75 0.14 230)",
  Culture: "oklch(0.78 0.18 40)",
  "Rural Development": "oklch(0.78 0.12 90)",
  Environment: "oklch(0.78 0.16 170)",
};

export function StoryConstellation() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<Node | null>(null);

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
          <p className="text-xs uppercase tracking-[0.35em] text-gold mb-4">
            Story Constellation
          </p>
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
          {(Object.keys(categoryColors) as Node["category"][]).map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground"
            >
              <span
                className="size-1.5 rounded-full"
                style={{ background: categoryColors[c] }}
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
              const isActive =
                activeId && (a === activeId || b === activeId);
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
                    pathLength: { duration: 1.8, delay: 0.5 + i * 0.06, ease: [0.16, 1, 0.3, 1] },
                    opacity: { duration: 0.6, delay: 0.5 + i * 0.06 },
                    strokeOpacity: { duration: 0.4, ease: "easeOut" },
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
            const color = categoryColors[n.category];
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
                        <span
                          className="size-1.5 rounded-full"
                          style={{ background: color }}
                        />
                        <span style={{ color }}>{n.category}</span>
                        <span className="text-muted-foreground">· {n.state}</span>
                      </div>
                      <div className="font-display text-base leading-snug">
                        {n.title}
                      </div>
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
                    style={{ background: categoryColors[selected.category] }}
                  />
                  <span style={{ color: categoryColors[selected.category] }}>
                    {selected.category}
                  </span>
                  <span className="text-muted-foreground">· {selected.state}</span>
                </div>
                <h3 className="font-display text-2xl leading-tight">
                  {selected.title}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {selected.summary}
                </p>

                <button className="mt-5 inline-flex items-center gap-2 text-sm text-gold hover:gap-3 transition-all">
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
                              style={{ background: categoryColors[c.category] }}
                            />
                            <span className="text-muted-foreground">
                              {c.state}
                            </span>
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
