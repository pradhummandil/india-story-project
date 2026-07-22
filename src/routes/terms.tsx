import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FileText, Shield, AlertTriangle, Scale, Mail, ExternalLink } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — India Story Project" },
      {
        name: "description",
        content:
          "Read the Terms of Service governing your use of India Story Project — India's premier community-driven storytelling platform.",
      },
    ],
  }),
  component: TermsOfService,
});

const LAST_UPDATED = "July 1, 2025";

const sections = [
  {
    id: "acceptance",
    icon: FileText,
    title: "1. Acceptance of Terms",
    content: [
      "By accessing or using the India Story Project website (indiastoryproject.com), mobile application, or any associated services (collectively, the 'Service'), you agree to be bound by these Terms of Service ('Terms'), our Privacy Policy, and any other policies referenced herein.",
      "If you are using the Service on behalf of an organisation, you represent and warrant that you have the authority to bind that organisation to these Terms.",
      "We reserve the right to update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms.",
    ],
  },
  {
    id: "eligibility",
    icon: Shield,
    title: "2. Eligibility & Account",
    content: [
      "You must be at least 13 years of age to use the Service. Users under 18 should have parental or guardian consent.",
      "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
      "You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate.",
      "We reserve the right to suspend or terminate accounts that violate these Terms without prior notice.",
    ],
  },
  {
    id: "content",
    icon: FileText,
    title: "3. User-Submitted Content",
    content: [
      "By submitting content (stories, comments, images, or other materials) to India Story Project, you grant us a worldwide, non-exclusive, royalty-free, sublicensable licence to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such content in any media.",
      "You represent and warrant that: (a) you own or have the necessary rights to the content you submit; (b) your content does not infringe any third-party intellectual property rights; (c) your content is accurate and does not contain false or misleading information.",
      "We reserve the right to review, reject, edit, or remove any user-submitted content that violates these Terms, our Editorial Policy, or applicable law.",
      "India Story Project is not responsible for the accuracy, completeness, or reliability of any user-submitted content.",
    ],
  },
  {
    id: "prohibited",
    icon: AlertTriangle,
    title: "4. Prohibited Conduct",
    content: [
      "You agree not to: submit false, misleading, or defamatory content; impersonate any person or entity; harass, threaten, or intimidate other users; upload malicious code or software; attempt to gain unauthorised access to any part of the Service; scrape or data-mine the Service without written permission; use the Service for commercial purposes without prior written consent.",
      "Content that is hateful, obscene, sexually explicit, promotes violence, or violates the laws of India or any applicable jurisdiction is strictly prohibited.",
      "Violations may result in immediate account suspension and may be reported to relevant law enforcement authorities.",
    ],
  },
  {
    id: "ip",
    icon: Scale,
    title: "5. Intellectual Property",
    content: [
      "All original content published on India Story Project — including but not limited to text, photography, design, logos, and software — is the property of India Story Project or its respective rights holders and is protected by Indian copyright law.",
      "The India Story Project name, logo, and all related marks are trademarks of India Story Project. Unauthorised use is prohibited.",
      "If you believe your intellectual property has been infringed, please contact our Grievance Officer as described in our Grievance Policy.",
    ],
  },
  {
    id: "liability",
    icon: Shield,
    title: "6. Disclaimers & Limitation of Liability",
    content: [
      "The Service is provided 'as is' and 'as available' without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, or free of viruses.",
      "To the maximum extent permitted by applicable law, India Story Project shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the Service.",
      "Our total liability to you for any claims arising from these Terms or your use of the Service shall not exceed the amount you paid to us (if any) in the twelve months preceding the claim.",
    ],
  },
  {
    id: "governing",
    icon: Scale,
    title: "7. Governing Law & Dispute Resolution",
    content: [
      "These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.",
      "Any dispute arising from these Terms shall first be attempted to be resolved through good-faith negotiation. If unresolved, disputes shall be submitted to binding arbitration under the Arbitration and Conciliation Act, 1996 of India.",
      "The courts of [City], India shall have exclusive jurisdiction for matters not subject to arbitration.",
    ],
  },
];

function TermsOfService() {
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
              <FileText className="size-4 text-gold" />
              <span className="text-xs uppercase tracking-[0.25em] font-sans font-bold text-gold">
                Legal
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-4">
              Terms of Service
            </h1>
            <p className="text-sm text-muted-foreground font-sans">
              Last updated: {LAST_UPDATED}
            </p>
            <p className="mt-6 text-base text-muted-foreground leading-relaxed font-sans max-w-2xl">
              Please read these Terms carefully before using India Story Project. By using our
              platform, you agree to be bound by these Terms.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        {/* Table of contents */}
        <motion.nav
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16 p-6 border border-border/50 bg-card/50"
        >
          <p className="text-xs uppercase tracking-[0.25em] font-bold text-gold font-sans mb-4">
            Contents
          </p>
          <ul className="space-y-2">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-sm font-sans text-muted-foreground hover:text-primary transition-colors"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </motion.nav>

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
                className="scroll-mt-24"
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
          <h3 className="font-display text-xl font-bold">Questions about these Terms?</h3>
          <p className="text-sm text-muted-foreground font-sans leading-relaxed">
            If you have any questions about these Terms of Service, please contact us at{" "}
            <a
              href="mailto:legal@indiastoryproject.com"
              className="text-primary hover:text-gold transition-colors underline underline-offset-2"
            >
              legal@indiastoryproject.com
            </a>{" "}
            or through our{" "}
            <Link to="/contact" className="text-primary hover:text-gold transition-colors underline underline-offset-2">
              Contact page
            </Link>
            .
          </p>
          <p className="text-xs text-muted-foreground font-sans">
            For grievances under the Information Technology Act, 2000, please visit our{" "}
            <Link to="/grievance" className="text-primary hover:text-gold transition-colors underline underline-offset-2">
              Grievance Policy
            </Link>
            .
          </p>
        </motion.div>
      </div>
    </SiteLayout>
  );
}
