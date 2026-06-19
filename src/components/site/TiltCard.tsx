import { useRef, type ReactNode, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

/**
 * Subtle 3D tilt on hover with a moving glass reflection highlight.
 * Disabled gracefully on touch (no hover events fire).
 */
export function TiltCard({ children, className = "", intensity = 8 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const mx = useMotionValue(50);
  const my = useMotionValue(50);

  const srx = useSpring(rx, { stiffness: 200, damping: 20 });
  const sry = useSpring(ry, { stiffness: 200, damping: 20 });

  const shineX = useTransform(mx, (v) => `${v}%`);
  const shineY = useTransform(my, (v) => `${v}%`);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
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
      style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
      className={`relative [perspective:1200px] ${className}`}
    >
      {children}
      <motion.div
        aria-hidden
        style={{
          background: `radial-gradient(220px circle at ${shineX.get()} ${shineY.get()}, color-mix(in oklab, var(--gold) 18%, transparent), transparent 60%)`,
        }}
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100 mix-blend-screen"
      />
    </motion.div>
  );
}
