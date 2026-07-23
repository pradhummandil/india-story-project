import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock, MapPin, User, Heart, MessageSquare, CheckCircle2, Share2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useJourney } from "@/lib/journey-store";
import { useI18nStore, translateStory, getCommonText } from "@/lib/i18n";
import { getStoryAuthor, getOptimizedImageUrl, getResponsiveSrcSet } from "@/lib/utils";
import { UniversalImage } from "@/components/common/UniversalImage";

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

const DEFAULT_STORY_IMAGES = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80",
];

export const StoryCard = React.memo(function StoryCard({
  story,
  index = 0,
}: {
  story: Story;
  index?: number;
}) {
  if (!story) return null;

  const { trackView } = useJourney();
  const hoverStart = useRef<number | null>(null);

  const lang = useI18nStore((s) => s.lang);
  const localizedStory = translateStory(story, lang);
  const commonText = getCommonText(lang);
  const authorName = getStoryAuthor(story.slug || "");

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

  const titleStr = story.title || story.titleHi || story.slug || "Story";
  const hash = Math.abs(titleStr.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0));
  const cardImage = story.image && story.image.trim() !== "" 
    ? story.image 
    : DEFAULT_STORY_IMAGES[hash % DEFAULT_STORY_IMAGES.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.25), ease: [0.22, 1, 0.36, 1] }}
      className="h-full flex flex-col w-full"
    >
      <Link
        to="/stories/$slug"
        params={{ slug: story.slug }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onClick={onClick}
        className="h-full flex flex-col w-full group"
      >
        <article className="border border-border/60 bg-card hover:bg-card/85 hover:border-gold/50 hover:shadow-lg transition-all duration-300 flex flex-col h-full justify-between overflow-hidden p-3.5 sm:p-4 rounded-xl relative group/card flex-1">
          {/* Category Themes & State Region */}
          <div className="flex items-center justify-between text-[10px] font-bold text-gold mb-2.5 font-sans gap-2 min-h-[22px]">
            <div className="flex flex-wrap gap-1 items-center">
              {(localizedStory.themes || [])
                .filter(
                  (t) =>
                    t.toLowerCase() !== "general" || (localizedStory.themes || []).length === 1,
                )
                .slice(0, 2)
                .map((t, idx) => (
                  <span
                    key={idx}
                    className="bg-primary/10 px-2 py-0.5 border border-primary/20 text-[9px] rounded uppercase font-bold text-primary"
                  >
                    {t}
                  </span>
                ))}
            </div>
            {localizedStory.region && (
              <span className="flex items-center gap-1 text-muted-foreground shrink-0 font-medium text-[10px]">
                <MapPin className="size-3 text-gold/80" />
                {localizedStory.region}
              </span>
            )}
          </div>

          {/* Compact 16:10 Thumbnail Image */}
          <div className="aspect-[16/10] relative overflow-hidden bg-muted mb-2.5 border border-border/40 group-hover/card:border-gold/30 transition-colors duration-300 rounded-lg shrink-0">
            <UniversalImage
              src={cardImage}
              alt={story.imageAlt ?? story.title}
              width={500}
              aspectRatio="aspect-[16/10]"
              className="filter saturate-[0.9] group-hover:scale-105 group-hover:saturate-100 transition-all duration-500 ease-out"
            />
            <div className="absolute inset-0 bg-black/5 pointer-events-none group-hover/card:bg-transparent transition-colors duration-300" />
            
            {/* Quick Share button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigator.clipboard.writeText(`${window.location.origin}/stories/${story.slug}`);
                toast.success("Story link copied!");
              }}
              className="absolute top-2 right-2 z-20 size-6 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/90 hover:text-gold hover:bg-black/90 transition-all opacity-0 group-hover/card:opacity-100 duration-300"
              title="Copy Story Link"
            >
              <Share2 className="size-3" />
            </button>
          </div>

          {/* Author and Read Time Meta Banner */}
          <div className="flex items-center justify-between gap-1.5 text-[10px] text-muted-foreground mb-2 font-sans font-medium min-h-[18px]">
            <div className="flex items-center gap-1.5 truncate">
              <span className="flex items-center gap-1 text-foreground/80 truncate">
                <User className="size-3 text-gold/80" />
                <span className="truncate">{story.authorName || authorName}</span>
                <CheckCircle2 className="size-3 text-blue-500 fill-blue-500/10 shrink-0" />
              </span>
              <span className="text-muted-foreground/30">•</span>
              <span className="flex items-center gap-1 shrink-0">
                <Clock className="size-3 text-muted-foreground/75" />
                {localizedStory.readTime || "3 min read"}
              </span>
            </div>

            {/* Engagement Counts */}
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground/80 font-sans shrink-0">
              <span className="flex items-center gap-0.5" title="Likes">
                <Heart className="size-2.5 text-red-500/80" />
                <span>{story.likesCount ?? 0}</span>
              </span>
            </div>
          </div>

          {/* Compact Title & Excerpt */}
          <div className="flex flex-col gap-1.5 flex-1 justify-start">
            <h3 className="font-display text-base font-bold leading-snug text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 min-h-[2.5rem]">
              {localizedStory.title}
            </h3>
            <p className="text-xs text-muted-foreground/85 leading-normal line-clamp-2 min-h-[2.2rem] font-sans font-normal">
              {localizedStory.excerpt}
            </p>
          </div>

          {/* Footer Read Link */}
          <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] font-bold text-primary font-sans group-hover:text-gold transition-colors duration-200 uppercase tracking-wider">
            <span>{commonText.readStory}</span>
            <ArrowUpRight className="size-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </div>
        </article>
      </Link>
    </motion.div>
  );
});
