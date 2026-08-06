import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, ChevronUp, ChevronDown, BookOpen, Sparkles } from "lucide-react";
import { useI18nStore } from "@/lib/i18n";

export interface Chapter {
  id: string;
  title: string;
  sectionIndex: number;
}

interface StoryChapterTimelineProps {
  chapters: Chapter[];
  activeChapterId: string;
  scrollProgress: number;
  onSelectChapter: (id: string) => void;
  visible: boolean; // Only true AFTER scrolling past hero!
}

export function StoryChapterTimeline({
  chapters,
  activeChapterId,
  scrollProgress,
  onSelectChapter,
  visible,
}: StoryChapterTimelineProps) {
  const lang = useI18nStore((s) => s.lang);
  const isHindi = lang === "hi";
  const [mobileExpanded, setMobileExpanded] = useState(false);

  if (!chapters || chapters.length === 0 || !visible) return null;

  const activeIndex = chapters.findIndex((c) => c.id === activeChapterId);
  const activeChapter = chapters[activeIndex >= 0 ? activeIndex : 0];

  const getChapterTitle = (title: string) => {
    if (!isHindi) return title;
    if (title.includes("Introduction")) return "परिचय और संदर्भ";
    if (title.includes("Facts") || title.includes("Metadata")) return "कहानी के तथ्य और विवरण";
    if (title.includes("Narrative")) return "पूर्ण कहानी कथा";
    if (title.includes("Visual") || title.includes("Archive")) return "दृश्य पुरालेख और गैलरी";
    if (title.includes("Universe")) return "कहानी का ब्रह्मांड";
    return title;
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Desktop Glass Sidebar (320px width, sticky left, ONLY visible after Hero) */}
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="hidden xl:block fixed left-8 top-28 z-40 w-[320px] pointer-events-auto"
            aria-label="Story Chapter Navigation"
          >
            <div className="bg-[#1A1816]/90 backdrop-blur-2xl border border-[#D4AF37]/25 rounded-2xl p-5 shadow-2xl shadow-black/50 text-white">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#FAF7F2]/10">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#D32F2F]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#FAF7F2]/80">
                    {isHindi ? "कहानी सूचकांक" : "Story Index"}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 font-semibold">
                  {Math.round(scrollProgress)}% {isHindi ? "पढ़ा गया" : "read"}
                </span>
              </div>

              {/* Vertical Timeline Items */}
              <div className="relative pl-4 space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
                {/* Connecting Line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-[#FAF7F2]/10" />

                {/* Active Progress Overlay Line */}
                <div
                  className="absolute left-[7px] top-2 w-0.5 bg-gradient-to-b from-[#D32F2F] via-[#D4AF37] to-[#D32F2F] transition-all duration-300"
                  style={{
                    height: `${Math.min(
                      100,
                      ((activeIndex >= 0 ? activeIndex : 0) / Math.max(1, chapters.length - 1)) * 100
                    )}%`,
                  }}
                />

                {chapters.map((chap, idx) => {
                  const isActive = chap.id === activeChapterId || (activeIndex === -1 && idx === 0);
                  const isPast = idx < activeIndex;

                  return (
                    <button
                      key={chap.id}
                      onClick={() => onSelectChapter(chap.id)}
                      className={`group relative flex items-start gap-3 w-full text-left transition-all duration-300 ${
                        isActive
                          ? "text-white font-semibold scale-[1.02]"
                          : isPast
                          ? "text-[#FAF7F2]/70 hover:text-white"
                          : "text-[#FAF7F2]/40 hover:text-[#FAF7F2]/70"
                      }`}
                    >
                      {/* Active Bullet Node */}
                      <div
                        className={`relative z-10 w-3.5 h-3.5 rounded-full mt-0.5 flex items-center justify-center transition-all duration-300 ${
                          isActive
                            ? "bg-[#D32F2F] ring-4 ring-[#D32F2F]/30 scale-110 shadow-lg shadow-[#D32F2F]/50"
                            : isPast
                            ? "bg-[#D4AF37]"
                            : "bg-[#2A2624] border border-[#FAF7F2]/20"
                        }`}
                      >
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        )}
                      </div>

                      {/* Chapter Title */}
                      <span className="text-xs leading-snug line-clamp-2 transition-colors">
                        {getChapterTitle(chap.title)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.aside>

          {/* Mobile Bottom Floating Chapter Drawer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="xl:hidden fixed bottom-6 left-4 right-4 z-40 pointer-events-auto"
          >
            <div className="bg-[#1A1816]/95 backdrop-blur-2xl border border-[#D4AF37]/30 rounded-full p-2.5 px-4 shadow-2xl flex items-center justify-between text-white">
              <button
                onClick={() => setMobileExpanded(!mobileExpanded)}
                className="flex items-center gap-3 text-left overflow-hidden pr-2 flex-1"
              >
                <div className="w-8 h-8 rounded-full bg-[#D32F2F]/20 border border-[#D32F2F]/40 flex items-center justify-center flex-shrink-0">
                  <List className="w-4 h-4 text-[#D32F2F]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold">
                    {isHindi ? `अध्याय ${activeIndex + 1} कुल ${chapters.length}` : `Chapter ${activeIndex + 1} of ${chapters.length}`}
                  </div>
                  <div className="text-xs font-semibold text-white truncate">
                    {getChapterTitle(activeChapter?.title || "Story Chapters")}
                  </div>
                </div>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded-full border border-[#D4AF37]/20 font-bold">
                  {Math.round(scrollProgress)}%
                </span>
                <button
                  onClick={() => setMobileExpanded(!mobileExpanded)}
                  className="p-1.5 rounded-full bg-white/10 text-white"
                >
                  {mobileExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Expanded Mobile Drawer */}
            <AnimatePresence>
              {mobileExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  className="mt-2 bg-[#1A1816]/98 backdrop-blur-2xl border border-[#D4AF37]/30 rounded-2xl p-4 shadow-2xl max-h-72 overflow-y-auto space-y-2 text-white"
                >
                  {chapters.map((chap, idx) => {
                    const isActive = chap.id === activeChapterId;
                    return (
                      <button
                        key={chap.id}
                        onClick={() => {
                          onSelectChapter(chap.id);
                          setMobileExpanded(false);
                        }}
                        className={`flex items-center gap-3 w-full text-left p-2.5 rounded-xl text-xs transition-all ${
                          isActive
                            ? "bg-[#D32F2F] text-white font-semibold shadow-md shadow-[#D32F2F]/20"
                            : "text-[#FAF7F2]/80 hover:bg-white/10"
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full bg-white/10 text-center leading-5 font-mono text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="truncate flex-1">{getChapterTitle(chap.title)}</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
