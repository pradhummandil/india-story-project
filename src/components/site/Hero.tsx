import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticleField, useMouseParallax } from "./ParticleField";
import { StoryNodes } from "./StoryNodes";
import { IndiaSilhouette } from "./IndiaSilhouette";
import { HeroStats } from "./AnimatedCounter";

const headingWords = ["Experience", "India's", "Stories,"];
const italicWords = ["Don't", "Just", "Read", "Them"];

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const { mouseX, mouseY } = useMouseParallax(heroRef);

  // Content depth — opposite direction, very subtle
  const contentX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 60,
    damping: 20,
  });
  const contentY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-8, 8]), {
    stiffness: 60,
    damping: 20,
  });

  return (
    <section
      ref={heroRef}
      className="relative bg-hero overflow-hidden min-h-[100svh] flex items-center"
    >
      {/* India silhouette — low-opacity art accent */}
      <IndiaSilhouette className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[820px] max-w-none pointer-events-none" />

      {/* Particles + cinematic glow */}
      <ParticleField mouseX={mouseX} mouseY={mouseY} />

      {/* Floating story nodes */}
      <StoryNodes mouseX={mouseX} mouseY={mouseY} />

      {/* Hero content with depth parallax */}
      <motion.div
        style={{ x: contentX, y: contentY }}
        className="container mx-auto px-6 py-24 md:py-32 text-center relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs uppercase tracking-widest text-muted-foreground mb-8"
        >
          <Sparkles className="size-3 text-gold" />
          A premium storytelling platform
        </motion.div>

        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[1.05] max-w-5xl mx-auto text-balance">
          <span className="block">
            {headingWords.map((word, i) => (
              <motion.span
                key={word + i}
                initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 1.1,
                  delay: 0.25 + i * 0.14,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="inline-block mr-[0.25em] hover:text-gradient-gold transition-all duration-500"
              >
                {word}
              </motion.span>
            ))}
          </span>
          <span className="block italic text-gradient-gold mt-2">
            {italicWords.map((word, i) => (
              <motion.span
                key={word + i}
                initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 1.1,
                  delay: 0.7 + i * 0.14,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="inline-block mr-[0.25em]"
              >
                {word}
              </motion.span>
            ))}
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 1.15 }}
          className="mt-8 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed"
        >
          Discover inspiring stories of changemakers, innovators, and heroes
          across India — told with the depth, craft, and care they deserve.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.35 }}
          className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            asChild
            size="lg"
            className="btn-premium bg-gradient-to-r from-gold to-saffron text-gold-foreground border-0 shadow-glow h-12 px-8 text-base group"
          >
            <Link to="/stories">
              Explore Stories
              <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="btn-premium glass border-border h-12 px-8 text-base hover:bg-accent/10"
          >
            <Link to="/about">Learn More</Link>
          </Button>
        </motion.div>

        {/* Animated stats */}
        <HeroStats />
      </motion.div>

      {/* Luxury scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3"
      >
        <span className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          Begin The Journey
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="size-8 rounded-full glass grid place-items-center"
        >
          <ChevronDown className="size-4 text-gold" />
        </motion.div>
      </motion.div>
    </section>
  );
}
