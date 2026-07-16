import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PremiumLoaderProps {
  isLoading?: boolean;
  minDuration?: number; // minimum duration in ms (default 1500ms)
  onFinished?: () => void;
}

export function PremiumLoader({
  isLoading = true,
  minDuration = 1600,
  onFinished,
}: PremiumLoaderProps) {
  const [show, setShow] = useState(true);
  const [stage, setStage] = useState<"walk" | "namaste" | "glow" | "logo" | "text" | "done">("walk");

  useEffect(() => {
    const startTime = Date.now();

    // Stage progression
    const walkTimer = setTimeout(() => setStage("namaste"), 500);
    const glowTimer = setTimeout(() => setStage("glow"), 900);
    const logoTimer = setTimeout(() => setStage("logo"), 1200);
    const textTimer = setTimeout(() => setStage("text"), 1500);
    const doneTimer = setTimeout(() => setStage("done"), 1800);

    return () => {
      clearTimeout(walkTimer);
      clearTimeout(glowTimer);
      clearTimeout(logoTimer);
      clearTimeout(textTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  useEffect(() => {
    if (!isLoading && stage === "done") {
      const timer = setTimeout(() => {
        setShow(false);
        if (onFinished) onFinished();
      }, 200);
      return () => clearTimeout(timer);
    } else if (!isLoading) {
      // If loading finished early, make sure we still wait until stage is "done"
      const checkTimer = setInterval(() => {
        if (stage === "done") {
          setShow(false);
          if (onFinished) onFinished();
          clearInterval(checkTimer);
        }
      }, 100);
      return () => clearInterval(checkTimer);
    }
  }, [isLoading, stage, onFinished]);

  // Floating particles
  const particles = Array.from({ length: 15 });

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#f8f4ec] text-[#222222] overflow-hidden select-none"
        >
          {/* Subtle warm glow background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(200,169,106,0.08),transparent_70%)] pointer-events-none" />

          {/* Floating gold particles */}
          {(stage === "namaste" || stage === "glow" || stage === "logo" || stage === "text" || stage === "done") && (
            <div className="absolute inset-0 pointer-events-none">
              {particles.map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-[#c8a96a]/40"
                  style={{
                    width: Math.random() * 4 + 2,
                    height: Math.random() * 4 + 2,
                    left: `${Math.random() * 60 + 20}%`,
                    top: `${Math.random() * 40 + 40}%`,
                  }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{
                    y: -100 - Math.random() * 100,
                    x: Math.sin(i) * 30,
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: 1.5 + Math.random() * 1.5,
                    repeat: Infinity,
                    delay: Math.random() * 1,
                  }}
                />
              ))}
            </div>
          )}

          {/* Animated Figures / Namaste Hands */}
          <div className="relative size-40 flex items-center justify-center">
            {/* Stage 1: Walking Silhouettes */}
            {stage === "walk" && (
              <div className="absolute inset-0 flex items-center justify-between px-6">
                {/* Male silhouette walking from left */}
                <motion.svg
                  initial={{ x: -60, opacity: 0 }}
                  animate={{ x: 10, opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="w-12 h-20 text-[#222222]/80"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm2 19v-6h3v-2c0-1.1-.9-2-2-2h-6c-1.1 0-2 .9-2 2v2h3v6h4z" />
                </motion.svg>

                {/* Female silhouette walking from right */}
                <motion.svg
                  initial={{ x: 60, opacity: 0 }}
                  animate={{ x: -10, opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="w-12 h-20 text-[#222222]/80"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm3.5 8.1c-.2-.6-.8-1.1-1.5-1.1h-4c-.7 0-1.3.5-1.5 1.1L7 18h2.5l1.5-5h2l1.5 5H17l-1.5-7.9z" />
                </motion.svg>
              </div>
            )}

            {/* Stage 2 & 3: Hands fold into Namaste with Golden Glow */}
            {(stage === "namaste" || stage === "glow" || stage === "logo" || stage === "text" || stage === "done") && (
              <div className="relative flex items-center justify-center">
                {/* Golden Glow effect */}
                {stage !== "namaste" && (
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute size-28 rounded-full bg-[radial-gradient(circle,#c8a96a_0%,transparent_70%)] filter blur-md"
                  />
                )}

                {/* Namaste hands folding */}
                <motion.svg
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="size-16 text-[#8b0000] relative z-10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Left hand praying */}
                  <motion.path
                    d="M12 3c-1.2 2.5-3.5 6-3.5 9.5 0 2.5 1 4.5 3.5 5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4 }}
                  />
                  {/* Right hand praying */}
                  <motion.path
                    d="M12 3c1.2 2.5 3.5 6 3.5 9.5 0 2.5-1 4.5-3.5 5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4 }}
                  />
                  {/* Wrist joint line */}
                  <motion.path
                    d="M10 18.5h4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  />
                </motion.svg>
              </div>
            )}
          </div>

          {/* Stage 4: India Story Project logo fades in */}
          {(stage === "logo" || stage === "text" || stage === "done") && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex items-center gap-2 mt-4"
            >
              <img
                src="Logo-ISP.jpg"
                alt="ISP"
                className="size-8 rounded-full border border-[#c8a96a]/20"
              />
              <span className="font-display text-lg font-bold tracking-wide">
                <span className="text-[#8b0000]">India</span> Story Project
              </span>
            </motion.div>
          )}

          {/* Stage 5: "Every Story Connects India" slogan */}
          {(stage === "text" || stage === "done") && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.6, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mt-2 text-[10px] uppercase tracking-[0.25em] font-sans font-bold text-[#8b0000]"
            >
              Every Story Connects India
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
