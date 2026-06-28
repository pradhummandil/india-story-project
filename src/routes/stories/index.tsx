import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import { SiteLayout } from "@/components/site/Layout";
import { StoryCard } from "@/components/site/StoryCard";
import { Input } from "@/components/ui/input";
import { YouMayAlsoLike } from "@/components/site/YouMayAlsoLike";
import { StoryDNA } from "@/components/site/StoryDNA";

import type { Story } from "@/components/site/StoryCard";
import { categories as categoriesData, stories as storiesData } from "@/lib/stories-data";

export const Route = createFileRoute("/stories/")({
  head: () => ({
    meta: [
      { title: "Stories — India Story Project" },
      {
        name: "description",
        content:
          "Browse stories of innovators, changemakers, and unsung heroes across India.",
      },
      { property: "og:title", content: "Stories — India Story Project" },
      {
        property: "og:description",
        content:
          "Browse stories of innovators, changemakers, and unsung heroes across India.",
      },
    ],
  }),
  component: StoriesList,
});

function StoriesList() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string>("All");

  // Local-only catalogue
  const stories: Story[] = storiesData;
  const categories = categoriesData as unknown as readonly string[];

  useEffect(() => {
    setActive((prev) => (categories.includes(prev) ? prev : "All"));
  }, [categories]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return stories.filter((s) => {
      const matchesCat = active === "All" || s.category === active;
      const matchesQ =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.excerpt.toLowerCase().includes(q) ||
        s.region.toLowerCase().includes(q);
      return matchesCat && matchesQ;
    });
  }, [query, active, stories]);

  return (
    <SiteLayout>
      <section className="container mx-auto px-6 py-12 md:py-20">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-widest text-gold mb-3">The archive</p>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.05]">
            Every story, <span className="text-gradient-gold italic">every corner</span> of India.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            A living archive of long-form stories, profiles, and dispatches from the people reshaping the subcontinent.
          </p>
        </div>

        {/* Search + filter */}
        <div className="mt-12 glass rounded-2xl p-4 md:p-5 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stories, regions, themes…"
              className="pl-11 h-12 bg-transparent border-border focus-visible:ring-gold/40"
            />
          </div>
          <button className="h-12 px-5 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
            <SlidersHorizontal className="size-4" />
            Filters
          </button>
        </div>

        {/* Category chips */}
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((c) => {
            const isActive = c === active;
            return (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-gold to-saffron text-gold-foreground shadow-glow"
                    : "glass text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((s, i) => (
            <StoryCard key={s.id} story={s} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-20 text-center text-muted-foreground">No stories match your search yet.</div>
        )}
      </section>

      <StoryDNA />
      <YouMayAlsoLike />
    </SiteLayout>
  );
}

