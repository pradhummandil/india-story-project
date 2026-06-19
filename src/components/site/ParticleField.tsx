import { useEffect, useMemo, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

/**
 * Animated background of slow-floating gold particles + parallax light orbs.
 * Reacts subtly to mouse position via the parent's mouseX/mouseY motion values.
 */
export function ParticleField({
  mouseX,
  mouseY,
}: {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 42 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 8 + 10,
      delay: Math.random() * 6,
      opacity: Math.random() * 0.5 + 0.2,
    }));
  }, []);

  // Smooth parallax based on mouse
  const parallaxX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-20, 20]), {
    stiffness: 50,
    damping: 20,
  });
  const parallaxY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-20, 20]), {
    stiffness: 50,
    damping: 20,
  });

  const orbX1 = useSpring(useTransform(mouseX, [-0.5, 0.5], [40, -40]), { stiffness: 30, damping: 20 });
  const orbY1 = useSpring(useTransform(mouseY, [-0.5, 0.5], [40, -40]), { stiffness: 30, damping: 20 });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Cinematic glow orbs */}
      <motion.div
        style={{ x: orbX1, y: orbY1 }}
        className="absolute top-[10%] left-[15%] w-[480px] h-[480px] rounded-full blur-[100px] opacity-40"
      >
        <div className="w-full h-full rounded-full bg-gradient-to-br from-saffron/40 to-transparent" />
      </motion.div>
      <motion.div
        style={{ x: useTransform(orbX1, (v) => -v), y: useTransform(orbY1, (v) => -v) }}
        className="absolute bottom-[5%] right-[10%] w-[520px] h-[520px] rounded-full blur-[120px] opacity-30"
      >
        <div className="w-full h-full rounded-full bg-gradient-to-tr from-gold/35 to-transparent" />
      </motion.div>

      {/* Particle layer with parallax */}
      <motion.div className="absolute inset-0" style={{ x: parallaxX, y: parallaxY }}>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full bg-gold"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              boxShadow: `0 0 ${p.size * 4}px oklch(0.82 0.14 75 / 0.8)`,
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, p.opacity, p.opacity, 0],
              y: [0, -40, -80, -120],
              x: [0, 10, -10, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/60" />
    </div>
  );
}

/**
 * Hook helper: track mouse position normalized to [-0.5, 0.5] within a ref'd element.
 */
export function useMouseParallax(ref: React.RefObject<HTMLElement | null>) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };
    const onLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [ref, mouseX, mouseY]);

  return { mouseX, mouseY };
}
