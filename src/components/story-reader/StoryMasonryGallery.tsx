import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, X, ChevronLeft, ChevronRight, Camera, Sparkles } from "lucide-react";
import { useI18nStore } from "@/lib/i18n";

export interface GalleryItem {
  url: string;
  caption?: string;
  source?: string;
}

interface StoryMasonryGalleryProps {
  images: GalleryItem[];
}

export function StoryMasonryGallery({ images }: StoryMasonryGalleryProps) {
  const lang = useI18nStore((s) => s.lang);
  const isHindi = lang === "hi";
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7 }}
      className="my-14 space-y-6"
    >
      <div className="flex items-center gap-3 pb-3 border-b border-[#FAF7F2]/10">
        <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
          <Camera className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-lg font-serif font-bold text-white">
            {isHindi ? "दृश्य पुरालेख और छवि गैलरी" : "Visual Archive & Image Gallery"}
          </h3>
          <p className="text-xs text-[#FAF7F2]/60">
            {isHindi ? "उच्च गुणवत्ता वाले वृत्तचित्र फोटो संग्रह" : "High-resolution photographic documentation"}
          </p>
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {images.map((img, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            onClick={() => setLightboxIdx(idx)}
            className="relative cursor-pointer overflow-hidden rounded-2xl bg-[#1A1816] border border-[#FAF7F2]/15 group break-inside-avoid shadow-lg"
          >
            <img
              src={img.url}
              alt={img.caption || `Gallery Image ${idx + 1}`}
              className="w-full h-auto object-cover group-hover:brightness-110 transition-all duration-500"
              loading="lazy"
            />

            {/* Hover overlay with zoom icon */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              {img.caption && (
                <p className="text-xs text-white font-medium line-clamp-2">{img.caption}</p>
              )}
              <div className="mt-2 flex items-center justify-between text-[10px] text-[#D4AF37] font-semibold uppercase tracking-wider">
                <span>{isHindi ? "विस्तार के लिए क्लिक करें" : "Click to expand"}</span>
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12"
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxIdx(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Previous image */}
            <button
              onClick={() =>
                setLightboxIdx((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : 0))
              }
              className="absolute left-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next image */}
            <button
              onClick={() =>
                setLightboxIdx((prev) => (prev !== null ? (prev + 1) % images.length : 0))
              }
              className="absolute right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Active Image Container */}
            <div className="max-w-5xl max-h-[85vh] flex flex-col items-center justify-center space-y-4">
              <motion.img
                key={lightboxIdx}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
                src={images[lightboxIdx].url}
                alt={images[lightboxIdx].caption || "Enlarged photo"}
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl border border-white/10"
              />

              {images[lightboxIdx].caption && (
                <div className="text-center max-w-2xl bg-black/60 px-6 py-3 rounded-xl border border-white/10">
                  <p className="text-sm font-medium text-white">{images[lightboxIdx].caption}</p>
                  {images[lightboxIdx].source && (
                    <span className="text-xs text-[#D4AF37] italic mt-1 block">
                      Source: {images[lightboxIdx].source}
                    </span>
                  )}
                </div>
              )}

              <div className="text-xs text-white/50 font-mono">
                {lightboxIdx + 1} of {images.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
