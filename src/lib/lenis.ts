/**
 * Lenis smooth scroll integration for India Story Project.
 *
 * - Initialises Lenis on the client only (SSR-safe).
 * - Syncs Lenis RAF with Framer Motion's useAnimationFrame so both
 *   schedulers use the same loop — no double-RAF jank.
 * - Automatically disables when prefers-reduced-motion: reduce is set.
 * - Exports useLenisScroll() for components that need access to the instance.
 */

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useAnimationFrame } from "framer-motion";

// Singleton instance shared across the app
let lenisInstance: Lenis | null = null;

export function getLenis(): Lenis | null {
  return lenisInstance;
}

/**
 * Primary hook — call once at the root level.
 * Initialises Lenis and drives its RAF via Framer Motion's scheduler.
 */
export function useLenisSetup() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Respect prefers-reduced-motion at the OS level
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      orientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.6,
      infinite: false,
    });

    lenisRef.current = lenis;
    lenisInstance = lenis;

    return () => {
      lenis.destroy();
      lenisRef.current = null;
      lenisInstance = null;
    };
  }, []);

  // Drive Lenis RAF via Framer Motion's unified animation frame — eliminates
  // double-rAF stuttering when both libraries are active simultaneously.
  useAnimationFrame((time) => {
    lenisRef.current?.raf(time);
  });

  return lenisRef;
}

/**
 * Lightweight hook for components that need to read or react to scroll.
 * Does NOT create a new Lenis instance.
 */
export function useLenisScroll() {
  return lenisInstance;
}
