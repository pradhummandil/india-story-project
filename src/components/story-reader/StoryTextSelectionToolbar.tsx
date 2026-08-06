import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Highlighter, Share2, BookOpen, Quote, Sparkles, Copy, Check, X, FileText, Bookmark, Languages, Edit3, Trash2 } from "lucide-react";
import { toast } from "sonner";

export interface SavedHighlight {
  id: string;
  text: string;
  color: string;
  note?: string;
  createdAt: number;
}

interface StoryTextSelectionToolbarProps {
  storyId: string;
  storyTitle: string;
  authorName: string;
  onBookmarkToggle?: () => void;
  isBookmarked?: boolean;
}

const HIGHLIGHT_COLORS = [
  { name: "Gold", bg: "#FEF08A", text: "#854D0E", label: "Gold Yellow" },
  { name: "Red", bg: "#FCA5A5", text: "#7F1D1D", label: "Crimson Red" },
  { name: "Emerald", bg: "#BBF7D0", text: "#166534", label: "Emerald Green" },
  { name: "Indigo", bg: "#C7D2FE", text: "#1E1B4B", label: "Sky Indigo" },
  { name: "Pink", bg: "#FBCFE8", text: "#9D174D", label: "Rose Pink" },
];

export function StoryTextSelectionToolbar({
  storyId,
  storyTitle,
  authorName,
  onBookmarkToggle,
  isBookmarked = false,
}: StoryTextSelectionToolbarProps) {
  const [selectedText, setSelectedText] = useState("");
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [savedHighlights, setSavedHighlights] = useState<SavedHighlight[]>([]);
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);

  // Modals
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showDictionaryModal, setShowDictionaryModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState("");

  const storageKey = `isp_highlights_${storyId}`;

  // Load saved highlights
  const loadSavedHighlights = () => {
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
    loadSavedHighlights();
  }, [storageKey]);

  // Listen for custom event to open action toolbar for an existing highlight
  useEffect(() => {
    const handleOpenHighlightAction = (e: Event) => {
      const customEvent = e as CustomEvent<{ highlight: SavedHighlight; rect: DOMRect }>;
      const { highlight, rect } = customEvent.detail;

      if (highlight && rect) {
        setSelectedText(highlight.text);
        setActiveHighlightId(highlight.id);
        setNoteText(highlight.note || "");

        // Absolute document coordinates (pinned to exact page location)
        const x = rect.left + rect.width / 2 + window.scrollX;
        const y = rect.top + window.scrollY - 12;

        setPosition({ x, y });
      }
    };

    window.addEventListener("isp_open_highlight_action", handleOpenHighlightAction);
    return () => window.removeEventListener("isp_open_highlight_action", handleOpenHighlightAction);
  }, []);

  // Selection detection (SCOPED strictly to story narrative text)
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        if (!activeHighlightId) {
          setPosition(null);
          setSelectedText("");
        }
        return;
      }

      // Ensure selection is strictly inside story narrative text
      const anchorNode = selection.anchorNode;
      const parentEl =
        anchorNode?.nodeType === Node.ELEMENT_NODE
          ? (anchorNode as HTMLElement)
          : anchorNode?.parentElement;

      const isInsideStoryContent = parentEl?.closest("#chapter-narrative") || parentEl?.closest("#chapter-intro");

      if (!isInsideStoryContent) {
        setPosition(null);
        return;
      }

      const text = selection.toString().trim();
      if (text.length > 2) {
        setActiveHighlightId(null);
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectedText(text);

        // Absolute document coordinates (pinned directly over selected text)
        const x = rect.left + rect.width / 2 + window.scrollX;
        const y = rect.top + window.scrollY - 12;

        setPosition({ x, y });
      }
    };

    document.addEventListener("mouseup", handleSelection);
    return () => {
      document.removeEventListener("mouseup", handleSelection);
    };
  }, [activeHighlightId]);

  const saveHighlightToStorage = (colorBg: string, note?: string) => {
    if (!selectedText) return;

    let updated: SavedHighlight[];
    if (activeHighlightId) {
      // Update existing highlight
      updated = savedHighlights.map((h) =>
        h.id === activeHighlightId ? { ...h, color: colorBg, note: note !== undefined ? note : h.note } : h
      );
      toast.success("Highlight updated");
    } else {
      // Create new highlight
      const newHighlight: SavedHighlight = {
        id: `hl-${Date.now()}`,
        text: selectedText,
        color: colorBg,
        note: note || undefined,
        createdAt: Date.now(),
      };
      updated = [newHighlight, ...savedHighlights];
      toast.success("Highlight saved to text & reader panel", {
        description: `"${selectedText.slice(0, 35)}..."`,
      });
    }

    setSavedHighlights(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      /* ignore */
    }

    setPosition(null);
    setActiveHighlightId(null);
    window.getSelection()?.removeAllRanges();
  };

  const removeHighlight = () => {
    if (!activeHighlightId) return;
    const updated = savedHighlights.filter((h) => h.id !== activeHighlightId);
    setSavedHighlights(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      /* ignore */
    }
    toast.success("Highlight removed");
    setPosition(null);
    setActiveHighlightId(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`“${selectedText}” — ${authorName}`);
    toast.success("Text copied with attribution!");
    setPosition(null);
  };

  const handleTranslate = () => {
    toast.info("Opening Dictionary...", {
      description: `Targeting "${selectedText.slice(0, 30)}..."`,
    });
    setShowDictionaryModal(true);
    setPosition(null);
  };

  return (
    <>
      {/* Floating Selection Menu Toolbar (Absolute Document Pinned directly over selected text) */}
      <AnimatePresence>
        {position && selectedText && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              transform: "translate(-50%, -100%)",
            }}
            className="absolute z-[99999] bg-[#1A1816]/95 backdrop-blur-xl border-2 border-[#D4AF37] rounded-full p-2 px-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.95)] flex items-center gap-2 pointer-events-auto text-white select-none"
          >
            {/* Pointer Caret Arrow */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-[#D4AF37]" />

            {/* Color Bullet Controls */}
            <div className="flex items-center gap-1.5 pr-2 border-r border-white/20">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    saveHighlightToStorage(c.bg);
                  }}
                  className="w-5.5 h-5.5 rounded-full border-2 border-white/30 hover:scale-125 transition-transform shadow-md cursor-pointer"
                  style={{ backgroundColor: c.bg }}
                  title={`Highlight in ${c.label}`}
                />
              ))}
            </div>

            {/* Note attachment */}
            <button
              onClick={() => setShowNoteModal(true)}
              className="p-1.5 px-2 rounded-full hover:bg-white/10 text-xs font-semibold flex items-center gap-1 text-[#D4AF37] cursor-pointer"
              title="Add / Edit Note"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Note</span>
            </button>

            {/* Copy */}
            <button
              onClick={handleCopy}
              className="p-1.5 px-2 rounded-full hover:bg-white/10 text-xs font-semibold flex items-center gap-1 text-white cursor-pointer"
              title="Copy snippet"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>

            {/* Quote Card */}
            <button
              onClick={() => {
                setShowQuoteModal(true);
                setPosition(null);
              }}
              className="p-1.5 px-2 rounded-full hover:bg-white/10 text-xs font-semibold flex items-center gap-1 text-[#F87171] cursor-pointer"
              title="Generate Quote Card"
            >
              <Quote className="w-3.5 h-3.5" />
              <span>Quote</span>
            </button>

            {/* Dictionary & Translate */}
            <button
              onClick={handleTranslate}
              className="p-1.5 px-2 rounded-full hover:bg-white/10 text-xs font-semibold flex items-center gap-1 text-[#6EE7B7] cursor-pointer"
              title="Define & Translate"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Define</span>
            </button>

            {/* Delete Highlight (if active) */}
            {activeHighlightId && (
              <button
                onClick={removeHighlight}
                className="p-1.5 px-2 rounded-full hover:bg-red-500/20 text-xs font-semibold flex items-center gap-1 text-red-400 cursor-pointer"
                title="Remove Highlight"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}

            {/* Close Selection Toolbar */}
            <button
              onClick={() => {
                setPosition(null);
                setActiveHighlightId(null);
                window.getSelection()?.removeAllRanges();
              }}
              className="p-1 rounded-full text-white/50 hover:text-white ml-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Note Attachment Modal */}
      <AnimatePresence>
        {showNoteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1A1816] border border-[#D4AF37]/30 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-white relative"
            >
              <button
                onClick={() => setShowNoteModal(false)}
                className="absolute top-4 right-4 p-2 text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                <Edit3 className="w-4 h-4" /> Add Reader Note to Highlight
              </div>

              <blockquote className="p-3 rounded-xl bg-[#24201D] border-l-2 border-[#D4AF37] text-xs italic text-white/80">
                “{selectedText}”
              </blockquote>

              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Type your personal reflections or research notes..."
                className="w-full h-28 p-3 rounded-xl bg-[#0F0E0D] border border-white/15 text-white text-xs outline-none focus:border-[#D4AF37] resize-none"
              />

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    saveHighlightToStorage("#FEF08A", noteText);
                    setShowNoteModal(false);
                    setNoteText("");
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#D32F2F] text-[#FAF7F2] font-semibold text-xs hover:bg-[#B91C1C] transition-all cursor-pointer"
                >
                  Save Highlight & Note
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quote Generator Modal */}
      <AnimatePresence>
        {showQuoteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1A1816] border border-[#FAF7F2]/20 rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-2xl relative text-white"
            >
              <button
                onClick={() => setShowQuoteModal(false)}
                className="absolute top-4 right-4 p-2 text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> Shareable Dispatch Quote Card
              </div>

              <div className="p-8 rounded-2xl bg-gradient-to-br from-[#261E1A] via-[#1A1816] to-[#2D1B18] border border-[#D4AF37]/30 text-center space-y-4 shadow-xl">
                <Quote className="w-10 h-10 text-[#D4AF37]/40 mx-auto" />
                <p className="text-xl font-serif font-bold text-white italic">“{selectedText}”</p>
                <div className="text-xs text-[#D4AF37] font-semibold">— {authorName}</div>
                <div className="text-[10px] text-white/50 uppercase tracking-widest">
                  India Story Project • {storyTitle}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`“${selectedText}” — ${authorName}, "${storyTitle}"`);
                    toast.success("Quote text copied!");
                    setShowQuoteModal(false);
                  }}
                  className="flex-1 py-3 rounded-xl bg-[#D32F2F] text-white font-semibold text-xs hover:bg-[#B91C1C] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Copy className="w-4 h-4" /> Copy Quote Text
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dictionary / Translate Modal */}
      <AnimatePresence>
        {showDictionaryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1A1816] border border-[#FAF7F2]/20 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative text-white"
            >
              <button
                onClick={() => setShowDictionaryModal(false)}
                className="absolute top-4 right-4 p-2 text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs font-semibold text-[#6EE7B7] uppercase tracking-wider">
                <Languages className="w-4 h-4" /> Contextual Dictionary & Translation
              </div>

              <h4 className="text-lg font-serif font-bold text-[#D4AF37]">"{selectedText}"</h4>

              <div className="p-4 rounded-xl bg-[#24201D] border border-white/10 text-xs leading-relaxed text-white/80 space-y-2">
                <p>
                  <strong>Cultural Significance:</strong> Excerpt from India Story Archive detailing grassroots innovation and historical dispatches.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
