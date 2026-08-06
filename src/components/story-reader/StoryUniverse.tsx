import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Compass, ZoomIn, ZoomOut, RotateCcw, Filter, Layers } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { stories } from "@/lib/stories-data";
import { useI18nStore } from "@/lib/i18n";

interface NodeItem {
  id: string;
  title: string;
  category: string;
  region: string;
  excerpt: string;
  image: string;
  slug: string;
  x: number; // 5..95 %
  y: number; // 5..95 %
  size: number;
}

export function StoryUniverse() {
  const lang = useI18nStore((s) => s.lang);
  const isHindi = lang === "hi";

  const categories = useMemo(() => {
    return isHindi
      ? ["सभी ब्रह्मांड", "संस्कृति", "विरासत", "शिल्प", "प्रकृति", "समुदाय"]
      : ["All Universe", "Culture", "Heritage", "Crafts", "Nature", "Community"];
  }, [isHindi]);

  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Generate deterministic cosmic positions for story nodes
  const nodes = useMemo(() => {
    return stories.slice(0, 16).map((s, idx) => {
      const angle = (idx / 16) * 2 * Math.PI;
      const radius = 22 + (idx % 3) * 12;
      const x = Math.max(8, Math.min(92, 50 + radius * Math.cos(angle)));
      const y = Math.max(10, Math.min(90, 50 + radius * Math.sin(angle)));

      return {
        id: s.id || `node-${idx}`,
        title: isHindi ? (s.titleHindi || s.title) : s.title,
        category: (s as any).category || (s as any).themes?.[0] || (idx % 2 === 0 ? (isHindi ? "संस्कृति" : "Culture") : (isHindi ? "विरासत" : "Heritage")),
        region: s.region || "India",
        excerpt: isHindi ? (s.excerptHindi || s.excerpt) : s.excerpt,
        image: s.image,
        slug: s.slug,
        x,
        y,
        size: 14 + (idx % 4) * 4,
      };
    });
  }, [isHindi]);

  const filteredNodes = useMemo(() => {
    if (selectedCategory === categories[0]) return nodes;
    return nodes.filter(
      (n) => n.category.toLowerCase().includes(selectedCategory.toLowerCase())
    );
  }, [nodes, selectedCategory, categories]);

  // Constellation links connecting nodes
  const links = useMemo(() => {
    const list: Array<[NodeItem, NodeItem]> = [];
    for (let i = 0; i < filteredNodes.length; i++) {
      for (let j = i + 1; j < filteredNodes.length; j++) {
        const a = filteredNodes[i];
        const b = filteredNodes[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 38 || a.category === b.category) {
          list.push([a, b]);
        }
      }
    }
    return list.slice(0, 24);
  }, [filteredNodes]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9 }}
      className="my-20 relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#090807] via-[#12100E] to-[#090807] border border-[#FAF7F2]/15 shadow-2xl p-6 md:p-12 text-white"
    >
      {/* Background Ambient Stars & Glowing Nebulae */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#D32F2F]/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-[160px]" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#FAF7F2_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#FAF7F2]/10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-widest mb-2">
              <Sparkles className="w-4 h-4" /> {isHindi ? "जीवंत कहानी तारामंडल" : "Living Story Constellation"}
            </div>
            <h3 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight">
              {isHindi ? "इंडिया स्टोरी ब्रह्मांड" : "The India Story Universe"}
            </h3>
            <p className="text-sm text-[#FAF7F2]/70 mt-1 max-w-xl">
              {isHindi
                ? "आधुनिक भारत में मानवीय आख्यानों, प्राचीन विरासत और क्षेत्रीय प्रेषणों का एक परस्पर जुड़ा हुआ ब्रह्मांडीय ग्राफ।"
                : "An interconnected cosmic graph of human narratives, ancient heritage, and regional dispatches across modern India."}
            </p>
          </div>

          {/* Controls: Zoom & Reset */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.15))}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-xs flex items-center gap-1 border border-white/10"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.15))}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-xs flex items-center gap-1 border border-white/10"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-xs flex items-center gap-1 border border-white/10"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                selectedCategory === cat
                  ? "bg-[#D32F2F] text-white shadow-lg shadow-[#D32F2F]/30 border border-[#D32F2F]"
                  : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Canvas Universe Container */}
        <div
          className="relative h-[480px] md:h-[600px] w-full rounded-2xl overflow-hidden bg-[#0D0B0A] border border-[#FAF7F2]/10 transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {links.map(([a, b], idx) => {
              const isHighlighted = hoveredId === a.id || hoveredId === b.id;
              return (
                <line
                  key={idx}
                  x1={`${a.x}%`}
                  y1={`${a.y}%`}
                  x2={`${b.x}%`}
                  y2={`${b.y}%`}
                  stroke={isHighlighted ? "#D32F2F" : "#D4AF37"}
                  strokeOpacity={isHighlighted ? 0.8 : 0.25}
                  strokeWidth={isHighlighted ? 2 : 1}
                  strokeDasharray={isHighlighted ? "4 2" : "none"}
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {filteredNodes.map((node) => {
            const isHovered = hoveredId === node.id;
            const isSelected = selectedNode?.id === node.id;

            return (
              <motion.div
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.25, zIndex: 30 }}
                onHoverStart={() => setHoveredId(node.id)}
                onHoverEnd={() => setHoveredId(null)}
                onClick={() => setSelectedNode(node)}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                <div
                  className={`relative rounded-full overflow-hidden border-2 transition-all duration-300 ${
                    isHovered || isSelected
                      ? "border-[#D32F2F] ring-4 ring-[#D32F2F]/40 shadow-2xl shadow-[#D32F2F]/50"
                      : "border-[#D4AF37]/60 hover:border-white"
                  }`}
                  style={{ width: `${node.size * 2.8}px`, height: `${node.size * 2.8}px` }}
                >
                  <img
                    src={node.image}
                    alt={node.title}
                    className="w-full h-full object-cover filter brightness-90 hover:brightness-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                {/* Node Title Label */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1.5 whitespace-nowrap pointer-events-none">
                  <span className="text-[10px] font-semibold text-white bg-black/80 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-md shadow-lg">
                    {node.title.slice(0, 20)}...
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Selected Node Details Drawer */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="p-6 rounded-2xl bg-[#1A1816] border border-[#FAF7F2]/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl"
            >
              <div className="flex items-center gap-4">
                <img
                  src={selectedNode.image}
                  alt={selectedNode.title}
                  className="w-20 h-20 rounded-xl object-cover border border-[#D4AF37]"
                />
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#D4AF37] px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20">
                    {selectedNode.category} • {selectedNode.region}
                  </span>
                  <h4 className="text-lg font-serif font-bold text-white mt-1">
                    {selectedNode.title}
                  </h4>
                  <p className="text-xs text-[#FAF7F2]/70 line-clamp-1">{selectedNode.excerpt}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <Link
                  to={`/stories/${selectedNode.slug}`}
                  className="px-6 py-2.5 rounded-full bg-[#D32F2F] text-white font-semibold text-xs hover:bg-[#B91C1C] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#D32F2F]/30 flex-1 md:flex-none"
                >
                  <span>{isHindi ? "कहानी देखें" : "Explore Node Dispatch"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                >
                  {isHindi ? "बंद करें" : "Close"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
