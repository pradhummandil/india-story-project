import { motion } from "framer-motion";
import { User, Sparkles, Award, BookOpen, ArrowRight, Share2, Twitter, Linkedin, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Story } from "@/components/site/StoryCard";
import { useI18nStore } from "@/lib/i18n";

interface StoryAuthorSpotlightProps {
  story: Story;
}

export function StoryAuthorSpotlight({ story }: StoryAuthorSpotlightProps) {
  const lang = useI18nStore((s) => s.lang);
  const isHindi = lang === "hi";

  const rawAuthor = story.authorName;
  const isRealAuthor = !!(
    rawAuthor &&
    rawAuthor.trim() !== "" &&
    rawAuthor.toLowerCase() !== "india story project" &&
    rawAuthor.toLowerCase() !== "not identifiable" &&
    rawAuthor.toLowerCase() !== "unknown"
  );
  const authorName = isRealAuthor ? rawAuthor : (isHindi ? "इंडिया स्टोरी प्रोजेक्ट संपादकीय टीम" : "India Story Project Editorial Team");
  const avatarUrl = (story as any).authorAvatar || `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(authorName)}`;
  const authorBio = isHindi
    ? "पुरस्कार विजेता स्वतंत्र वृत्तचित्र पत्रकार और सांस्कृतिक शोधकर्ता, जो ग्रामीण और आधुनिक भारत की कहानियों को सहेजते हैं।"
    : ((story as any).authorBio || "Award-winning independent documentary journalist & cultural researcher capturing stories across rural and modern India.");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      className="my-16 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-[#1F1C18] via-[#2A1E1A] to-[#1F1C18] border border-[#FAF7F2]/15 shadow-2xl relative overflow-hidden text-white"
    >
      {/* Background Accent glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#D32F2F]/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
        {/* Large Author Portrait */}
        <div className="relative flex-shrink-0">
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-[#D4AF37] shadow-2xl">
            <img src={avatarUrl} alt={authorName} className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-2 right-2 px-2.5 py-1 rounded-full bg-[#D32F2F] text-white text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1 border border-white/20">
            <Sparkles className="w-3 h-3 text-[#D4AF37]" /> {isHindi ? "सत्यापित" : "Verified"}
          </div>
        </div>

        {/* Bio & Details */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#D4AF37]">
                {isHindi ? "विशेष कहानीकार" : "Featured Storyteller Spotlight"}
              </span>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mt-1">
                {authorName}
              </h3>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3">
              <span className="px-3 py-1 rounded-full bg-[#FAF7F2]/10 text-xs font-medium border border-white/10 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" /> {isHindi ? "14 प्रेषण" : "14 Dispatches"}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#FAF7F2]/10 text-xs font-medium border border-white/10 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#D32F2F]" /> {isHindi ? "वरिष्ठ साथी" : "Senior Fellow"}
              </span>
            </div>
          </div>

          <p className="text-sm md:text-base text-[#FAF7F2]/80 leading-relaxed font-light">
            {authorBio}
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center md:justify-start gap-4">
            {isRealAuthor && (story as any).authorId && (
              <Link
                to={`/authors/${(story as any).authorId}`}
                className="px-5 py-2.5 rounded-full bg-[#D32F2F] text-white font-semibold text-xs hover:bg-[#B91C1C] transition-all flex items-center gap-2 shadow-lg shadow-[#D32F2F]/30"
              >
                <span>{isHindi ? "लेखक प्रोफ़ाइल देखें" : "View Author Profile & Dispatches"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}

            <button className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all flex items-center gap-2 border border-white/10 cursor-pointer">
              <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" /> {isHindi ? "लेखक जीवनी साझा करें" : "Share Author Bio"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
