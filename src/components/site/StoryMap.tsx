import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Hotspot {
  id: string;
  state: string;
  category: string;
  title: string;
  preview: string;
  // coords in viewBox 500x600 (matching IndiaSilhouette path)
  x: number;
  y: number;
}

const hotspots: Hotspot[] = [
  {
    id: "ut",
    state: "Uttarakhand",
    category: "Innovation",
    title: "Coding Schools in the Himalayas",
    preview: "A former engineer training tribal youth to build software from a remote mountain village.",
    x: 268,
    y: 165,
  },
  {
    id: "as",
    state: "Assam",
    category: "Heritage",
    title: "The Weaver Who Revived a Forgotten Loom",
    preview: "Bringing back a 400-year-old weaving tradition — one thread at a time.",
    x: 395,
    y: 230,
  },
  {
    id: "up",
    state: "Uttar Pradesh",
    category: "Culture",
    title: "Reimagining Royal Awadhi Cuisine",
    preview: "A young chef from Lucknow blends Nawabi recipes with modern fine dining.",
    x: 295,
    y: 230,
  },
  {
    id: "tg",
    state: "Telangana",
    category: "Sustainability",
    title: "The Silent Revolution of Millet Farmers",
    preview: "Smallholder farmers reshaping India's food future by reviving ancient grains.",
    x: 280,
    y: 380,
  },
  {
    id: "ka",
    state: "Karnataka",
    category: "Science",
    title: "Designing a Made-in-India Spacecraft",
    preview: "Young engineers behind India's most ambitious private space mission.",
    x: 250,
    y: 445,
  },
  {
    id: "rj",
    state: "Rajasthan",
    category: "Heritage",
    title: "Guardians of the Thar",
    preview: "Desert artisans preserving block-print traditions across generations.",
    x: 215,
    y: 220,
  },
  {
    id: "kl",
    state: "Kerala",
    category: "Environment",
    title: "The Backwater Restorers",
    preview: "Fisher communities reviving Kerala's lifeline waterways.",
    x: 240,
    y: 510,
  },
];

// Pre-defined "story connection" pairs to animate
const connections: Array<[string, string]> = [
  ["ut", "as"],
  ["rj", "tg"],
  ["ka", "kl"],
  ["up", "ka"],
];

function getHotspot(id: string) {
  return hotspots.find((h) => h.id === id)!;
}

export function StoryMap() {
  const [active, setActive] = useState<Hotspot | null>(null);

  return (
    <section className="relative container mx-auto px-6 py-24 md:py-32">
      {/* Heading */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-xs uppercase tracking-widest text-gold mb-4"
        >
          The story map
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
          Travel across the country through the lives of changemakers, innovators,
          and everyday heroes.
        </motion.p>
      </div>

      {/* Map + sidebar */}
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
        {/* Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative glass rounded-3xl p-4 md:p-8 overflow-hidden"
        >
          {/* Ambient glow */}
          <div className="absolute inset-0 bg-hero opacity-40 pointer-events-none" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 size-[420px] rounded-full bg-gold/10 blur-3xl pointer-events-none" />

          <svg
            viewBox="0 0 500 600"
            className="relative w-full h-auto"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="mapStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="oklch(0.82 0.14 75)" />
                <stop offset="100%" stopColor="oklch(0.72 0.2 50)" />
              </linearGradient>
              <linearGradient id="mapFill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="oklch(0.82 0.14 75)" stopOpacity="0.08" />
                <stop offset="100%" stopColor="oklch(0.72 0.2 50)" stopOpacity="0.02" />
              </linearGradient>
              <filter id="mapGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="hotspotGrad">
                <stop offset="0%" stopColor="oklch(0.9 0.16 75)" />
                <stop offset="100%" stopColor="oklch(0.72 0.2 50)" />
              </radialGradient>
            </defs>

            {/* India silhouette */}
            <motion.path
              d="M180 60 C 220 50 260 55 295 70 C 330 82 355 100 365 125 C 372 145 360 165 345 178 C 380 185 410 200 425 230 C 440 260 430 295 405 320 C 395 332 380 340 365 345 C 380 370 385 400 375 430 C 365 460 345 485 320 505 C 295 525 265 540 240 550 C 220 558 200 555 195 540 C 188 520 200 500 215 485 C 200 480 188 470 185 455 C 180 435 195 418 210 408 C 195 395 185 378 188 358 C 192 335 215 320 235 318 C 220 305 210 285 215 265 C 222 240 245 225 268 222 C 245 215 225 200 215 178 C 205 155 215 132 232 118 C 215 110 200 95 195 78 C 190 65 175 62 180 60 Z"
              fill="url(#mapFill)"
              stroke="url(#mapStroke)"
              strokeWidth="1.5"
              filter="url(#mapGlow)"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* Subtle region divider lines (north/south/east/west) */}
            <g stroke="url(#mapStroke)" strokeWidth="0.6" strokeDasharray="3 5" opacity="0.25">
              <line x1="180" y1="270" x2="425" y2="270" />
              <line x1="180" y1="400" x2="400" y2="400" />
              <line x1="280" y1="80" x2="280" y2="550" />
            </g>

            {/* Connections between selected stories */}
            <g>
              {connections.map(([a, b], i) => {
                const A = getHotspot(a);
                const B = getHotspot(b);
                return (
                  <motion.line
                    key={`${a}-${b}`}
                    x1={A.x}
                    y1={A.y}
                    x2={B.x}
                    y2={B.y}
                    stroke="url(#mapStroke)"
                    strokeWidth="0.8"
                    strokeDasharray="4 6"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 0.5 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 1.4,
                      delay: 1.5 + i * 0.2,
                      ease: "easeOut",
                    }}
                  />
                );
              })}
            </g>

            {/* Hotspots */}
            {hotspots.map((h, i) => {
              const isActive = active?.id === h.id;
              return (
                <g
                  key={h.id}
                  className="cursor-pointer"
                  onMouseEnter={() => setActive(h)}
                  onMouseLeave={() => setActive((cur) => (cur?.id === h.id ? null : cur))}
                  onClick={() => setActive(h)}
                >
                  {/* Pulse ring */}
                  <motion.circle
                    cx={h.x}
                    cy={h.y}
                    r="6"
                    fill="oklch(0.82 0.14 75)"
                    opacity="0.4"
                    animate={{ r: [6, 18, 6], opacity: [0.5, 0, 0.5] }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeOut",
                    }}
                  />
                  {/* Outer halo on hover */}
                  <motion.circle
                    cx={h.x}
                    cy={h.y}
                    r="14"
                    fill="oklch(0.82 0.14 75)"
                    opacity={isActive ? 0.18 : 0}
                    animate={{ opacity: isActive ? 0.18 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  {/* Core dot */}
                  <circle
                    cx={h.x}
                    cy={h.y}
                    r={isActive ? 5.5 : 4}
                    fill="url(#hotspotGrad)"
                    stroke="oklch(0.96 0.01 80)"
                    strokeWidth="0.8"
                    style={{ transition: "r 0.3s ease" }}
                  />
                  {/* Invisible larger hit target */}
                  <circle cx={h.x} cy={h.y} r="20" fill="transparent" />
                </g>
              );
            })}
          </svg>

          {/* Hover tooltip (positioned absolutely over the map) */}
          <AnimatePresence>
            {active && (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="hidden md:block absolute top-6 right-6 max-w-xs glass rounded-2xl p-5 shadow-elegant pointer-events-none"
              >
                <div className="flex items-center gap-2 text-xs text-gold mb-2">
                  <MapPin className="size-3.5" />
                  <span className="uppercase tracking-widest">{active.state}</span>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                  {active.category}
                </p>
                <h3 className="font-display text-xl leading-tight mb-2">
                  {active.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {active.preview}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Sidebar — story list */}
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
            Featured locations
          </p>
          <div className="flex flex-col gap-2">
            {hotspots.map((h, i) => {
              const isActive = active?.id === h.id;
              return (
                <motion.button
                  key={h.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.05 }}
                  onMouseEnter={() => setActive(h)}
                  onFocus={() => setActive(h)}
                  className={`text-left glass rounded-xl p-4 transition-all border ${
                    isActive
                      ? "border-gold/50 shadow-glow"
                      : "border-transparent hover:border-gold/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs text-gold mb-1">
                        <MapPin className="size-3" />
                        <span className="uppercase tracking-widest">{h.state}</span>
                        <span className="size-1 rounded-full bg-muted-foreground/50" />
                        <span className="text-muted-foreground normal-case tracking-normal">
                          {h.category}
                        </span>
                      </div>
                      <p className="font-display text-lg leading-snug truncate">
                        {h.title}
                      </p>
                    </div>
                    <ArrowRight
                      className={`size-4 shrink-0 transition-all ${
                        isActive ? "text-gold translate-x-1" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-6">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-gold to-saffron text-gold-foreground border-0 shadow-glow"
            >
              Explore the story map
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
