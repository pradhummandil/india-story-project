import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles, Share2, Bookmark, ArrowUp, Compass, Award } from "lucide-react";
import { toast } from "sonner";
import type { Story } from "@/components/site/StoryCard";
import { useI18nStore } from "@/lib/i18n";

interface CinematicEndingProps {
  story: Story;
  onLikeToggle?: () => void;
  isLiked?: boolean;
  likeCount?: number;
}

export function CinematicEnding({
  story,
  onLikeToggle,
  isLiked = false,
  likeCount = 0,
}: CinematicEndingProps) {
  const lang = useI18nStore((s) => s.lang);
  const isHindi = lang === "hi";

  const [claps, setClaps] = useState(0);

  const handleClap = () => {
    setClaps((prev) => prev + 1);
    toast.success(isHindi ? "स्वतंत्र पत्रकारिता का समर्थन करने के लिए धन्यवाद!" : "Thank you for supporting independent journalism!", {
      description: isHindi ? "आपकी सराहना दर्ज कर ली गई है।" : "Your applause has been recorded.",
    });
    if (onLikeToggle && !isLiked) {
      onLikeToggle();
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.9 }}
      className="my-20 relative rounded-3xl overflow-hidden bg-[#12100E] border border-[#FAF7F2]/15 shadow-2xl text-white"
    >
      {/* Background Hero Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={story.image}
          alt={isHindi ? (story.titleHindi || story.title) : story.title}
          className="w-full h-full object-cover filter brightness-[0.25] blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12100E] via-[#12100E]/80 to-transparent" />
      </div>

      <div className="relative z-10 p-8 md:p-16 max-w-4xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#FDE68A] text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" /> {isHindi ? "कहानी का समापन" : "Story Finale"}
        </div>

        <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#FAF7F2] leading-tight drop-shadow-lg">
          {isHindi ? "यात्रा जारी है" : "The Journey Continues"}
        </h2>

        <p className="text-lg md:text-xl font-serif italic text-[#E5DECA] max-w-2xl mx-auto leading-relaxed border-y border-[#D4AF37]/30 py-6">
          {isHindi
            ? "“भारत की हर कहानी मानवीय लचीलेपन, संस्कृति और परिवर्तन के जीवंत ताने-बाने में एक धागा है।”"
            : "“Every story from India is a thread in the living tapestry of human resilience, culture, and transformation.”"}
        </p>

        {/* Reader Applause & Reaction Section */}
        <div className="pt-4 flex flex-col items-center justify-center gap-4">
          <button
            onClick={handleClap}
            className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-[#D32F2F] via-[#EF4444] to-[#D32F2F] text-white font-bold text-base shadow-2xl shadow-[#D32F2F]/40 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3 cursor-pointer"
          >
            <Heart className={`w-6 h-6 ${isLiked || claps > 0 ? "fill-current" : "group-hover:scale-110"}`} />
            <span>
              {isHindi ? "कहानी की सराहना करें" : "Applaud Story"} ({likeCount + claps})
            </span>
          </button>

          <span className="text-xs text-[#FAF7F2]/60">
            {isHindi
              ? "आधुनिक भारत की प्रामाणिक कहानियों के लिए अपना समर्थन दिखाएं"
              : "Show your support for authentic storytelling from modern India"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="pt-8 border-t border-[#FAF7F2]/15 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={scrollToTop}
            className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all flex items-center gap-2 border border-white/10 cursor-pointer"
          >
            <ArrowUp className="w-4 h-4 text-[#D4AF37]" /> {isHindi ? "ऊपर जाएं" : "Back to Top"}
          </button>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: isHindi ? (story.titleHindi || story.title) : story.title,
                  text: isHindi ? (story.excerptHindi || story.excerpt) : story.excerpt,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                toast.success(isHindi ? "कहानी का लिंक कॉपी किया गया!" : "Story link copied to clipboard!");
              }
            }}
            className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all flex items-center gap-2 border border-white/10 cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-[#D32F2F]" /> {isHindi ? "कहानी साझा करें" : "Share Dispatch"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
