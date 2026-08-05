import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ScrollProgress } from "./ScrollProgress";
import { AmbientBackground } from "./AmbientBackground";
import { CursorGlow } from "./CursorGlow";
import { StoryCompanion } from "./StoryCompanion";
import { useI18nStore } from "@/lib/i18n";

const pageVariants = {
  initial: { opacity: 0, y: 8, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -4, filter: "blur(2px)" },
};

const pageTransition = {
  duration: 0.32,
  ease: [0.16, 1, 0.3, 1] as const,
};

export function SiteLayout({ children }: { children: ReactNode }) {
  const lang = useI18nStore((s) => s.lang);
  const { location } = useRouterState();

  return (
    <div lang={lang} className="relative min-h-dvh flex flex-col bg-background text-foreground">
      <AmbientBackground />
      <ScrollProgress />
      <CursorGlow />
      <Navbar />

      {/* Framer Motion page transitions on route change */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          className={`flex-1 ${location.pathname === "/" ? "pt-0" : "pt-24"}`}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      <Footer />
      <StoryCompanion />
    </div>
  );
}
