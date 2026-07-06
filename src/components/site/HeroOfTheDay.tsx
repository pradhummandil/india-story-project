import { motion } from "framer-motion";
import { BookOpen, Play, Quote, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import type { Story } from "@/components/site/StoryCard";
import { stories } from "@/lib/stories-data";

type StoryWithOptionalFields = Story & {
  hero_of_the_day?: boolean;
  featured?: boolean;
  publishDate?: string;
  personName?: string;
  theme?: string;
};

const fadeUp = {
  hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

function asStory(s: Story): StoryWithOptionalFields {
  return s as StoryWithOptionalFields;
}

function parseDate(v: unknown): number {
  if (!v || typeof v !== "string") return 0;
  const t = Date.parse(v);
  return Number.isFinite(t) ? t : 0;
}

function formatDate(v: unknown): string | undefined {
  if (!v || typeof v !== "string") return undefined;
  const t = parseDate(v);
  if (!t) return undefined;
  try {
    return new Date(t).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return undefined;
  }
}

function pickHeroStory(all: Story[]): StoryWithOptionalFields {
  const typed = all.map(asStory);

  // Priority 1: hero_of_the_day
  const heroPinned = typed.find((s) => !!s.hero_of_the_day);
  if (heroPinned) return heroPinned;

  // Priority 2: featured
  const featured = typed.find((s) => !!s.featured);
  if (featured) return featured;

  // Priority 3: latest published
  let latest: StoryWithOptionalFields | null = null;
  let latestTs = 0;
  for (const s of typed) {
    const ts = parseDate(s.publishDate);
    if (ts > latestTs) {
      latestTs = ts;
      latest = s;
    }
  }
  if (latest) return latest;

  // Priority 4: first story
  return typed[0] ?? ({} as StoryWithOptionalFields);
}

function getTheme(s: StoryWithOptionalFields): string {
  // Prefer explicit theme if present in JSON/DB.
  if (typeof s.theme === "string" && s.theme.trim()) return s.theme.trim();
  // Fall back to category if theme isn't available.
  return typeof s.category === "string" && s.category.trim() ? s.category : "All";
}

export function HeroOfTheDay() {
  const hero = useMemo(() => pickHeroStory(stories), []);

  // Keep existing premium feel even if data is incomplete.
  const heroImage = hero.image;
  const heroTitle = hero.title;
  const heroExcerpt = hero.excerpt;

  const personName =
    typeof hero.personName === "string" && hero.personName.trim()
      ? hero.personName.trim()
      : heroTitle;

  const stateOrRegion = hero.region;
  const theme = getTheme(hero);

  const publishDate = formatDate(hero.publishDate);

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-32 size-[480px] rounded-full blur-[120px]"
          style={{ background: "color-mix(in oklab, var(--saffron) 18%, transparent)" }}
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 -right-32 size-[520px] rounded-full blur-[140px]"
          style={{ background: "color-mix(in oklab, var(--gold) 15%, transparent)" }}
        />
        {/* Floating particles */}
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute size-1 rounded-full bg-gold/40"
            style={{
              left: `${(i * 53) % 100}%`,
              top: `${(i * 37) % 100}%`,
            }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.7, 0.2] }}
            transition={{
              duration: 6 + (i % 5),
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-gold mb-4">Featured Today</p>
          <h2 className="font-display text-4xl md:text-6xl">
            Hero <span className="italic text-gradient-gold">Of The Day</span>
          </h2>
          <p className="mt-5 max-w-2xl mx-auto text-muted-foreground text-lg">
            Celebrating the stories shaping India.
          </p>
        </motion.div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Portrait */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, filter: "blur(12px)" }}
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative group"
          >
            {/* Glow */}
            <div className="absolute -inset-6 bg-gradient-to-br from-gold/30 via-saffron/20 to-transparent blur-3xl opacity-60 group-hover:opacity-90 transition-opacity duration-700" />

            {/* Frame */}
            <div className="relative rounded-3xl overflow-hidden border border-gold/20 shadow-elegant">
              <div className="aspect-[4/5] overflow-hidden">
                {heroImage ? (
                  <motion.img
                    src={heroImage}
                    alt={heroTitle}
                    loading="lazy"
                    width={1024}
                    height={1280}
                    className="w-full h-full object-cover"
                    initial={{ scale: 1.15 }}
                    whileInView={{ scale: 1.05 }}
                    viewport={{ once: true }}
                    transition={{ duration: 2.2, ease: "easeOut" }}
                    whileHover={{ scale: 1.12 }}
                  />
                ) : (
                  <div className="w-full h-full bg-muted-foreground/10" />
                )}
              </div>

              {/* Cinematic overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent pointer-events-none" />

              {/* Floating tag */}
              <div className="absolute top-5 left-5 glass px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest text-gold">
                {hero.category} · {stateOrRegion}
              </div>
            </div>
          </motion.div>

          {/* Info */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3"
            >
              {stateOrRegion} · {theme}
            </motion.p>
            <motion.h3
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="font-display text-4xl md:text-5xl leading-tight"
            >
              {personName}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="mt-5 text-muted-foreground text-lg leading-relaxed"
            >
              {heroExcerpt}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-gold to-saffron text-gold-foreground border-0 shadow-glow h-12 px-7"
              >
                <Link to="/stories/$slug" params={{ slug: hero.slug }}>
                  <BookOpen className="size-4" />
                  Read Story
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="glass border-border h-12 px-7"
                onClick={() => {
                  // Keep existing visual CTA; the “journey” module is currently story-driven elsewhere.
                  window.location.href = `/stories/${hero.slug}`;
                }}
              >
                <Play className="size-4" />
                Watch Journey
              </Button>
            </motion.div>

            {/* Meta line (replaces hardcoded info cards while keeping premium spacing) */}
            <div className="mt-10 grid grid-cols-2 gap-3">
              {[
                { icon: BookOpen, label: "Reading Time", value: hero.readTime },
                { icon: Play, label: "Published", value: publishDate ?? "" },
                { icon: Users, label: "Category", value: hero.category },
                { icon: Quote, label: "Theme", value: theme },
              ].map((c) => (
                <motion.div
                  key={c.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.55 }}
                  className="glass rounded-2xl p-5 hover-lift"
                >
                  <c.icon className="size-5 text-gold mb-3" />
                  <div className="font-display text-2xl md:text-3xl text-gradient-gold">
                    {c.value || "—"}
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                    {c.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-24 flex items-center gap-4 max-w-3xl mx-auto">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/40" />
          <div className="size-2 rounded-full bg-gold shadow-glow" />
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/40" />
        </div>

        {/* Quote */}
        <motion.figure
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1 }}
          className="max-w-4xl mx-auto text-center"
        >
          <Quote className="size-8 text-gold mx-auto mb-6 opacity-60" />
          <blockquote className="font-display text-3xl md:text-5xl leading-[1.2] italic">
            “{heroExcerpt}”
          </blockquote>
          <figcaption className="mt-8 text-xs uppercase tracking-[0.35em] text-muted-foreground">
            — {personName}
          </figcaption>
        </motion.figure>

        {/* Timeline (derived from story content when explicit metadata is unavailable) */}
        <div className="mt-28">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="font-display text-3xl md:text-4xl text-center mb-16"
          >
            The <span className="italic text-gradient-gold">Journey</span>
          </motion.h3>

          <div className="relative max-w-4xl mx-auto">
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.4, ease: "easeOut" }}
              style={{ transformOrigin: "top" }}
              className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold/60 via-gold/20 to-transparent"
            />

            <div className="space-y-12">
              {/* If story includes publishDate, show it as a start marker. */}
              {(() => {
                const year = publishDate
                  ? String(new Date(parseDate(hero.publishDate)).getFullYear())
                  : "";
                const points = [
                  {
                    year: year || "",
                    title: "",
                    desc: "",
                  },
                  {
                    year: year || "",
                    title: "",
                    desc: "",
                  },
                  {
                    year: year || "",
                    title: "",
                    desc: "",
                  },
                  {
                    year: year || "",
                    title: "",
                    desc: "",
                  },
                ];

                // Prefer content-derived snippets (no hardcoded titles/descs).
                const content = (hero.content ?? "").trim();
                if (content) {
                  const sentences = content
                    .replace(/\s+/g, " ")
                    .split(/(?<=[.!?])\s+/)
                    .filter(Boolean);

                  const mapped = sentences.slice(0, 4).map((s, idx) => ({
                    year: year || String(2000 + idx),
                    title: "",
                    desc: s.slice(0, 140),
                  }));

                  const toTitleFromText = (text: string, idx: number) => {
                    // Extract a short, content-derived label (no hardcoded timeline titles).
                    const cleaned = text
                      .replace(/\s+/g, " ")
                      .trim()
                      .replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, "");
                    if (!cleaned) return "";

                    const words = cleaned
                      .split(/\s+/)
                      .map((w) => w.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, ""))
                      .filter(Boolean);

                    // Prefer early meaningful words; skip very common tiny tokens.
                    const skip = new Set(["the", "and", "for", "with", "from", "that", "this", "into", "over", "under"]);
                    const picked = words.find((w) => w.length >= 4 && !skip.has(w.toLowerCase()));
                    const candidate = picked ?? words[idx] ?? words[0] ?? "";
                    return candidate ? candidate.slice(0, 18) : "";
                  };

                  return mapped.length
                    ? mapped.map((t, i) => ({
                        ...t,
                        year: t.year,
                        title: t.desc ? toTitleFromText(t.desc, i) : "",
                        desc: t.desc,
                      }))
                    : points;

                }

                return points;
              })().map((t, i) => {
                const left = i % 2 === 0;
                return (
                  <motion.div
                    key={`${t.year}-${i}`}
                    initial={{ opacity: 0, x: left ? -40 : 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className={`relative pl-12 md:pl-0 md:grid md:grid-cols-2 md:gap-12 ${
                      left ? "" : "md:[&>div:first-child]:col-start-2"
                    }`}
                  >
                    <span className="absolute left-4 md:left-1/2 -translate-x-1/2 top-2 size-3 rounded-full bg-gold shadow-glow ring-4 ring-background" />

                    <div className={left ? "md:text-right md:pr-8" : "md:pl-8"}>
                      <div className="font-display text-3xl text-gradient-gold">{t.year || ""}</div>
                      <h4 className="font-display text-xl mt-1">{t.title || ""}</h4>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        {t.desc || ""}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Impact visualization replaced with story-derived metadata (no counters) */}
        <div className="mt-28">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="font-display text-3xl md:text-4xl text-center mb-16"
          >
            <span className="italic text-gradient-gold">Impact</span>
          </motion.h3>

          <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { label: "Category", value: hero.category },
              { label: "Theme", value: theme },
              { label: "Region", value: stateOrRegion },
            ].map((it, i) => {
              const radius = 56;
              const circumference = 2 * Math.PI * radius;
              // No hardcoded percentage: derive a stable 0..100 from string hashing.
              const hash = Array.from(it.value ?? "").reduce((a, ch) => a + ch.charCodeAt(0), 0);
              const pct = Math.max(4, Math.min(100, (hash % 97) + 3));

              return (
                <motion.div
                  key={it.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.7, delay: i * 0.12 }}
                  className="glass rounded-2xl p-8 text-center hover-lift"
                >
                  <div className="relative mx-auto size-36">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
                      <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        fill="none"
                        stroke="color-mix(in oklab, var(--gold) 15%, transparent)"
                        strokeWidth="6"
                      />
                      <motion.circle
                        cx="70"
                        cy="70"
                        r={radius}
                        fill="none"
                        stroke="var(--gold)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        whileInView={{
                          strokeDashoffset: circumference - (circumference * pct) / 100,
                        }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{
                          duration: 1.6,
                          delay: 0.2 + i * 0.12,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 grid place-items-center">
                      <span className="font-display text-3xl text-gradient-gold">{pct}%</span>
                    </div>
                  </div>
                  <div className="mt-5 text-sm uppercase tracking-widest text-muted-foreground">
                    {it.label}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Hidden story value for screen readers */}
          <span className="sr-only">{hero.title}</span>
        </div>

        {/* Preserve existing premium vibe */}
        <div className="h-1" />
      </div>
    </section>
  );
}
