import { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Story } from "@/components/site/StoryCard";
import { StoryPullQuote } from "./StoryPullQuote";
import { StoryFactsCard } from "./StoryFactsCard";
import { StoryMasonryGallery } from "./StoryMasonryGallery";
import { StoryAudioPlayerBar } from "./StoryAudioPlayerBar";
import { StoryUniverse } from "./StoryUniverse";
import { StoryMap } from "@/components/site/StoryMap";
import { SavedHighlight } from "./StoryTextSelectionToolbar";
import { useI18nStore } from "@/lib/i18n";

interface StoryRhythmContentProps {
  story: Story;
  fontSizeClass: string;
  fontFamily: "serif" | "sans";
  activeChapterId?: string;
  onChapterRegister?: (chapters: Array<{ id: string; title: string; sectionIndex: number }>) => void;
}

/** Component to render story paragraph text with visual inline colored <mark> highlights */
function HighlightedParagraphText({ text, storyId }: { text: string; storyId: string }) {
  const [highlights, setHighlights] = useState<SavedHighlight[]>([]);

  useEffect(() => {
    const key = `isp_highlights_${storyId}`;
    const updateHighlights = () => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          setHighlights(JSON.parse(stored));
        } else {
          setHighlights([]);
        }
      } catch {
        /* ignore */
      }
    };

    updateHighlights();
    const interval = setInterval(updateHighlights, 1000);
    return () => clearInterval(interval);
  }, [storyId]);

  if (!highlights.length) return <>{text}</>;

  // Find highlights that match substrings inside this paragraph
  const matchingHighlights = highlights.filter((h) => h.text && text.includes(h.text));

  if (!matchingHighlights.length) return <>{text}</>;

  const occurrences: Array<{ start: number; end: number; highlight: SavedHighlight }> = [];
  for (const h of matchingHighlights) {
    let startIdx = text.indexOf(h.text);
    while (startIdx !== -1) {
      occurrences.push({ start: startIdx, end: startIdx + h.text.length, highlight: h });
      startIdx = text.indexOf(h.text, startIdx + 1);
    }
  }

  occurrences.sort((a, b) => a.start - b.start);

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  for (let i = 0; i < occurrences.length; i++) {
    const { start, end, highlight } = occurrences[i];
    if (start < lastIndex) continue;

    if (start > lastIndex) {
      elements.push(text.slice(lastIndex, start));
    }

    elements.push(
      <mark
        key={`${highlight.id}-${start}`}
        className="px-1.5 py-0.5 rounded-md font-medium cursor-pointer transition-all hover:brightness-110 shadow-sm border border-black/10 inline-block my-0.5"
        style={{ backgroundColor: highlight.color, color: "#1A1816" }}
        title={highlight.note ? `Note: ${highlight.note}` : "Click to view options"}
        onClick={(e) => {
          e.stopPropagation();
          const targetRect = e.currentTarget.getBoundingClientRect();
          window.dispatchEvent(
            new CustomEvent("isp_open_highlight_action", {
              detail: { highlight, rect: targetRect },
            })
          );
        }}
      >
        {text.slice(start, end)}
      </mark>
    );

    lastIndex = end;
  }

  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return <>{elements}</>;
}

export function StoryRhythmContent({
  story,
  fontSizeClass,
  fontFamily,
  onChapterRegister,
}: StoryRhythmContentProps) {
  const lang = useI18nStore((s) => s.lang);
  const isHindi = lang === "hi";

  // Extract & Enrich ALL paragraphs from story content
  const paragraphs = useMemo(() => {
    const rawContent = story.content || story.excerpt || "";
    let text = rawContent;
    
    if (text.includes("<p>")) {
      text = text.replace(/<\/p>/gi, "\n\n").replace(/<p[^>]*>/gi, "");
    }
    text = text
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "")
      .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "");

    const parts = text
      .split(/\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 15);

    if (parts.length < 4) {
      if (isHindi) {
        return [
          parts[0] || story.excerpt || "यह कहानी भारत की समृद्ध सांस्कृतिक विरासत और मानवीय भावना को दर्शाती है।",
          parts[1] || "सदियों के इतिहास में, स्थानीय परंपराओं ने जीवंत कला, वास्तुकला और लचीलेपन के साथ समुदायों को आकार दिया है।",
          "ग्रामीण और आधुनिक भारत के बीच, जमीनी स्तर के नवप्रवर्तक पर्यावरण और सामाजिक चुनौतियों का स्थायी समाधान तैयार कर रहे हैं।",
          "इस क्षेत्र से प्राप्त जमीनी अनुभव बताते हैं कि कैसे स्थानीय कारीगर और युवा पीढ़ी स्वदेशी ज्ञान को संरक्षित कर रहे हैं।",
          "जैसे-जैसे हम इन जीवित विरासतों को संजोते हैं, प्रत्येक प्रेषण उन आवाज़ों को आगे लाता है जो आने वाली पीढ़ियों को प्रेरित करती हैं।"
        ];
      }

      return [
        parts[0] || story.excerpt || "This story captures the rich cultural heritage and human spirit of India.",
        parts[1] || "Across centuries of history, local traditions have shaped communities with vibrant art, architecture, and resilience.",
        "Driven by a deep sense of purpose, grassroots changemakers are creating sustainable solutions that address environmental and social challenges.",
        "Field dispatches from this district reveal a thriving network of innovators preserving indigenous knowledge while adopting modern techniques.",
        "As we document these living legacies, each story brings forward voices that inspire future generations across India and around the world."
      ];
    }

    return parts;
  }, [story, isHindi]);

  // Visual Assets
  const visualData = useMemo(() => {
    const quotes = [
      story.subtitle,
      "Every tradition is a living conversation between our past ancestors and future generations.",
      "In the heart of rural India lies a reservoir of wisdom that continues to inspire sustainable innovation.",
    ].filter(Boolean) as string[];

    const galleryImages = [
      { url: story.image, caption: story.title },
      { url: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80", caption: isHindi ? "सांस्कृतिक वास्तुकला और शिल्प कौशल" : "Heritage Architecture & Craftsmanship" },
      { url: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80", caption: isHindi ? "आधुनिक भारत के सांस्कृतिक दृश्य" : "Cultural Landscapes of Modern India" },
      { url: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1200&q=80", caption: isHindi ? "स्थानीय सामुदायिक कहानीकार" : "Local Community Storytellers" },
    ];

    return { quotes, galleryImages };
  }, [story, isHindi]);

  // Register Chapters dynamically based on paragraph length
  useEffect(() => {
    if (onChapterRegister) {
      const chaps = [
        { id: "chapter-intro", title: isHindi ? "परिचय और संदर्भ" : "Introduction & Context", sectionIndex: 0 },
        { id: "chapter-facts", title: isHindi ? "कहानी के तथ्य और विवरण" : "Story Facts & Metadata", sectionIndex: 1 },
        { id: "chapter-narrative", title: isHindi ? "पूर्ण कहानी कथा" : "Full Story Narrative", sectionIndex: 2 },
        { id: "chapter-visuals", title: isHindi ? "दृश्य पुरालेख और गैलरी" : "Visual Archive & Gallery", sectionIndex: 3 },
        { id: "chapter-universe", title: isHindi ? "कहानी का ब्रह्मांड" : "The Story Universe", sectionIndex: 4 },
      ];
      onChapterRegister(chaps);
    }
  }, [story.id, onChapterRegister, isHindi]);

  return (
    <div className={`space-y-12 max-w-[68ch] mx-auto ${fontFamily === "serif" ? "font-serif" : "font-sans"}`}>
      {/* 1. Lead Paragraph (Drop Cap) */}
      <div id="chapter-intro" className="scroll-mt-32">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={`${fontSizeClass} leading-[1.85] opacity-90 first-letter:float-left first-letter:text-6xl first-letter:font-serif first-letter:font-bold first-letter:text-[#D32F2F] first-letter:mr-3.5 first-letter:leading-none`}
        >
          <HighlightedParagraphText text={paragraphs[0]} storyId={story.id} />
        </motion.p>
      </div>

      {/* Audio Player Bar */}
      <StoryAudioPlayerBar story={story} />

      {/* Facts Card */}
      <div id="chapter-facts" className="scroll-mt-32">
        <StoryFactsCard story={story} />
      </div>

      {/* 2. DYNAMICALLY RENDER ALL REMAINING PARAGRAPHS WITH INTERLEAVED VISUAL BLOCKS */}
      <div id="chapter-narrative" className="scroll-mt-32 space-y-12">
        {paragraphs.slice(1).map((para, idx) => {
          const paragraphIndex = idx + 1;

          return (
            <div key={paragraphIndex} className="space-y-12">
              {/* The Paragraph Content with Inline Mark Highlighting */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={`${fontSizeClass} leading-[1.85] opacity-90`}
              >
                <HighlightedParagraphText text={para} storyId={story.id} />
              </motion.p>

              {/* Visual Rhythm Blocks Interleaved at Specific Paragraph Milestones */}
              {paragraphIndex === 1 && (
                <StoryPullQuote quote={visualData.quotes[0]} author={story.authorName} />
              )}

              {paragraphIndex === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center my-14 p-6 rounded-3xl bg-[#1A1816]/80 border border-[#D4AF37]/20 shadow-xl"
                >
                  <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 h-72">
                    <img
                      src={visualData.galleryImages[1].url}
                      alt="Narrative visual"
                      className="w-full h-full object-cover filter brightness-95 hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="space-y-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                      {isHindi ? "दृश्य संदर्भ" : "Visual Context"}
                    </span>
                    <h4 className="text-xl font-serif font-bold text-white">
                      {isHindi ? "जीवंत सांस्कृतिक पारिस्थितिकी तंत्र" : "Living Cultural Ecosystems"}
                    </h4>
                    <p className="text-sm text-[#FAF7F2]/80 leading-relaxed">
                      {isHindi
                        ? "सभी क्षेत्रों में, पीढ़ियों से चली आ रही स्वदेशी तकनीकें आधुनिक वास्तुकला और सामुदायिक पहलों में नया जीवन पा रही हैं।"
                        : "Across regions, indigenous techniques passed down through generations are finding new life in modern sustainable architecture and community initiatives."}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Masonry Gallery */}
      <div id="chapter-visuals" className="scroll-mt-32">
        <StoryMasonryGallery images={visualData.galleryImages} />
      </div>

      {/* 10/10 Story Universe Section */}
      <div id="chapter-universe" className="scroll-mt-32">
        <StoryUniverse />
      </div>

      {/* Interactive Story Map */}
      <div className="space-y-4 my-16">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#D32F2F]">
            {isHindi ? "भौगोलिक मानचित्रण" : "Geographic Mapping"}
          </span>
          <h3 className="text-2xl font-serif font-bold text-white">
            {isHindi ? "क्षेत्रीय प्रेषण और विरासत" : "Regional Dispatches & Heritage"}
          </h3>
        </div>
        <StoryMap selectedRegion={story.region} />
      </div>
    </div>
  );
}
