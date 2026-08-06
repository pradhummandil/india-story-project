import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Calendar, Volume2, Sparkles, Bookmark, Heart, Share2, Compass } from "lucide-react";
import type { Story } from "@/components/site/StoryCard";
import { useAudioStore } from "@/lib/audio-store";
import { StoryLanguageToggle } from "./StoryLanguageToggle";
import { useI18nStore } from "@/lib/i18n";

interface StoryHeroProps {
  story: Story;
  onBookmarkToggle?: () => void;
  isBookmarked?: boolean;
  onLikeToggle?: () => void;
  isLiked?: boolean;
  likeCount?: number;
}

export function StoryHero({
  story,
  onBookmarkToggle,
  isBookmarked = false,
  onLikeToggle,
  isLiked = false,
  likeCount = 0,
}: StoryHeroProps) {
  const lang = useI18nStore((s) => s.lang);
  const isHindi = lang === "hi";

  const { playEpisode } = useAudioStore();
  const category = (story as any).category || (story as any).themes?.[0] || (isHindi ? "सांस्कृतिक विरासत" : "Cultural Heritage");
  const authorName = story.authorName || (isHindi ? "इंडिया स्टोरी प्रोजेक्ट" : "India Story Project");
  const dateStr = (story as any).publishedAt || (story as any).createdAt
    ? new Date((story as any).publishedAt || (story as any).createdAt).toLocaleDateString(isHindi ? "hi-IN" : "en-IN", { month: "long", day: "numeric", year: "numeric" })
    : (isHindi ? "20 जुलाई 2026" : "India Dispatch");

  const region = story.region || "India";
  const district = (story as any).district;

  const displayTitle = isHindi ? (story.titleHindi || story.title) : story.title;
  const displaySubtitle = isHindi ? (story.subtitleHindi || story.subtitle) : story.subtitle;
  const displayExcerpt = isHindi ? (story.excerptHindi || story.excerpt) : story.excerpt;

  // Subtle ambient particle field
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number; delay: number }>>([]);

  useEffect(() => {
    const generated = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1.5,
      duration: Math.random() * 14 + 12,
      delay: Math.random() * 6,
    }));
    setParticles(generated);
  }, []);

  const handleAudioPlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playEpisode({
      id: story.id,
      slug: story.slug,
      title: displayTitle,
      excerpt: displayExcerpt,
      audioUrl: (story as any).audioUrl || "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ambient-piano-10781.mp3",
      duration: 300,
      authorName: authorName,
      imageUrl: story.image,
    });
  };

  return (
    <section className="relative min-h-[85vh] lg:min-h-[92vh] flex flex-col justify-between overflow-hidden bg-[#09090B] text-[#FAF7F2] select-none">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.45 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          src={story.image}
          alt={displayTitle}
          className="w-full h-full object-cover filter brightness-[0.55] contrast-[1.1] saturate-[1.15]"
        />

        {/* Ambient Dark Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090B]/90 via-transparent to-[#09090B]/80" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0.1, y: 0 }}
            animate={{ opacity: [0.1, 0.4, 0.1], y: [-20, -140] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
            className="absolute rounded-full bg-[#D4AF37]"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.size}px`, height: `${p.size}px` }}
          />
        ))}
      </div>

      {/* Top Bar Header Navigation / Badges */}
      <div className="relative z-20 container mx-auto px-6 lg:px-12 pt-8 flex items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 flex-wrap"
        >
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#D32F2F] text-white shadow-lg shadow-[#D32F2F]/30 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            {category}
          </span>

          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#1A1816]/80 border border-[#FAF7F2]/15 text-[#FAF7F2]/90 backdrop-blur-md">
            <MapPin className="w-3.5 h-3.5 text-[#D32F2F]" />
            {district ? `${district}, ${region}` : region}
          </span>

          {/* CRITICAL: RESTORED EN / HI LANGUAGE TOGGLE */}
          <StoryLanguageToggle />
        </motion.div>

        {/* Actions: Audio Listen & Bookmarks */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center gap-2.5"
        >
          <button
            type="button"
            onClick={handleAudioPlay}
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#FDE68A] hover:bg-[#D4AF37]/25 backdrop-blur-md transition-all duration-300 shadow-lg cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs font-semibold tracking-wide uppercase">
              {isHindi ? "वाचन सुनें" : "LISTEN NARRATION"}
            </span>
          </button>

          {onBookmarkToggle && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBookmarkToggle();
              }}
              className={`p-2.5 rounded-full backdrop-blur-md border transition-all duration-300 cursor-pointer ${
                isBookmarked
                  ? "bg-[#D32F2F] border-[#D32F2F] text-white shadow-lg shadow-[#D32F2F]/30"
                  : "bg-[#1A1816]/80 border-[#FAF7F2]/15 text-white/80 hover:text-white"
              }`}
              title={isBookmarked ? "Bookmarked" : "Bookmark story"}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
          )}

          {onLikeToggle && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onLikeToggle();
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full backdrop-blur-md border transition-all duration-300 cursor-pointer ${
                isLiked
                  ? "bg-[#D32F2F] border-[#D32F2F] text-white shadow-lg shadow-[#D32F2F]/30"
                  : "bg-[#1A1816]/80 border-[#FAF7F2]/15 text-white/80 hover:text-white"
              }`}
              title="Like story"
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-xs font-semibold">{likeCount}</span>
            </button>
          )}
        </motion.div>
      </div>

      {/* Main Center Hero Content */}
      <div className="relative z-20 container mx-auto px-6 lg:px-12 py-12 lg:py-24 flex flex-col justify-end max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-[#FAF7F2] leading-[1.14] drop-shadow-2xl max-w-4xl">
            {displayTitle}
          </h1>

          {displaySubtitle && (
            <p className="text-lg md:text-2xl font-light text-[#E5DECA] leading-relaxed max-w-3xl border-l-2 border-[#D4AF37] pl-4 py-1">
              {displaySubtitle}
            </p>
          )}

          {displayExcerpt && !displaySubtitle && (
            <p className="text-base md:text-xl font-light text-[#FAF7F2]/80 leading-relaxed max-w-3xl">
              {displayExcerpt}
            </p>
          )}
        </motion.div>

        {/* Author & Meta Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-10 pt-6 border-t border-[#FAF7F2]/15 flex flex-wrap items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#D4AF37]/60 shadow-lg">
              <img
                src={(story as any).authorAvatar || `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(authorName)}`}
                alt={authorName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                {isHindi ? "कहानीकार" : "Storyteller"}
              </div>
              <div className="text-base font-serif font-semibold text-white">{authorName}</div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#FAF7F2]/70 font-medium">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              <span>{story.readTime ? (isHindi ? story.readTime.replace("min read", "मिनट पढ़ें") : story.readTime) : (isHindi ? "5 मिनट पढ़ें" : "5 min read")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              <span>{dateStr}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#D32F2F]" />
              <span>{isHindi ? "इंटरएक्टिव कहानी" : "Interactive Story"}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Hero Bottom Ambient Scroll Indicator */}
      <div className="relative z-20 pb-4 text-center">
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity"
        >
          <span className="text-[9px] font-semibold uppercase tracking-widest text-[#D4AF37]">
            {isHindi ? "खोजने के लिए नीचे स्क्रॉल करें" : "SCROLL TO EXPLORE"}
          </span>
          <div className="w-4 h-7 rounded-full border-2 border-[#D4AF37] p-1 flex justify-center">
            <div className="w-1 h-2 rounded-full bg-[#D4AF37]" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
