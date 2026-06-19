import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Instagram, Twitter, Youtube, Linkedin, ChevronDown } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — India Story Project" },
      { name: "description", content: "Reach out to pitch a story, partner, or simply say hello." },
      { property: "og:title", content: "Contact — India Story Project" },
      { property: "og:description", content: "Pitch a story, partner with us, or say hello." },
    ],
  }),
  component: Contact,
});

const faqs = [
  {
    q: "How do I pitch a story?",
    a: "Use the form on this page or email us directly. Share a short pitch (200 words), why this story matters now, and how you'd report it.",
  },
  {
    q: "Do you pay writers?",
    a: "Yes — fairly. We pay industry-leading rates and cover reasonable reporting expenses for commissioned long-form pieces.",
  },
  {
    q: "Can I republish your stories?",
    a: "Selected pieces are available under Creative Commons. Reach out and we'll work something out.",
  },
  {
    q: "Do you accept guest essays?",
    a: "Occasionally. We prioritize reported pieces, but a strong, original essay always finds a home with us.",
  },
];

const socials = [
  { icon: Instagram, label: "Instagram" },
  { icon: Twitter, label: "Twitter" },
  { icon: Youtube, label: "YouTube" },
  { icon: Linkedin, label: "LinkedIn" },
];

function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <SiteLayout>
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-widest text-gold mb-3">Get in touch</p>
          <h1 className="font-display text-5xl md:text-7xl leading-[1.05]">
            Let's tell a <span className="text-gradient-gold italic">story together</span>.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Pitch a story, partner with us, or simply say hello. We read every message.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 mt-16">
          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="glass rounded-2xl p-8 md:p-10 lg:col-span-3 space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" required className="bg-transparent h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required className="bg-transparent h-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" className="bg-transparent h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Your message</Label>
              <Textarea id="message" rows={6} required className="bg-transparent" />
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full bg-gradient-to-r from-gold to-saffron text-gold-foreground border-0 shadow-glow"
            >
              {sent ? "Thank you — we'll be in touch." : "Send message"}
            </Button>
          </form>

          {/* Aside */}
          <aside className="lg:col-span-2 space-y-4">
            <div className="glass rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-lg bg-gradient-to-br from-gold/20 to-saffron/10 grid place-items-center border border-gold/20">
                  <Mail className="size-4 text-gold" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Email</p>
                  <p className="mt-1 text-foreground">hello@indiastoryproject.com</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-lg bg-gradient-to-br from-gold/20 to-saffron/10 grid place-items-center border border-gold/20">
                  <MapPin className="size-4 text-gold" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Studios</p>
                  <p className="mt-1 text-foreground">Bengaluru · Mumbai · Delhi</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-8">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Follow the work</p>
              <div className="flex gap-3">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href="#"
                    aria-label={s.label}
                    className="grid place-items-center size-10 rounded-full glass hover:border-gold/60 transition-colors"
                  >
                    <s.icon className="size-4" />
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* FAQ */}
        <div className="mt-24 max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-gold mb-3 text-center">FAQ</p>
          <h2 className="font-display text-4xl md:text-5xl text-center mb-12">
            Questions, answered.
          </h2>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="glass rounded-2xl px-6 border-0"
              >
                <AccordionTrigger className="font-display text-lg hover:no-underline py-5 [&[data-state=open]>svg]:rotate-180">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </SiteLayout>
  );
}
