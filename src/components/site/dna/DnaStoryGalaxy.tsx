import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dna, Sparkles, MapPin, User, ZoomIn, ZoomOut, RotateCcw, Layers } from "lucide-react";
import type { Story } from "@/components/site/StoryCard";
import { useI18nStore, translateStory } from "@/lib/i18n";
import { DnaHoverPreviewCard } from "./DnaHoverPreviewCard";

interface DnaStoryGalaxyProps {
  stories: Story[];
  activeStoryId: string;
  onSelectStory: (id: string) => void;
  selectedCategory?: string;
}

export function DnaStoryGalaxy({
  stories,
  activeStoryId,
  onSelectStory,
  selectedCategory = "All",
}: DnaStoryGalaxyProps) {
  const lang = useI18nStore((s) => s.lang);
  const [hoveredStoryId, setHoveredStoryId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Filter stories by category if selected
  const displayStories = useMemo(() => {
    if (!selectedCategory || selectedCategory === "All") {
      return stories.slice(0, 14); // Limit to top 14 for optimal orbital galaxy layout
    }
    const filtered = stories.filter((s) => {
      const themes = Array.isArray(s.themes) ? s.themes : [];
      return (
        themes.some((t) => t.toLowerCase() === selectedCategory.toLowerCase()) ||
        s.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    });
    return filtered.length > 0 ? filtered.slice(0, 14) : stories.slice(0, 14);
  }, [stories, selectedCategory]);

  // Active base story
  const activeStory = useMemo(() => {
    return stories.find((s) => s.id === activeStoryId) || displayStories[0] || stories[0];
  }, [stories, activeStoryId, displayStories]);

  // Hovered story object
  const hoveredStory = useMemo(() => {
    if (!hoveredStoryId) return null;
    return stories.find((s) => s.id === hoveredStoryId) || null;
  }, [stories, hoveredStoryId]);

  // Calculate orbital node positions around the central core node
  const galaxyNodes = useMemo(() => {
    if (!displayStories.length) return [];

    return displayStories.map((story, i) => {
      // Create 2 concentric orbital rings for a multi-layered star galaxy feeling
      const isInnerRing = i % 2 === 0;
      const radiusPct = isInnerRing ? 28 : 42; // Percentage radius from center
      const angle = (i / displayStories.length) * Math.PI * 2 - Math.PI / 2;

      // Floating random variance for star physics
      const floatDuration = 4 + (i % 5) * 1.2;
      const floatDelay = (i * 0.4) % 3;

      return {
        story,
        x: 50 + Math.cos(angle) * radiusPct,
        y: 50 + Math.sin(angle) * radiusPct,
        angle,
        isInnerRing,
        floatDuration,
        floatDelay,
      };
    });
  }, [displayStories]);

  if (!activeStory) return null;

  return (
    <section
      id="galaxy-universe-section"
      className="relative min-h-[750px] lg:min-h-[850px] bg-[#0D0D0D] overflow-hidden text-[#F8F6F1] py-16 px-4 md:px-8 border-b border-[#C89A3D]/20 flex flex-col justify-between"
    >
      {/* Background Starfield & Constellation Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(200,154,61,0.12)_0%,rgba(13,13,13,0.95)_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(165,0,0,0.08)_0%,transparent_60%)]" />

        {/* Ambient Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(200,154,61,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(200,154,61,0.05)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Header Info Bar */}
      <div className="relative z-10 container mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#C89A3D] uppercase tracking-widest mb-1">
            <Sparkles className="size-3.5" />
            <span>{lang === "hi" ? "जीवंत कहानी आकाशगंगा" : "LIVING STORY GALAXY"}</span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-[#F8F6F1] tracking-tight">
            {lang === "hi" ? "कहानी का ब्रह्मांड" : "Discover India's Story Universe"}
          </h2>
        </div>

        {/* Interactive Controls Bar */}
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md self-start md:self-auto">
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.15))}
            className="p-2 rounded-xl text-[#F1E5D0]/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="size-4" />
          </button>
          <span className="text-xs font-mono text-[#C89A3D] px-1">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.15))}
            className="p-2 rounded-xl text-[#F1E5D0]/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="size-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-2 rounded-xl text-[#F1E5D0]/70 hover:text-white hover:bg-white/10 transition-colors ml-1 border-l border-white/10"
            title="Reset Zoom"
          >
            <RotateCcw className="size-4" />
          </button>
        </div>
      </div>

      {/* Main Story Galaxy Interactive Canvas Container */}
      <div className="relative z-10 container mx-auto flex-1 min-h-[580px] grid place-items-center my-4 overflow-visible">
        <motion.div
          className="relative w-full max-w-5xl aspect-square md:aspect-[16/10] grid place-items-center"
          animate={{ scale: zoomLevel }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
        >
          {/* Orbital SVG Connected Filaments & Pulse Beams */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            <defs>
              <linearGradient id="galaxyLineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C89A3D" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#A50000" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#C89A3D" stopOpacity="0.2" />
              </linearGradient>
              <radialGradient id="centerGlowGradient">
                <stop offset="0%" stopColor="#C89A3D" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#A50000" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Concentric Orbital Ring Guidelines */}
            <circle
              cx="50%"
              cy="50%"
              r="28%"
              fill="none"
              stroke="#C89A3D"
              strokeOpacity="0.15"
              strokeDasharray="4 6"
            />
            <circle
              cx="50%"
              cy="50%"
              r="42%"
              fill="none"
              stroke="#C89A3D"
              strokeOpacity="0.1"
              strokeDasharray="6 8"
            />

            {/* Animated Energy Filaments connecting Center to Node Stars */}
            {galaxyNodes.map((node) => {
              const isSelected = activeStoryId === node.story.id;
              const isHovered = hoveredStoryId === node.story.id;
              const isConnected = isSelected || isHovered;

              return (
                <g key={node.story.id}>
                  <line
                    x1="50%"
                    y1="50%"
                    x2={`${node.x}%`}
                    y2={`${node.y}%`}
                    stroke={isConnected ? "#C89A3D" : "url(#galaxyLineGradient)"}
                    strokeWidth={isConnected ? 2.5 : 1}
                    strokeOpacity={isConnected ? 0.9 : 0.3}
                  />
                  {/* Energy Pulse Dot moving along line */}
                  {isConnected && (
                    <motion.circle
                      r="3"
                      fill="#F8F6F1"
                      animate={{
                        cx: ["50%", `${node.x}%`],
                        cy: ["50%", `${node.y}%`],
                        opacity: [0, 1, 0],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Central Glowing ISP Story Node */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center">
            {/* Glowing Core Pulsing Rings */}
            <motion.div
              animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-36 h-36 rounded-full bg-[#C89A3D]/25 blur-xl pointer-events-none"
            />
            <motion.div
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-48 h-48 rounded-full bg-[#A50000]/20 blur-2xl pointer-events-none"
            />

            {/* Central Node Container */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="relative size-20 md:size-24 rounded-full p-1 bg-gradient-to-br from-[#C89A3D] via-[#A50000] to-[#C89A3D] shadow-[0_0_40px_rgba(200,154,61,0.6)] cursor-pointer grid place-items-center"
            >
              <div className="w-full h-full rounded-full bg-[#111111] flex flex-col items-center justify-center p-2 text-center overflow-hidden border border-[#F1E5D0]/30">
                <Dna className="size-6 md:size-8 text-[#C89A3D] animate-pulse" />
                <span className="text-[9px] md:text-[10px] font-bold font-mono tracking-widest text-[#F1E5D0] uppercase mt-0.5">
                  INDIA DNA
                </span>
              </div>
            </motion.div>
          </div>

          {/* Floating Orbital Story Orbs */}
          {galaxyNodes.map((node) => {
            const story = translateStory(node.story, lang);
            const isSelected = activeStoryId === node.story.id;
            const isHovered = hoveredStoryId === node.story.id;
            const orbImage =
              story.image ||
              story.heroImage ||
              "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=400&q=80";

            return (
              <motion.div
                key={node.story.id}
                className="absolute z-30"
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: isHovered ? 1.25 : isSelected ? 1.15 : 1,
                  opacity: 1,
                  y: [0, -10, 0],
                }}
                transition={{
                  y: {
                    duration: node.floatDuration,
                    repeat: Infinity,
                    delay: node.floatDelay,
                    ease: "easeInOut",
                  },
                  scale: { duration: 0.3 },
                }}
              >
                <div
                  className="relative -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  onClick={() => onSelectStory(node.story.id)}
                  onMouseEnter={() => setHoveredStoryId(node.story.id)}
                  onMouseLeave={() => setHoveredStoryId(null)}
                >
                  {/* Outer Orbital Glow Ring */}
                  <div
                    className={`absolute inset-0 rounded-full transition-all duration-500 ${
                      isSelected
                        ? "bg-[#C89A3D] blur-md opacity-90 scale-125"
                        : isHovered
                          ? "bg-[#A50000] blur-md opacity-80 scale-120"
                          : "bg-[#C89A3D]/20 blur-sm opacity-40 group-hover:opacity-70"
                    }`}
                  />

                  {/* Story Orb Frame */}
                  <div
                    className={`relative size-14 sm:size-16 md:size-20 rounded-full p-0.5 transition-all duration-300 ${
                      isSelected
                        ? "bg-gradient-to-br from-[#C89A3D] via-[#F1E5D0] to-[#A50000] shadow-[0_0_25px_rgba(200,154,61,0.8)]"
                        : isHovered
                          ? "bg-gradient-to-br from-[#A50000] to-[#C89A3D] shadow-[0_0_20px_rgba(165,0,0,0.8)]"
                          : "bg-white/15 border border-white/30 backdrop-blur-md hover:border-[#C89A3D]"
                    }`}
                  >
                    {/* Actual Story Hero Image inside Orb */}
                    <div className="w-full h-full rounded-full overflow-hidden relative">
                      <img
                        src={orbImage}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* District Pill */}
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-black/80 backdrop-blur-md text-[8px] font-sans font-medium text-[#F1E5D0] truncate max-w-[85%] text-center">
                        {story.region?.split(",")[0] || "India"}
                      </span>
                    </div>
                  </div>

                  {/* Floating Title Label below Orb */}
                  <motion.div
                    className={`absolute left-1/2 -translate-x-1/2 top-full mt-1.5 px-2.5 py-1 rounded-lg bg-[#141414]/90 border backdrop-blur-md text-center whitespace-nowrap pointer-events-none transition-all duration-300 ${
                      isSelected
                        ? "border-[#C89A3D] text-[#C89A3D] shadow-lg"
                        : isHovered
                          ? "border-[#A50000] text-white"
                          : "border-white/10 text-[#F1E5D0]/80 group-hover:text-white"
                    }`}
                  >
                    <p className="text-[10px] font-bold font-sans truncate max-w-[130px]">
                      {story.title}
                    </p>
                    <p className="text-[8px] font-mono text-[#F1E5D0]/50 uppercase tracking-widest">
                      {story.category || story.themes?.[0] || "Story"}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Floating Hover Preview Card Popup */}
      <AnimatePresence>
        {hoveredStory && (
          <div className="fixed bottom-8 right-8 z-50 pointer-events-auto">
            <DnaHoverPreviewCard
              story={hoveredStory}
              onInspectDna={(id) => {
                onSelectStory(id);
                setHoveredStoryId(null);
              }}
              onClose={() => setHoveredStoryId(null)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Mobile/Tablet Fallback Stacked Cards Indicator */}
      <div className="relative z-10 container mx-auto pt-4 flex items-center justify-between text-xs text-[#F1E5D0]/60 border-t border-white/10">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-[#C89A3D] animate-ping" />
          <span>{lang === "hi" ? "नोड पर होवर या क्लिक करें" : "Hover or tap any orb to inspect story DNA"}</span>
        </div>
        <div className="font-mono text-[11px] text-[#C89A3D]">
          {activeStory.title}
        </div>
      </div>
    </section>
  );
}
