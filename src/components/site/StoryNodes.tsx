import { motion, useSpring, useTransform, type MotionValue } from "framer-motion";

interface StoryNode {
  name: string;
  state: string;
  category: string;
  /** position in % relative to hero container */
  top: string;
  left: string;
  /** float animation delay */
  delay: number;
}

const nodes: StoryNode[] = [
  { name: "Ratna Devi", state: "Assam", category: "Heritage", top: "18%", left: "8%", delay: 0 },
  { name: "Arjun Mehra", state: "Uttarakhand", category: "Innovation", top: "28%", left: "82%", delay: 0.6 },
  { name: "Lakshmi K.", state: "Telangana", category: "Sustainability", top: "62%", left: "6%", delay: 1.2 },
  { name: "Vikram S.", state: "Karnataka", category: "Science", top: "70%", left: "84%", delay: 1.8 },
  { name: "Imran A.", state: "Lucknow", category: "Culture", top: "44%", left: "92%", delay: 2.4 },
];

export function StoryNodes({
  mouseX,
  mouseY,
}: {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}) {
  // gentle parallax shift opposite to particles for depth
  const px = useSpring(useTransform(mouseX, [-0.5, 0.5], [15, -15]), { stiffness: 40, damping: 18 });
  const py = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), { stiffness: 40, damping: 18 });

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none hidden md:block"
      style={{ x: px, y: py }}
    >
      {nodes.map((n, i) => (
        <motion.div
          key={n.name}
          className="absolute"
          style={{ top: n.top, left: n.left }}
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{
            opacity: 1,
            y: [0, -10, 0, 6, 0],
            scale: 1,
          }}
          transition={{
            opacity: { duration: 1.2, delay: 0.9 + i * 0.18, ease: [0.16, 1, 0.3, 1] },
            scale: { duration: 1.2, delay: 0.9 + i * 0.18, ease: [0.16, 1, 0.3, 1] },
            y: {
              duration: 9 + i * 0.6,
              delay: n.delay,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          <div className="relative group pointer-events-auto cursor-pointer">
            {/* Pulse ring */}
            <span className="absolute inset-0 -m-2 rounded-full bg-gold/20 animate-ping" />
            <span className="absolute inset-0 size-3 rounded-full bg-gradient-to-br from-gold to-saffron shadow-glow" />
            <span className="block size-3" />

            {/* Floating label */}
            <div className="absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap glass rounded-xl px-3 py-2 opacity-80 group-hover:opacity-100 transition-opacity duration-500">
              <div className="text-[11px] uppercase tracking-widest text-gold leading-none mb-1">
                {n.category}
              </div>
              <div className="text-sm font-display leading-tight text-foreground">
                {n.name}
              </div>
              <div className="text-[10px] text-muted-foreground leading-none mt-1">
                {n.state}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
