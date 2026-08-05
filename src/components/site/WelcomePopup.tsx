import React, { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Compass, Feather, MessageSquare } from "lucide-react";
import { useI18nStore } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function WelcomePopup() {
  const [isVisible, setIsVisible] = useState(false);
  const lang = useI18nStore((s) => s.lang);
  const isHindi = lang === "hi";
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasSeen = localStorage.getItem("isp_welcome_popup_seen");
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3500); // 3.5 seconds delay
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("isp_welcome_popup_seen", "true");
  };

  const handleAction = (route: string) => {
    handleDismiss();
    void navigate({ to: route as any });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-24 right-4 sm:bottom-8 sm:right-24 z-[70] w-[90vw] sm:w-[380px] bg-white/95 dark:bg-[#181715]/95 backdrop-blur-xl border border-[#ECE7DF] dark:border-[#2A2722] rounded-3xl p-5 shadow-2xl space-y-4 font-sans text-[#1D1D1D] dark:text-[#FBF8F3]"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-10 rounded-2xl bg-[#9E1C20] text-white flex items-center justify-center shadow-md shadow-[#9E1C20]/25">
                <Sparkles className="size-5 text-[#C9A227]" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C9A227]">
                  {isHindi ? "भारत स्टोरी एआई" : "India Story AI"}
                </span>
                <h3 className="font-display font-bold text-sm leading-tight text-[#1D1D1D] dark:text-[#FBF8F3]">
                  {isHindi ? "👋 भारत स्टोरी प्रोजेक्ट में आपका स्वागत है!" : "👋 Welcome to India Story Project!"}
                </h3>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-full text-[#666666] hover:text-[#1D1D1D] dark:hover:text-white transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-[#666666] dark:text-[#A09D96] leading-relaxed">
            {isHindi
              ? "कहानियाँ खोजना चाहते हैं, अपने राज्य की धरोहर जानना चाहते हैं या अपनी खुद की कहानी प्रकाशित करना चाहते हैं? हमारे एआई सहायक से बात करें!"
              : "Need help discovering heritage stories, exploring your state, or publishing your own narrative? Talk to our flagship AI Story Assistant!"}
          </p>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              onClick={() => handleAction("/explore")}
              variant="outline"
              className="w-full text-xs font-bold py-2 border-[#ECE7DF] dark:border-[#2A2722] hover:border-[#9E1C20] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Compass className="size-3.5 text-[#C9A227]" />
              <span>{isHindi ? "कहानियाँ खोजें" : "Explore Stories"}</span>
            </Button>

            <Button
              onClick={() => handleAction("/share-story")}
              variant="outline"
              className="w-full text-xs font-bold py-2 border-[#ECE7DF] dark:border-[#2A2722] hover:border-[#9E1C20] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Feather className="size-3.5 text-[#9E1C20]" />
              <span>{isHindi ? "कहानी शेयर करें" : "Share Story"}</span>
            </Button>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#ECE7DF]/60 dark:border-[#2A2722]/60">
            <button
              onClick={() => handleAction("/chatbot")}
              className="text-xs font-bold text-[#9E1C20] dark:text-[#C9A227] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="size-3.5" />
              <span>{isHindi ? "एआई सहायक से पूछें" : "Ask AI Assistant"}</span>
            </button>

            <button
              onClick={handleDismiss}
              className="text-[11px] text-[#666666] hover:text-[#1D1D1D] dark:hover:text-white uppercase font-bold tracking-wider cursor-pointer"
            >
              {isHindi ? "बंद करें" : "Dismiss"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
