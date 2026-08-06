import React, { useEffect, useState, useMemo } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useI18nStore } from "@/lib/i18n";
import { NotFoundState } from "./NotFoundState";
import { OfflineState } from "./OfflineState";
import { ApiFailureState } from "./ApiFailureState";
import { ErrorIllustration } from "./ErrorIllustration";
import { ErrorActions } from "./ErrorActions";

export type ErrorExperienceType = "auto" | "404" | "offline" | "api" | "crash";

interface ErrorExperienceProps {
  type?: ErrorExperienceType;
  error?: Error | null;
  reset?: () => void;
}

export function ErrorExperience({ type = "auto", error, reset }: ErrorExperienceProps) {
  const lang = useI18nStore((s) => s.lang);
  const isHindi = lang === "hi";

  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Parallax Mouse Effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX / innerWidth - 0.5) * 20);
    mouseY.set((clientY / innerHeight - 0.5) * 20);
  };

  const cardRotateX = useTransform(mouseY, [-20, 20], [2, -2]);
  const cardRotateY = useTransform(mouseX, [-20, 20], [-2, 2]);

  // Determine active error view
  const resolvedType = useMemo(() => {
    if (type !== "auto") return type;
    if (!isOnline) return "offline";
    if (error?.message?.toLowerCase().includes("network") || error?.message?.toLowerCase().includes("fetch")) {
      return "api";
    }
    if (error?.message?.toLowerCase().includes("404") || error?.message?.toLowerCase().includes("not found")) {
      return "404";
    }
    return "crash";
  }, [type, isOnline, error]);

  // Generate 12 ambient dust particle positions
  const particles = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: `${(i * 23 + 7) % 92}%`,
      top: `${(i * 31 + 12) % 88}%`,
      size: `${(i % 3) + 2}px`,
      duration: (i % 4) + 6,
      delay: (i % 3) * 0.8,
    }));
  }, []);

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full flex flex-col justify-between items-center bg-[#FAF7F1] dark:bg-[#0F0E0D] text-[#111111] dark:text-[#F8F6F1] px-4 py-8 overflow-hidden select-none"
    >
      {/* ── BACKGROUND AMBIENCE ── */}
      {/* Soft Vignette Overlay */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#FAF7F1]/40 dark:via-[#0F0E0D]/60 to-[#EAE3D4]/80 dark:to-black/90 pointer-events-none z-0" />

      {/* Slow Moving Golden Radial Light */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-radial from-[#C89A3D]/20 via-[#A50000]/10 to-transparent blur-3xl pointer-events-none z-0"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating Ambient Dust Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-[#C89A3D]/40 dark:bg-[#C89A3D]/60 blur-[0.5px]"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
            }}
            animate={{
              y: [-15, 15, -15],
              x: [-10, 10, -10],
              opacity: [0.2, 0.7, 0.2],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* ── BRAND HEADER BAR ── */}
      <header className="relative z-10 w-full max-w-5xl flex items-center justify-between py-2">
        <a href="/" className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#A50000] to-[#C89A3D] p-0.5 shadow-sm group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full bg-[#FAF7F1] dark:bg-[#0F0E0D] flex items-center justify-center">
              <span className="font-display font-bold text-xs text-[#A50000] dark:text-[#C89A3D]">ISP</span>
            </div>
          </div>
          <span className="font-display text-sm font-bold tracking-tight text-[#111111] dark:text-[#F8F6F1]">
            India Story Project
          </span>
        </a>

        <div className="text-[11px] font-mono text-[#888] dark:text-[#999] uppercase tracking-widest">
          {resolvedType === "404" ? "404 • CHAPTER NOT FOUND" : "SYSTEM MESSAGE"}
        </div>
      </header>

      {/* ── MAIN FLOATING GLASS PANEL ── */}
      <main className="relative z-10 my-auto w-full max-w-2xl px-2 py-4">
        <motion.div
          style={{
            rotateX: cardRotateX,
            rotateY: cardRotateY,
            transformStyle: "preserve-3d",
          }}
          initial={{ opacity: 0, y: 25, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full rounded-[24px] bg-white/70 dark:bg-[#161513]/80 border border-[#C89A3D]/30 dark:border-[#C89A3D]/40 backdrop-blur-xl p-6 sm:p-10 shadow-2xl shadow-[#111111]/5 dark:shadow-black/60 overflow-hidden"
        >
          {/* Subtle Top Gold Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#C89A3D] to-transparent opacity-80" />

          {/* Render Contextual Error State */}
          {resolvedType === "404" && <NotFoundState />}
          {resolvedType === "offline" && <OfflineState onRetry={reset} />}
          {resolvedType === "api" && <ApiFailureState error={error} onRetry={reset} />}
          {resolvedType === "crash" && (
            <div className="w-full flex flex-col items-center text-center">
              <ErrorIllustration type="crash" className="w-36 h-36 mb-4" />
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#111111] dark:text-[#F8F6F1] tracking-tight mb-3">
                {isHindi ? "यह अध्याय लोड नहीं हो सका" : "We've lost this chapter"}
              </h1>
              <p className="text-xs sm:text-sm text-[#555] dark:text-[#BBB] font-sans leading-relaxed max-w-md mb-6">
                {isHindi
                  ? "एक अप्रत्याशित समस्या आई है। आप पृष्ठ को पुनः लोड कर सकते हैं या मुख्य संग्रह का अन्वेषण जारी रख सकते हैं।"
                  : "An unexpected turn occurred while rendering this page. You can try refreshing or resume exploring our archives."}
              </p>
              <ErrorActions onRetry={reset} />
            </div>
          )}
        </motion.div>
      </main>

      {/* ── FOOTER BRANDING ── */}
      <footer className="relative z-10 w-full max-w-5xl text-center py-2 space-y-1">
        <p className="text-xs font-serif italic text-[#777] dark:text-[#AAA]">
          {isHindi
            ? "« हर महान यात्रा में अप्रत्याशित मोड़ होते हैं। »"
            : "“Every great journey has unexpected turns.”"}
        </p>
        <p className="text-[11px] font-sans text-[#888] dark:text-[#999]">
          © {new Date().getFullYear()} India Story Project. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
