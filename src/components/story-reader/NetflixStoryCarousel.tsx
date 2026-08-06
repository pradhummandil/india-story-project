import { motion } from "framer-motion";
import { Clock, MapPin, ArrowRight, Sparkles, Compass } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Story } from "@/components/site/StoryCard";
import { useI18nStore } from "@/lib/i18n";

interface NetflixStoryCarouselProps {
  stories: Story[];
  currentStoryId: string;
}

export function NetflixStoryCarousel({ stories, currentStoryId }: NetflixStoryCarouselProps) {
  const lang = useI18nStore((s) => s.lang);
  const isHindi = lang === "hi";

  const filtered = stories.filter((s) => s.id !== currentStoryId).slice(0, 6);

  if (filtered.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      className="my-16 space-y-6"
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#FAF7F2]/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D32F2F]/20 border border-[#D32F2F]/40 flex items-center justify-center text-[#D32F2F]">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-2xl font-serif font-bold text-white">
              {isHindi ? "आधुनिक भारत का अन्वेषण जारी रखें" : "Continue Exploring Modern India"}
            </h3>
            <p className="text-xs text-[#FAF7F2]/60">
              {isHindi ? "आपके लिए विशेष रूप से चुने गए वृत्तचित्र प्रेषण" : "Handpicked documentary dispatches for you"}
            </p>
          </div>
        </div>

        <Link
          to="/explore"
          className="text-xs font-semibold text-[#D4AF37] hover:underline flex items-center gap-1"
        >
          <span>{isHindi ? "पुरालेख देखें" : "View Archive"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Netflix Horizontal Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <Link key={item.id} to={`/stories/${item.slug}`}>
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="group relative rounded-3xl bg-[#1A1816] border border-[#FAF7F2]/15 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-[#D32F2F]/20 flex flex-col h-full"
            >
              {/* Image Container */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={item.image}
                  alt={isHindi ? (item.titleHindi || item.title) : item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter brightness-90 group-hover:brightness-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1816] via-transparent to-transparent" />

                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#D32F2F]/80 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                  {(item as any).category || item.region || "Dispatch"}
                </div>

                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/70 text-white text-[10px] font-mono flex items-center gap-1 backdrop-blur-md">
                  <Clock className="w-3 h-3 text-[#D4AF37]" />
                  {item.readTime || "5 min"}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[#D4AF37] font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{item.region}</span>
                  </div>
                  <h4 className="text-base font-serif font-bold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-2 leading-snug">
                    {isHindi ? (item.titleHindi || item.title) : item.title}
                  </h4>
                  <p className="text-xs text-[#FAF7F2]/70 line-clamp-2 leading-relaxed">
                    {isHindi ? (item.excerptHindi || item.excerpt) : item.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#FAF7F2]/10 flex items-center justify-between text-xs text-[#FAF7F2]/60">
                  <span className="font-serif font-medium">{item.authorName || "India Story Project"}</span>
                  <span className="text-[#D32F2F] font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    {isHindi ? "पढ़ें" : "Read"} <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
