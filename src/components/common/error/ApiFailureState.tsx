import React from "react";
import { useI18nStore } from "@/lib/i18n";
import { ErrorIllustration } from "./ErrorIllustration";
import { ErrorActions } from "./ErrorActions";

interface ApiFailureStateProps {
  onRetry?: () => void;
  error?: Error | null;
}

export function ApiFailureState({ onRetry, error }: ApiFailureStateProps) {
  const lang = useI18nStore((s) => s.lang);
  const isHindi = lang === "hi";

  return (
    <div className="w-full flex flex-col items-center text-center">
      {/* API Custom Illustration */}
      <ErrorIllustration type="api" className="w-36 h-36 mb-4" />

      {/* Headline */}
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#111111] dark:text-[#F8F6F1] tracking-tight mb-3">
        {isHindi ? "संग्रह से संपर्क स्थापित नहीं हो सका" : "We're having trouble reaching the archive"}
      </h1>

      {/* Subtitle */}
      <p className="text-xs sm:text-sm text-[#555] dark:text-[#BBB] font-sans leading-relaxed max-w-md mb-6">
        {isHindi
          ? "हमारे ऐतिहासिक भंडार में वर्तमान में अत्यधिक मांग है। कृपया पुनः प्रयास करें या हमारे मुख्य पृष्ठ पर नेविगेट करें।"
          : "Our historical vault is temporarily experiencing high demand. Please try refreshing or explore our archive directory."}
      </p>

      {/* Optional Debug message preview */}
      {error?.message && (
        <div className="max-w-md w-full p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-[#C89A3D]/20 text-[11px] font-mono text-[#777] dark:text-[#AAA] mb-6 truncate">
          {error.message}
        </div>
      )}

      {/* Action Buttons */}
      <ErrorActions onRetry={onRetry} />
    </div>
  );
}
