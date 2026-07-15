import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  MapPin,
  Phone,
  MessageSquare,
  PenTool,
  Bug,
  ShieldQuestion,
  Briefcase,
  Radio,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Twitter,
  Linkedin,
  Instagram,
  Github,
  ExternalLink,
  Feather,
  Send,
} from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — India Story Project" },
      {
        name: "description",
        content:
          "Reach out to pitch a story, partner with us, or request technical support. Let's build India's story together.",
      },
    ],
  }),
  component: Contact,
});

const contactCards = [
  {
    icon: PenTool,
    title: "Editorial & Story Pitches",
    desc: "Have a story of a local hero, innovation, or cultural heritage? Share a 200-word pitch with us.",
    email: "editorial@indiastoryproject.com",
    color: "from-amber-500/10 to-amber-600/5",
    accent: "text-amber-400",
    accentBg: "bg-amber-500/10 border-amber-500/15",
  },
  {
    icon: Bug,
    title: "Technical Support",
    desc: "Encountering a bug or platform issue? Our technical team is ready to help.",
    email: "technical@indiastoryproject.com",
    color: "from-blue-500/10 to-blue-600/5",
    accent: "text-blue-400",
    accentBg: "bg-blue-500/10 border-blue-500/15",
  },
  {
    icon: ShieldQuestion,
    title: "General Support",
    desc: "Questions about your account, XP points, reading streaks, or story submissions.",
    email: "support@indiastoryproject.com",
    color: "from-purple-500/10 to-purple-600/5",
    accent: "text-purple-400",
    accentBg: "bg-purple-500/10 border-purple-500/15",
  },
  {
    icon: Briefcase,
    title: "Business & Partnerships",
    desc: "Interested in licensing our story database or collaborating on community impact?",
    email: "business@indiastoryproject.com",
    color: "from-emerald-500/10 to-emerald-600/5",
    accent: "text-emerald-400",
    accentBg: "bg-emerald-500/10 border-emerald-500/15",
  },
  {
    icon: Radio,
    title: "Media & Press",
    desc: "For interview requests, press releases, media kits, or coverage inquiries.",
    email: "media@indiastoryproject.com",
    color: "from-rose-500/10 to-rose-600/5",
    accent: "text-rose-400",
    accentBg: "bg-rose-500/10 border-rose-500/15",
  },
];

const socialLinks = [
  {
    icon: Twitter,
    label: "Twitter / X",
    handle: "@indiastoryproject",
    href: "https://twitter.com",
  },
  {
    icon: Instagram,
    label: "Instagram",
    handle: "@indiastoryproject",
    href: "https://instagram.com",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    handle: "India Story Project",
    href: "https://linkedin.com",
  },
  { icon: Github, label: "GitHub", handle: "indiastoryproject", href: "https://github.com" },
];

// Floating label input component
function FloatingInput({
  id,
  label,
  type = "text",
  required = false,
  value,
  onChange,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const isFloated = focused || value.length > 0;

  return (
    <div className="relative pt-5">
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        className="peer w-full h-11 bg-transparent border-b-2 border-border/40 focus:border-gold text-foreground font-sans text-sm outline-none transition-colors duration-200 placeholder-transparent"
        placeholder={label}
      />
      <label
        htmlFor={id}
        className={`absolute left-0 pointer-events-none font-sans transition-all duration-200 ${
          isFloated
            ? "top-0 text-[10px] font-bold uppercase tracking-[0.15em] text-gold"
            : "top-5 text-sm text-muted-foreground"
        }`}
      >
        {label}
        {required && " *"}
      </label>
      <div
        className={`absolute bottom-0 left-0 h-0.5 bg-gold transition-all duration-300 ${focused ? "w-full" : "w-0"}`}
      />
    </div>
  );
}

function FloatingTextarea({
  id,
  label,
  required = false,
  value,
  onChange,
}: {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const isFloated = focused || value.length > 0;

  return (
    <div className="relative pt-5">
      <textarea
        id={id}
        required={required}
        rows={5}
        value={value}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        className="peer w-full bg-transparent border-b-2 border-border/40 focus:border-gold text-foreground font-sans text-sm outline-none transition-colors duration-200 resize-none pt-2 placeholder-transparent"
        placeholder={label}
      />
      <label
        htmlFor={id}
        className={`absolute left-0 pointer-events-none font-sans transition-all duration-200 ${
          isFloated
            ? "top-0 text-[10px] font-bold uppercase tracking-[0.15em] text-gold"
            : "top-6 text-sm text-muted-foreground"
        }`}
      >
        {label}
        {required && " *"}
      </label>
      <div
        className={`absolute bottom-0 left-0 h-0.5 bg-gold transition-all duration-300 ${focused ? "w-full" : "w-0"}`}
      />
    </div>
  );
}

function Contact() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      setSent(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <div className="bg-background text-foreground min-h-screen">
        {/* ─── Hero ─── */}
        <section className="relative overflow-hidden pt-32 pb-24 md:pt-44 md:pb-32 border-b border-border/40 bg-card">
          <div className="absolute inset-0 bg-hero opacity-20 pointer-events-none" />
          <div className="absolute -top-60 left-1/3 size-[600px] rounded-full bg-gold/6 blur-[130px] pointer-events-none" />
          <div className="absolute -bottom-60 right-1/3 size-[500px] rounded-full bg-saffron/6 blur-[130px] pointer-events-none" />
          <div
            className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)",
              backgroundSize: "48px 48px",
            }}
          />

          <div className="container mx-auto px-6 relative max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass border border-gold/20 text-[11px] uppercase tracking-[0.2em] text-gold font-sans font-bold mb-8"
            >
              <MessageSquare className="size-3" />
              Get In Touch
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight"
            >
              Let's Build India's
              <br />
              <span className="text-gradient-gold italic">Story Together</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="mt-7 text-base md:text-lg text-muted-foreground leading-relaxed font-sans max-w-2xl mx-auto"
            >
              Have a story to pitch? A partnership idea? A technical question? We read every message
              and route it to the right team within 24–48 hours.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-muted-foreground font-sans"
            >
              {[
                { icon: Mail, text: "indiastoryprojectmanager21@gmail.com" },
                { icon: MapPin, text: "Bengaluru · Mumbai · Delhi" },
                { icon: Phone, text: "+91 80 4567 8901" },
              ].map((item, i) => (
                <span key={i} className="flex items-center gap-2">
                  <item.icon className="size-3.5 text-gold" />
                  {item.text}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── Contact Category Cards ─── */}
        <section className="py-20 border-b border-border/40">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-12">
              <span className="text-[11px] uppercase tracking-[0.2em] font-sans font-bold text-gold">
                Departments
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold mt-3">
                Who Should You Reach?
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {contactCards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  className={`bg-gradient-to-b ${card.color} border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-white/12 hover-lift group transition-all duration-300`}
                >
                  <div className="space-y-4">
                    <div
                      className={`size-10 rounded-xl ${card.accentBg} flex items-center justify-center border ${card.accent}`}
                    >
                      <card.icon className="size-4" />
                    </div>
                    <h3 className="font-display font-bold text-sm text-foreground leading-snug">
                      {card.title}
                    </h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
                      {card.desc}
                    </p>
                  </div>
                  <a
                    href={`mailto:${card.email}`}
                    className={`mt-6 flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-wider ${card.accent} hover:opacity-80 transition-opacity group`}
                  >
                    <span className="truncate">{card.email}</span>
                    <ExternalLink className="size-2.5 shrink-0 opacity-60" />
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Form + Info ─── */}
        <section className="py-20 border-b border-border/40">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="grid lg:grid-cols-5 gap-12">
              {/* ─── Form (3/5) ─── */}
              <div className="lg:col-span-3">
                <div className="mb-8">
                  <span className="text-[11px] uppercase tracking-[0.2em] font-sans font-bold text-gold">
                    Send a Message
                  </span>
                  <h2 className="font-display text-2xl md:text-3xl font-bold mt-2">Write to Us</h2>
                </div>

                <AnimatePresence mode="wait">
                  {sent ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass rounded-2xl border border-white/8 p-10 text-center"
                    >
                      <div className="size-16 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mx-auto mb-5">
                        <CheckCircle2 className="size-7 text-emerald-400" />
                      </div>
                      <h3 className="font-display text-xl font-bold text-foreground mb-2">
                        Message Received!
                      </h3>
                      <p className="text-sm text-muted-foreground font-sans max-w-xs mx-auto leading-relaxed mb-6">
                        Thank you for reaching out. We'll get back to you within 24–48 hours.
                      </p>
                      <button
                        onClick={() => {
                          setSent(false);
                          setName("");
                          setEmail("");
                          setSubject("");
                          setMessage("");
                        }}
                        className="text-xs uppercase tracking-widest font-bold font-sans text-gold hover:text-gold/70 transition-colors"
                      >
                        Send Another Message
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={handleSubmit}
                      className="glass rounded-2xl border border-white/8 p-8 md:p-10 space-y-8"
                    >
                      {errorMsg && (
                        <div className="p-4 rounded-xl text-sm bg-red-500/8 border border-red-500/20 text-red-400 font-sans">
                          {errorMsg}
                        </div>
                      )}

                      <div className="grid sm:grid-cols-2 gap-8">
                        <FloatingInput
                          id="name"
                          label="Your Name"
                          required
                          value={name}
                          onChange={setName}
                        />
                        <FloatingInput
                          id="email"
                          label="Email Address"
                          type="email"
                          required
                          value={email}
                          onChange={setEmail}
                        />
                      </div>

                      <FloatingInput
                        id="subject"
                        label="Subject"
                        required
                        value={subject}
                        onChange={setSubject}
                      />

                      <FloatingTextarea
                        id="message"
                        label="Your Message"
                        required
                        value={message}
                        onChange={setMessage}
                      />

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-gradient-to-r from-gold to-saffron text-black font-bold font-sans uppercase tracking-[0.15em] text-xs rounded-xl border-0 shadow-glow btn-premium flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Sparkles className="size-4 animate-pulse" />
                            Sending…
                          </>
                        ) : (
                          <>
                            <Send className="size-4" />
                            Send Message
                          </>
                        )}
                      </Button>

                      <p className="text-center text-[10px] text-muted-foreground font-sans">
                        We typically respond within 24–48 business hours.
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              {/* ─── Info + Social (2/5) ─── */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <span className="text-[11px] uppercase tracking-[0.2em] font-sans font-bold text-gold">
                    Contact Details
                  </span>
                  <h2 className="font-display text-2xl font-bold mt-2 mb-6">Reach Us Directly</h2>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      icon: Mail,
                      label: "Primary Email",
                      value: "indiastoryprojectmanager21@gmail.com",
                      href: "mailto:indiastoryprojectmanager21@gmail.com",
                    },
                    {
                      icon: MapPin,
                      label: "National Offices",
                      value: "Bengaluru · Mumbai · New Delhi",
                      href: undefined,
                    },
                    {
                      icon: Phone,
                      label: "Phone Helpline",
                      value: "+91 80 4567 8901",
                      href: "tel:+918045678901",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="glass rounded-xl p-5 border border-white/5 flex items-start gap-4 hover:border-gold/15 transition-colors group"
                    >
                      <div className="size-9 rounded-lg bg-gold/8 border border-gold/15 flex items-center justify-center text-gold shrink-0 group-hover:bg-gold/15 transition-colors">
                        <item.icon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-[0.15em] font-bold font-sans text-muted-foreground mb-0.5">
                          {item.label}
                        </div>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-sm font-sans text-foreground hover:text-gold transition-colors truncate block"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <span className="text-sm font-sans text-foreground">{item.value}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Social Links */}
                <div className="pt-2">
                  <h4 className="text-[10px] uppercase tracking-[0.15em] font-bold font-sans text-muted-foreground mb-4">
                    Follow Us
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {socialLinks.map((soc, i) => (
                      <a
                        key={i}
                        href={soc.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass rounded-xl p-3 border border-white/5 flex items-center gap-3 hover:border-gold/20 hover:bg-gold/4 transition-all duration-200 group"
                      >
                        <div className="size-7 rounded-lg bg-white/4 flex items-center justify-center text-muted-foreground group-hover:text-gold transition-colors">
                          <soc.icon className="size-3.5" />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-bold tracking-wider font-sans text-muted-foreground group-hover:text-foreground transition-colors">
                            {soc.label}
                          </div>
                          <div className="text-[9px] text-muted-foreground/60 font-sans truncate">
                            {soc.handle}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Mini map */}
                <div className="h-48 rounded-xl border border-border/40 overflow-hidden bg-card/20 relative">
                  <iframe
                    title="India Story Project — Bengaluru Office"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.9268393561937!2d77.61831861536647!3d12.976402390852928!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1680d249f7e5%3A0xa64aa9a785d0d8bf!2sMG%20Road%20Bengaluru!5e0!3m2!1sen!2sin!4v1655021235122!5m2!1sen!2sin"
                    className="w-full h-full border-0 grayscale opacity-40 contrast-110 saturate-50"
                    allowFullScreen
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[10px] font-sans font-bold text-white/60">
                    <MapPin className="size-3 text-gold" />
                    MG Road, Bengaluru
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Story Pitch CTA ─── */}
        <section className="py-20">
          <div className="container mx-auto px-6 max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl border border-gold/15 p-10 md:p-14 relative overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 size-[200px] rounded-full bg-gold/5 blur-3xl pointer-events-none" />
              <Feather className="size-7 text-gold mx-auto mb-5" />
              <h2 className="font-display text-2xl md:text-4xl font-bold mb-4 leading-tight">
                Have a Story to Tell?
              </h2>
              <p className="text-muted-foreground font-sans text-sm max-w-md mx-auto mb-8 leading-relaxed">
                Skip the contact form — go straight to our story submission portal and share your
                story with India.
              </p>
              <a
                href="/share-story"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-bold text-xs uppercase tracking-widest h-11 px-7 rounded-full shadow-glow transition-all duration-300 btn-premium"
              >
                Submit Your Story
                <ArrowRight className="size-3.5" />
              </a>
            </motion.div>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
