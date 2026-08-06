import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Highlighter, Edit3, Bookmark, Quote, Copy, Trash2, FileText, ChevronRight, Sparkles, BookOpen, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { SavedHighlight } from "./StoryTextSelectionToolbar";
import { useI18nStore } from "@/lib/i18n";

interface StoryHighlightPanelProps {
  storyId: string;
  storyTitle: string;
  authorName: string;
  visible: boolean;
}

const HIGHLIGHT_COLORS = [
  { name: "Gold", bg: "#FEF08A", text: "#854D0E", label: "Gold Yellow" },
  { name: "Red", bg: "#FCA5A5", text: "#7F1D1D", label: "Crimson Red" },
  { name: "Emerald", bg: "#BBF7D0", text: "#166534", label: "Emerald Green" },
  { name: "Indigo", bg: "#C7D2FE", text: "#1E1B4B", label: "Sky Indigo" },
  { name: "Pink", bg: "#FBCFE8", text: "#9D174D", label: "Rose Pink" },
];

export function StoryHighlightPanel({
  storyId,
  storyTitle,
  authorName,
  visible,
}: StoryHighlightPanelProps) {
  const lang = useI18nStore((s) => s.lang);
  const isHindi = lang === "hi";

  const [savedHighlights, setSavedHighlights] = useState<SavedHighlight[]>([]);
  const [activeSelectionText, setActiveSelectionText] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const storageKey = `isp_highlights_${storyId}`;

  // Load persistent highlights from localStorage
  const loadHighlights = () => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setSavedHighlights(JSON.parse(stored));
      } else {
        setSavedHighlights([]);
      }
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    loadHighlights();

    const interval = setInterval(loadHighlights, 1000);
    return () => clearInterval(interval);
  }, [storageKey]);

  // Listen for current active text selection on page
  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) {
        const txt = sel.toString().trim();
        if (txt.length > 2) {
          setActiveSelectionText(txt);
          return;
        }
      }
      setActiveSelectionText("");
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  const saveSelectedTextWithColor = (colorBg: string) => {
    if (!activeSelectionText) return;
    const newHighlight: SavedHighlight = {
      id: `hl-${Date.now()}`,
      text: activeSelectionText,
      color: colorBg,
      createdAt: Date.now(),
    };

    const updated = [newHighlight, ...savedHighlights];
    setSavedHighlights(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      /* ignore */
    }

    toast.success(isHindi ? "हाइलाइट सहेजा गया और लागू किया गया" : "Highlight saved & applied to text", {
      description: `"${activeSelectionText.slice(0, 35)}..."`,
    });

    setActiveSelectionText("");
    window.getSelection()?.removeAllRanges();
  };

  const handleCardClick = (item: SavedHighlight) => {
    // Clear selection so floating toolbar does not trigger at old coordinates
    window.getSelection()?.removeAllRanges();

    // Look for matching <mark> element in story text
    const marks = Array.from(document.querySelectorAll("mark"));
    const matchingMark = marks.find(
      (m) => m.textContent?.includes(item.text) || item.text.includes(m.textContent || "")
    );

    if (matchingMark) {
      // Smooth scroll directly to the highlighted text paragraph
      matchingMark.scrollIntoView({ behavior: "smooth", block: "center" });

      // Pulse ring animation so reader immediately sees the text
      matchingMark.classList.add("ring-4", "ring-[#D4AF37]", "ring-offset-2", "ring-offset-[#1A1816]");
      setTimeout(() => {
        matchingMark.classList.remove("ring-4", "ring-[#D4AF37]", "ring-offset-2", "ring-offset-[#1A1816]");
      }, 1800);
    } else {
      toast.info(`Highlight: "${item.text.slice(0, 30)}..."`, {
        description: item.note ? `Note: ${item.note}` : undefined,
      });
    }
  };

  const removeHighlight = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = savedHighlights.filter((h) => h.id !== id);
    setSavedHighlights(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      /* ignore */
    }
    toast.success(isHindi ? "हाइलाइट हटाया गया" : "Highlight removed");
  };

  const clearAllHighlights = () => {
    setSavedHighlights([]);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    toast.success(isHindi ? "सभी टिप्पणियां हटाई गईं" : "All reader notes cleared");
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 30 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="hidden 2xl:block fixed right-8 top-28 z-40 w-[300px] pointer-events-auto"
          aria-label="Reader Highlights & Annotations Panel"
        >
          <div className="bg-[#1A1816]/95 backdrop-blur-2xl border border-[#D4AF37]/30 rounded-2xl p-4 shadow-2xl shadow-black/80 text-white space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#FAF7F2]/10">
              <div className="flex items-center gap-2">
                <Highlighter className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#FAF7F2]/90">
                  {isHindi ? "पाठक हाइलाइट्स" : "Reader Highlights"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold">
                  {savedHighlights.length} {isHindi ? "सहेजे गए" : "Saved"}
                </span>
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="p-1 rounded-lg text-white/60 hover:text-white cursor-pointer"
                >
                  <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>

            {!collapsed && (
              <>
                {/* Active Selection Quick-Highlight Box */}
                {activeSelectionText ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 rounded-xl bg-gradient-to-br from-[#2A231C] to-[#1A1816] border-2 border-[#D4AF37] shadow-lg space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> {isHindi ? "चयनित पाठ तैयार" : "Selected Text Ready"}
                      </span>
                    </div>

                    <p className="text-xs italic font-serif text-white/90 line-clamp-2 bg-black/40 p-2 rounded-lg border border-white/10">
                      “{activeSelectionText}”
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-white/60">{isHindi ? "रंग चुनें:" : "Choose Color:"}</span>
                      <div className="flex items-center gap-1.5">
                        {HIGHLIGHT_COLORS.map((c) => (
                          <button
                            key={c.name}
                            onClick={() => saveSelectedTextWithColor(c.bg)}
                            className="w-5.5 h-5.5 rounded-full border border-white/30 hover:scale-125 transition-transform cursor-pointer shadow-md"
                            style={{ backgroundColor: c.bg }}
                            title={`Highlight in ${c.label}`}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* Instructions */
                  <div className="p-3 rounded-xl bg-[#24201D] border border-white/10 text-[11px] text-[#FAF7F2]/70 leading-relaxed space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-[#D4AF37]">
                      <Sparkles className="w-3 h-3" /> {isHindi ? "कहानी पाठ चुनें" : "Select Story Text"}
                    </div>
                    <p>
                      {isHindi
                        ? "पाठ पर जाने के लिए स्क्रीन या कार्ड पर किसी भी हाइलाइट किए गए पाठ पर क्लिक करें!"
                        : "Click any highlighted text on screen or card below to jump to text!"}
                    </p>
                  </div>
                )}

                {/* Highlight List */}
                <div className="max-h-[42vh] overflow-y-auto space-y-2.5 pr-1">
                  {savedHighlights.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#FAF7F2]/40 italic border border-dashed border-white/10 rounded-xl">
                      {isHindi
                        ? "अभी तक कोई पाठ हाइलाइट नहीं किया गया है। टिप्पणी सहेजने के लिए किसी भी पैराग्राफ को चुनें!"
                        : "No text highlighted yet. Select any story paragraph to save notes!"}
                    </div>
                  ) : (
                    savedHighlights.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => handleCardClick(item)}
                        className="p-3 rounded-xl bg-[#24201D] border border-white/10 space-y-1.5 group relative hover:border-[#D4AF37] transition-all cursor-pointer shadow-md"
                      >
                        <div
                          className="text-xs italic font-serif leading-snug line-clamp-3 p-2 rounded-lg font-medium shadow-inner"
                          style={{ backgroundColor: item.color, color: "#1A1816" }}
                        >
                          “{item.text}”
                        </div>

                        {item.note && (
                          <div className="text-[11px] text-[#FAF7F2]/80 font-sans flex items-start gap-1 pt-1">
                            <Edit3 className="w-3 h-3 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{item.note}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] text-[#FAF7F2]/50">
                          <span className="flex items-center gap-1 text-[#D4AF37]">
                            <ExternalLink className="w-2.5 h-2.5" /> {isHindi ? "पाठ पर जाएं" : "Scroll to text"}
                          </span>
                          <button
                            onClick={(e) => removeHighlight(e, item.id)}
                            className="p-1 text-red-400 hover:text-red-300 opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Remove highlight"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Bottom Actions */}
                {savedHighlights.length > 0 && (
                  <div className="pt-2 border-t border-[#FAF7F2]/10 flex items-center justify-between">
                    <button
                      onClick={clearAllHighlights}
                      className="text-[10px] font-semibold text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> {isHindi ? "सभी टिप्पणियां हटाएं" : "Clear All Notes"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
