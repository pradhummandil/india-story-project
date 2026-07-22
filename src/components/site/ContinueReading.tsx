/**
 * ContinueReading — Client-side component that reads localStorage for
 * in-progress stories the user has started but not yet finished.
 * Falls back to a graceful empty state (no section shown) when no history exists.
 */
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ArrowRight, X, Clock } from "lucide-react";
import { useI18nStore } from "@/lib/i18n";
import { getOptimizedImageUrl } from "@/lib/utils";

interface ReadingEntry {
  slug: string;
  title: string;
  image?: string;
  author?: string;
  region?: string;
  theme?: string;
  progressPercent: number;
  lastReadAt: string;
  readTime?: string;
}

const READING_PROGRESS_KEY = "isp_reading_progress";

function getReadingHistory(): ReadingEntry[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(READING_PROGRESS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, ReadingEntry>;
    return Object.values(parsed)
      .filter((e) => e.progressPercent > 5 && e.progressPercent < 95)
      .sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime())
      .slice(0, 4);
  } catch {
    return [];
  }
}

function removeFromHistory(slug: string) {
  try {
    const raw = localStorage.getItem(READING_PROGRESS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, ReadingEntry>;
    delete parsed[slug];
    localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(parsed));
  } catch {
    // ignore
  }
}

export function ContinueReading() {
  const [entries, setEntries] = useState<ReadingEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const lang = useI18nStore((s) => s.lang);

  useEffect(() => {
    setEntries(getReadingHistory());
    setMounted(true);
  }, []);

  const handleDismiss = (slug: string) => {
    removeFromHistory(slug);
    setEntries((prev) => prev.filter((e) => e.slug !== slug));
  };

  // Don't render until mounted (avoids SSR hydration mismatch)
  // Don't render if no in-progress stories
  if (!mounted || entries.length === 0) return null;

  return (
    <section className="container mx-auto px-6 py-14 md:py-20 border-b border-border/70">
      {/* Section header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-full bg-gold/10 text-gold border border-gold/20">
            <BookOpen className="size-4" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] font-sans font-bold text-gold">
              {lang === "en" ? "Pick Up Where You Left Off" : "जहाँ छोड़ा था वहाँ से शुरू करें"}
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-bold">
              {lang === "en" ? "Continue Reading" : "पढ़ना जारी रखें"}
            </h2>
          </div>
        </div>
      </div>

      {/* Cards row */}
      <AnimatePresence initial={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.slug}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="relative group border border-border/50 bg-card hover:border-gold/30 hover:shadow-elegant transition-all duration-300 overflow-hidden"
            >
              {/* Dismiss button */}
              <button
                onClick={() => handleDismiss(entry.slug)}
                className="absolute top-2 right-2 z-20 size-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove from continue reading"
              >
                <X className="size-3" />
              </button>

              {/* Story image */}
              <div className="relative h-32 overflow-hidden bg-muted">
                {entry.image ? (
                  <img
                    src={getOptimizedImageUrl(entry.image, 300)}
                    alt={entry.title}
                    className="w-full h-full object-cover filter saturate-[0.85] group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-950/40 to-stone-900 flex items-center justify-center">
                    <span className="font-display italic text-2xl text-gold/30">ISP</span>
                  </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {/* Theme badge */}
                {entry.theme && (
                  <span className="absolute bottom-2 left-2 text-[9px] uppercase tracking-[0.2em] font-bold text-gold bg-black/50 backdrop-blur-sm px-2 py-0.5 border border-gold/20">
                    {entry.theme}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <h3 className="font-display text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  <Link to="/stories/$slug" params={{ slug: entry.slug }}>
                    {entry.title}
                  </Link>
                </h3>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-sans text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="size-2.5" />
                      {entry.readTime || "3 min read"}
                    </span>
                    <span>{Math.round(entry.progressPercent)}% read</span>
                  </div>
                  <div className="h-[2px] bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${entry.progressPercent}%` }}
                    />
                  </div>
                </div>

                <Link
                  to="/stories/$slug"
                  params={{ slug: entry.slug }}
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-bold text-primary hover:text-gold transition-colors font-sans"
                >
                  {lang === "en" ? "Continue" : "जारी रखें"}
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </section>
  );
}
