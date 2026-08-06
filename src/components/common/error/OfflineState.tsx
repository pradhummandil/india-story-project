import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useI18nStore } from "@/lib/i18n";
import { ErrorIllustration } from "./ErrorIllustration";
import { ErrorActions } from "./ErrorActions";

interface OfflineStateProps {
  onRetry?: () => void;
}

export function OfflineState({ onRetry }: OfflineStateProps) {
  const lang = useI18nStore((s) => s.lang);
  const isHindi = lang === "hi";
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsReconnecting(true);
      if (onRetry) {
        onRetry();
      } else {
        window.location.reload();
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [onRetry]);

  const handleManualRetry = () => {
    setIsReconnecting(true);
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="w-full flex flex-col items-center text-center">
      {/* Offline Custom Illustration */}
      <ErrorIllustration type="offline" className="w-36 h-36 mb-4" />

      {/* Headline */}
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#111111] dark:text-[#F8F6F1] tracking-tight mb-3">
        {isHindi ? "इंटरनेट कनेक्शन नहीं है" : "No Internet Connection"}
      </h1>

      {/* Subtitle */}
      <p className="text-xs sm:text-sm text-[#555] dark:text-[#BBB] font-sans leading-relaxed max-w-md mb-6">
        {isHindi
          ? "ऐसा लगता है कि आप ऑफ़लाइन हैं। भारत के कहानी ब्रह्मांड की खोज जारी रखने के लिए कृपया पुनः कनेक्ट करें।"
          : "It seems you are offline. Reconnect to resume exploring India's story universe."}
      </p>

      {/* Reconnect Status Bar */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#A50000]/10 border border-[#A50000]/30 text-[#A50000] dark:text-[#E57373] text-xs font-mono mb-6 animate-pulse">
        <WifiOff className="size-3.5" />
        <span>{isReconnecting ? (isHindi ? "पुनः कनेक्ट हो रहा है..." : "Reconnecting...") : (isHindi ? "नेटवर्क की प्रतीक्षा में..." : "Waiting for network...")}</span>
      </div>

      {/* Reconnect Action Button */}
      <motion.button
        onClick={handleManualRetry}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#A50000] to-[#C89A3D] text-white font-sans font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#A50000]/20 hover:shadow-xl transition-all mb-8 cursor-pointer"
      >
        <RefreshCw className={`size-4 ${isReconnecting ? "animate-spin" : ""}`} />
        <span>{isHindi ? "पुनः कनेक्ट करें" : "Reconnect Now"}</span>
      </motion.button>

      {/* Quick Navigation Links */}
      <ErrorActions showQuickNav={true} />
    </div>
  );
}
