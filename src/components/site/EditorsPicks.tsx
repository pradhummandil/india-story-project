/**
 * EditorsPicks — Curated editorial selections from the India Story Project team.
 * Renders stories marked editorsPick=true in the database with a premium editorial layout.
 */
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Award, ArrowRight, MapPin, Clock } from "lucide-react";
import { useI18nStore, translateStory } from "@/lib/i18n";
import { getOptimizedImageUrl, getResponsiveSrcSet } from "@/lib/utils";

interface EditorStory {
  id: string;
  slug: string;
  title: string;
  titleHi?: string | null;
  excerpt: string;
  excerptHi?: string | null;
  image?: string;
  author?: string;
  themes?: string[];
  region?: string;
  readTime?: string;
  readingTime?: string | number;
}

interface EditorsPicksProps {
  stories: EditorStory[];
}

export function EditorsPicks({ stories }: EditorsPicksProps) {
  const lang = useI18nStore((s) => s.lang);

  if (!stories || stories.length === 0) return null;

  const [featured, ...rest] = stories;
  const title = (lang === "hi" && (featured as any).titleHi) ? (featured as any).titleHi : featured.title;
  const excerpt = (lang === "hi" && (featured as any).excerptHi) ? (featured as any).excerptHi : featured.excerpt;
  const readTime = typeof featured.readingTime === "number"
    ? `${featured.readingTime} min read`
    : featured.readTime || "4 min read";

  return (
    <section className="container mx-auto px-6 py-16 md:py-24 border-b border-border/70">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-full bg-gold/10 text-gold border border-gold/20">
            <Award className="size-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] font-sans font-bold text-gold mb-1">
              {lang === "en" ? "Handpicked by Our Editors" : "हमारे संपादकों द्वारा चुनी गई"}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              {lang === "en" ? "Editor's Picks" : "संपादक की पसंद"}
            </h2>
          </div>
        </div>
        <Link
          to="/stories"
          className="text-xs uppercase tracking-[0.15em] font-sans font-bold text-primary hover:text-gold inline-flex items-center gap-2 group transition-colors duration-300"
        >
          {lang === "en" ? "All Stories" : "सभी कहानियाँ"}
          <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Editorial layout: large left + stacked right */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
        {/* Featured pick — large left card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-3 group relative overflow-hidden border border-border/50 bg-card hover:border-gold/30 transition-all duration-500"
        >
          {/* Image */}
          <div className="relative aspect-[16/9] overflow-hidden bg-muted">
            {featured.image ? (
              <img
                src={getOptimizedImageUrl(featured.image, 900)}
                srcSet={getResponsiveSrcSet(featured.image, [600, 900, 1200])}
                sizes="(max-width: 1024px) 100vw, 60vw"
                alt={title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover filter saturate-[0.85] group-hover:scale-105 transition-transform duration-[1200ms]"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-950/50 to-stone-900 flex items-center justify-center">
                <span className="font-display italic text-4xl text-gold/20">ISP</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            {/* Editor's pick badge */}
            <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-gold text-black text-[9px] uppercase tracking-[0.25em] font-bold px-3 py-1.5 font-sans">
              <Award className="size-3" />
              {lang === "en" ? "Editor's Pick" : "संपादक की पसंद"}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-bold font-sans">
              {(featured.themes || []).slice(0, 2).map((t) => (
                <span key={t} className="text-gold">{t}</span>
              ))}
              {featured.region && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="size-3" />
                  {featured.region}
                </span>
              )}
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-bold leading-tight group-hover:text-primary transition-colors">
              <Link to="/stories/$slug" params={{ slug: featured.slug }}>
                {title}
              </Link>
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-sans line-clamp-3">
              {excerpt}
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <span className="text-[11px] font-sans font-medium text-muted-foreground">
                {featured.author ? (lang === "en" ? `By ${featured.author}` : `लेखक: ${featured.author}`) : ""}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-sans text-muted-foreground">
                <Clock className="size-3" />
                {readTime}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Stacked secondary picks */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {rest.slice(0, 3).map((s, i) => {
            const sTitle = (lang === "hi" && (s as any).titleHi) ? (s as any).titleHi : s.title;
            const sReadTime = typeof s.readingTime === "number"
              ? `${s.readingTime} min read`
              : s.readTime || "3 min read";
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                className="group flex gap-4 border border-border/50 bg-card p-4 hover:border-gold/30 hover:bg-card/70 transition-all duration-300"
              >
                {/* Thumbnail */}
                <div className="w-24 h-20 shrink-0 overflow-hidden bg-muted">
                  {s.image ? (
                    <img
                      src={getOptimizedImageUrl(s.image, 200)}
                      alt={sTitle}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover filter saturate-[0.8] group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-950/40 to-stone-900 flex items-center justify-center">
                      <span className="font-display italic text-sm text-gold/30">ISP</span>
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-gold font-sans mb-1">
                      {(s.themes || [])[0] || ""}
                    </div>
                    <h4 className="font-display text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      <Link to="/stories/$slug" params={{ slug: s.slug }}>
                        {sTitle}
                      </Link>
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-sans mt-1">
                    <Clock className="size-2.5 shrink-0" />
                    {sReadTime}
                    {s.region && (
                      <>
                        <span>·</span>
                        <MapPin className="size-2.5 shrink-0" />
                        <span className="truncate">{s.region}</span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
