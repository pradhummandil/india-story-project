import { useI18nStore } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Language toggle with smooth crossfade + vertical slide transition.
 * When switching EN ↔ HI, the active label fades out upward and the
 * new one fades in from below — a satisfying micro-interaction.
 */
export function LanguageToggle() {
  const lang = useI18nStore((s) => s.lang);
  const setLang = useI18nStore((s) => s.setLang);

  const toggleLang = () => setLang(lang === "en" ? "hi" : "en");

  return (
    <>
      {/* ── Desktop View (Full Text Toggle) ── */}
      <div className="hidden md:flex items-center gap-3 text-xs tracking-wider font-semibold">
        <button
          type="button"
          onClick={() => setLang("en")}
          className={`relative transition-colors py-1 cursor-pointer ${
            lang === "en"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="relative inline-flex items-center min-h-[22px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={`en-${lang === "en" ? "active" : "inactive"}`}
                className="inline-block"
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              >
                ENGLISH
              </motion.span>
            </AnimatePresence>
          </span>
        </button>
        <span className="text-border/60">|</span>
        <button
          type="button"
          onClick={() => setLang("hi")}
          className={`relative transition-colors py-1 cursor-pointer ${
            lang === "hi"
              ? "text-primary border-b-2 border-primary font-bold"
              : "text-muted-foreground hover:text-foreground font-semibold"
          }`}
        >
          <span className="relative inline-flex items-center min-h-[22px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={`hi-${lang === "hi" ? "active" : "inactive"}`}
                className="inline-block"
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              >
                हिन्दी
              </motion.span>
            </AnimatePresence>
          </span>
        </button>
      </div>

      {/* ── Mobile View (Compact Pill Switch with ≥ 44x44px touch target) ── */}
      <button
        type="button"
        onClick={toggleLang}
        aria-label={`Switch language from ${lang === "en" ? "English" : "Hindi"}`}
        className="flex md:hidden items-center justify-center min-h-[44px] min-w-[44px] px-1 cursor-pointer focus:outline-none"
      >
        <div className="h-8 px-2.5 rounded-full border border-primary/40 bg-primary/10 text-primary flex items-center gap-1 font-sans text-[11px] font-bold tracking-wider shadow-sm">
          <span className={lang === "en" ? "text-primary font-bold" : "text-muted-foreground"}>EN</span>
          <span className="text-primary/40 text-[9px]">/</span>
          <span className={lang === "hi" ? "text-primary font-bold" : "text-muted-foreground"}>अ</span>
        </div>
      </button>
    </>
  );
}
