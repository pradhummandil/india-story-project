import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, Clock, Eye, Calendar, Bookmark, ArrowUpRight } from "lucide-react";
import { useI18nStore } from "@/lib/i18n";
import { getOptimizedImageUrl } from "@/lib/utils";
import { UniversalImage } from "@/components/common/UniversalImage";

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
            <mark key={i} className="bg-[#D32F2F]/20 text-[#D32F2F] font-bold px-1 rounded">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
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
  if (!n) return "0";
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
  const rawAuthorName = story.author?.name;
  const isRealAuthor = !!(
    rawAuthorName &&
    rawAuthorName.trim() !== "" &&
    rawAuthorName.toLowerCase() !== "india story project" &&
    rawAuthorName.toLowerCase() !== "not identifiable" &&
    rawAuthorName.toLowerCase() !== "unknown"
  );
  const displayAuthorName = isRealAuthor ? rawAuthorName : "India Story Project";
  const imageUrl     = story.image ? getOptimizedImageUrl(story.image, 600) : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col sm:flex-row items-stretch gap-0 overflow-hidden border border-[#EAE4D8] bg-[#FFFFFF] hover:border-[#D32F2F]/40 hover:bg-[#FFFDF9] transition-all duration-300 shadow-sm hover:shadow-md rounded-2xl"
    >
      {/* Thumbnail Container (Full Height, Soft Background, Zero Black Strip) */}
      <Link
        to="/stories/$slug"
        params={{ slug: story.slug }}
        className="block w-full sm:w-64 md:w-72 lg:w-80 shrink-0 min-h-[200px] sm:min-h-[220px] self-stretch relative overflow-hidden bg-[#F4EFE6] border-b sm:border-b-0 sm:border-r border-[#EAE4D8]"
        aria-label={`Read ${title}`}
        tabIndex={-1}
      >
        {imageUrl ? (
          <div className="absolute inset-0 w-full h-full">
            <UniversalImage
              src={imageUrl}
              alt={story.imageCaption ?? title}
              width={600}
              aspectRatio="aspect-auto"
              objectFit="cover"
              className="w-full h-full min-h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#8C827A] font-serif text-sm">
            India Story Project
          </div>
        )}
      </Link>

      {/* Main details with generous padding (p-5 md:p-6) so text NEVER touches the thumbnail image */}
      <div className="flex-1 flex flex-col justify-between space-y-3 min-w-0 p-5 md:p-6">
        <div>
          {/* Metadata tags: State + City + Theme */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-sans font-bold text-[#D32F2F] uppercase tracking-wider mb-2">
            {primaryTheme && (
              <span className="bg-[#D32F2F]/10 border border-[#D32F2F]/20 text-[#D32F2F] px-2.5 py-0.5 rounded-full text-[9px] font-bold">
                {primaryTheme}
              </span>
            )}
            {stateName && (
              <span className="flex items-center gap-1 text-[#6B625B] font-medium text-[11px]">
                <MapPin className="size-3 text-[#D4AF37]" />
                {stateName}
                {cityName ? `, ${cityName}` : ""}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-serif text-base sm:text-lg md:text-xl font-bold text-[#1A1816] group-hover:text-[#D32F2F] transition-colors line-clamp-2 leading-snug">
            <Link to="/stories/$slug" params={{ slug: story.slug }}>
              {highlightText(title, query)}
            </Link>
          </h3>

          {/* Excerpt */}
          <p className="text-xs sm:text-sm text-[#6B625B] font-sans line-clamp-2 leading-relaxed mt-2">
            {excerpt}
          </p>

          {/* Tags */}
          {story.tags && story.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {story.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag.slug || tag.name}
                  className="inline-flex items-center gap-0.5 text-[9px] font-mono text-[#5A524C] bg-[#F4EFE6] px-2 py-0.5 rounded-full border border-[#E5DFD3]"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom row: author + stats + CTA */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#EAE4D8]">
          <div className="flex items-center gap-3 text-[10px] text-[#6B625B] font-sans font-medium">
            <span className="truncate max-w-[140px]">
              {isRealAuthor && story.author?.id ? (
                <Link
                  to="/authors/$id"
                  params={{ id: story.author.id }}
                  className="hover:text-[#D32F2F] hover:underline transition-colors font-bold text-[#1A1816]"
                >
                  {lang === "en" ? `By ${displayAuthorName}` : `लेखक: ${displayAuthorName}`}
                </Link>
              ) : (
                lang === "en" ? `By ${displayAuthorName}` : `लेखक: ${displayAuthorName}`
              )}
            </span>
            {story.readingTime && (
              <span className="flex items-center gap-1 shrink-0">
                <Clock className="size-3 text-[#D4AF37]" />
                {story.readingTime} min
              </span>
            )}
            {story.publishedAt && (
              <span className="hidden md:flex items-center gap-1 shrink-0">
                <Calendar className="size-3 text-[#D4AF37]" />
                {formatDate(story.publishedAt)}
              </span>
            )}
            {(story.viewCount ?? 0) > 0 && (
              <span className="hidden lg:flex items-center gap-1 shrink-0">
                <Eye className="size-3 text-[#D32F2F]" />
                {formatViews(story.viewCount)}
              </span>
            )}
          </div>

          <Link
            to="/stories/$slug"
            params={{ slug: story.slug }}
            className="shrink-0 inline-flex items-center gap-1 text-[11px] font-serif font-bold uppercase tracking-widest text-[#D32F2F] hover:text-[#B71C1C] transition-colors"
            aria-label={`Read ${title}`}
          >
            {lang === "en" ? "Read" : "पढ़ें"}
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
