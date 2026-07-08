import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ScrollProgress } from "./ScrollProgress";
import { AmbientBackground } from "./AmbientBackground";
import { CursorGlow } from "./CursorGlow";
import { StoryCompanion } from "./StoryCompanion";
import { useI18nStore } from "@/lib/i18n";

export function SiteLayout({ children }: { children: ReactNode }) {
  const lang = useI18nStore((s) => s.lang);

  const { location } = useRouterState();
  return (
    <div lang={lang} className="relative min-h-dvh flex flex-col bg-background text-foreground">
      <AmbientBackground />
      <ScrollProgress />
      <CursorGlow />
      <Navbar />
      <main
        key={location.pathname}
        className={`flex-1 page-transition ${location.pathname === "/" ? "pt-0" : "pt-24"}`}
      >
        {children}
      </main>
      <Footer />
      <StoryCompanion />
    </div>
  );
}
