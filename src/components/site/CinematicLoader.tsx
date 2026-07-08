import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { INDIA_PATHS } from "./IndiaPaths";

export function CinematicLoader() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show once per session
    const hasShown = sessionStorage.getItem("isp_loader_shown");
    if (!hasShown) {
      setIsVisible(true);
      sessionStorage.setItem("isp_loader_shown", "true");
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Animate progress to 100 over 2.2 seconds
    const duration = 2200;
    const intervalTime = 20;
    const steps = duration / intervalTime;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const nextProgress = Math.min(Math.round((step / steps) * 100), 100);
      setProgress(nextProgress);

      if (step >= steps) {
        clearInterval(timer);
        // Let it display 100% briefly, then fade out
        setTimeout(() => {
          setIsVisible(false);
        }, 500);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] text-white select-none"
        >
          {/* Animated Gold India Outline Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-45 pointer-events-none scale-75 md:scale-95">
            <svg
              viewBox="0 0 612 696"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full max-w-[450px] h-auto"
            >
              <defs>
                <linearGradient id="loaderIndiaGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C7A25A" />
                  <stop offset="50%" stopColor="#FAF8F5" />
                  <stop offset="100%" stopColor="#8B0000" />
                </linearGradient>
                <filter id="loaderGlow">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                </filter>
              </defs>
              <g>
                {/* Layer 1: Ambient Glow */}
                {INDIA_PATHS.map((path) => (
                  <motion.path
                    key={`glow-${path.id}`}
                    d={path.d}
                    fill="none"
                    stroke="url(#loaderIndiaGold)"
                    strokeWidth="3.5"
                    filter="url(#loaderGlow)"
                    opacity="0.25"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2.2, ease: "easeInOut" }}
                  />
                ))}
                {/* Layer 2: Sharp precise outline */}
                {INDIA_PATHS.map((path) => (
                  <motion.path
                    key={`sharp-${path.id}`}
                    d={path.d}
                    fill="none"
                    stroke="url(#loaderIndiaGold)"
                    strokeWidth="1.3"
                    opacity="0.8"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2.2, ease: "easeInOut" }}
                  />
                ))}
              </g>
            </svg>
          </div>

          {/* Loader UI Content */}
          <div className="relative z-10 flex flex-col items-center text-center px-6">
            {/* Logo Icon Animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8"
            >
              <div className="relative size-16 md:size-20 flex items-center justify-center rounded-full border border-gold/30 bg-gradient-to-b from-gold/10 to-transparent">
                <span className="font-display text-3xl md:text-4xl font-bold text-gradient-gold">
                  I
                </span>
                {/* Orbital Ring */}
                <motion.div
                  className="absolute inset-[-4px] rounded-full border-t border-b border-gold/40"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </motion.div>

            {/* Cinematic Slogan */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-2xl md:text-3xl tracking-[0.25em] text-[#C7A25A] uppercase mb-2 font-bold"
            >
              Every Story Connects India
            </motion.h1>

            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 0.6 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xs uppercase tracking-[0.4em] text-white font-sans font-medium mb-12"
            >
              India Story Project
            </motion.p>

            {/* Percentage counter */}
            <div className="relative overflow-hidden h-12 w-24 flex items-center justify-center">
              <motion.span
                key={progress}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="font-display italic text-2xl md:text-3xl font-medium tracking-widest text-[#C7A25A]"
              >
                {progress}%
              </motion.span>
            </div>

            {/* Progress bar */}
            <div className="w-48 h-[2px] bg-white/5 rounded-full overflow-hidden mt-3 shadow-[0_0_8px_rgba(199,162,90,0.1)] relative">
              <motion.div
                className="h-full bg-gradient-to-r from-[#C7A25A] to-[#8B0000] shadow-[0_0_6px_rgba(199,162,90,0.5)]"
                style={{ width: `${progress}%` }}
                transition={{ ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
