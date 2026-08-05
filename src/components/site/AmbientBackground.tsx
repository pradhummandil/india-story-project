import { useEffect, useState } from "react";

/**
 * Site-wide ambient layer: drifting gradient orbs + a subtle CSS grain.
 * Fixed, behind all content, pointer-events disabled.
 *
 * Uses CSS animations instead of Framer Motion for zero JS overhead on
 * this always-present background layer. prefers-reduced-motion disables
 * all drift animations, leaving the orbs static.
 */
export function AmbientBackground() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Orb 1 — antique gold, top-left */}
      <div
        className="absolute -top-32 -left-32 size-[520px] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(200,169,106,0.07) 0%, transparent 70%)",
          animation: reducedMotion ? "none" : "ambient-drift-1 28s ease-in-out infinite",
        }}
      />
      {/* Orb 2 — saffron, mid-right */}
      <div
        className="absolute top-1/3 -right-32 size-[480px] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(255,153,51,0.06) 0%, transparent 70%)",
          animation: reducedMotion ? "none" : "ambient-drift-2 34s ease-in-out infinite",
        }}
      />
      {/* Orb 3 — primary red, bottom-center */}
      <div
        className="absolute bottom-0 left-1/3 size-[420px] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(139,0,0,0.05) 0%, transparent 70%)",
          animation: reducedMotion ? "none" : "ambient-drift-3 30s ease-in-out infinite",
        }}
      />
      {/* Orb 4 — deep crimson, bottom-left (new) */}
      <div
        className="absolute -bottom-20 -left-20 size-[380px] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(100,0,0,0.04) 0%, transparent 70%)",
          animation: reducedMotion ? "none" : "ambient-drift-4 42s ease-in-out infinite",
        }}
      />

      {/* Subtle noise grain overlay — adds print-like texture */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />
    </div>
  );
}
