import { useI18nStore } from "@/lib/i18n";

export function LanguageToggle() {
  const lang = useI18nStore((s) => s.lang);
  const setLang = useI18nStore((s) => s.setLang);

  return (
    <div className="flex items-center gap-3 text-xs tracking-wider font-semibold">
      <button
        onClick={() => setLang("en")}
        className={`transition-colors pb-0.5 ${
          lang === "en"
            ? "text-primary border-b-2 border-primary"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        ENGLISH
      </button>
      <span className="text-border/60">|</span>
      <button
        onClick={() => setLang("hi")}
        className={`transition-colors pb-0.5 ${
          lang === "hi"
            ? "text-primary border-b-2 border-primary"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        हिन्दी
      </button>
    </div>
  );
}
