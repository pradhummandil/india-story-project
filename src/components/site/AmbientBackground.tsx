import { motion } from "framer-motion";

/**
 * Site-wide ambient layer: drifting gradient orbs + faint particles.
 * Fixed, behind all content, pointer-events disabled.
 */
export function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
    >
      <motion.div
        className="absolute -top-32 -left-32 size-[520px] rounded-full bg-gold/[0.07] blur-3xl"
        animate={{ x: [0, 60, -20, 0], y: [0, 40, 80, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-32 size-[480px] rounded-full bg-saffron/[0.06] blur-3xl"
        animate={{ x: [0, -50, 30, 0], y: [0, 60, -30, 0] }}
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 size-[420px] rounded-full bg-primary/[0.05] blur-3xl"
        animate={{ x: [0, 40, -40, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
