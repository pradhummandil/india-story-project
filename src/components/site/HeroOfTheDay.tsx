import { motion } from "framer-motion";
import {
  BookOpen,
  Play,
  Users,
  Calendar,
  Globe2,
  Award,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "./AnimatedCounter";
import heroImage from "@/assets/hero-of-day.jpg";

const infoCards = [
  { icon: Users, value: 12400, suffix: "+", label: "Lives Impacted" },
  { icon: Calendar, value: 14, suffix: "", label: "Years of Work" },
  { icon: Globe2, value: 86, suffix: "", label: "Communities Reached" },
  { icon: Award, value: 9, suffix: "", label: "Awards & Honors" },
];

const timeline = [
  { year: "2012", title: "Started the Mission", desc: "Set up a single loom in a one-room workshop." },
  { year: "2015", title: "First Breakthrough", desc: "Trained 40 women weavers across three villages." },
  { year: "2018", title: "Community Growth", desc: "Cooperative scales to 600 artisans statewide." },
  { year: "2024", title: "National Recognition", desc: "Honored at the National Heritage Awards." },
];

const impact = [
  { label: "Artisans Trained", value: 86 },
  { label: "Looms Restored", value: 72 },
  { label: "Villages Reached", value: 64 },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export function HeroOfTheDay() {
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
          <p className="text-xs uppercase tracking-[0.35em] text-gold mb-4">
            Featured Today
          </p>
          <h2 className="font-display text-4xl md:text-6xl">
            Hero <span className="italic text-gradient-gold">Of The Day</span>
          </h2>
          <p className="mt-5 max-w-2xl mx-auto text-muted-foreground text-lg">
            Celebrating extraordinary people creating extraordinary change.
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
                <motion.img
                  src={heroImage}
                  alt="Ratna Devi, master weaver from Assam"
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
              </div>
              {/* Cinematic overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent pointer-events-none" />

              {/* Floating tag */}
              <div className="absolute top-5 left-5 glass px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest text-gold">
                Heritage · Assam
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
              Assam · Heritage & Craft
            </motion.p>
            <motion.h3
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="font-display text-4xl md:text-5xl leading-tight"
            >
              Ratna <span className="italic text-gradient-gold">Devi</span>
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="mt-5 text-muted-foreground text-lg leading-relaxed"
            >
              In a quiet village of Assam, Ratna is rebuilding a 400-year-old
              weaving tradition — one thread at a time. What began with a
              single loom is now a cooperative of hundreds of women earning
              with dignity through ancestral craft.
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
                size="lg"
                className="bg-gradient-to-r from-gold to-saffron text-gold-foreground border-0 shadow-glow h-12 px-7"
              >
                <BookOpen className="size-4" />
                Read Story
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="glass border-border h-12 px-7"
              >
                <Play className="size-4" />
                Watch Journey
              </Button>
            </motion.div>

            {/* Info cards */}
            <div className="mt-10 grid grid-cols-2 gap-3">
              {infoCards.map((c, i) => (
                <motion.div
                  key={c.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.55 + i * 0.08 }}
                  className="glass rounded-2xl p-5 hover-lift"
                >
                  <c.icon className="size-5 text-gold mb-3" />
                  <div className="font-display text-2xl md:text-3xl text-gradient-gold">
                    <AnimatedCounter value={c.value} suffix={c.suffix} />
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
            "A loom is not just wood and thread.
            <br />
            It is{" "}
            <span className="text-gradient-gold not-italic">memory</span>{" "}
            holding hands with{" "}
            <span className="text-gradient-gold not-italic">tomorrow</span>."
          </blockquote>
          <figcaption className="mt-8 text-xs uppercase tracking-[0.35em] text-muted-foreground">
            — Ratna Devi
          </figcaption>
        </motion.figure>

        {/* Timeline */}
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
            {/* Vertical line */}
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.4, ease: "easeOut" }}
              style={{ transformOrigin: "top" }}
              className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold/60 via-gold/20 to-transparent"
            />

            <div className="space-y-12">
              {timeline.map((t, i) => {
                const left = i % 2 === 0;
                return (
                  <motion.div
                    key={t.year}
                    initial={{ opacity: 0, x: left ? -40 : 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className={`relative pl-12 md:pl-0 md:grid md:grid-cols-2 md:gap-12 ${
                      left ? "" : "md:[&>div:first-child]:col-start-2"
                    }`}
                  >
                    {/* Dot */}
                    <span className="absolute left-4 md:left-1/2 -translate-x-1/2 top-2 size-3 rounded-full bg-gold shadow-glow ring-4 ring-background" />

                    <div className={left ? "md:text-right md:pr-8" : "md:pl-8"}>
                      <div className="font-display text-3xl text-gradient-gold">
                        {t.year}
                      </div>
                      <h4 className="font-display text-xl mt-1">{t.title}</h4>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        {t.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Impact visualization */}
        <div className="mt-28">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="font-display text-3xl md:text-4xl text-center mb-16"
          >
            Measured <span className="italic text-gradient-gold">Impact</span>
          </motion.h3>

          <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {impact.map((it, i) => {
              const radius = 56;
              const circumference = 2 * Math.PI * radius;
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
                    <svg
                      className="w-full h-full -rotate-90"
                      viewBox="0 0 140 140"
                    >
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
                          strokeDashoffset:
                            circumference - (circumference * it.value) / 100,
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
                      <span className="font-display text-3xl text-gradient-gold">
                        <AnimatedCounter value={it.value} suffix="%" />
                      </span>
                    </div>
                  </div>
                  <div className="mt-5 text-sm uppercase tracking-widest text-muted-foreground">
                    {it.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
