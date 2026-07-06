import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

export function AnimatedCounter({
  value,
  duration = 2.4,
  suffix = "",
}: {
  value: number;
  duration?: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / (duration * 1000), 1);
      // easeOutExpo — smoother, more cinematic settle
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return (
    <span ref={ref}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

export function HeroStats() {
  const stats = [
    { value: 1240, suffix: "+", label: "Stories Collected" },
    { value: 28, suffix: "", label: "States Covered" },
    { value: 95000, suffix: "+", label: "Lives Impacted" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.9 }}
      className="mt-16 grid grid-cols-3 gap-4 sm:gap-10 max-w-2xl mx-auto"
    >
      {stats.map((s) => (
        <div key={s.label} className="text-center">
          <div className="font-display text-3xl md:text-4xl text-gradient-gold">
            <AnimatedCounter value={s.value} suffix={s.suffix} />
          </div>
          <div className="mt-2 text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">
            {s.label}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
