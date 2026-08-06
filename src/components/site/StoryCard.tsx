import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock, MapPin, User, Heart, MessageSquare, CheckCircle2, Share2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useJourney } from "@/lib/journey-store";
import { useI18nStore, translateStory, getCommonText } from "@/lib/i18n";
import { getStoryAuthor, getOptimizedImageUrl, getResponsiveSrcSet } from "@/lib/utils";
import { UniversalImage } from "@/components/common/UniversalImage";
import { TiltCard } from "@/components/site/TiltCard";

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

// Detect touch/coarse-pointer devices to skip tilt effect
function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(hover: none), (pointer: coarse)");
    setIsTouch(mq.matches);
  }, []);
  return isTouch;
}

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
  const isTouch = useIsTouchDevice();

  const lang = useI18nStore((s) => s.lang);
  const localizedStory = translateStory(story, lang);
  const commonText = getCommonText(lang);
  const rawAuthorName = story.authorName;
  const isRealAuthor = !!(
    rawAuthorName &&
    rawAuthorName.trim() !== "" &&
    rawAuthorName.toLowerCase() !== "india story project" &&
    rawAuthorName.toLowerCase() !== "not identifiable" &&
    rawAuthorName.toLowerCase() !== "unknown"
  );
  const authorName = isRealAuthor ? rawAuthorName : "India Story Project";

  const onEnter = () => { hoverStart.current = Date.now(); };
  const onLeave = () => {
    if (hoverStart.current && Date.now() - hoverStart.current > 1500) {
      trackView(story, Date.now() - hoverStart.current);
    }
    hoverStart.current = null;
  };
  const onClick = () => trackView(story, 6000);

  // If story.image is set (e.g. uploaded from admin portal), use it; otherwise fallback to ISP logo on black background
  const cardImage = story.image && story.image.trim() !== "" ? story.image : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.25), ease: [0.22, 1, 0.36, 1] }}
      className="h-full flex flex-col w-full"
    >
      {/* TiltCard wrapper */}
      <TiltCard intensity={6} disabled={isTouch} className="h-full flex flex-col group">
        <Link
          to="/stories/$slug"
          params={{ slug: story.slug }}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onClick={onClick}
          className="h-full flex flex-col w-full"
        >
          <article className="border border-[#EAE4D8] bg-[#FFFFFF] hover:bg-[#FFFDF9] hover:border-[#D32F2F]/40 hover:shadow-md transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col h-full justify-between overflow-hidden p-3.5 sm:p-4 rounded-2xl relative group/card flex-1">
            {/* Top Hover Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] w-0 group-hover/card:w-full bg-[#D32F2F] transition-all duration-500 ease-out" />

            {/* Category Themes & State Region */}
            <div className="flex items-center justify-between text-[10px] font-bold text-[#D32F2F] mb-2.5 font-sans gap-2 min-h-[22px]">
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
                      className="bg-[#D32F2F]/10 px-2.5 py-0.5 border border-[#D32F2F]/20 text-[9px] rounded-full uppercase font-bold text-[#D32F2F] tracking-wider"
                    >
                      {t}
                    </span>
                  ))}
              </div>
              {localizedStory.region && (
                <span className="flex items-center gap-1 text-[#6B625B] shrink-0 font-medium text-[10px] bg-[#F4EFE6] px-2.5 py-0.5 rounded-full border border-[#E5DFD3]">
                  <MapPin className="size-3 text-[#D4AF37]" />
                  {localizedStory.region}
                </span>
              )}
            </div>

            {/* Thumbnail: Black background with ISP logo when image is missing or loading */}
            <div className="aspect-[16/10] relative overflow-hidden bg-black mb-3 border border-[#EAE4D8] group-hover/card:border-[#D32F2F]/40 transition-colors duration-300 rounded-xl shrink-0">
              <UniversalImage
                src={cardImage}
                alt={story.imageAlt ?? story.title}
                width={500}
                aspectRatio="aspect-[16/10]"
                loading={index < 4 ? "eager" : "lazy"}
                fetchPriority={index < 4 ? "high" : "auto"}
                className="group-hover/card:scale-[1.04] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              />

              {/* Quick Share */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigator.clipboard.writeText(`${window.location.origin}/stories/${story.slug}`);
                  toast.success("Story link copied!");
                }}
                className="absolute top-2 right-2 z-20 size-7 rounded-full bg-black/75 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:text-[#D32F2F] transition-all opacity-0 group-hover/card:opacity-100 duration-300"
                title="Copy Story Link"
              >
                <Share2 className="size-3.5" />
              </button>
            </div>

            {/* Author and Read Time */}
            <div className="flex items-center justify-between gap-1.5 text-[10px] text-[#6B625B] mb-2 font-sans font-medium min-h-[18px]">
              <div className="flex items-center gap-1.5 truncate">
                <span className="flex items-center gap-1 text-[#1A1816] truncate">
                  <User className="size-3 text-[#D4AF37]" />
                  {isRealAuthor && story.authorId ? (
                    <Link
                      to="/authors/$id"
                      params={{ id: story.authorId }}
                      onClick={(e) => e.stopPropagation()}
                      className="truncate hover:text-[#D32F2F] hover:underline transition-colors font-bold cursor-pointer"
                    >
                      By {authorName}
                    </Link>
                  ) : (
                    <span className="truncate">By {authorName}</span>
                  )}
                  <CheckCircle2 className="size-3 text-blue-500 fill-blue-500/10 shrink-0" />
                </span>
                <span className="text-[#8C827A]">•</span>
                <span className="flex items-center gap-1 shrink-0">
                  <Clock className="size-3 text-[#8C827A]" />
                  {localizedStory.readTime || "3 min read"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-[#6B625B] font-sans shrink-0">
                <span className="flex items-center gap-0.5" title="Likes">
                  <Heart className="size-2.5 text-[#D32F2F]" />
                  <span>{story.likesCount ?? 0}</span>
                </span>
              </div>
            </div>

            {/* Title & Excerpt */}
            <div className="flex flex-col gap-1.5 flex-1 justify-start">
              <h3 className="font-serif text-base font-bold leading-snug text-[#1A1816] group-hover/card:text-[#D32F2F] transition-colors duration-200 line-clamp-2 min-h-[2.5rem]">
                {localizedStory.title}
              </h3>
              <p className="text-xs text-[#6B625B] leading-normal line-clamp-2 min-h-[2.2rem] font-sans font-normal">
                {localizedStory.excerpt}
              </p>
            </div>

            {/* Footer */}
            <div className="mt-3 pt-2.5 border-t border-[#EAE4D8] flex items-center justify-between text-[11px] font-serif font-bold text-[#D32F2F] group-hover/card:text-[#B71C1C] transition-colors duration-200 uppercase tracking-wider">
              <span>{commonText.readStory}</span>
              <ArrowUpRight className="size-3.5 transform group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5 transition-transform duration-200" />
            </div>
          </article>
        </Link>
      </TiltCard>
    </motion.div>
  );
});
