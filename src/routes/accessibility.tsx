import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Eye, Shield, Check, Scale, Mail, Info } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/accessibility")({
  head: () => ({
    meta: [
      { title: "Accessibility Statement — India Story Project" },
      {
        name: "description",
        content:
          "Read India Story Project's commitment to web accessibility (WCAG 2.1 Level AA) and how we work to make our stories accessible to all.",
      },
    ],
  }),
  component: AccessibilityStatement,
});

const LAST_UPDATED = "July 1, 2025";

const features = [
  {
    title: "Semantic HTML Elements",
    desc: "We use standard HTML5 semantic elements (like <header>, <nav>, <main>, <article>, and <footer>) to assist screen readers and other assistive technologies.",
  },
  {
    title: "Contrast & Colors",
    desc: "Our typography, borders, and brand accents are optimized to meet or exceed WCAG 2.1 Level AA contrast ratios for readability under varied lighting conditions.",
  },
  {
    title: "Keyboard Navigation",
    desc: "The entire website is designed to be fully navigable using only a keyboard. Focus states are clearly styled and visible as you tab through links and inputs.",
  },
  {
    title: "Alt Text on Images",
    desc: "All content images and state cards include descriptive alt tags, ensuring that visual storytelling is accessible to screen-reader users.",
  },
  {
    title: "Aria Roles and Landmarks",
    desc: "Interactive elements (like the slideshow controls, navigation menus, and search modals) use appropriate ARIA attributes to announce state and control changes.",
  },
];

function AccessibilityStatement() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative border-b border-border/70 bg-card/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-gold/5 pointer-events-none" />
        <div className="container mx-auto px-6 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-6">
              <Eye className="size-4 text-gold" />
              <span className="text-xs uppercase tracking-[0.25em] font-sans font-bold text-gold">
                Compliance
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-4">
              Accessibility Statement
            </h1>
            <p className="text-sm text-muted-foreground font-sans">
              Last updated: {LAST_UPDATED}
            </p>
            <p className="mt-6 text-base text-muted-foreground leading-relaxed font-sans max-w-2xl">
              India Story Project is committed to making its digital platform accessible to
              everyone, including persons with disabilities. We continually work to improve the
              user experience for all readers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-6 py-16 max-w-4xl space-y-16">
        {/* Our Goal */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
            <span className="p-2 rounded-full bg-primary/5 text-primary border border-primary/10">
              <Scale className="size-4" />
            </span>
            <h2 className="font-display text-2xl font-bold">Our Goal & Standards</h2>
          </div>
          <div className="space-y-4">
            <p className="text-sm md:text-base text-foreground/80 leading-relaxed font-sans">
              We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.
              These guidelines explain how to make web content more accessible for people with sensory,
              cognitive, physical, and developmental disabilities.
            </p>
            <p className="text-sm md:text-base text-foreground/80 leading-relaxed font-sans">
              While we strive to make every page fully compliant, we recognize that some content
              (such as interactive maps, legacy media, or user-submitted audio/video) might have
              limitations. We are actively working on improving these elements.
            </p>
          </div>
        </motion.section>

        {/* Features implemented */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
            <span className="p-2 rounded-full bg-primary/5 text-primary border border-primary/10">
              <Check className="size-4" />
            </span>
            <h2 className="font-display text-2xl font-bold">Implemented Accessibility Features</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div key={i} className="p-5 border border-border/50 bg-card/40 space-y-2">
                <h3 className="font-display text-lg font-bold text-gold">{f.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground font-sans leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Contact/Feedback */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 border border-border/50 bg-card/40 space-y-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Mail className="size-4 text-gold" />
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-gold font-sans">
              Feedback
            </span>
          </div>
          <h3 className="font-display text-xl font-bold">Have trouble accessing our site?</h3>
          <p className="text-sm text-muted-foreground font-sans leading-relaxed">
            We welcome your feedback on the accessibility of India Story Project. If you encounter
            any accessibility barriers or need assistance accessing our stories, please reach out
            to us at:
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Mail className="size-4 text-gold" />
            <a
              href="mailto:accessibility@indiastoryproject.com"
              className="text-sm font-sans text-primary hover:text-gold transition-colors underline underline-offset-2"
            >
              accessibility@indiastoryproject.com
            </a>
          </div>
          <p className="text-xs text-muted-foreground font-sans leading-relaxed">
            We endeavor to respond to accessibility feedback within 3 business days and offer
            alternative versions of content wherever possible.
          </p>
        </motion.section>
      </div>
    </SiteLayout>
  );
}
