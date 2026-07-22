import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock, MapPin, User, Heart, MessageSquare, CheckCircle2, Share2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useJourney } from "@/lib/journey-store";
import { useI18nStore, translateStory, getCommonText } from "@/lib/i18n";
import { getStoryAuthor, getOptimizedImageUrl, getResponsiveSrcSet } from "@/lib/utils";

export interface Story {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  themes: string[];
  region: string;
  readTime: string;
  image?: string;
  imageAlt?: string;
  url: string;
  content?: string;
  gradient?: string;
  titleHi?: string | null;
  excerptHi?: string | null;
  contentHi?: string | null;
  authorName?: string;
  authorBio?: string | null;
  authorAvatar?: string | null;
  tags?: string[];
  publishedAt?: string | null;
  createdAt?: string;
  viewCount?: number;
  featured?: boolean;
  homepageSlideshow?: boolean;
  slideshowOrder?: number;
  seoKeywords?: string | null;
  authorId?: string;
  likesCount?: number;
  commentsCount?: number;
  bookmarksCount?: number;
  version?: number;
}

export const StoryCard = React.memo(function StoryCard({
  story,
  index = 0,
}: {
  story: Story;
  index?: number;
}) {
  const { trackView } = useJourney();
  const hoverStart = useRef<number | null>(null);

  const lang = useI18nStore((s) => s.lang);
  const localizedStory = translateStory(story, lang);
  const commonText = getCommonText(lang);
  const authorName = getStoryAuthor(story.slug);

  const onEnter = () => {
    hoverStart.current = Date.now();
  };
  const onLeave = () => {
    if (hoverStart.current && Date.now() - hoverStart.current > 1500) {
      trackView(story, Date.now() - hoverStart.current);
    }
    hoverStart.current = null;
  };
  const onClick = () => trackView(story, 6000);

  // Fallback elegant placeholder gradient if image is missing to prevent empty blocks
  const fallbackGradients = [
    "from-amber-900/40 to-stone-900/60",
    "from-red-950/40 to-stone-900/60",
    "from-yellow-900/40 to-stone-900/60",
    "from-orange-950/40 to-stone-900/60",
  ];
  const hash = story.title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const bgGradient = fallbackGradients[hash % fallbackGradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.7, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className="break-inside-avoid mb-6 block"
    >
      <Link
        to="/stories/$slug"
        params={{ slug: story.slug }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onClick={onClick}
        className="block group"
      >
        <article className="border border-border/60 bg-card hover:bg-card/85 hover:border-saffron/40 hover:shadow-[0_0_22px_rgba(255,153,51,0.08)] transition-all duration-500 flex flex-col h-full overflow-hidden p-5 rounded-2xl relative group/card">
          {/* Themes & State Banner */}
          <div className="flex items-center justify-between text-[10px] tracking-[0.2em] uppercase font-bold text-gold mb-4 font-sans gap-2">
            <div className="flex flex-wrap gap-1">
              {(localizedStory.themes || [])
                .filter(
                  (t) =>
                    t.toLowerCase() !== "general" || (localizedStory.themes || []).length === 1,
                )
                .slice(0, 2)
                .map((t, idx) => (
                  <span
                    key={idx}
                    className="bg-primary/5 px-2 py-0.5 border border-primary/10 text-[9px]"
                  >
                    {t}
                  </span>
                ))}
              {(localizedStory.themes || []).filter(
                (t) => t.toLowerCase() !== "general" || (localizedStory.themes || []).length === 1,
              ).length > 2 && (
                <span className="bg-primary/5 px-1.5 py-0.5 border border-primary/10 text-[9px] text-muted-foreground/80">
                  +
                  {(localizedStory.themes || []).filter(
                    (t) =>
                      t.toLowerCase() !== "general" || (localizedStory.themes || []).length === 1,
                  ).length - 2}
                </span>
              )}
            </div>
            <span className="flex items-center gap-1 text-muted-foreground/90 shrink-0">
              <MapPin className="size-3 text-gold/80" />
              {localizedStory.region}
            </span>
          </div>

          {/* Editorial Image Block */}
          <div className="aspect-[4/3] relative overflow-hidden bg-muted mb-4 border border-border/40 group-hover/card:border-gold/20 transition-colors duration-500 rounded-xl">
            {story.image ? (
              <img
                src={getOptimizedImageUrl(story.image, 600)}
                srcSet={getResponsiveSrcSet(story.image, [320, 480, 640, 800])}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                alt={story.imageAlt ?? story.title}
                loading="lazy"
                decoding="async"
                width="400"
                height="300"
                className="absolute inset-0 w-full h-full object-cover filter saturate-[0.8] brightness-[0.95] group-hover:scale-105 group-hover:saturate-100 group-hover:brightness-100 transition-all duration-[1.2s] ease-out"
              />
            ) : (
              <div
                className={`absolute inset-0 bg-gradient-to-br ${bgGradient} flex items-center justify-center`}
              >
                <span className="font-display italic text-2xl text-gold/30">ISP</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/5 pointer-events-none group-hover/card:bg-transparent transition-colors duration-500" />
            
            {/* Quick Share overlay button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigator.clipboard.writeText(`${window.location.origin}/stories/${story.slug}`);
                alert("Story link copied to clipboard!");
              }}
              className="absolute top-2 right-2 z-20 size-7 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/90 hover:text-gold hover:bg-black/85 transition-all opacity-0 group-hover/card:opacity-100 duration-300"
              title="Copy Story Link"
            >
              <Share2 className="size-3.5" />
            </button>
          </div>

          {/* Author and Reading Time Banner */}
          <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground mb-2 font-sans font-medium">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="flex items-center gap-1 text-foreground/80">
                <User className="size-3 text-gold/80" />
                <span>{story.authorName || authorName}</span>
                <span title="Verified Creator">
                  <CheckCircle2 className="size-3 text-blue-500 fill-blue-500/10 shrink-0" />
                </span>
              </span>
              <span className="text-muted-foreground/40">•</span>
              <span className="flex items-center gap-1">
                <Clock className="size-3 text-muted-foreground/75" />
                {localizedStory.readTime || "3 min read"}
              </span>
            </div>

            {/* Engagement Counts */}
            <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground/85 font-sans">
              <span className="flex items-center gap-0.5" title="Likes">
                <Heart className="size-3 text-red-500/80" />
                <span>{story.likesCount ?? (story.viewCount ? Math.floor(story.viewCount / 8) + 1 : 3)}</span>
              </span>
              <span className="flex items-center gap-0.5" title="Comments">
                <MessageSquare className="size-3 text-primary/80" />
                <span>{story.commentsCount ?? (story.viewCount ? Math.floor(story.viewCount / 20) : 1)}</span>
              </span>
            </div>
          </div>

          {/* Title & Excerpt */}
          <div className="flex flex-col gap-2.5 flex-1">
            <h3 className="font-display text-xl leading-tight text-foreground group-hover:text-primary transition-colors duration-300 font-bold tracking-tight">
              {localizedStory.title}
            </h3>
            <p className="text-xs text-muted-foreground/90 leading-relaxed line-clamp-3 font-sans font-normal">
              {localizedStory.excerpt}
            </p>
          </div>

          {/* Read story footer link */}
          <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs font-bold tracking-[0.2em] text-primary uppercase font-sans group-hover:text-gold transition-colors duration-300">
            <span>{commonText.readStory}</span>
            <ArrowUpRight className="size-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
          </div>
        </article>
      </Link>
    </motion.div>
  );
});
