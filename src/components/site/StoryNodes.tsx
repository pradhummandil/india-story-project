import { motion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { Link } from "@tanstack/react-router";

import { stories } from "@/lib/stories-data";

type StoryNode = {
  storySlug: string;
  name: string;
  state: string;
  category: string;
  /** position in % relative to hero container */
  top: string;
  left: string;
  /** float animation delay */
  delay: number;
};

function seededNumber(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 2 ** 32;
}

function makeNodes(): StoryNode[] {
  // Keep the same count / general layout feel (5 nodes) while using real stories.
  const pick = stories.slice(0, 5);
  const anchors = [
    { top: "18%", left: "8%" },
    { top: "28%", left: "82%" },
    { top: "62%", left: "6%" },
    { top: "70%", left: "84%" },
    { top: "44%", left: "92%" },
  ];

  return pick.map((s, i) => {
    const a = anchors[i] ?? anchors[0];
    const jitter = (v: string, n: number) => v; // keep visuals stable

    return {
      storySlug: s.slug,
      name: s.title,
      state: s.region,
      category: s.category,
      top: jitter(a.top, i),
      left: jitter(a.left, i),
      delay: seededNumber(`${s.slug}|delay`) * 2.4,
    };
  });
}

export function StoryNodes({
  mouseX,
  mouseY,
}: {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}) {
  // gentle parallax shift opposite to particles for depth
  const px = useSpring(useTransform(mouseX, [-0.5, 0.5], [15, -15]), {
    stiffness: 40,
    damping: 18,
  });
  const py = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), {
    stiffness: 40,
    damping: 18,
  });

  const nodes = makeNodes();

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none hidden md:block"
      style={{ x: px, y: py }}
    >
      {nodes.map((n, i) => (
        <motion.div
          key={n.storySlug}
          className="absolute"
          style={{ top: n.top, left: n.left }}
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{
            opacity: 1,
            y: [0, -10, 0, 6, 0],
            scale: 1,
          }}
          transition={{
            opacity: {
              duration: 1.2,
              delay: 0.9 + i * 0.18,
              ease: [0.16, 1, 0.3, 1],
            },
            scale: {
              duration: 1.2,
              delay: 0.9 + i * 0.18,
              ease: [0.16, 1, 0.3, 1],
            },
            y: {
              duration: 9 + i * 0.6,
              delay: n.delay,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          <Link
            to="/stories/$slug"
            params={{ slug: n.storySlug }}
            search={{}}
            className="relative group pointer-events-auto cursor-pointer"
          >
            {/* Pulse ring */}
            <span className="absolute inset-0 -m-2 rounded-full bg-gold/20 animate-ping" />
            <span className="absolute inset-0 size-3 rounded-full bg-gradient-to-br from-gold to-saffron shadow-glow" />
            <span className="block size-3" />

            {/* Floating label */}
            <div className="absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap glass rounded-xl px-3 py-2 opacity-80 group-hover:opacity-100 transition-opacity duration-500">
              <div className="text-[11px] uppercase tracking-widest text-gold leading-none mb-1">
                {n.category}
              </div>
              <div className="text-sm font-display leading-tight text-foreground">{n.name}</div>
              <div className="text-[10px] text-muted-foreground leading-none mt-1">{n.state}</div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
