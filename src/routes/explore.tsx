import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Compass, Filter, Globe2 } from "lucide-react";

import { SiteLayout } from "@/components/site/Layout";
import { ExploreIndia } from "@/components/site/ExploreIndia";
import { ClientOnly } from "@tanstack/react-router";
import { ExploreIndia3D } from "@/components/site/ExploreIndia3D";

export const Route = createFileRoute("/explore")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SiteLayout>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero opacity-40 pointer-events-none" />
        <div className="absolute -top-40 left-1/4 size-[420px] rounded-full bg-gold/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-56 right-1/4 size-[520px] rounded-full bg-saffron/10 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 pt-24 pb-14 relative">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs uppercase tracking-widest text-muted-foreground">
              <Sparkles className="size-3" />
              Explore
            </div>

            <h1 className="font-display text-4xl md:text-6xl leading-[1.05] mt-6">
              Find your next story
              <span className="block italic text-gradient-gold mt-3">by region & theme</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mt-6">
              Discover India like a streaming experience: quick previews, immersive collections, and
              a smooth journey from state to story.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/stories"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-6 py-3 text-sm font-medium shadow hover:brightness-110 transition"
              >
                <Compass className="size-4" />
                Browse stories
                <ArrowRight className="size-4" />
              </Link>

              <Link
                to="/join"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background/40 px-6 py-3 text-sm font-medium hover:bg-background/60 transition"
              >
                <Sparkles className="size-4" />
                Join the community
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Filter className="size-3.5" /> Filter by theme
              </span>
              <span className="inline-flex items-center gap-2">
                <Globe2 className="size-3.5" /> Region routes
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-24">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
          <div className="rounded-3xl border border-input bg-background/40 overflow-hidden">
            <ClientOnly fallback={<div className="min-h-[420px]" />}>
              <ExploreIndia3D />
            </ClientOnly>
          </div>

          <div className="lg:sticky lg:top-28 space-y-6">
            <div className="glass rounded-3xl p-6 border border-input">
              <h2 className="font-display text-2xl">How it works</h2>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="size-7 rounded-full grid place-items-center bg-primary/15 text-primary">
                    1
                  </span>
                  Hover a beacon to preview the state collection.
                </li>
                <li className="flex gap-3">
                  <span className="size-7 rounded-full grid place-items-center bg-primary/15 text-primary">
                    2
                  </span>
                  Click to open a state card and “read” your next story.
                </li>
                <li className="flex gap-3">
                  <span className="size-7 rounded-full grid place-items-center bg-primary/15 text-primary">
                    3
                  </span>
                  Filter by theme to match your mood.
                </li>
              </ul>
            </div>

            <div className="glass rounded-3xl p-6 border border-input">
              <h2 className="font-display text-2xl">Curated route</h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                A living map that feels like a Netflix rail—quick to explore, cinematic to enter.
              </p>
              <div className="mt-5">
                <ClientOnly fallback={null}>
                  <ExploreIndia />
                </ClientOnly>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

