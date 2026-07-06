import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { useI18nStore } from "@/lib/i18n";
import { getLanguageLabels } from "@/lib/i18n";

export function LanguageToggle() {
  const lang = useI18nStore((s) => s.lang);
  const setLang = useI18nStore((s) => s.setLang);
  const labels = getLanguageLabels(lang);

  const next: "en" | "hi" = lang === "en" ? "hi" : "en";


  return (
    <div className="hidden lg:flex items-center gap-2">
      <Globe className="size-4 text-muted-foreground" />
      <motion.button
        type="button"
        onClick={() => setLang(next)}
        className="h-10 px-3 rounded-md glass border border-border text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        aria-label="Toggle language"
      >
        <span className="uppercase tracking-wide">{labels[lang]}</span>
      </motion.button>
    </div>
  );
}

