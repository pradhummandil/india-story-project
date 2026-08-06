import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Flame, Clock, MapPin, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import type { Story } from "@/components/site/StoryCard";
import { useI18nStore, translateStory } from "@/lib/i18n";

interface DnaTrendingCarouselProps {
  stories: Story[];
  onSelectStory?: (id: string) => void;
}

export function DnaTrendingCarousel({ stories, onSelectStory }: DnaTrendingCarouselProps) {
  const lang = useI18nStore((s) => s.lang);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const trendingStories = stories.slice(0, 8);

  // Auto-play effect
  useEffect(() => {
    if (!isAutoPlaying || trendingStories.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % trendingStories.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, trendingStories.length]);

  if (!trendingStories.length) return null;

  const currentRawStory = trendingStories[currentIndex] || trendingStories[0];
  const story = translateStory(currentRawStory, lang);
  const heroImage =
    story.heroImage ||
    story.image ||
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80";

  const targetSlug = story.slug || story.id;

  return (
    <section
      className="py-20 px-6 bg-[#0D0D0D] text-[#F8F6F1] border-b border-[#C89A3D]/20 overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#A50000] uppercase tracking-widest mb-2 font-bold">
              <Flame className="size-4 animate-bounce text-[#A50000]" />
              <span>{lang === "hi" ? "ट्रेंडिंग कहानियाँ" : "FLAGSHIP TRENDING CAROUSEL"}</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-[#F8F6F1] tracking-tight">
              {lang === "hi" ? "ट्रेंडिंग स्टोरी यूनिवर्स" : "Subcontinental Trending Universe"}
            </h2>
          </div>

          {/* Carousel Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setCurrentIndex((prev) => (prev === 0 ? trendingStories.length - 1 : prev - 1))
              }
              className="size-11 rounded-full bg-white/5 border border-white/10 hover:border-[#C89A3D] text-[#F1E5D0] flex items-center justify-center transition-all cursor-pointer hover:bg-white/10"
              aria-label="Previous story"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % trendingStories.length)}
              className="size-11 rounded-full bg-white/5 border border-white/10 hover:border-[#C89A3D] text-[#F1E5D0] flex items-center justify-center transition-all cursor-pointer hover:bg-white/10"
              aria-label="Next story"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        {/* Main Netflix/Apple Hero Card Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={story.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.6 }}
            className="relative min-h-[460px] md:min-h-[540px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col justify-end p-6 md:p-12 group"
          >
            {/* Background Image with Ambient Zoom */}
            <motion.img
              src={heroImage}
              alt={story.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            />
            {/* Ambient Dark Gradient Layer */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D]/90 via-[#0D0D0D]/40 to-transparent" />

            {/* Content Glass Box */}
            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#A50000] text-white text-xs font-bold uppercase tracking-wider">
                  {story.category || story.themes?.[0] || "Trending"}
                </span>
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#F1E5D0] text-xs font-mono flex items-center gap-1.5 border border-white/10">
                  <MapPin className="size-3 text-[#C89A3D]" />
                  {story.region || "India"}
                </span>
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#F1E5D0] text-xs font-mono flex items-center gap-1.5 border border-white/10">
                  <Clock className="size-3 text-[#C89A3D]" />
                  {story.readTime || "5 min read"}
                </span>
              </div>

              <Link to="/stories/$slug" params={{ slug: targetSlug }} className="block group">
                <h3 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#F8F6F1] group-hover:text-[#C89A3D] transition-colors leading-tight tracking-tight drop-shadow-md">
                  {story.title}
                </h3>
              </Link>

              <p className="text-sm sm:text-base text-[#F1E5D0]/80 line-clamp-3 leading-relaxed font-sans font-normal max-w-2xl">
                {story.excerpt || story.content || "Explore this flagship story from the India Story Project archive."}
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  to="/stories/$slug"
                  params={{ slug: targetSlug }}
                  className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#A50000] via-[#C89A3D] to-[#A50000] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl hover:brightness-110 transition-all cursor-pointer"
                >
                  <span>{lang === "hi" ? "कहानी का अनुभव करें" : "Experience Story"}</span>
                  <ArrowUpRight className="size-4" />
                </Link>

                {onSelectStory && (
                  <button
                    onClick={() => onSelectStory(story.id)}
                    className="px-6 py-3.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#F8F6F1] font-semibold text-xs uppercase tracking-wider hover:bg-white/20 transition-all cursor-pointer"
                  >
                    {lang === "hi" ? "डीएनए देखें" : "Inspect DNA"}
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Dots Indicator */}
            <div className="absolute bottom-6 right-8 z-10 flex items-center gap-2">
              {trendingStories.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentIndex ? "w-8 bg-[#C89A3D]" : "w-2 bg-white/30 hover:bg-white/60"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
