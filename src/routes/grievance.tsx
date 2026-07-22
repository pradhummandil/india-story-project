import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AlertOctagon, Mail, Phone, Clock, Shield, User } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/grievance")({
  head: () => ({
    meta: [
      { title: "Grievance Policy — India Story Project" },
      {
        name: "description",
        content:
          "India Story Project's Grievance Policy and Grievance Officer details as required under the Information Technology Act, 2000 and IT (Intermediary Guidelines) Rules, 2021.",
      },
    ],
  }),
  component: GrievancePage,
});

function GrievancePage() {
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
              <AlertOctagon className="size-4 text-gold" />
              <span className="text-xs uppercase tracking-[0.25em] font-sans font-bold text-gold">
                Legal
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-4">
              Grievance Policy
            </h1>
            <p className="text-sm text-muted-foreground font-sans">
              As required under the Information Technology Act, 2000 and the IT (Intermediary
              Guidelines and Digital Media Ethics Code) Rules, 2021.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-6 py-16 max-w-4xl space-y-16">
        {/* Grievance Officer */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
            <span className="p-2 rounded-full bg-primary/5 text-primary border border-primary/10">
              <User className="size-4" />
            </span>
            <h2 className="font-display text-2xl font-bold">Grievance Officer</h2>
          </div>

          <div className="p-6 border border-border/50 bg-card/50 space-y-4">
            <p className="text-sm text-muted-foreground font-sans leading-relaxed">
              In accordance with Rule 3(2)(b) of the IT (Intermediary Guidelines and Digital Media
              Ethics Code) Rules, 2021, the following person has been designated as the Grievance
              Officer for India Story Project:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.2em] font-bold text-gold font-sans">Name</p>
                <p className="text-sm font-sans font-medium">Grievance Officer</p>
                <p className="text-xs text-muted-foreground font-sans">India Story Project Editorial Team</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-gold shrink-0" />
                  <a
                    href="mailto:grievance@indiastoryproject.com"
                    className="text-sm font-sans text-primary hover:text-gold transition-colors"
                  >
                    grievance@indiastoryproject.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-gold shrink-0" />
                  <span className="text-sm font-sans text-muted-foreground">
                    Monday–Friday, 10:00 AM – 5:00 PM IST
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* How to File a Grievance */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
            <span className="p-2 rounded-full bg-primary/5 text-primary border border-primary/10">
              <AlertOctagon className="size-4" />
            </span>
            <h2 className="font-display text-2xl font-bold">How to File a Grievance</h2>
          </div>
          <div className="space-y-4">
            <p className="text-sm md:text-base text-foreground/80 leading-relaxed font-sans">
              If you have a grievance relating to content published on India Story Project that
              violates your rights, including but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-foreground/80 font-sans pl-2">
              <li>Privacy violation or personal data concerns</li>
              <li>Defamatory, false, or misleading content</li>
              <li>Copyright or intellectual property infringement</li>
              <li>Obscene, harmful, or unlawful content</li>
              <li>Content impersonating you or another person</li>
            </ul>
            <p className="text-sm md:text-base text-foreground/80 leading-relaxed font-sans">
              You may submit your grievance in writing to our Grievance Officer at the email address
              above. Please include the following in your communication:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-foreground/80 font-sans pl-2">
              <li>Your full name, contact details, and relationship to the content</li>
              <li>A description of the content causing the grievance</li>
              <li>The URL of the specific page or content in question</li>
              <li>The specific nature of the violation and supporting details</li>
              <li>The remedy or action you are requesting</li>
            </ol>
          </div>
        </motion.section>

        {/* Response Time */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
            <span className="p-2 rounded-full bg-primary/5 text-primary border border-primary/10">
              <Clock className="size-4" />
            </span>
            <h2 className="font-display text-2xl font-bold">Response Timeline</h2>
          </div>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-5 border border-border/50 bg-card/40">
                <p className="text-xs uppercase tracking-[0.2em] font-bold text-gold font-sans mb-2">
                  Acknowledgement
                </p>
                <p className="font-display text-2xl font-bold mb-1">24 Hours</p>
                <p className="text-xs text-muted-foreground font-sans">
                  We acknowledge all valid grievances within 24 hours of receipt during business days.
                </p>
              </div>
              <div className="p-5 border border-border/50 bg-card/40">
                <p className="text-xs uppercase tracking-[0.2em] font-bold text-gold font-sans mb-2">
                  Resolution
                </p>
                <p className="font-display text-2xl font-bold mb-1">15 Days</p>
                <p className="text-xs text-muted-foreground font-sans">
                  We aim to resolve all grievances within 15 days of receipt, as mandated by the IT Rules, 2021.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Other ways */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
            <span className="p-2 rounded-full bg-primary/5 text-primary border border-primary/10">
              <Shield className="size-4" />
            </span>
            <h2 className="font-display text-2xl font-bold">Related Policies</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Privacy Policy", to: "/privacy" },
              { label: "Terms of Service", to: "/terms" },
              { label: "Contact Support", to: "/contact" },
              { label: "Editorial Policy", to: "/about" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-sans font-medium text-primary hover:text-gold border border-border/50 hover:border-gold/30 px-4 py-2 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.section>
      </div>
    </SiteLayout>
  );
}
