import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Production Vercel-style top progress bar.
 * Appears only when route navigation or code-splitting chunk loading exceeds 150ms.
 */
export function RouteLoadingBar() {
  const isNavigating = useRouterState({ select: (s) => s.status === "pending" });
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    if (isNavigating) {
      // Delay showing progress bar by 150ms (per Vercel standard)
      timer = setTimeout(() => {
        setVisible(true);
        setProgress(20);

        progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 85) return prev;
            return prev + Math.random() * 12 + 4;
          });
        }, 180);
      }, 150);
    } else {
      if (visible) {
        setProgress(100);
        const hideTimer = setTimeout(() => {
          setVisible(false);
          setProgress(0);
        }, 200);
        return () => clearTimeout(hideTimer);
      }
    }

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [isNavigating, visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[2.5px] bg-black/10 dark:bg-white/10"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-[#9E1C20] via-[#C9A227] to-[#9E1C20] shadow-[0_0_8px_rgba(201,162,39,0.8)]"
            style={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.2 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
