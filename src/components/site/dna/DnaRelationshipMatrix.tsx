import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  Sparkles,
  Users,
  MapPin,
  Heart,
  Landmark,
  Target,
  Flame,
  Briefcase,
  ArrowRight,
  Dna,
} from "lucide-react";
import type { Story } from "@/components/site/StoryCard";
import { useI18nStore, translateStory } from "@/lib/i18n";
import { getConnections, deriveDNA } from "@/lib/story-dna";

interface DnaRelationshipMatrixProps {
  activeStory: Story;
  allStories: Story[];
  onSelectStory: (id: string) => void;
}

export function DnaRelationshipMatrix({
  activeStory: rawActiveStory,
  allStories,
  onSelectStory,
}: DnaRelationshipMatrixProps) {
  const lang = useI18nStore((s) => s.lang);
  const activeStory = translateStory(rawActiveStory, lang);
  const activeDna = deriveDNA(rawActiveStory);

  // Compute connected story relationships
  const relationships = useMemo(() => {
    const rawConnections = getConnections(rawActiveStory.id, 8);

    // Define 8 distinct DNA connection badges
    const connectionTypes = [
      { key: "heroes", labelEn: "Similar Heroes", labelHi: "समान नायक", icon: Users, color: "from-[#C89A3D] to-amber-600" },
      { key: "culture", labelEn: "Similar Culture", labelHi: "समान संस्कृति", icon: Landmark, color: "from-[#A50000] to-rose-700" },
      { key: "district", labelEn: "Same District / Region", labelHi: "समान जिला/क्षेत्र", icon: MapPin, color: "from-blue-600 to-indigo-700" },
      { key: "community", labelEn: "Same Community", labelHi: "समान समुदाय", icon: Heart, color: "from-purple-600 to-violet-700" },
      { key: "theme", labelEn: "Same Theme", labelHi: "समान विषय", icon: Sparkles, color: "from-emerald-600 to-teal-700" },
      { key: "sdg", labelEn: `Same SDG (${activeDna.sdgs[0]?.label || "Impact"})`, labelHi: "समान एसडीजी लक्ष्य", icon: Target, color: "from-orange-600 to-amber-700" },
      { key: "festival", labelEn: "Same Festival / Era", labelHi: "समान त्योहार/युग", icon: Flame, color: "from-pink-600 to-rose-800" },
      { key: "occupation", labelEn: "Same Domain / Occupation", labelHi: "समान क्षेत्र", icon: Briefcase, color: "from-cyan-600 to-blue-800" },
    ];

    return rawConnections.map((conn, idx) => {
      const type = connectionTypes[idx % connectionTypes.length];
      return {
        ...conn,
        type,
      };
    });
  }, [rawActiveStory, activeDna]);

  return (
    <section className="py-20 px-6 bg-[#111111] text-[#F8F6F1] border-b border-[#C89A3D]/20">
      <div className="container mx-auto max-w-7xl">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#C89A3D] uppercase tracking-widest mb-2">
              <Dna className="size-4 animate-spin-slow text-[#C89A3D]" />
              <span>{lang === "hi" ? "डीएनए संबंध नेटवर्क" : "CONNECTED DNA MATRIX"}</span>
            </div>
            <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F8F6F1] leading-tight">
              {lang === "hi" ? "क्योंकि आपको यह कहानी पसंद आई..." : "Because you liked this story..."}
            </h3>
            <p className="text-sm text-[#F1E5D0]/70 mt-2 font-sans font-medium">
              {lang === "hi" ? "जुड़ी हुई कहानी: " : "Base Story: "}
              <span className="text-[#C89A3D] italic font-semibold">"{activeStory.title}"</span>
            </p>
          </div>

          <div className="px-4 py-2 rounded-full bg-white/5 border border-[#C89A3D]/30 text-xs font-mono text-[#F1E5D0]/80">
            {relationships.length} {lang === "hi" ? "संबद्ध कहानियाँ मिलीं" : "Connected Threads Found"}
          </div>
        </div>

        {/* Relationship Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {relationships.map((item, idx) => {
              const story = translateStory(item.story, lang);
              const Icon = item.type.icon;
              const heroImg =
                story.image ||
                story.heroImage ||
                "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80";

              return (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative rounded-2xl bg-[#171717] border border-white/10 hover:border-[#C89A3D]/60 overflow-hidden shadow-xl hover:shadow-[0_12px_40px_rgba(200,154,61,0.2)] transition-all duration-500 flex flex-col justify-between"
                >
                  <Link
                    to="/stories/$slug"
                    params={{ slug: story.slug || story.id }}
                    className="flex flex-col flex-1 h-full w-full"
                  >
                    {/* Top Image & Badge */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={heroImg}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/30 to-transparent" />

                      {/* Relationship Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${item.type.color} text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md`}>
                          <Icon className="size-3" />
                          {lang === "hi" ? item.type.labelHi : item.type.labelEn}
                        </span>
                      </div>

                      {/* Region Pill */}
                      <div className="absolute bottom-2 left-3 flex items-center gap-1 text-[11px] text-[#F1E5D0] font-sans">
                        <MapPin className="size-3 text-[#C89A3D]" />
                        <span>{story.region || "India"}</span>
                      </div>
                    </div>

                    {/* Body Info */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="font-display text-base font-bold text-[#F8F6F1] group-hover:text-[#C89A3D] transition-colors leading-snug line-clamp-2">
                          {story.title}
                        </h4>
                        <p className="text-xs text-[#F1E5D0]/60 mt-1 line-clamp-2 leading-relaxed">
                          {story.excerpt || story.content || "Discover how this story shares deep cultural and geographical DNA."}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#F1E5D0]/70">
                        <span className="truncate max-w-[140px] font-medium">
                          {story.authorName || "India Story Project"}
                        </span>
                        <span className="text-[#C89A3D] font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          {lang === "hi" ? "कहानी पढ़ें" : "Explore"} <ArrowRight className="size-3" />
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* DNA Inspect Action */}
                  <div className="px-5 pb-4 pt-1 bg-[#141414] border-t border-white/5 flex items-center justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStory(story.id);
                      }}
                      className="text-[10px] text-[#C89A3D] hover:underline font-mono flex items-center gap-1 cursor-pointer"
                    >
                      <Dna className="size-3" />
                      <span>{lang === "hi" ? "डीएनए देखें" : "Inspect DNA"}</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
