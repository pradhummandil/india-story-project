import React from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, BookOpen } from "lucide-react";
import { useI18nStore } from "@/lib/i18n";
import { stories as fallbackStories } from "@/lib/stories-data";
import { ErrorIllustration } from "./ErrorIllustration";
import { ErrorActions } from "./ErrorActions";

export function NotFoundState() {
  const lang = useI18nStore((s) => s.lang);
  const isHindi = lang === "hi";

  const suggestedStories = fallbackStories.slice(0, 3);

  return (
    <div className="w-full flex flex-col items-center text-center">
      {/* 404 Custom Illustration */}
      <ErrorIllustration type="404" className="w-36 h-36 mb-4" />

      {/* Headline */}
      <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#111111] dark:text-[#F8F6F1] tracking-tight mb-3">
        {isHindi ? "यह अध्याय नहीं मिला" : "This chapter doesn't exist"}
      </h1>

      {/* Subtitle */}
      <p className="text-xs sm:text-sm text-[#555] dark:text-[#BBB] font-sans leading-relaxed max-w-md mb-6">
        {isHindi
          ? "हर कहानी का अपना एक सफर होता है। दुर्भाग्य से यह पृष्ठ एक अलग रास्ते पर निकल गया। आइए आपको वापस लाने में मदद करें।"
          : "Every story has a journey. Unfortunately this page took a different path. Let's help you find your way back."}
      </p>

      {/* Primary & Secondary Actions */}
      <ErrorActions />

      {/* Recommended Stories Box */}
      <div className="w-full mt-10 pt-8 border-t border-[#C89A3D]/20">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="size-4 text-[#C89A3D]" />
          <h3 className="font-display font-bold text-sm text-[#111111] dark:text-[#F8F6F1] uppercase tracking-wider">
            {isHindi ? "सुझाई गई कहानियाँ पढ़ें" : "Explore Suggested Chronicles"}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full text-left">
          {suggestedStories.map((s, idx) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link
                to="/stories/$slug"
                params={{ slug: s.slug }}
                className="group flex flex-col justify-between p-3.5 rounded-xl bg-white/60 dark:bg-white/5 border border-[#C89A3D]/20 hover:border-[#C89A3D] hover:shadow-md transition-all duration-300 h-full"
              >
                <div>
                  <span className="inline-block text-[10px] font-mono text-[#C89A3D] uppercase tracking-widest mb-1">
                    {s.region || "India"}
                  </span>
                  <h4 className="font-display text-xs font-bold text-[#111111] dark:text-[#F8F6F1] group-hover:text-[#A50000] dark:group-hover:text-[#C89A3D] line-clamp-2 transition-colors">
                    {s.title}
                  </h4>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#777] dark:text-[#AAA] font-sans mt-3 pt-2 border-t border-[#C89A3D]/10">
                  <span>{s.readTime || "4 min read"}</span>
                  <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform text-[#C89A3D]" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
