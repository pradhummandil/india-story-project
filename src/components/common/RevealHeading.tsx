/**
 * RevealHeading — Clip-path left-to-right text unveiling on scroll.
 *
 * Uses Framer Motion's useInView + clipPath animation to create a
 * "text being pulled out of a curtain" cinematic effect as the heading
 * enters the viewport.
 *
 * Respects prefers-reduced-motion: renders instantly without clip-path.
 *
 * Usage:
 *   <RevealHeading as="h2" className="font-display text-4xl font-bold">
 *     Latest Stories
 *   </RevealHeading>
 */

import React, { useRef, useEffect, useState, type ElementType, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";

interface RevealHeadingProps {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "h4";
  className?: string;
  /** Extra delay before the reveal starts (seconds) */
  delay?: number;
  /** Amount of element that must be visible before triggering */
  amount?: number;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export function RevealHeading({
  children,
  as: Tag = "h2",
  className = "",
  delay = 0,
  amount = 0.3,
}: RevealHeadingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount });
  const reducedMotion = usePrefersReducedMotion();

  // If reduced motion, render without any animation
  if (reducedMotion) {
    const StaticTag = Tag as React.ElementType<{ className?: string; children?: ReactNode }>;
    return <StaticTag className={className}>{children}</StaticTag>;
  }

  return (
    // Outer div is the ref + overflow clip boundary
    <div ref={ref} className="overflow-hidden">
      <motion.div
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={inView ? { clipPath: "inset(0 0% 0 0)" } : {}}
        transition={{
          duration: 0.85,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <motion.div
          initial={{ opacity: 0.2 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: delay + 0.1 }}
        >
          {React.createElement(Tag, { className }, children)}
        </motion.div>
      </motion.div>
    </div>
  );
}
