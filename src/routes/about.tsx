import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Globe,
  ShieldCheck,
  HeartHandshake,
  Award,
  Cpu,
  Github,
  Linkedin,
  Twitter,
  Sparkles,
  BookOpen,
  Users,
  MapPin,
  Feather,
  Zap,
  Eye,
  Code2,
  Smartphone,
  Brain,
  ExternalLink,
} from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — India Story Project" },
      {
        name: "description",
        content:
          "We are India's dedicated slow-journalism platform — celebrating transformational change, local heroes, and cultural heritage across all 36 states and UTs.",
      },
    ],
  }),
  component: About,
});

const stats = [
  { value: "500+", label: "Stories Published" },
  { value: "36", label: "States & UTs" },
  { value: "100+", label: "Local Heroes" },
  { value: "5M+", label: "Readers Reached" },
];

const editorialValues = [
  {
    icon: Feather,
    title: "Truth Over Traffic",
    desc: "We never chase clicks. Every story is chosen for impact, not virality.",
  },
  {
    icon: ShieldCheck,
    title: "Rigorous Verification",
    desc: "Facts are checked against primary sources before a single word goes live.",
  },
  {
    icon: HeartHandshake,
    title: "Fair to Contributors",
    desc: "We credit every author, award XP, and treat storytellers as valued partners.",
  },
  {
    icon: Globe,
    title: "Rooted in Place",
    desc: "We prioritize local, ground-level reporting over distant commentary.",
  },
];

const processSteps = [
  {
    num: "01",
    title: "Submission",
    desc: "Contributors submit stories through our secure portal with images, context, and source links.",
  },
  {
    num: "02",
    title: "Editorial Review",
    desc: "Our editors assess the story's impact, originality, and community relevance.",
  },
  {
    num: "03",
    title: "Fact Verification",
    desc: "Independent fact-checkers verify people, places, and claims using primary data.",
  },
  {
    num: "04",
    title: "Story Selection",
    desc: "Stories that meet our editorial standards and resonate with our audience are greenlit.",
  },
  {
    num: "05",
    title: "Publication",
    desc: "Approved stories are published with full author credit, imagery, and SEO optimization.",
  },
];

const techStack = [
  {
    name: "React & TanStack",
    icon: Code2,
    desc: "Type-safe client with high-performance routing and state management",
  },
  {
    name: "Prisma & PostgreSQL",
    icon: Cpu,
    desc: "Relational data modeling with migration-safe schema management",
  },
  {
    name: "Supabase",
    icon: Zap,
    desc: "Real-time auth, storage, and serverless database at the edge",
  },
  {
    name: "Gemini AI",
    icon: Brain,
    desc: "Context-aware AI chatbot trained on India's story database",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: i * 0.1,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

function About() {
  return (
    <SiteLayout>
      <div className="bg-background text-foreground min-h-screen">
        {/* ─── Hero Banner ─── */}
        <section className="relative overflow-hidden pt-32 pb-24 md:pt-44 md:pb-32 border-b border-border/40 bg-black">
          <div className="absolute inset-0 bg-hero opacity-20 pointer-events-none" />
          <div className="absolute -top-60 left-1/3 size-[700px] rounded-full bg-gold/6 blur-[140px] pointer-events-none" />
          <div className="absolute -bottom-60 right-1/3 size-[600px] rounded-full bg-saffron/6 blur-[140px] pointer-events-none" />
          <div
            className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "48px 48px",
            }}
          />

          <div className="container mx-auto px-6 relative max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass border border-gold/20 text-[11px] uppercase tracking-[0.2em] text-gold font-sans font-bold mb-8"
            >
              <Globe className="size-3" />
              About India Story Project
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight"
            >
              India Deserves
              <br />
              <span className="text-gradient-gold italic">Better Stories</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="mt-7 text-base md:text-lg text-muted-foreground leading-relaxed font-sans max-w-2xl mx-auto"
            >
              In a world dominated by outrage cycles and fleeting headlines, the quiet stories of
              positive change — local craftsmanship, community innovations, and grassroots heroes —
              are constantly being drowned out. We exist to change that.
            </motion.p>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.3 }}
              className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
            >
              {stats.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="font-display text-4xl md:text-5xl font-black text-gradient-gold">
                    {s.value}
                  </div>
                  <div className="mt-1.5 text-[10px] uppercase tracking-[0.18em] font-sans font-bold text-muted-foreground">
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── Mission & Vision ─── */}
        <section className="py-24 border-b border-border/40">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="glass rounded-2xl p-10 border border-white/5 hover:border-gold/20 hover-lift group"
              >
                <div className="size-12 rounded-xl bg-gold/8 border border-gold/15 flex items-center justify-center text-gold mb-6 group-hover:bg-gold/15 transition-colors">
                  <Feather className="size-5" />
                </div>
                <span className="text-[11px] uppercase tracking-[0.2em] font-sans font-bold text-gold">
                  Mission
                </span>
                <h2 className="font-display text-2xl md:text-3xl font-bold mt-2 mb-4 leading-snug">
                  Slow, Place-Rooted Journalism
                </h2>
                <p className="text-muted-foreground leading-relaxed text-sm font-sans">
                  We commission long-form stories directly from local community members who live
                  where they report. Every story is reviewed deeply, fact-checked thoroughly, and
                  published with aesthetic care. No SEO sensationalism. No hot-takes. Just real,
                  transformative India.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="glass rounded-2xl p-10 border border-white/5 hover:border-gold/20 hover-lift group"
              >
                <div className="size-12 rounded-xl bg-gold/8 border border-gold/15 flex items-center justify-center text-gold mb-6 group-hover:bg-gold/15 transition-colors">
                  <Eye className="size-5" />
                </div>
                <span className="text-[11px] uppercase tracking-[0.2em] font-sans font-bold text-gold">
                  Vision
                </span>
                <h2 className="font-display text-2xl md:text-3xl font-bold mt-2 mb-4 leading-snug">
                  The Living Archive of Bharat
                </h2>
                <p className="text-muted-foreground leading-relaxed text-sm font-sans">
                  A public treasury where readers around the globe discover who India is becoming —
                  told directly through the lens of local builders, artisans, solar pioneers, and
                  grassroots change agents. A living, evolving record of modern Bharat.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── Why India Needs This ─── */}
        <section className="py-24 bg-card/10 border-b border-border/40">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-[11px] uppercase tracking-[0.2em] font-sans font-bold text-gold">
                Context
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 mb-7 leading-tight max-w-2xl mx-auto">
                Why India Needs This
              </h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-sans max-w-3xl mx-auto">
                Traditional mass media reduces the narrative of developmental India to
                administrative metrics and transient noise. The human factor — the village
                schoolteacher who built a digital library, the farmer restoring heirloom seeds, the
                weaver preserving lost indigo patterns — is lost. We tell these stories because they
                represent the true, resilient foundation of Bharat.
              </p>
            </motion.div>

            <div className="mt-16 grid sm:grid-cols-2 gap-5 text-left">
              {[
                {
                  icon: BookOpen,
                  text: "Over 500+ long-form stories published with full editorial oversight",
                },
                {
                  icon: MapPin,
                  text: "All 36 States and Union Territories represented in our archive",
                },
                {
                  icon: Users,
                  text: "A growing community of verified contributors from across India",
                },
                {
                  icon: Award,
                  text: "Recognized by readers as India's most credible human-interest platform",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="glass rounded-xl p-5 border border-white/5 flex items-start gap-4 hover:border-gold/15 transition-colors"
                >
                  <div className="size-9 rounded-lg bg-gold/8 border border-gold/15 flex items-center justify-center text-gold shrink-0">
                    <item.icon className="size-4" />
                  </div>
                  <p className="text-sm font-sans text-foreground/80 leading-relaxed">
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Editorial Values ─── */}
        <section className="py-24 border-b border-border/40">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16">
              <span className="text-[11px] uppercase tracking-[0.2em] font-sans font-bold text-gold">
                Our Principles
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 leading-tight">
                Editorial Values
              </h2>
              <div className="w-12 h-0.5 bg-primary/60 mx-auto mt-5" />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {editorialValues.map((v, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="text-center space-y-4 p-7 border border-border/30 rounded-2xl bg-card/10 hover:border-gold/20 hover:bg-card/30 transition-all duration-300 group"
                >
                  <div className="size-14 rounded-2xl bg-gold/8 border border-gold/15 flex items-center justify-center mx-auto text-gold group-hover:bg-gold/15 transition-colors duration-300">
                    <v.icon className="size-6" />
                  </div>
                  <h3 className="font-display font-bold text-base text-foreground">{v.title}</h3>
                  <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                    {v.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Story Selection Process ─── */}
        <section className="py-24 bg-card/10 border-b border-border/40">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="text-center mb-16">
              <span className="text-[11px] uppercase tracking-[0.2em] font-sans font-bold text-gold">
                Our Process
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 leading-tight">
                Story Selection Process
              </h2>
              <p className="mt-4 text-muted-foreground font-sans max-w-xl mx-auto text-sm">
                Every story goes through a transparent, rigorous editorial pipeline before reaching
                our readers.
              </p>
            </div>

            <div className="relative">
              {/* Connecting line */}
              <div className="hidden lg:block absolute top-8 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

              <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-6">
                {processSteps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="text-center space-y-3 relative"
                  >
                    <div className="size-16 rounded-full glass border border-gold/15 flex items-center justify-center mx-auto font-display text-xl font-black text-gradient-gold relative z-10">
                      {step.num}
                    </div>
                    <h4 className="font-sans font-bold text-sm text-foreground">{step.title}</h4>
                    <p className="text-[11px] text-muted-foreground font-sans leading-relaxed">
                      {step.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Meet the Developer (PREMIUM CARD) ─── */}
        <section className="py-24 border-b border-border/40">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="text-center mb-16">
              <span className="text-[11px] uppercase tracking-[0.2em] font-sans font-bold text-gold">
                The Architect
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 leading-tight">
                Meet the Builder
              </h2>
              <p className="mt-4 text-muted-foreground font-sans max-w-xl mx-auto text-sm">
                The engineer who designed and built the India Story Project from first principles.
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden rounded-3xl"
              >
                {/* Outer glow border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gold/30 via-transparent to-saffron/20 p-px">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#0d0d0d] to-[#111] backdrop-blur-xl" />
                </div>

                <div className="relative p-8 md:p-12">
                  {/* Decorative corner elements */}
                  <div className="absolute top-4 right-4 text-[9px] font-sans uppercase tracking-[0.25em] text-gold/40 font-bold">
                    Lead Engineer
                  </div>
                  <div className="absolute bottom-4 left-4 size-1 rounded-full bg-gold/30" />
                  <div className="absolute bottom-4 left-7 size-1 rounded-full bg-gold/20" />
                  <div className="absolute bottom-4 left-10 size-1 rounded-full bg-gold/10" />

                  <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="size-32 md:size-40 rounded-2xl overflow-hidden bg-gradient-to-br from-gold/20 to-saffron/10 border border-gold/25 flex items-center justify-center relative shadow-glow">
                        {/* Decorative icon-based avatar */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d0d] to-[#1a1a1a]" />
                        <div className="relative z-10 flex flex-col items-center gap-1">
                          <Cpu className="size-10 text-gold" />
                          <Sparkles className="size-4 text-saffron absolute -top-1 -right-1 animate-pulse" />
                          <span className="text-[8px] uppercase font-sans font-black tracking-[0.25em] text-white/40 mt-1">
                            ISP Dev
                          </span>
                        </div>
                      </div>

                      {/* Status badge */}
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-gold to-saffron text-[8px] uppercase font-black tracking-[0.2em] text-black px-3 py-1 rounded-full shadow-glow">
                        Verified Developer
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 text-center md:text-left space-y-5">
                      <div>
                        <h3 className="font-display text-3xl md:text-4xl font-extrabold text-white leading-tight">
                          Pradhum Mandil
                        </h3>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                          {[
                            { icon: Code2, label: "Full Stack Web" },
                            { icon: Smartphone, label: "Flutter Apps" },
                            { icon: Brain, label: "AI Engineer" },
                          ].map((role, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-gold/80 bg-gold/8 border border-gold/15 px-2.5 py-1 rounded-full font-sans"
                            >
                              <role.icon className="size-3" />
                              {role.label}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                        Pradhum Mandil is the principal architect of the India Story Project. He
                        designed the entire platform from first principles — engineering the
                        high-performance TanStack routing engine, building the real-time Supabase
                        Auth and database layer, developing the hybrid Cloudinary/Supabase media
                        storage pipeline, and integrating the context-aware Gemini AI chatbot that
                        surfaces local hero stories across Bharat.
                      </p>

                      <div className="flex justify-center md:justify-start items-center gap-3 pt-1">
                        {[
                          {
                            icon: Github,
                            href: "https://github.com",
                            label: "GitHub",
                            hint: "github.com/pradhummandil",
                          },
                          {
                            icon: Linkedin,
                            href: "https://linkedin.com",
                            label: "LinkedIn",
                            hint: "linkedin.com/in/pradhum",
                          },
                          {
                            icon: Twitter,
                            href: "https://twitter.com",
                            label: "Twitter / X",
                            hint: "@pradhummandil",
                          },
                        ].map((soc, i) => (
                          <a
                            key={i}
                            href={soc.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-white/4 border border-white/8 hover:border-gold/30 hover:bg-gold/8 transition-all duration-300"
                            aria-label={soc.label}
                          >
                            <soc.icon className="size-3.5 text-white/60 group-hover:text-gold transition-colors" />
                            <span className="text-[10px] font-sans text-white/40 group-hover:text-gold/70 transition-colors hidden sm:block">
                              {soc.hint}
                            </span>
                            <ExternalLink className="size-2.5 text-white/20 group-hover:text-gold/40 transition-colors" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── Technology Stack ─── */}
        <section className="py-20 border-b border-border/40 bg-card/5">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="text-center mb-12">
              <span className="text-[11px] uppercase tracking-[0.2em] font-sans font-bold text-gold">
                Architecture
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold mt-3">
                Technology Powering the Platform
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {techStack.map((tech, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="glass rounded-xl p-6 border border-white/5 hover:border-gold/20 group transition-all duration-300"
                >
                  <div className="size-10 rounded-lg bg-gold/8 border border-gold/15 flex items-center justify-center text-gold mb-4 group-hover:bg-gold/15 transition-colors">
                    <tech.icon className="size-4.5" />
                  </div>
                  <h4 className="font-sans font-bold text-sm text-foreground mb-1.5">
                    {tech.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground font-sans leading-relaxed">
                    {tech.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section className="py-20">
          <div className="container mx-auto px-6 max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <Feather className="size-7 text-gold mx-auto" />
              <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight">
                Be Part of <span className="text-gradient-gold italic">India's Story</span>
              </h2>
              <p className="text-muted-foreground font-sans text-sm max-w-md mx-auto leading-relaxed">
                Whether you're a reader, a storyteller, or a community builder — this platform is
                built for you.
              </p>
              <a
                href="/share-story"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-bold text-sm uppercase tracking-widest h-12 px-8 rounded-full shadow-glow transition-all duration-300 btn-premium"
              >
                Share Your Story
              </a>
            </motion.div>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
