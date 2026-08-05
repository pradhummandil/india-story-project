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

  return (
    <div className="flex items-center gap-3 text-xs tracking-wider font-semibold">
      <button
        onClick={() => setLang("en")}
        className={`relative transition-colors pb-0.5 ${
          lang === "en"
            ? "text-primary border-b-2 border-primary"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <span className="relative overflow-hidden inline-block h-[1.1em]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={`en-${lang === "en" ? "active" : "inactive"}`}
              className="inline-block"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              ENGLISH
            </motion.span>
          </AnimatePresence>
        </span>
      </button>
      <span className="text-border/60">|</span>
      <button
        onClick={() => setLang("hi")}
        className={`relative transition-colors pb-0.5 ${
          lang === "hi"
            ? "text-primary border-b-2 border-primary"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <span className="relative overflow-hidden inline-block h-[1.1em]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={`hi-${lang === "hi" ? "active" : "inactive"}`}
              className="inline-block"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              हिन्दी
            </motion.span>
          </AnimatePresence>
        </span>
      </button>
    </div>
  );
}
