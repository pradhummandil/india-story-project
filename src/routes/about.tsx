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
  Brain,
  Instagram,
  Mail,
} from "lucide-react";
import { teamMembers } from "@/lib/data/teamMembers";
import { SiteLayout } from "@/components/site/Layout";
import { useI18nStore, uiText } from "@/lib/i18n";

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

const editorialValuesEn = [
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
    desc: "We credit every author, award XP, and treat local storytellers as valued partners.",
  },
  {
    icon: Globe,
    title: "Rooted in Place",
    desc: "We prioritize local, ground-level reporting over distant commentary.",
  },
];

const editorialValuesHi = [
  {
    icon: Feather,
    title: "ट्रैफिक से बढ़कर सत्य",
    desc: "हम कभी क्लिक्स के पीछे नहीं भागते। हर कहानी प्रभाव के लिए चुनी जाती है, न कि वायरल होने के लिए।",
  },
  {
    icon: ShieldCheck,
    title: "सख्त सत्यापन",
    desc: "प्रकाशन से पहले प्राथमिक स्रोतों के खिलाफ तथ्यों की गहन जांच की जाती है।",
  },
  {
    icon: HeartHandshake,
    title: "योगदानकर्ताओं के प्रति निष्पक्ष",
    desc: "हम हर लेखक को श्रेय देते हैं और स्थानीय कहानीकारों को मूल्यवान साझेदार मानते हैं।",
  },
  {
    icon: Globe,
    title: "जमीनी स्तर पर आधारित",
    desc: "हम दूरस्थ टिप्पणी के स्थान पर स्थानीय, धरातलीय रिपोर्टिंग को प्राथमिकता देते हैं।",
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
  const lang = useI18nStore((s) => s.lang);
  const aboutText = uiText[lang].about;

  const stats = [
    { value: "500+", label: lang === "hi" ? "प्रकाशित कहानियाँ" : "Stories Published" },
    { value: "36", label: lang === "hi" ? "राज्य और क्षेत्र" : "States & UTs" },
    { value: "100+", label: lang === "hi" ? "जमीनी नायक" : "Local Heroes" },
    { value: "5M+", label: lang === "hi" ? "पाठक पहुंचे" : "Readers Reached" },
  ];

  return (
    <SiteLayout>
      <div className="bg-background text-foreground min-h-screen">
        {/* ─── Hero Banner ─── */}
        <section className="relative overflow-hidden pt-32 pb-24 md:pt-44 md:pb-32 border-b border-border/40 bg-card">
          <div className="absolute inset-0 bg-hero opacity-20 pointer-events-none" />
          <div className="absolute -top-40 right-1/4 size-[500px] rounded-full bg-gold/6 blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-40 left-1/4 size-[400px] rounded-full bg-saffron/6 blur-[120px] pointer-events-none" />

          <div className="container mx-auto px-6 relative max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-gold/20 text-[11px] uppercase tracking-[0.2em] text-gold font-sans font-bold mb-8"
            >
              <Sparkles className="size-3" />
              {aboutText.title}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-5xl md:text-7xl font-bold leading-[1.06] tracking-tight"
            >
              {lang === "hi" ? "भारत की अनकही" : "Chronicling the People"}
              <br />
              <span className="text-gradient-gold italic">
                {lang === "hi" ? "कहानियों का संग्रह" : "Building Tomorrow's India"}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="mt-7 text-base md:text-lg text-muted-foreground leading-relaxed font-sans max-w-2xl mx-auto"
            >
              {aboutText.subtitle}
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
                  {lang === "hi" ? "हमारा उद्देश्य" : "Mission"}
                </span>
                <h2 className="font-display text-2xl md:text-3xl font-bold mt-2 mb-4 leading-snug">
                  {lang === "hi" ? "धीमी और जमीनी पत्रकारिता" : "Slow, Place-Rooted Journalism"}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-sm font-sans">
                  {lang === "hi"
                    ? "हम स्थानीय समुदाय के सदस्यों से सीधे विस्तृत कहानियों का दस्तावेजीकरण करते हैं। प्रत्येक कहानी की गहन समीक्षा और सत्यापन किया जाता है।"
                    : "We commission long-form stories directly from local community members who live where they report. Every story is reviewed deeply, fact-checked thoroughly, and published with aesthetic care."}
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
                  {lang === "hi" ? "हमारा दृष्टिकोण" : "Vision"}
                </span>
                <h2 className="font-display text-2xl md:text-3xl font-bold mt-2 mb-4 leading-snug">
                  {lang === "hi" ? "भारत का जीवंत संग्रह" : "The Living Archive of Bharat"}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-sm font-sans">
                  {lang === "hi"
                    ? "एक सार्वजनिक खजाना जहाँ दुनिया भर के पाठक खोजते हैं कि भारत क्या बन रहा है — स्थानीय कारीगरों, नवप्रवर्तकों और बदलाव के नायकों की नज़र से।"
                    : "A public treasury where readers around the globe discover who India is becoming — told directly through the lens of local builders, artisans, solar pioneers, and grassroots change agents."}
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
                {lang === "hi" ? "संदर्भ" : "Context"}
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 mb-7 leading-tight max-w-2xl mx-auto">
                {lang === "hi" ? "भारत को इसकी आवश्यकता क्यों है" : "Why India Needs This"}
              </h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-sans max-w-3xl mx-auto">
                {lang === "hi"
                  ? "पारंपरिक मुख्यधारा मीडिया विकासात्मक भारत के आख्यान को प्रशासनिक आंकड़ों तक सीमित कर देता है। मानवीय कारक — डिजिटल पुस्तकालय बनाने वाला शिक्षक, पुरानी फसलों को सहेजने वाला किसान — दब जाता है। हम ये कहानियाँ बताते हैं क्योंकि वे भारत की वास्तविक नींव का प्रतिनिधित्व करती हैं।"
                  : "Traditional mass media reduces the narrative of developmental India to administrative metrics and transient noise. The human factor — the village schoolteacher who built a digital library, the farmer restoring heirloom seeds, the weaver preserving lost indigo patterns — is lost. We tell these stories because they represent the true, resilient foundation of Bharat."}
              </p>
            </motion.div>

            <div className="mt-16 grid sm:grid-cols-2 gap-5 text-left">
              {[
                {
                  icon: BookOpen,
                  text: lang === "hi" ? "पूर्ण संपादकीय देखरेख के साथ 500+ से अधिक कहानियाँ प्रकाशित" : "Over 500+ long-form stories published with full editorial oversight",
                },
                {
                  icon: MapPin,
                  text: lang === "hi" ? "हमारे संग्रह में सभी 36 राज्य और केंद्र शासित प्रदेश शामिल हैं" : "All 36 States and Union Territories represented in our archive",
                },
                {
                  icon: Users,
                  text: lang === "hi" ? "पूरे भारत से सत्यापित योगदानकर्ताओं का बढ़ता समुदाय" : "A growing community of verified contributors from across India",
                },
                {
                  icon: Award,
                  text: lang === "hi" ? "पाठकों द्वारा भारत का सबसे विश्वसनीय मानवीय कहानियों का मंच माना गया" : "Recognized by readers as India's most credible human-interest platform",
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
                {lang === "hi" ? "हमारे सिद्धांत" : "Our Principles"}
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 leading-tight">
                {lang === "hi" ? "संपादकीय मूल्य" : "Editorial Values"}
              </h2>
              <div className="w-12 h-0.5 bg-primary/60 mx-auto mt-5" />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(lang === "hi" ? editorialValuesHi : editorialValuesEn).map((v, i) => (
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

        {/* ─── Team India Story Project ─── */}
        <section className="py-24 border-b border-border/40">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16">
              <span className="text-[11px] uppercase tracking-[0.2em] font-sans font-bold text-gold">
                Team India Story Project
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 leading-tight">
                Team India Story Project
              </h2>
              <p className="mt-4 text-muted-foreground font-sans max-w-xl mx-auto text-sm">
                The people preserving India's stories through technology, culture, research and design.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, i) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative overflow-hidden rounded-2xl border border-border/30 bg-card/10 hover:border-gold/30 hover:bg-card/25 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center p-6 text-center"
                >
                  {/* Circular Avatar / Placeholder */}
                  <div className="relative mb-6">
                    <div className="size-28 rounded-full overflow-hidden border border-gold/20 flex items-center justify-center bg-gradient-to-br from-gold/15 to-saffron/10 relative shadow-inner group-hover:scale-105 transition-transform duration-500">
                      {member.photo ? (
                        <img
                          src={member.photo}
                          alt={member.name}
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      ) : (
                        <span className="font-display text-2xl md:text-3xl font-black text-gradient-gold tracking-wider select-none">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Name & Role */}
                  <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                    {member.name}
                  </h3>
                  <p className="text-xs uppercase tracking-wider font-sans font-bold text-gold mt-1.5 mb-3">
                    {member.role}
                  </p>

                  {/* Bio */}
                  <p className="text-xs text-muted-foreground font-sans leading-relaxed flex-1 mb-4">
                    {member.bio}
                  </p>

                  {/* Location if available */}
                  {member.location && (
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/60 font-sans mb-5 flex items-center gap-1">
                      <MapPin className="size-3 text-gold/60" />
                      {member.location}
                    </p>
                  )}

                  {/* Social Links */}
                  <div className="flex items-center justify-center gap-3 mt-auto pt-4 border-t border-border/40 w-full">
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/4 border border-white/5 hover:border-gold/30 hover:bg-gold/8 text-white/50 hover:text-gold transition-all duration-300"
                        aria-label={`${member.name}'s LinkedIn profile`}
                      >
                        <Linkedin className="size-4" />
                      </a>
                    )}
                    {member.github && (
                      <a
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/4 border border-white/5 hover:border-gold/30 hover:bg-gold/8 text-white/50 hover:text-gold transition-all duration-300"
                        aria-label={`${member.name}'s GitHub profile`}
                      >
                        <Github className="size-4" />
                      </a>
                    )}
                    {member.instagram && (
                      <a
                        href={member.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/4 border border-white/5 hover:border-gold/30 hover:bg-gold/8 text-white/50 hover:text-gold transition-all duration-300"
                        aria-label={`${member.name}'s Instagram profile`}
                      >
                        <Instagram className="size-4" />
                      </a>
                    )}
                    {member.twitter && (
                      <a
                        href={member.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/4 border border-white/5 hover:border-gold/30 hover:bg-gold/8 text-white/50 hover:text-gold transition-all duration-300"
                        aria-label={`${member.name}'s X/Twitter profile`}
                      >
                        <Twitter className="size-4" />
                      </a>
                    )}
                    {member.website && (
                      <a
                        href={member.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/4 border border-white/5 hover:border-gold/30 hover:bg-gold/8 text-white/50 hover:text-gold transition-all duration-300"
                        aria-label={`${member.name}'s official website`}
                      >
                        <Globe className="size-4" />
                      </a>
                    )}
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="p-2 rounded-lg bg-white/4 border border-white/5 hover:border-gold/30 hover:bg-gold/8 text-white/50 hover:text-gold transition-all duration-300"
                        aria-label={`Email ${member.name}`}
                      >
                        <Mail className="size-4" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
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
