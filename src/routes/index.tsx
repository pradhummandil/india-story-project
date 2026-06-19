import { createFileRoute, Link, ClientOnly } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Leaf, Lightbulb, Landmark, Users, Globe2 } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { StoryCard } from "@/components/site/StoryCard";
import { Hero } from "@/components/site/Hero";
import { HeroOfTheDay } from "@/components/site/HeroOfTheDay";
import { StoryConstellation } from "@/components/site/StoryConstellation";
import { ExploreIndia3D } from "@/components/site/ExploreIndia3D";
import { RecommendedForYou } from "@/components/site/RecommendedForYou";
import { StoryJourney } from "@/components/site/StoryJourney";
import { LiveIndiaNow } from "@/components/site/LiveIndiaNow";
import { Button } from "@/components/ui/button";
import { stories } from "@/lib/stories-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "India Story Project — Experience India's Stories" },
      { name: "description", content: "Discover inspiring stories of changemakers, innovators, and heroes across India." },
      { property: "og:title", content: "India Story Project" },
      { property: "og:description", content: "Experience India's stories, don't just read them." },
    ],
  }),
  component: Home,
});

const categories = [
  { icon: Landmark, label: "Heritage", desc: "Crafts, traditions, and timeless wisdom" },
  { icon: Lightbulb, label: "Innovation", desc: "Founders and builders reshaping India" },
  { icon: Leaf, label: "Sustainability", desc: "Quiet revolutions in farming and climate" },
  { icon: Sparkles, label: "Culture", desc: "Food, art, cinema, and identity" },
  { icon: Users, label: "Changemakers", desc: "People moving communities forward" },
  { icon: Globe2, label: "Diaspora", desc: "India's stories told around the world" },
];

function Home() {
  return (
    <SiteLayout>
      <Hero />
      <HeroOfTheDay />
      <StoryConstellation />
      <ClientOnly fallback={<div className="min-h-[600px]" />}>
        <ExploreIndia3D />
      </ClientOnly>


      {/* FEATURED STORIES */}
      <section className="container mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold mb-3">Featured</p>
            <h2 className="font-display text-4xl md:text-5xl max-w-2xl">
              Stories worth your evening
            </h2>
          </div>
          <Link to="/stories" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2 group">
            View all stories
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.slice(0, 3).map((s, i) => (
            <StoryCard key={s.id} story={s} index={i} />
          ))}
        </div>
      </section>

      <LiveIndiaNow />
      <RecommendedForYou />
      <StoryJourney />

      {/* CATEGORIES */}
      <section className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-widest text-gold mb-3">Explore by theme</p>
          <h2 className="font-display text-4xl md:text-5xl">A India in every chapter</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="glass rounded-2xl p-6 hover-lift cursor-pointer"
            >
              <div className="size-12 rounded-xl bg-gradient-to-br from-gold/20 to-saffron/10 grid place-items-center mb-4 border border-gold/20">
                <c.icon className="size-5 text-gold" />
              </div>
              <h3 className="font-display text-2xl mb-2">{c.label}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* MISSION */}
      <section className="container mx-auto px-6 py-24">
        <div className="glass rounded-3xl p-10 md:p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-hero opacity-50 pointer-events-none" />
          <div className="relative max-w-3xl mx-auto text-center">
            <p className="text-xs uppercase tracking-widest text-gold mb-4">Our mission</p>
            <h2 className="font-display text-4xl md:text-5xl leading-tight">
              To tell <span className="text-gradient-gold italic">a billion stories</span> with the craft they deserve.
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              India Story Project is a slow journalism initiative — we travel,
              listen, and document the people quietly building the country's
              future. No clickbait. No noise. Just stories, beautifully told.
            </p>
            <Button asChild size="lg" className="mt-10 bg-gradient-to-r from-gold to-saffron text-gold-foreground border-0">
              <Link to="/about">
                Read our story
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
