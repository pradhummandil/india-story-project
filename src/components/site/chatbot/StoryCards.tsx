import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, ArrowRight, Bookmark, Share2, Sparkles, Clock, Landmark, Feather } from "lucide-react";
import { toast } from "sonner";

export type StoryPayload = {
  id: string;
  slug: string;
  title: string;
  titleHi?: string | null;
  excerpt: string;
  excerptHi?: string | null;
  themes: string[];
  region: string;
  stateName?: string;
  cityName?: string | null;
  readTime: string;
  image: string;
  authorName?: string;
  authorBio?: string | null;
  historicalSignificance?: string;
  culturalSignificance?: string;
  isExactMatch?: boolean;
};

interface StoryCardsProps {
  stories: StoryPayload[];
  isHindi: boolean;
  onStoryClick?: () => void;
}

export function StoryCards({ stories, isHindi, onStoryClick }: StoryCardsProps) {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  if (!stories || stories.length === 0) return null;

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info(isHindi ? "बुकमार्क हटाया गया" : "Bookmark removed");
      } else {
        next.add(id);
        toast.success(isHindi ? "कहानी बुकमार्क की गई" : "Story saved to bookmarks");
      }
      return next;
    });
  };

  const handleShare = (story: StoryPayload, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/stories/${story.slug}`;
    if (navigator.share) {
      void navigator.share({ title: story.title, url: shareUrl });
    } else {
      void navigator.clipboard.writeText(shareUrl);
      toast.success(isHindi ? "लिंक कॉपी किया गया!" : "Story link copied to clipboard!");
    }
  };

  return (
    <div className="w-full pt-3 space-y-4 font-sans">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9E1C20] dark:text-[#C9A227]">
        <Sparkles className="size-4 text-[#C9A227]" />
        <span>{isHindi ? "विशेष भारत स्टोरी कार्ड्स:" : "Featured Repository Story Cards:"}</span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory">
        {stories.map((story) => {
          const isBookmarked = bookmarkedIds.has(story.id);
          const locationDisplay = story.cityName
            ? `${story.cityName}, ${story.stateName || story.region}`
            : story.stateName || story.region || "India";

          return (
            <div
              key={story.id}
              className={`snap-start shrink-0 ${
                story.isExactMatch ? "w-[300px] sm:w-[360px] border-[#C9A227]" : "w-[280px] sm:w-[320px]"
              } bg-white dark:bg-[#181715] border border-[#ECE7DF] dark:border-[#2A2722] rounded-3xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.05)] hover:border-[#9E1C20] dark:hover:border-[#C9A227] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative`}
            >
              {/* Featured Badge for Exact Match */}
              {story.isExactMatch && (
                <div className="absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9E1C20] text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                  <Sparkles className="size-3 text-[#C9A227]" />
                  <span>{isHindi ? "मुख्य कहानी" : "Exact Story Match"}</span>
                </div>
              )}

              {/* Cover Image Header */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#FBF8F3] dark:bg-[#2A2722]">
                <img
                  src={story.image || "/Logo-ISP.jpg"}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                {!story.isExactMatch && (
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                    <MapPin className="size-3 text-[#C9A227]" />
                    <span>{locationDisplay}</span>
                  </div>
                )}

                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                  <button
                    onClick={(e) => toggleBookmark(story.id, e)}
                    className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:text-[#C9A227] transition-colors cursor-pointer"
                    title={isBookmarked ? "Remove Bookmark" : "Save Story"}
                  >
                    <Bookmark className={`size-3.5 ${isBookmarked ? "fill-[#C9A227] text-[#C9A227]" : ""}`} />
                  </button>
                  <button
                    onClick={(e) => handleShare(story, e)}
                    className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:text-[#C9A227] transition-colors cursor-pointer"
                    title="Share Story"
                  >
                    <Share2 className="size-3.5" />
                  </button>
                </div>

                <div className="absolute bottom-2 left-3 right-3 text-white text-[10px] font-medium flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-xs">
                    <Clock className="size-3 text-[#C9A227]" />
                    <span>{story.readTime}</span>
                  </div>
                  {story.authorName && (
                    <span className="bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-xs truncate max-w-[140px]">
                      By {story.authorName}
                    </span>
                  )}
                </div>
              </div>

              {/* Content Body */}
              <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#9E1C20]/10 text-[#9E1C20] dark:text-[#C9A227]">
                      {story.themes?.[0] || "Cultural Heritage"}
                    </span>
                    <span className="text-[10px] text-[#666666] dark:text-[#A09D96] font-medium flex items-center gap-1">
                      <MapPin className="size-2.5 text-[#C9A227]" />
                      <span>{locationDisplay}</span>
                    </span>
                  </div>

                  <h4 className="font-display font-bold text-sm sm:text-base text-[#1D1D1D] dark:text-[#FBF8F3] line-clamp-2 leading-snug group-hover:text-[#9E1C20] dark:group-hover:text-[#C9A227] transition-colors">
                    {isHindi && story.titleHi ? story.titleHi : story.title}
                  </h4>

                  <p className="text-xs text-[#666666] dark:text-[#A09D96] line-clamp-2 leading-relaxed">
                    {isHindi && story.excerptHi ? story.excerptHi : story.excerpt}
                  </p>

                  {/* Significance highlights (Phase 2) */}
                  {story.historicalSignificance && (
                    <div className="bg-[#FBF8F3] dark:bg-[#1C1B18] border border-[#ECE7DF] dark:border-[#2A2722] p-2.5 rounded-xl space-y-1 text-[11px]">
                      <div className="flex items-center gap-1 text-[#9E1C20] dark:text-[#C9A227] font-bold">
                        <Landmark className="size-3 text-[#C9A227]" />
                        <span>{isHindi ? "ऐतिहासिक महत्व:" : "Why it matters:"}</span>
                      </div>
                      <p className="text-xs text-[#666666] dark:text-[#A09D96] line-clamp-2">
                        {story.historicalSignificance}
                      </p>
                    </div>
                  )}
                </div>

                {/* Primary CTA: READ STORY Redirect to /stories/[slug] */}
                <div className="pt-3 border-t border-[#ECE7DF] dark:border-[#2A2722] flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#666666] dark:text-[#A09D96] uppercase tracking-wider">
                    {story.authorName || "Editorial"}
                  </span>
                  <Link
                    to="/stories/$slug"
                    params={{ slug: story.slug }}
                    onClick={onStoryClick}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#9E1C20] hover:bg-[#851619] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#9E1C20]/20 cursor-pointer hover:translate-x-0.5"
                  >
                    <span>{isHindi ? "कहानी पढ़ें" : "READ STORY"}</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
