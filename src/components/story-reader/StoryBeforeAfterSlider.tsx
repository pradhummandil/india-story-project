import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, Sparkles } from "lucide-react";

interface StoryBeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  caption?: string;
}

export function StoryBeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Historical Archive",
  afterLabel = "Modern Preservation",
  caption = "Drag slider to compare historical dispatch with contemporary restoration.",
}: StoryBeforeAfterSliderProps) {
  const [sliderPos, setSliderPos] = useState(50);
  const isDragging = useRef(false);

  const handleMove = (clientX: number, rect: DOMRect) => {
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7 }}
      className="my-14 space-y-4"
    >
      <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
        <Sparkles className="w-4 h-4" /> Visual Transformation Comparison
      </div>

      <div
        className="relative h-80 md:h-[480px] w-full rounded-3xl overflow-hidden shadow-2xl border border-[#FAF7F2]/15 select-none cursor-ew-resize"
        onMouseDown={() => (isDragging.current = true)}
        onMouseUp={() => (isDragging.current = false)}
        onMouseLeave={() => (isDragging.current = false)}
        onMouseMove={(e) => {
          if (!isDragging.current) return;
          handleMove(e.clientX, e.currentTarget.getBoundingClientRect());
        }}
        onTouchMove={(e) => {
          handleMove(e.touches[0].clientX, e.currentTarget.getBoundingClientRect());
        }}
        onClick={(e) => {
          handleMove(e.clientX, e.currentTarget.getBoundingClientRect());
        }}
      >
        {/* After Image (Background) */}
        <img
          src={afterImage}
          alt={afterLabel}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider border border-white/20">
          {afterLabel}
        </div>

        {/* Before Image (Clipped Foreground) */}
        <div
          className="absolute inset-0 overflow-hidden border-r-2 border-[#D4AF37]"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="absolute inset-0 w-full h-full object-cover max-w-none"
            style={{ width: "100%", height: "100%" }}
          />
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[#D4AF37] text-xs font-semibold uppercase tracking-wider border border-[#D4AF37]/40">
            {beforeLabel}
          </div>
        </div>

        {/* Slider Divider Bar with Drag Handle */}
        <div
          className="absolute top-0 bottom-0 z-20 flex items-center justify-center -ml-4"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="w-8 h-8 rounded-full bg-[#D32F2F] border-2 border-white text-white flex items-center justify-center shadow-2xl ring-4 ring-[#D32F2F]/30 hover:scale-110 transition-transform">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
        </div>
      </div>

      {caption && (
        <p className="text-center text-xs text-[#FAF7F2]/60 italic font-serif">
          {caption}
        </p>
      )}
    </motion.div>
  );
}
