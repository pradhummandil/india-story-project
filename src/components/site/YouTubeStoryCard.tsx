import React from "react";
import { motion } from "framer-motion";
import { Eye, MapPin, Youtube, Sparkles, ExternalLink } from "lucide-react";
import { useI18nStore } from "@/lib/i18n";
import { extractYouTubeId, type YouTubeStoryVideo } from "@/lib/youtube-videos";

export interface YouTubeVideoItem {
  id: string;
  youtubeId: string;
  title: string;
  titleHi?: string | null;
  excerpt?: string | null;
  excerptHi?: string | null;
  duration?: number | string;
  viewCount?: number;
  thumbnail?: string;
  authorName?: string;
  region?: string;
  isShort?: boolean;
  slug?: string;
  category?: string;
}

interface YouTubeStoryCardProps {
  video: YouTubeVideoItem;
  index?: number;
  onPlay?: (video: YouTubeVideoItem) => void;
}

export { extractYouTubeId };

export function YouTubeStoryCard({ video, index = 0, onPlay }: YouTubeStoryCardProps) {
  const lang = useI18nStore((s) => s.lang);
  const ytid = extractYouTubeId(video.youtubeId || video.id);

  const displayTitle = lang === "hi" && video.titleHi ? video.titleHi : video.title;
  const displayExcerpt = lang === "hi" && video.excerptHi ? video.excerptHi : video.excerpt;

  const youtubeDirectUrl = video.isShort
    ? `https://www.youtube.com/shorts/${ytid}`
    : `https://www.youtube.com/watch?v=${ytid}`;

  const embedSrc = `https://www.youtube.com/embed/${ytid}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
      className="h-full flex flex-col w-full"
    >
      <article
        className="border border-border/60 bg-card hover:border-gold/50 hover:shadow-lg transition-all duration-300 flex flex-col h-full justify-between overflow-hidden p-4 rounded-2xl relative flex-1"
      >
        {/* Top Header Tag */}
        <div className="flex items-center justify-between text-[10px] font-bold text-gold mb-3 font-sans gap-2 min-h-[22px]">
          <span className="flex items-center gap-1.5 bg-red-600/10 border border-red-500/20 text-red-500 px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold">
            <Youtube className="size-3 text-red-500 fill-red-500" />
            {video.isShort ? (lang === "hi" ? "यूट्यूब शॉट" : "YouTube Short") : (lang === "hi" ? "सिनेमा वीडियो" : "Cinema Dispatch")}
          </span>
          {video.region && (
            <span className="flex items-center gap-1 text-muted-foreground shrink-0 font-medium">
              <MapPin className="size-3 text-gold/80" />
              {video.region}
            </span>
          )}
        </div>

        {/* 16:9 Widescreen Direct Embedded Native YouTube Video Player */}
        <div className="relative overflow-hidden bg-black mb-3 border border-border/40 rounded-xl shrink-0 shadow-md aspect-video w-full">
          <iframe
            width="100%"
            height="100%"
            src={embedSrc}
            title={displayTitle}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="w-full h-full border-0 rounded-xl"
          />
        </div>

        {/* Info & Title */}
        <div className="flex flex-col gap-2 flex-1 justify-start">
          <h3 className="font-display text-base sm:text-lg font-bold leading-tight text-foreground transition-colors line-clamp-2 min-h-[2.75rem]">
            {displayTitle}
          </h3>
          {displayExcerpt && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 font-sans font-normal min-h-[2.4rem]">
              {displayExcerpt}
            </p>
          )}
        </div>

        {/* Footer Meta & Direct YouTube Link */}
        <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] font-sans text-muted-foreground font-medium">
          <span className="flex items-center gap-1 text-foreground/80 truncate">
            <Sparkles className="size-3 text-gold" />
            {video.authorName || "India Story Project"}
          </span>

          <div className="flex items-center gap-2 shrink-0">
            {video.viewCount !== undefined && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Eye className="size-3" />
                {video.viewCount}
              </span>
            )}
            <a
              href={youtubeDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-red-500 hover:text-red-600 hover:underline font-bold"
              title="Open directly on YouTube"
            >
              <span>YouTube</span>
              <ExternalLink className="size-2.5" />
            </a>
          </div>
        </div>
      </article>
    </motion.div>
  );
}
