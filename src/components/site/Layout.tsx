import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ScrollProgress } from "./ScrollProgress";
import { AmbientBackground } from "./AmbientBackground";
import { CursorGlow } from "./CursorGlow";
import { StoryCompanion } from "./StoryCompanion";

export function SiteLayout({ children }: { children: ReactNode }) {
  const { location } = useRouterState();
  return (
    <div className="relative min-h-dvh flex flex-col bg-background text-foreground">
      <AmbientBackground />
      <ScrollProgress />
      <CursorGlow />
      <Navbar />
      <main key={location.pathname} className="flex-1 pt-24 page-transition">
        {children}
      </main>
      <Footer />
      <StoryCompanion />
    </div>
  );
}
