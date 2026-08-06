import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { MapPin, Clock, User, ArrowUpRight, Dna, Tag, Sparkles } from "lucide-react";
import type { Story } from "@/components/site/StoryCard";
import { useI18nStore, translateStory } from "@/lib/i18n";
import { deriveDNA } from "@/lib/story-dna";

interface DnaHoverPreviewCardProps {
  story: Story;
  onInspectDna?: (storyId: string) => void;
  onClose?: () => void;
  position?: { x: number; y: number } | null;
}

export function DnaHoverPreviewCard({
  story: rawStory,
  onInspectDna,
  position,
}: DnaHoverPreviewCardProps) {
  const lang = useI18nStore((s) => s.lang);
  const story = translateStory(rawStory, lang);
  const dna = deriveDNA(rawStory);

  const heroImage =
    story.heroImage ||
    story.image ||
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80";

  const targetSlug = story.slug || story.id;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88, y: 12, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.92, y: 8, filter: "blur(4px)" }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className="z-50 w-80 md:w-96 rounded-2xl bg-[#141414]/95 border border-[#C89A3D]/40 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden text-[#F8F6F1] font-sans"
      style={
        position
          ? {
              position: "absolute",
              left: `${position.x}px`,
              top: `${position.y}px`,
              transform: "translate(-50%, -100%)",
            }
          : undefined
      }
    >
      {/* Top Banner Image with Gradient Blur */}
      <Link to="/stories/$slug" params={{ slug: targetSlug }} className="block relative h-44 overflow-hidden group">
        <img
          src={heroImage}
          alt={story.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />

        {/* Category & Read Time Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-full bg-[#A50000]/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-[#A50000]">
            {story.themes?.[0] || story.category || "Story"}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#F1E5D0] text-[10px] font-mono flex items-center gap-1 border border-white/10">
            <Clock className="size-3 text-[#C89A3D]" />
            {story.readTime || "4 min read"}
          </span>
        </div>

        {/* District & State Overlay */}
        <div className="absolute bottom-2 left-3 flex items-center gap-1.5 text-xs text-[#F1E5D0] font-medium drop-shadow-md">
          <MapPin className="size-3.5 text-[#C89A3D]" />
          <span>{story.region || "India"}</span>
        </div>
      </Link>

      {/* Card Content Body */}
      <div className="p-5 space-y-3">
        {/* Title */}
        <Link to="/stories/$slug" params={{ slug: targetSlug }} className="block group">
          <h4 className="font-display text-lg font-bold text-[#F8F6F1] group-hover:text-[#C89A3D] transition-colors leading-tight line-clamp-2">
            {story.title}
          </h4>
        </Link>

        {/* Author Tag */}
        <div className="flex items-center gap-2 text-xs text-[#F1E5D0]/70 font-sans">
          <div className="size-5 rounded-full bg-[#C89A3D]/20 border border-[#C89A3D]/50 flex items-center justify-center text-[#C89A3D]">
            <User className="size-3" />
          </div>
          <span>{story.authorName || "India Story Project"}</span>
        </div>

        {/* Short Summary */}
        <p className="text-xs text-[#F1E5D0]/70 line-clamp-2 leading-relaxed font-sans font-normal">
          {story.excerpt || story.content || "Explore this connected story of impact and change across India."}
        </p>

        {/* DNA Traits Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="px-2 py-0.5 rounded-md bg-[#C89A3D]/15 border border-[#C89A3D]/30 text-[#C89A3D] text-[10px] font-mono flex items-center gap-1">
            <Sparkles className="size-2.5" />
            {dna.impactType}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[#F1E5D0]/80 text-[10px] font-mono flex items-center gap-1">
            <Tag className="size-2.5 text-[#C89A3D]" />
            {dna.emotion}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-2 border-t border-white/10">
          <Link
            to="/stories/$slug"
            params={{ slug: targetSlug }}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#A50000] to-[#C89A3D] text-white font-semibold text-xs text-center flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 transition-all cursor-pointer"
          >
            <span>{lang === "hi" ? "कहानी पढ़ें" : "Open Story"}</span>
            <ArrowUpRight className="size-3.5" />
          </Link>

          {onInspectDna && (
            <button
              onClick={() => onInspectDna(story.id)}
              className="px-3.5 py-2.5 rounded-xl bg-white/5 border border-[#C89A3D]/40 text-[#C89A3D] font-semibold text-xs flex items-center gap-1.5 hover:bg-[#C89A3D]/20 transition-all cursor-pointer"
            >
              <Dna className="size-3.5" />
              <span>{lang === "hi" ? "डीएनए देखें" : "DNA"}</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
