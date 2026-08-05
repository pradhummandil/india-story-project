import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ScrollProgress } from "./ScrollProgress";
import { RouteLoadingBar } from "./RouteLoadingBar";
import { StoryCompanion } from "./StoryCompanion";
import { WelcomePopup } from "./WelcomePopup";
import { useI18nStore } from "@/lib/i18n";

const cubicEase = [0.22, 1, 0.36, 1] as const;

const pageVariants = {
  initial: {
    opacity: 0,
    y: 12,
    filter: "blur(4px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.32,
      ease: cubicEase,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(3px)",
    transition: {
      duration: 0.18,
      ease: cubicEase,
    },
  },
};

export function SiteLayout({ children }: { children: ReactNode }) {
  const lang = useI18nStore((s) => s.lang);
  const { location } = useRouterState();

  return (
    <div lang={lang} className="relative min-h-dvh flex flex-col bg-background text-foreground w-full overflow-x-clip">
      <RouteLoadingBar />
      <ScrollProgress />
      <Navbar />

      {/* Premium page transitions on route change */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={`flex-1 ${location.pathname === "/" ? "pt-0" : "pt-24"}`}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      <Footer />
      <WelcomePopup />
      <StoryCompanion />
    </div>
  );
}

