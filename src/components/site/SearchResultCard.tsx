import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, Clock, Eye, Calendar, Bookmark, ArrowUpRight } from "lucide-react";
import { useI18nStore } from "@/lib/i18n";
import { getOptimizedImageUrl } from "@/lib/utils";

export type SearchStory = {
  id: string;
  slug: string;
  title: string;
  titleHi?: string | null;
  excerpt: string;
  excerptHi?: string | null;
  publishedAt?: string | Date | null;
  readingTime?: number | null;
  viewCount?: number;
  featured?: boolean;
  image?: string | null;
  imageCaption?: string | null;
  author?: { id?: string; name?: string; avatar?: string | null } | null;
  state?: { id?: string; name?: string; slug?: string } | null;
  city?: { id?: string; name?: string } | null;
  tags?: { name: string; slug?: string }[];
  themes?: { name: string; slug?: string }[];
};

type Props = {
  story: SearchStory;
  query?: string;
  index?: number;
};

function highlightText(text: string, query?: string): React.ReactNode {
  if (!query || !query.trim()) return <>{text}</>;
  try {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-gold/20 text-gold font-bold rounded-sm px-0.5 not-italic">
              {part}
            </mark>
          ) : (
            part
          ),
        )}
      </>
    );
  } catch {
    return <>{text}</>;
  }
}

function formatDate(d?: string | Date | null): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatViews(n?: number): string {
  if (!n) return "";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function SearchResultCard({ story, query, index = 0 }: Props) {
  const lang = useI18nStore((s) => s.lang);
  const title   = (lang === "hi" && story.titleHi)   ? story.titleHi   : story.title;
  const excerpt = (lang === "hi" && story.excerptHi) ? story.excerptHi : story.excerpt;
  const primaryTheme = story.themes?.[0]?.name ?? "";
  const stateName    = story.state?.name ?? "";
  const cityName     = story.city?.name ?? "";
  const authorName   = story.author?.name ?? "";
  const imageUrl     = story.image ? getOptimizedImageUrl(story.image, 600) : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col sm:flex-row gap-0 overflow-hidden border border-border/50 bg-card hover:border-gold/30 hover:bg-card/80 transition-all duration-300 shadow-sm"
    >
      {/* Thumbnail */}
      <Link
        to="/stories/$slug"
        params={{ slug: story.slug }}
        className="block w-full sm:w-48 md:w-56 shrink-0 aspect-[4/3] sm:aspect-auto sm:h-44 md:h-48 overflow-hidden bg-[#1a1a1a] border-b sm:border-b-0 sm:border-r border-border/40 relative"
        aria-label={`Read ${title}`}
        tabIndex={-1}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={story.imageCaption ?? title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain filter saturate-[0.85] group-hover:scale-[1.02] transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-950/40 to-stone-900 flex items-center justify-center">
            <img src="/Logo-ISP.jpg" alt="ISP" className="w-20 h-20 object-contain opacity-60" />
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col justify-between p-4 md:p-5 flex-1 min-w-0">
        {/* Top meta row */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {primaryTheme && (
            <span className="inline-flex items-center gap-1 text-[9px] tracking-[0.15em] uppercase font-bold text-gold bg-gold/8 border border-gold/20 px-2 py-0.5 rounded-sm font-sans">
              {primaryTheme}
            </span>
          )}
          {stateName && (
            <span className="inline-flex items-center gap-1 text-[9px] tracking-[0.15em] uppercase font-semibold text-muted-foreground font-sans">
              <MapPin className="size-2.5" />
              {cityName ? `${cityName}, ${stateName}` : stateName}
            </span>
          )}
          {story.featured && (
            <span className="inline-flex text-[9px] font-bold text-primary/90 border border-primary/20 bg-primary/5 px-2 py-0.5 rounded-sm tracking-widest font-sans uppercase">
              Featured
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display text-base md:text-lg lg:text-xl font-bold leading-tight mb-2 group-hover:text-primary transition-colors">
          <Link to="/stories/$slug" params={{ slug: story.slug }} className="focus:outline-none focus:ring-2 focus:ring-primary/50 rounded">
            {highlightText(title, query)}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="text-xs md:text-sm text-muted-foreground font-sans line-clamp-2 leading-relaxed mb-3">
          {highlightText(excerpt, query)}
        </p>

        {/* Tags */}
        {story.tags && story.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {story.tags.slice(0, 4).map((tag) => (
              <span
                key={tag.name}
                className="text-[9px] font-sans font-semibold px-2 py-0.5 bg-muted text-muted-foreground border border-border/50 rounded-full"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Bottom row: author + stats + CTA */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-sans font-medium">
            {authorName && (
              <span className="truncate max-w-[100px]">
                {lang === "en" ? `By ${authorName}` : `लेखक: ${authorName}`}
              </span>
            )}
            {story.readingTime && (
              <span className="flex items-center gap-1 shrink-0">
                <Clock className="size-3" />
                {story.readingTime} min
              </span>
            )}
            {story.publishedAt && (
              <span className="hidden md:flex items-center gap-1 shrink-0">
                <Calendar className="size-3" />
                {formatDate(story.publishedAt)}
              </span>
            )}
            {(story.viewCount ?? 0) > 0 && (
              <span className="hidden lg:flex items-center gap-1 shrink-0">
                <Eye className="size-3" />
                {formatViews(story.viewCount)}
              </span>
            )}
          </div>

          <Link
            to="/stories/$slug"
            params={{ slug: story.slug }}
            className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-gold transition-colors font-sans"
            aria-label={`Read ${title}`}
          >
            {lang === "en" ? "Read" : "पढ़ें"}
            <ArrowUpRight className="size-3" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
