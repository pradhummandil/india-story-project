import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { MapPin, Sparkles, User, Globe2, BookOpen, ArrowRight, Dna } from "lucide-react";
import type { Story } from "@/components/site/StoryCard";
import { STATE_COORDINATES } from "@/components/site/StateCoordinates";
import { useI18nStore, translateStory, translateStateName } from "@/lib/i18n";

interface DnaMapExplorerProps {
  stories: Story[];
  onSelectStory?: (id: string) => void;
}

export function DnaMapExplorer({ stories, onSelectStory }: DnaMapExplorerProps) {
  const lang = useI18nStore((s) => s.lang);
  const [selectedState, setSelectedState] = useState<string>("Rajasthan");
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const activeStateName = hoveredState || selectedState;

  // Group stories by state
  const storiesByState = useMemo(() => {
    const map = new Map<string, Story[]>();
    stories.forEach((story) => {
      const reg = story.region || "India";
      const matchedState = Object.keys(STATE_COORDINATES).find(
        (st) => reg.toLowerCase().includes(st.toLowerCase()) || st.toLowerCase().includes(reg.toLowerCase())
      ) || "Rajasthan";

      const list = map.get(matchedState) || [];
      list.push(story);
      map.set(matchedState, list);
    });
    return map;
  }, [stories]);

  // Featured story for current active state
  const activeStateStories = storiesByState.get(activeStateName) || stories.slice(0, 3);
  const featuredStoryRaw = activeStateStories[0] || stories[0];
  const featuredStory = translateStory(featuredStoryRaw, lang);

  const stateHeroImage =
    featuredStory.heroImage ||
    featuredStory.image ||
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80";

  const targetSlug = featuredStory.slug || featuredStory.id;

  return (
    <section className="py-20 px-6 bg-[#111111] text-[#F8F6F1] border-b border-[#C89A3D]/20">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs font-mono text-[#C89A3D] uppercase tracking-widest mb-2">
            <Globe2 className="size-4" />
            <span>{lang === "hi" ? "भौगोलिक कहानी मानचित्र" : "INTERACTIVE MAP INTEGRATION"}</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-[#F8F6F1] tracking-tight">
            {lang === "hi" ? "भारत का राज्य-वार डीएनए मानचित्र" : "Map of Indian Stories & Regional Heritage"}
          </h2>
          <p className="text-sm text-[#F1E5D0]/70 mt-3 font-sans leading-relaxed">
            {lang === "hi"
              ? "किसी भी राज्य पर होवर करें ताकि वहाँ की कहानियों, लेखकों, स्थानीय भाषा और संस्कृति को देखा जा सके।"
              : "Hover or click any state across the Indian subcontinent to discover regional stories, authors, dialects, and cultural heritage."}
          </p>
        </div>

        {/* Map & Preview Split Layout */}
        <div className="grid lg:grid-cols-[1fr_450px] gap-8 items-center">
          {/* Interactive Map Visual Container */}
          <div className="relative min-h-[480px] md:min-h-[560px] rounded-3xl bg-[#0D0D0D] border border-[#C89A3D]/30 p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
            {/* Background Grid & Ambient Glow */}
            <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_center,rgba(200,154,61,0.25)_0%,transparent_70%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

            {/* Map Header Indicator */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-mono text-[#C89A3D] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {lang === "hi" ? "राज्य चुनें" : "Select State"}
              </span>
              <span className="text-xs font-mono text-[#F1E5D0]/60">
                {Object.keys(STATE_COORDINATES).length} {lang === "hi" ? "राज्य एवं केंद्र शासित प्रदेश" : "States & UTs Active"}
              </span>
            </div>

            {/* Map Canvas with Interactive State Glowing Nodes */}
            <div className="relative z-10 w-full h-[400px] md:h-[460px] my-auto grid place-items-center overflow-visible">
              <svg
                viewBox="0 0 650 700"
                className="w-full h-full max-w-[550px] max-h-[460px] drop-shadow-2xl overflow-visible"
              >
                {/* Connecting Constellation Network Lines between State Pins */}
                {Object.entries(STATE_COORDINATES).map(([stName, coords], idx, arr) => {
                  if (idx === 0) return null;
                  const prevCoords = arr[idx - 1][1];
                  const isHighlighted = activeStateName === stName;

                  return (
                    <line
                      key={`line-${stName}`}
                      x1={prevCoords.x}
                      y1={prevCoords.y}
                      x2={coords.x}
                      y2={coords.y}
                      stroke={isHighlighted ? "#C89A3D" : "#C89A3D"}
                      strokeOpacity={isHighlighted ? 0.6 : 0.12}
                      strokeWidth={isHighlighted ? 2 : 0.75}
                      strokeDasharray="3 4"
                    />
                  );
                })}

                {/* State Interactive Pin Nodes */}
                {Object.entries(STATE_COORDINATES).map(([stName, coords]) => {
                  const isActive = activeStateName === stName;

                  return (
                    <g
                      key={stName}
                      className="cursor-pointer group"
                      onClick={() => setSelectedState(stName)}
                      onMouseEnter={() => setHoveredState(stName)}
                      onMouseLeave={() => setHoveredState(null)}
                    >
                      {/* Pulsing Glow Ring on Active */}
                      {isActive && (
                        <circle
                          cx={coords.x}
                          cy={coords.y}
                          r="18"
                          fill="#C89A3D"
                          fillOpacity="0.3"
                          className="animate-ping"
                        />
                      )}

                      {/* State Outer Ring */}
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r={isActive ? "10" : "6"}
                        fill={isActive ? "#C89A3D" : "#A50000"}
                        stroke="#F8F6F1"
                        strokeWidth={isActive ? "2.5" : "1.5"}
                        className="transition-all duration-300 group-hover:scale-125"
                      />

                      {/* State Label Pin */}
                      <text
                        x={coords.x}
                        y={coords.y - 12}
                        textAnchor="middle"
                        fill={isActive ? "#C89A3D" : "#F1E5D0"}
                        fontSize={isActive ? "11 font-bold" : "8"}
                        fontFamily="sans-serif"
                        className="pointer-events-none drop-shadow-md transition-all duration-300"
                      >
                        {translateStateName(stName, lang)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Footer Hint */}
            <div className="relative z-10 text-[11px] font-mono text-[#F1E5D0]/50 text-center">
              {lang === "hi" ? "मानचित्र पर किसी भी राज्य पिन पर क्लिक करें" : "Click or hover any regional state pin"}
            </div>
          </div>

          {/* Active State Featured Story Floating Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStateName}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl bg-[#141414] border border-[#C89A3D]/40 p-6 md:p-8 shadow-2xl space-y-6"
            >
              {/* Top State Badge & Story Count */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#C89A3D]">
                    {lang === "hi" ? "चयनित राज्य" : "FEATURED REGIONAL STATE"}
                  </span>
                  <h3 className="font-display text-2xl font-extrabold text-[#F8F6F1]">
                    {translateStateName(activeStateName, lang)}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-xl font-extrabold font-mono text-[#C89A3D]">
                    {activeStateStories.length}
                  </span>
                  <p className="text-[10px] text-[#F1E5D0]/60 font-sans">
                    {lang === "hi" ? "कहानियाँ सहेजी गईं" : "Stories Documented"}
                  </p>
                </div>
              </div>

              {/* State Featured Story Image */}
              <Link to="/stories/$slug" params={{ slug: targetSlug }} className="block relative h-48 rounded-2xl overflow-hidden group">
                <img
                  src={stateHeroImage}
                  alt={featuredStory.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#A50000] text-white text-[10px] font-bold uppercase">
                    {featuredStory.category || featuredStory.themes?.[0] || "Regional Story"}
                  </span>
                </div>
              </Link>

              {/* Story Information */}
              <div className="space-y-3">
                <Link to="/stories/$slug" params={{ slug: targetSlug }} className="block group">
                  <h4 className="font-display text-lg font-bold text-[#F8F6F1] group-hover:text-[#C89A3D] transition-colors leading-tight">
                    {featuredStory.title}
                  </h4>
                </Link>

                <p className="text-xs text-[#F1E5D0]/70 line-clamp-3 leading-relaxed">
                  {featuredStory.excerpt || featuredStory.content || "Explore this regional story of grassroots change."}
                </p>

                <div className="flex items-center gap-2 text-xs text-[#F1E5D0]/80 pt-1 font-sans">
                  <User className="size-3.5 text-[#C89A3D]" />
                  <span>{featuredStory.authorName || "India Story Project Author"}</span>
                </div>
              </div>

              {/* Action Button */}
              <Link
                to="/stories/$slug"
                params={{ slug: targetSlug }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#A50000] via-[#C89A3D] to-[#A50000] text-white font-semibold text-xs text-center flex items-center justify-center gap-2 shadow-lg hover:brightness-110 transition-all cursor-pointer"
              >
                <span>{lang === "hi" ? "राज्य की कहानी पढ़ें" : "Read State Story"}</span>
                <ArrowRight className="size-4" />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
