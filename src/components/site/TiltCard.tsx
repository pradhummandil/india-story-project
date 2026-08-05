import { useRef, type ReactNode, type MouseEvent } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Degrees of tilt at card edge. Keep 6–8 for cards, 4–5 for hero images. */
  intensity?: number;
  /** Disable tilt entirely (e.g. on touch/coarse-pointer devices) */
  disabled?: boolean;
}

/**
 * Subtle 3D tilt on hover with a reactive glass-shimmer highlight.
 *
 * Fixed: the shine position now uses useMotionTemplate so it updates
 * reactively with the motion values — previously shineX.get() was a
 * static snapshot captured at render time.
 *
 * Disabled gracefully on touch devices (no hover events fire anyway).
 */
export function TiltCard({
  children,
  className = "",
  intensity = 8,
  disabled = false,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const mx = useMotionValue(50);
  const my = useMotionValue(50);

  const srx = useSpring(rx, { stiffness: 200, damping: 20 });
  const sry = useSpring(ry, { stiffness: 200, damping: 20 });

  // Reactive gradient string — updates on every frame when mouse moves
  const shineGradient = useMotionTemplate`radial-gradient(220px circle at ${mx}% ${my}%, rgba(200,169,106,0.18), transparent 60%)`;

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * intensity);
    rx.set((0.5 - py) * intensity);
    mx.set(px * 100);
    my.set(py * 100);
  };

  const onLeave = () => {
    rx.set(0);
    ry.set(0);
    mx.set(50);
    my.set(50);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={
        disabled
          ? {}
          : { rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }
      }
      className={`relative ${disabled ? "" : "[perspective:1200px]"} ${className}`}
    >
      {children}
      {/* Reactive glass shimmer — only visible on hover via CSS group */}
      {!disabled && (
        <motion.div
          aria-hidden
          style={{ background: shineGradient }}
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-screen"
        />
      )}
    </motion.div>
  );
}
