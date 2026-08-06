import { motion } from "framer-motion";
import {
  Users,
  Sparkles,
  Zap,
  Sprout,
  Sun,
  Palette,
  GraduationCap,
  Music2,
  HeartPulse,
  Landmark,
  Compass,
  Search,
  RotateCcw,
  Check,
  ShieldAlert,
} from "lucide-react";
import { useI18nStore } from "@/lib/i18n";
import { useHorizontalScroll } from "@/lib/use-horizontal-scroll";

export interface FilterChip {
  id: string;
  labelEn: string;
  labelHi: string;
  icon: typeof Users;
  gradient: string;
  glowColor: string;
}

export const DNA_FILTER_CHIPS: FilterChip[] = [
  {
    id: "All",
    labelEn: "All Universe",
    labelHi: "सभी ब्रह्मांड",
    icon: Compass,
    gradient: "from-[#C89A3D]/20 to-[#A50000]/20 border-[#C89A3D]/50",
    glowColor: "rgba(200,154,61,0.4)",
  },
  {
    id: "People",
    labelEn: "People",
    labelHi: "लोग",
    icon: Users,
    gradient: "from-amber-500/20 to-amber-700/20 border-amber-500/40",
    glowColor: "rgba(245,158,11,0.4)",
  },
  {
    id: "Women",
    labelEn: "Women",
    labelHi: "महिलाएं",
    icon: Sparkles,
    gradient: "from-pink-500/20 to-rose-700/20 border-pink-500/40",
    glowColor: "rgba(236,72,153,0.4)",
  },
  {
    id: "Freedom",
    labelEn: "Freedom",
    labelHi: "स्वतंत्रता",
    icon: ShieldAlert,
    gradient: "from-orange-500/20 to-amber-600/20 border-orange-500/40",
    glowColor: "rgba(249,115,22,0.4)",
  },
  {
    id: "Innovation",
    labelEn: "Innovation",
    labelHi: "नवाचार",
    icon: Zap,
    gradient: "from-blue-500/20 to-indigo-700/20 border-blue-500/40",
    glowColor: "rgba(59,130,246,0.4)",
  },
  {
    id: "Farming",
    labelEn: "Farming",
    labelHi: "कृषि",
    icon: Sprout,
    gradient: "from-emerald-500/20 to-teal-700/20 border-emerald-500/40",
    glowColor: "rgba(16,185,129,0.4)",
  },
  {
    id: "Climate",
    labelEn: "Climate",
    labelHi: "जलवायु",
    icon: Sun,
    gradient: "from-cyan-500/20 to-blue-700/20 border-cyan-500/40",
    glowColor: "rgba(6,182,212,0.4)",
  },
  {
    id: "Crafts",
    labelEn: "Crafts",
    labelHi: "हस्तशिल्प",
    icon: Palette,
    gradient: "from-purple-500/20 to-violet-700/20 border-purple-500/40",
    glowColor: "rgba(168,85,247,0.4)",
  },
  {
    id: "Education",
    labelEn: "Education",
    labelHi: "शिक्षा",
    icon: GraduationCap,
    gradient: "from-sky-500/20 to-blue-700/20 border-sky-500/40",
    glowColor: "rgba(14,165,233,0.4)",
  },
  {
    id: "Art",
    labelEn: "Art",
    labelHi: "कला",
    icon: Palette,
    gradient: "from-fuchsia-500/20 to-pink-700/20 border-fuchsia-500/40",
    glowColor: "rgba(217,70,239,0.4)",
  },
  {
    id: "Music",
    labelEn: "Music",
    labelHi: "संगीत",
    icon: Music2,
    gradient: "from-violet-500/20 to-purple-700/20 border-violet-500/40",
    glowColor: "rgba(139,92,246,0.4)",
  },
  {
    id: "Health",
    labelEn: "Health",
    labelHi: "स्वास्थ्य",
    icon: HeartPulse,
    gradient: "from-red-500/20 to-rose-700/20 border-red-500/40",
    glowColor: "rgba(239,68,68,0.4)",
  },
  {
    id: "Heritage",
    labelEn: "Heritage",
    labelHi: "विरासत",
    icon: Landmark,
    gradient: "from-[#C89A3D]/25 to-yellow-800/20 border-[#C89A3D]/50",
    glowColor: "rgba(200,154,61,0.5)",
  },
];

interface DnaFilterBarProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeCount: number;
  totalCount: number;
}

export function DnaFilterBar({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  activeCount,
  totalCount,
}: DnaFilterBarProps) {
  const lang = useI18nStore((s) => s.lang);
  const chipsScrollRef = useHorizontalScroll<HTMLDivElement>();

  return (
    <div className="w-full py-6 px-4 md:px-8 bg-[#111111]/90 border-y border-[#C89A3D]/20 backdrop-blur-xl sticky top-0 z-40">
      <div className="container mx-auto flex flex-col lg:flex-row items-center gap-4 justify-between">
        {/* Search Input & Counter */}
        <div className="w-full lg:w-72 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#C89A3D]/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={lang === "hi" ? "कहानी, विषय या स्थान खोजें..." : "Filter story universe..."}
              className="w-full h-10 pl-10 pr-4 rounded-full bg-white/5 border border-[#C89A3D]/30 text-xs text-[#F8F6F1] placeholder-[#F1E5D0]/40 focus:outline-none focus:border-[#C89A3D] focus:ring-1 focus:ring-[#C89A3D]/40 transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#F1E5D0]/50 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          <div className="text-[11px] text-[#F1E5D0]/60 font-mono shrink-0 whitespace-nowrap">
            <span className="text-[#C89A3D] font-bold">{activeCount}</span> / {totalCount}
          </div>
        </div>

        {/* Floating Chips Carousel / Grid */}
        <div
          ref={chipsScrollRef}
          className="w-full overflow-x-auto no-scrollbar flex items-center gap-2 py-1 scroll-smooth"
        >
          {DNA_FILTER_CHIPS.map((chip) => {
            const isSelected = selectedCategory.toLowerCase() === chip.id.toLowerCase();
            const Icon = chip.icon;

            return (
              <motion.button
                key={chip.id}
                onClick={() => onSelectCategory(chip.id)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`relative px-4 py-2 rounded-full border text-xs font-semibold font-sans tracking-wide transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer ${
                  isSelected
                    ? `bg-gradient-to-r ${chip.gradient} text-white border-[#C89A3D] shadow-lg`
                    : "bg-white/5 border-white/10 text-[#F1E5D0]/70 hover:text-white hover:bg-white/10 hover:border-[#C89A3D]/40"
                }`}
                style={{
                  boxShadow: isSelected ? `0 0 16px ${chip.glowColor}` : undefined,
                }}
              >
                <Icon className={`size-3.5 ${isSelected ? "text-[#C89A3D]" : "text-[#F1E5D0]/60"}`} />
                <span>{lang === "hi" ? chip.labelHi : chip.labelEn}</span>
                {isSelected && <Check className="size-3 text-[#C89A3D]" />}
              </motion.button>
            );
          })}
        </div>

        {/* Reset Filter Action */}
        {selectedCategory !== "All" || searchQuery ? (
          <button
            onClick={() => {
              onSelectCategory("All");
              onSearchChange("");
            }}
            className="flex items-center gap-1.5 text-xs text-[#C89A3D] hover:underline font-mono shrink-0 cursor-pointer"
          >
            <RotateCcw className="size-3" />
            <span>{lang === "hi" ? "रीसेट करें" : "Reset"}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
