import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import namasteVideo from "@/assets/stories/Namaste.mp4";

export function WelcomeVideoOverlay() {
  const [show, setShow] = useState(false);
  const [timeLeft, setTimeLeft] = useState(4);

  useEffect(() => {
    // Check if welcome video flag was set on login/signup
    const shouldShow = sessionStorage.getItem("show_namaste_welcome") === "true";
    if (shouldShow) {
      setShow(true);
      setTimeLeft(4);
    }
  }, []);

  useEffect(() => {
    if (!show) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [show]);

  const handleFinish = () => {
    sessionStorage.removeItem("show_namaste_welcome");
    setShow(false);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FBF8F3] p-4 sm:p-8 font-sans overflow-hidden"
      >
        {/* Soft Background Ambient Glows */}
        <div className="absolute size-[500px] rounded-full bg-gold/15 blur-3xl pointer-events-none -top-24 -left-24" />
        <div className="absolute size-[500px] rounded-full bg-primary/10 blur-3xl pointer-events-none -bottom-24 -right-24" />

        {/* Outer Greeting Container */}
        <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center space-y-4">
          {/* Header Tag Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold/15 border border-gold/30 text-xs font-sans font-bold uppercase tracking-[0.2em] text-gold shadow-xs"
          >
            <Sparkles className="size-3.5 text-gold" />
            Namaste & Welcome
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight"
          >
            Welcome to India Story Project
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-xs sm:text-sm text-stone-600 font-sans max-w-sm"
          >
            Connecting stories, culture, and changemakers across India.
          </motion.p>

          {/* Video Container Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative w-full aspect-[4/3] max-w-md rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-black my-2"
          >
            <video
              src={namasteVideo}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

            {/* Skip Button in Top-Right Corner */}
            <button
              onClick={handleFinish}
              className="absolute top-4 right-4 z-20 px-4 py-2 rounded-full bg-black/80 hover:bg-black text-white font-sans text-xs font-bold border border-white/30 shadow-lg backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>Skip ({timeLeft}s)</span>
              <ArrowRight className="size-3.5" />
            </button>
          </motion.div>

          {/* Progress Bar Indicator */}
          <div className="flex items-center gap-3 pt-2">
            <div className="w-36 h-1.5 rounded-full bg-stone-200/80 overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 4, ease: "linear" }}
                className="h-full bg-primary rounded-full"
              />
            </div>
            <span className="text-[11px] font-sans font-semibold text-stone-500">
              Entering site in {timeLeft}s...
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
