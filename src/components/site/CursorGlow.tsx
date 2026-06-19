import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Subtle custom cursor glow. Disabled on touch/coarse-pointer devices.
 * Scales up when hovering interactive elements.
 */
export function CursorGlow() {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 350, damping: 30, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 350, damping: 30, mass: 0.4 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setEnabled(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setEnabled(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement | null;
      const inter = !!t?.closest(
        "a, button, [role='button'], input, textarea, select, [data-cursor='hover']",
      );
      setActive(inter);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        aria-hidden
        style={{ x: sx, y: sy }}
        className="fixed top-0 left-0 z-[70] pointer-events-none -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          animate={{ scale: active ? 1.6 : 1, opacity: active ? 0.9 : 0.55 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="size-8 rounded-full bg-gold/20 blur-md"
        />
      </motion.div>
      <motion.div
        aria-hidden
        style={{ x, y }}
        className="fixed top-0 left-0 z-[71] pointer-events-none -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          animate={{ scale: active ? 0.6 : 1, opacity: active ? 0.4 : 0.9 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="size-1.5 rounded-full bg-gold shadow-glow"
        />
      </motion.div>
    </>
  );
}
