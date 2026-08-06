import { motion } from "framer-motion";
import { Sun, Moon, Type, Maximize, Minimize, Sparkles, BookOpen } from "lucide-react";
import { useI18nStore } from "@/lib/i18n";

export type ReaderTheme = "ivory" | "obsidian" | "sepia" | "maroon";

interface StoryReaderBarProps {
  theme: ReaderTheme;
  onThemeChange: (theme: ReaderTheme) => void;
  fontSize: "sm" | "md" | "lg";
  onFontSizeChange: (size: "sm" | "md" | "lg") => void;
  fontFamily: "serif" | "sans";
  onFontFamilyChange: (family: "serif" | "sans") => void;
  isZen: boolean;
  onZenToggle: () => void;
}

export function StoryReaderBar({
  theme,
  onThemeChange,
  fontSize,
  onFontSizeChange,
  fontFamily,
  onFontFamilyChange,
  isZen,
  onZenToggle,
}: StoryReaderBarProps) {
  const lang = useI18nStore((s) => s.lang);
  const isHindi = lang === "hi";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-20 z-30 my-8 mx-auto max-w-2xl px-4 pointer-events-auto"
    >
      <div className="bg-[#1A1816]/90 backdrop-blur-2xl border border-[#FAF7F2]/15 rounded-full p-2 px-5 shadow-2xl flex items-center justify-between gap-4 text-white">
        {/* Theme Selectors */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#D4AF37] mr-1 hidden sm:inline">
            {isHindi ? "वातावरण:" : "Atmosphere:"}
          </span>
          {[
            { id: "ivory", label: isHindi ? "हाथीदांत" : "Warm Ivory", color: "#FAF7F2", border: "#D4AF37" },
            { id: "obsidian", label: isHindi ? "ऑब्सीडियन" : "Dark Obsidian", color: "#09090B", border: "#3F3F46" },
            { id: "sepia", label: isHindi ? "सेपिया" : "Vintage Sepia", color: "#F8F1E5", border: "#D97706" },
            { id: "maroon", label: isHindi ? "मैरून" : "Velvet Maroon", color: "#2D0B14", border: "#991B1B" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => onThemeChange(t.id as ReaderTheme)}
              className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                theme === t.id ? "scale-125 ring-2 ring-[#D4AF37]" : "opacity-70 hover:opacity-100"
              }`}
              style={{ backgroundColor: t.color, borderColor: t.border }}
              title={t.label}
            />
          ))}
        </div>

        <div className="w-px h-5 bg-[#FAF7F2]/15" />

        {/* Font Size & Type Controls */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => onFontFamilyChange(fontFamily === "serif" ? "sans" : "serif")}
            className={`px-2.5 py-1 rounded-lg border border-white/10 transition-all font-mono cursor-pointer ${
              fontFamily === "serif" ? "bg-[#D4AF37] text-black font-serif font-bold" : "text-white"
            }`}
            title="Toggle Serif/Sans Font"
          >
            {fontFamily === "serif" ? "Serif" : "Sans"}
          </button>

          <div className="flex items-center bg-[#24201D] border border-white/10 rounded-lg p-0.5">
            {(["sm", "md", "lg"] as const).map((sz) => (
              <button
                key={sz}
                onClick={() => onFontSizeChange(sz)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-all cursor-pointer ${
                  fontSize === sz ? "bg-[#D32F2F] text-white" : "text-white/60 hover:text-white"
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        <div className="w-px h-5 bg-[#FAF7F2]/15 hidden sm:block" />

        {/* Zen Mode Toggle */}
        <button
          onClick={onZenToggle}
          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            isZen
              ? "bg-[#D32F2F] text-white shadow-lg shadow-[#D32F2F]/30"
              : "bg-white/10 text-white/80 hover:bg-white/20"
          }`}
          title="Toggle Zen Immersion Mode"
        >
          {isZen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">
            {isZen ? (isHindi ? "ज़ेन मोड से बाहर निकलें" : "Exit Zen Mode") : (isHindi ? "ज़ेन मोड" : "Zen Mode")}
          </span>
        </button>
      </div>
    </motion.div>
  );
}
