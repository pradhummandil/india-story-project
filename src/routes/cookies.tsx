import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Cookie, Shield, Eye, Settings, HelpCircle, Mail } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — India Story Project" },
      {
        name: "description",
        content:
          "Read the Cookie Policy for India Story Project to understand how we use cookies and how you can manage your preferences.",
      },
    ],
  }),
  component: CookiePolicy,
});

const LAST_UPDATED = "July 1, 2025";

const sections = [
  {
    id: "what-are-cookies",
    icon: Cookie,
    title: "1. What Are Cookies?",
    content: [
      "Cookies are small text files stored on your device (computer, tablet, or mobile) when you visit websites. They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site.",
      "Cookies help us recognize your device, remember your preferences, and improve your overall browsing experience. They do not damage your computer or retrieve any personally identifiable information from your hard drive.",
    ],
  },
  {
    id: "how-we-use",
    icon: Shield,
    title: "2. How We Use Cookies",
    content: [
      "We use cookies for several reasons, including keeping you signed in, remembering your preferences (such as language selection), analyzing website traffic, and providing a personalized experience.",
      "The cookies we use fall into three main categories: (a) Strictly Necessary Cookies, (b) Analytical/Performance Cookies, and (c) Functional/Preference Cookies. We do not use intrusive advertising or tracking cookies from third-party networks.",
    ],
  },
  {
    id: "types-of-cookies",
    icon: Eye,
    title: "3. Types of Cookies We Set",
    content: [
      "Strictly Necessary: These cookies are essential for you to move around the website and use its features, such as accessing secure areas of the site (e.g., contributor dashboard, editor workflow). Without these, services like authentication cannot be provided.",
      "Analytical/Performance: These allow us to recognize and count the number of visitors and see how visitors move around our website when they are using it. This helps us improve the way our website works (e.g., ensuring users find what they are looking for easily). We use Vercel Analytics and Google Analytics for this purpose.",
      "Functional/Preferences: These are used to recognize you when you return to our website. This enables us to personalize our content for you, greet you by name, and remember your preferences (for example, your choice of English or Hindi).",
    ],
  },
  {
    id: "managing-preferences",
    icon: Settings,
    title: "4. Managing Your Cookie Preferences",
    content: [
      "Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set, visit www.aboutcookies.org or www.allaboutcookies.org.",
      "If you choose to decline or block cookies, please note that some parts of our Service may not function properly or may become inaccessible (such as saving your reading progress or staying logged into your dashboard).",
    ],
  },
];

function CookiePolicy() {
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
              <Cookie className="size-4 text-gold" />
              <span className="text-xs uppercase tracking-[0.25em] font-sans font-bold text-gold">
                Privacy
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-4">
              Cookie Policy
            </h1>
            <p className="text-sm text-muted-foreground font-sans">
              Last updated: {LAST_UPDATED}
            </p>
            <p className="mt-6 text-base text-muted-foreground leading-relaxed font-sans max-w-2xl">
              This Cookie Policy explains how India Story Project uses cookies and similar
              technologies to recognize you when you visit our website.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        {/* Sections */}
        <div className="space-y-16">
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <motion.section
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.05 }}
              >
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                  <span className="p-2 rounded-full bg-primary/5 text-primary border border-primary/10">
                    <Icon className="size-4" />
                  </span>
                  <h2 className="font-display text-2xl font-bold">{section.title}</h2>
                </div>
                <div className="space-y-4">
                  {section.content.map((para, j) => (
                    <p key={j} className="text-sm md:text-base text-foreground/80 leading-relaxed font-sans">
                      {para}
                    </p>
                  ))}
                </div>
              </motion.section>
            );
          })}
        </div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 p-8 border border-border/50 bg-card/40 space-y-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Mail className="size-4 text-gold" />
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-gold font-sans">
              Contact
            </span>
          </div>
          <h3 className="font-display text-xl font-bold">Questions about our Cookie Policy?</h3>
          <p className="text-sm text-muted-foreground font-sans leading-relaxed">
            If you have any questions or concerns about our use of cookies, please email us at{" "}
            <a
              href="mailto:privacy@indiastoryproject.com"
              className="text-primary hover:text-gold transition-colors underline underline-offset-2"
            >
              privacy@indiastoryproject.com
            </a>{" "}
            or check out our{" "}
            <Link to="/privacy" className="text-primary hover:text-gold transition-colors underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </p>
        </motion.div>
      </div>
    </SiteLayout>
  );
}
