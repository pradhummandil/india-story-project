import { motion } from "framer-motion";
import { Quote, Sparkles } from "lucide-react";
import { useI18nStore } from "@/lib/i18n";

interface StoryPullQuoteProps {
  quote: string;
  author?: string;
  context?: string;
}

export function StoryPullQuote({ quote, author, context }: StoryPullQuoteProps) {
  const lang = useI18nStore((s) => s.lang);
  const isHindi = lang === "hi";

  // Translate quote text if language is set to Hindi
  let displayQuote = quote;
  if (isHindi) {
    if (quote.includes("Every tradition is a living conversation")) {
      displayQuote = "हर परंपरा हमारे पूर्वजों और आने वाली पीढ़ियों के बीच एक जीवंत संवाद है।";
    } else if (quote.includes("reservoir of wisdom")) {
      displayQuote = "ग्रामीण भारत के दिल में ज्ञान का एक ऐसा भंडार छिपा है जो सतत नवाचार को प्रेरित करता रहता है।";
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="my-14 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1F1C18] via-[#2A1D1A] to-[#1F1C18] p-8 md:p-14 border border-[#FAF7F2]/15 shadow-2xl shadow-black/50 text-[#FAF7F2]"
    >
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#D32F2F]/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#D4AF37]/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Decorative Quote Icon Background watermark */}
      <Quote className="absolute -top-4 -left-4 w-40 h-40 text-[#D4AF37]/10 pointer-events-none transform -rotate-12" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#FDE68A] text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> {isHindi ? "मुख्य विचार" : "Key Reflection"}
        </div>

        <blockquote className="text-2xl md:text-4xl lg:text-5xl font-serif font-bold italic leading-relaxed text-[#FAF7F2] drop-shadow-md">
          “{displayQuote}”
        </blockquote>

        {(author || context) && (
          <div className="pt-4 flex flex-col items-center justify-center gap-1">
            {author && (
              <cite className="not-italic text-base md:text-lg font-semibold tracking-wide text-[#D4AF37]">
                — {author}
              </cite>
            )}
            {context && (
              <span className="text-xs md:text-sm text-[#FAF7F2]/70 font-light italic">
                {context}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
