import { motion } from "framer-motion";
import { Sparkles, ArrowDown, Dna, Compass, Globe2 } from "lucide-react";
import { useI18nStore } from "@/lib/i18n";

interface DnaHeroBannerProps {
  onStartExploring?: () => void;
}

export function DnaHeroBanner({ onStartExploring }: DnaHeroBannerProps) {
  const lang = useI18nStore((s) => s.lang);

  return (
    <section className="relative min-h-[85vh] lg:min-h-screen flex flex-col justify-between overflow-hidden bg-[#111111] text-[#F8F6F1] pt-24 pb-12 px-6">
      {/* Background Animated Gradient Mesh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.25, 0.45, 0.25],
            x: ["-10%", "10%", "-10%"],
            y: ["-10%", "10%", "-10%"],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/4 -left-1/4 w-[70vw] h-[70vw] rounded-full bg-radial from-[#A50000]/30 via-[#C89A3D]/15 to-transparent blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.35, 0.2],
            x: ["10%", "-10%", "10%"],
            y: ["10%", "-10%", "10%"],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-1/4 -right-1/4 w-[65vw] h-[65vw] rounded-full bg-radial from-[#C89A3D]/25 via-[#A50000]/10 to-transparent blur-3xl"
        />

        {/* Ambient Floating Particle Stars */}
        {Array.from({ length: 28 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#C89A3D]"
            style={{
              width: `${(i % 3) + 2}px`,
              height: `${(i % 3) + 2}px`,
              top: `${(i * 19) % 100}%`,
              left: `${(i * 31) % 100}%`,
            }}
            animate={{
              opacity: [0.15, 0.7, 0.15],
              y: [0, -25, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 4 + (i % 6),
              repeat: Infinity,
              delay: (i * 0.3) % 3,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Subtle Overlay Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(200,154,61,0.06)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />
      </div>

      {/* Top Tag Header */}
      <div className="relative z-10 container mx-auto flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-[#C89A3D]/30 backdrop-blur-md text-[#C89A3D] text-xs font-semibold uppercase tracking-widest"
        >
          <Dna className="size-3.5 animate-pulse text-[#C89A3D]" />
          <span>{lang === "hi" ? "भारत कहानी ब्रह्मांड" : "Discover India's Story Universe"}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="hidden sm:flex items-center gap-2 text-xs text-[#F1E5D0]/70 font-sans"
        >
          <Globe2 className="size-3.5 text-[#C89A3D]" />
          <span>{lang === "hi" ? "जीवंत इंटरैक्टिव नेटवर्क" : "Living Story Constellation"}</span>
        </motion.div>
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 container mx-auto my-auto py-12 max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#A50000]/20 border border-[#A50000]/40 text-[#F1E5D0] text-[11px] font-mono tracking-wider mb-6"
        >
          <Sparkles className="size-3 text-[#C89A3D]" />
          <span>{lang === "hi" ? "डीएनए ऑफ चेंज" : "EXPLORE THE DNA OF CHANGE"}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25 }}
          className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] text-[#F8F6F1]"
        >
          {lang === "hi" ? "भारतीय कहानियों के " : "Explore the DNA "}
          <span className="italic font-normal bg-gradient-to-r from-[#C89A3D] via-[#F1E5D0] to-[#C89A3D] bg-clip-text text-transparent">
            {lang === "hi" ? "डीएनए की खोज करें" : "behind India's stories"}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-6 md:mt-8 max-w-3xl mx-auto text-base sm:text-xl text-[#F1E5D0]/80 font-sans font-normal leading-relaxed tracking-wide"
        >
          {lang === "hi"
            ? "हर कहानी लोगों, स्थानों, विरासत, संस्कृति, नवाचार, प्रकृति और आशा के माध्यम से आपस में जुड़ी हुई है।"
            : "Every story is connected through people, places, heritage, culture, innovation, nature, and hope."}
        </motion.p>

        {/* CTA & Scroll Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-10 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => {
              if (onStartExploring) {
                onStartExploring();
              } else {
                const el = document.getElementById("galaxy-universe-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-[#A50000] via-[#C89A3D] to-[#A50000] bg-[length:200%_auto] text-white font-semibold text-sm sm:text-base tracking-wider uppercase shadow-xl hover:shadow-[#C89A3D]/25 transition-all duration-500 cursor-pointer flex items-center gap-3 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Compass className="size-5 group-hover:rotate-45 transition-transform duration-500" />
              {lang === "hi" ? "अन्वेषण शुरू करें" : "Start Exploring"}
            </span>
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="relative z-10"
            >
              <ArrowDown className="size-4 text-[#F1E5D0]" />
            </motion.div>
            <div className="absolute inset-0 bg-white/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </motion.div>
      </div>

      {/* Bottom Scroll Indicator & Accent Line */}
      <div className="relative z-10 container mx-auto flex flex-col items-center">
        <motion.div
          animate={{ y: [0, 6, 0], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-1.5 text-xs text-[#C89A3D] font-mono cursor-pointer"
          onClick={() => {
            const el = document.getElementById("galaxy-universe-section");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <span>{lang === "hi" ? "नीचे स्क्रॉल करें" : "SCROLL TO DISCOVER"}</span>
          <ArrowDown className="size-3.5" />
        </motion.div>

        <div className="w-full max-w-xs h-px mt-6 bg-gradient-to-r from-transparent via-[#C89A3D]/40 to-transparent" />
      </div>
    </section>
  );
}
