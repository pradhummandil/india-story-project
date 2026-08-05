import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Youtube, MapPin, Eye, Share2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { type YouTubeVideoItem, extractYouTubeId } from "./YouTubeStoryCard";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

interface YouTubeModalPlayerProps {
  video: YouTubeVideoItem | null;
  onClose: () => void;
}

export function YouTubeModalPlayer({ video, onClose }: YouTubeModalPlayerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (video) {
      window.addEventListener("keydown", handleKeyDown);
      lockScroll();
    } else {
      unlockScroll();
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      unlockScroll();
    };
  }, [video, onClose]);

  const ytid = video ? extractYouTubeId(video.youtubeId || video.id) : "";
  const embedUrl = ytid ? `https://www.youtube.com/embed/${ytid}?autoplay=1&rel=0` : "";

  const copyShareLink = () => {
    if (!ytid) return;
    navigator.clipboard.writeText(`${window.location.origin}/videos?v=${ytid}`);
    toast.success("Video link copied to clipboard!");
  };

  return (
    <AnimatePresence>
      {video && (
        <motion.div
          key="youtube-video-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100000] bg-black/92 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 select-none"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-5xl bg-[#121215] border border-white/12 rounded-3xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 bg-red-600/20 border border-red-500/30 text-red-400 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider">
                  <Youtube className="size-3.5 fill-red-500 text-red-500" />
                  {video.isShort ? "YouTube Short" : "Cinema Dispatch"}
                </span>
                {video.region && (
                  <span className="text-xs font-sans font-medium text-white/60 flex items-center gap-1">
                    <MapPin className="size-3 text-gold" />
                    {video.region}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyShareLink}
                  className="flex items-center gap-1.5 text-xs font-sans font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10 transition-colors cursor-pointer"
                >
                  <Share2 className="size-3.5" />
                  Share
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="size-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Iframe Video Container */}
            <div className={`relative bg-black w-full ${video.isShort ? "aspect-[9/16] max-h-[70vh] mx-auto" : "aspect-video"}`}>
              {ytid ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={embedUrl}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/60 p-6 text-center">
                  <Youtube className="size-12 text-red-500 mb-2" />
                  <p className="text-sm font-sans font-medium">Video stream unavailable.</p>
                </div>
              )}
            </div>

            {/* Video Metadata Footer */}
            <div className="p-6 bg-black/60 space-y-3">
              <h2 className="font-display text-xl sm:text-2xl font-bold leading-tight">
                {video.title}
              </h2>
              {video.excerpt && (
                <p className="text-xs sm:text-sm font-sans text-white/70 leading-relaxed max-w-3xl">
                  {video.excerpt}
                </p>
              )}

              <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs font-sans text-white/50 border-t border-white/10">
                <span className="flex items-center gap-1.5 font-medium text-white/80">
                  <Sparkles className="size-3.5 text-gold" />
                  {video.authorName || "India Story Project Bureau"}
                </span>
                {video.viewCount !== undefined && (
                  <span className="flex items-center gap-1">
                    <Eye className="size-3.5" />
                    {video.viewCount} views
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
