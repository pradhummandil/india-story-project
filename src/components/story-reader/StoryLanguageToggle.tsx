import { motion } from "framer-motion";
import { Languages, Globe } from "lucide-react";
import { useI18nStore, Lang } from "@/lib/i18n";

export function StoryLanguageToggle() {
  const { lang, setLang } = useI18nStore();

  const toggleLanguage = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const nextLang: Lang = lang === "en" ? "hi" : "en";
    setLang(nextLang);
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleLanguage}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleLanguage();
          }
        }}
        aria-label={`Switch language to ${lang === "en" ? "Hindi" : "English"}`}
        className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A1816]/90 border border-[#D4AF37]/40 text-xs font-semibold text-white shadow-lg backdrop-blur-xl hover:border-[#D4AF37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] transition-all duration-300 cursor-pointer"
      >
        <Globe className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
        <span className="relative z-10 flex items-center gap-1">
          <span className={lang === "en" ? "text-[#D4AF37] font-bold" : "text-white/60"}>
            EN
          </span>
          <span className="text-white/30">/</span>
          <span className={lang === "hi" ? "text-[#D4AF37] font-bold" : "text-white/60"}>
            हिंदी
          </span>
        </span>

        {/* Animated pill highlight */}
        <motion.div
          layoutId="langPill"
          className="absolute inset-0 rounded-full bg-[#D4AF37]/15"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      </button>
    </div>
  );
}
