import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, X, Radio } from "lucide-react";

type AnnouncementItem = {
  id: string;
  text: string;
  region?: string;
  slug?: string;
};

const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: "1",
    text: "Rajasthan: Desert rainwater harvesting techniques revive 40 ancient stepwells",
    region: "Rajasthan",
    slug: "rajasthan-stepwells-revival",
  },
  {
    id: "2",
    text: "West Bengal: Patachitra scroll painters digitize 400-year-old folklore archives",
    region: "West Bengal",
    slug: "patachitra-digital-archives",
  },
  {
    id: "3",
    text: "Kerala: Solar community grid powers remote Wayanad tribal settlements",
    region: "Kerala",
    slug: "wayanad-solar-grid",
  },
  {
    id: "4",
    text: "Ladakh: Zero-energy ice stupas secure spring irrigation for Himalayan farmers",
    region: "Ladakh",
    slug: "ladakh-ice-stupas-irrigation",
  },
];

export function TopAnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % DEFAULT_ANNOUNCEMENTS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  if (!visible) return null;

  const current = DEFAULT_ANNOUNCEMENTS[index];

  return (
    <div className="w-full bg-gradient-to-r from-[#120D08] via-[#1C140A] to-[#120D08] border-b border-[#C8A96A]/25 text-[#EFE3C3] text-[11px] font-sans py-2 px-4 select-none relative z-50 shadow-md">
      <div className="container mx-auto flex items-center justify-between gap-4">
        {/* Left Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="relative flex size-2">
            <span className="absolute inset-0 rounded-full bg-[#C8A96A] animate-ping" />
            <span className="relative rounded-full bg-[#C8A96A] size-2" />
          </span>
          <span className="font-extrabold uppercase tracking-widest text-[9.5px] text-[#C8A96A] flex items-center gap-1">
            <Radio className="size-3 text-[#C8A96A] animate-pulse" />
            Live Dispatches
          </span>
        </div>

        {/* Center Live Ticker Content */}
        <div className="flex-1 overflow-hidden h-5 relative flex items-center justify-center text-center px-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2 truncate text-white/90 font-medium"
            >
              {current.region && (
                <span className="px-1.5 py-0.5 rounded bg-[#C8A96A]/15 text-[#C8A96A] border border-[#C8A96A]/30 text-[9px] font-extrabold uppercase shrink-0">
                  {current.region}
                </span>
              )}
              <span className="truncate text-xs">{current.text}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right CTA / Action */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/stories"
            className="hidden sm:flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#C8A96A] hover:text-white transition-colors"
          >
            Explore Stories
            <ArrowRight className="size-3" />
          </Link>
          <button
            onClick={() => setVisible(false)}
            className="text-white/40 hover:text-white transition-colors p-0.5 rounded cursor-pointer"
            aria-label="Dismiss announcement bar"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
