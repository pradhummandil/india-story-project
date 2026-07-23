import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { useI18nStore, uiText } from "@/lib/i18n";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy & Terms — India Story Project" },
      {
        name: "description",
        content:
          "Privacy Policy, terms of service, cookies policies, accessibility commitments, and grievance contacts of the India Story Project.",
      },
    ],
  }),
  component: PrivacyTermsPage,
});

function PrivacyTermsPage() {
  const lang = useI18nStore((s) => s.lang);
  const privText = uiText[lang].privacyPage;

  const [activeTab, setActiveTab] = useState<
    "privacy" | "terms" | "cookies" | "accessibility" | "grievance"
  >("privacy");

  return (
    <SiteLayout>
      <div className="bg-background min-h-screen py-24 md:py-32">
        {/* Header */}
        <div className="container mx-auto px-6 border-b border-border/40 pb-10 mb-12">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-sans font-bold mb-3 flex items-center gap-2">
              <ShieldCheck className="size-4" /> {privText.title}
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-none tracking-tight">
              {lang === "hi" ? "पारदर्शिता और " : "Transparency & "}
              <span className="text-primary italic">{lang === "hi" ? "विश्वास।" : "Trust."}</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-sm md:text-base leading-relaxed font-sans font-medium">
              {privText.subtitle}
            </p>
          </div>
        </div>

        {/* Layout */}
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Tab Navigation */}
          <div className="lg:col-span-1 flex flex-col gap-2 font-sans">
            <button
              onClick={() => setActiveTab("privacy")}
              className={`text-left px-4 py-3 text-xs tracking-wider font-bold border transition-colors ${
                activeTab === "privacy"
                  ? "bg-primary text-white border-primary"
                  : "bg-card text-muted-foreground border-border/60 hover:text-foreground"
              }`}
            >
              {lang === "hi" ? "1. गोपनीयता नीति" : "1. Privacy Policy"}
            </button>
            <button
              onClick={() => setActiveTab("terms")}
              className={`text-left px-4 py-3 text-xs tracking-wider font-bold border transition-colors ${
                activeTab === "terms"
                  ? "bg-primary text-white border-primary"
                  : "bg-card text-muted-foreground border-border/60 hover:text-foreground"
              }`}
            >
              {lang === "hi" ? "2. सेवा की शर्तें" : "2. Terms of Service"}
            </button>
            <button
              onClick={() => setActiveTab("cookies")}
              className={`text-left px-4 py-3 text-xs tracking-wider font-bold border transition-colors ${
                activeTab === "cookies"
                  ? "bg-primary text-white border-primary"
                  : "bg-card text-muted-foreground border-border/60 hover:text-foreground"
              }`}
            >
              {lang === "hi" ? "3. कुकी नीति" : "3. Cookie Policy"}
            </button>
            <button
              onClick={() => setActiveTab("accessibility")}
              className={`text-left px-4 py-3 text-xs tracking-wider font-bold border transition-colors ${
                activeTab === "accessibility"
                  ? "bg-primary text-white border-primary"
                  : "bg-card text-muted-foreground border-border/60 hover:text-foreground"
              }`}
            >
              {lang === "hi" ? "4. सुगमता (एक्सेसिबिलिटी)" : "4. Accessibility"}
            </button>
            <button
              onClick={() => setActiveTab("grievance")}
              className={`text-left px-4 py-3 text-xs tracking-wider font-bold border transition-colors ${
                activeTab === "grievance"
                  ? "bg-primary text-white border-primary"
                  : "bg-card text-muted-foreground border-border/60 hover:text-foreground"
              }`}
            >
              {lang === "hi" ? "5. शिकायत अधिकारी" : "5. Grievance Officer"}
            </button>
          </div>

          {/* Policy Text Frame */}
          <div className="lg:col-span-3 bg-card border border-border/80 p-8 md:p-12 space-y-6 text-muted-foreground/90 font-sans leading-relaxed text-sm">
            {activeTab === "privacy" && (
              <>
                <h2 className="font-display text-2xl font-bold text-white mb-4">Privacy Policy</h2>
                <p>Last updated: July 15, 2026</p>
                <p>
                  At India Story Project, we are committed to protecting your personal data and
                  respecting your privacy. This policy outlines how we collect, process, and protect
                  your information when you visit our website, sign up for digests, submit stories,
                  or interact with our forums.
                </p>
                <h3 className="font-display text-lg font-bold text-white pt-4">
                  1. Data We Collect
                </h3>
                <p>
                  We collect your email address when you subscribe to our newsletter or register for
                  an account. We also log standard traffic analytics (IP address, country codes,
                  device identifiers) to optimize page loading speeds and analyze readership
                  outreach.
                </p>
                <h3 className="font-display text-lg font-bold text-white pt-4">
                  2. Story Submissions
                </h3>
                <p>
                  If you submit a story via our portal, you consent to our editorial team verifying
                  and publishing the text alongside your provided author credentials (name, bio,
                  location).
                </p>
              </>
            )}

            {activeTab === "terms" && (
              <>
                <h2 className="font-display text-2xl font-bold text-white mb-4">
                  Terms of Service
                </h2>
                <p>Last updated: July 15, 2026</p>
                <p>
                  By accessing the India Story Project platform, you agree to comply with and be
                  bound by these terms. If you do not agree, please do not use the website.
                </p>
                <h3 className="font-display text-lg font-bold text-white pt-4">1. Content Usage</h3>
                <p>
                  All articles, visuals, and video dispatches published on India Story Project are
                  protected by copyright laws. You may quote snippets or copy URLs for sharing, but
                  bulk reproduction without explicit written permission is strictly prohibited.
                </p>
                <h3 className="font-display text-lg font-bold text-white pt-4">2. User Conduct</h3>
                <p>
                  When participating in comments or discussion boards, you agree to engage
                  respectfully. Any spam, offensive language, or copyright infringement will result
                  in immediate profile suspension.
                </p>
              </>
            )}

            {activeTab === "cookies" && (
              <>
                <h2 className="font-display text-2xl font-bold text-white mb-4">Cookie Policy</h2>
                <p>
                  We use cookies to enhance your browsing experience, remember your preferences, and
                  track aggregate traffic analytics.
                </p>
                <h3 className="font-display text-lg font-bold text-white pt-4">
                  1. Essential Cookies
                </h3>
                <p>
                  These are necessary for authentication, allowing you to log in to your reader
                  dashboard, save bookmarks, and participate in discussion threads.
                </p>
                <h3 className="font-display text-lg font-bold text-white pt-4">
                  2. Performance &amp; Analytics
                </h3>
                <p>
                  We use Google Analytics and basic database logs to track pageviews and
                  geographical read-distribution to measure our dispatches' impact.
                </p>
              </>
            )}

            {activeTab === "accessibility" && (
              <>
                <h2 className="font-display text-2xl font-bold text-white mb-4">
                  Accessibility Statement
                </h2>
                <p>
                  We believe that stories of change should be accessible to everyone. We actively
                  work to align our digital interfaces with Web Content Accessibility Guidelines
                  (WCAG 2.1 Level AA) parameters.
                </p>
                <h3 className="font-display text-lg font-bold text-white pt-4">Key Commitments</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Alternative text tags (alt text) for all images uploaded to our media libraries.
                  </li>
                  <li>Proper heading structures and distinct button labeling.</li>
                  <li>
                    Strict contrast ratios to ensure legibility on all dark-mode and warm-tinted
                    grids.
                  </li>
                </ul>
              </>
            )}

            {activeTab === "grievance" && (
              <>
                <h2 className="font-display text-2xl font-bold text-white mb-4">
                  Grievance Redressal
                </h2>
                <p>
                  In compliance with Information Technology rules, any concerns regarding content,
                  accuracy of dispatches, or user conduct on our platform can be addressed to our
                  Grievance Officer.
                </p>
                <h3 className="font-display text-lg font-bold text-white pt-4">Officer Details</h3>
                <p className="font-sans">
                  <strong>Name:</strong> Pradhumnan Dil
                  <br />
                  <strong>Designation:</strong> Director, Editorial Quality &amp; Compliance
                  <br />
                  <strong>Email:</strong> grievance@indiastoryproject.org
                  <br />
                  <strong>Address:</strong> India Story Project Bureau, New Delhi, India
                </p>
                <p className="text-xs mt-4">
                  We aim to acknowledge receipt of complaints within 36 hours and resolve concerns
                  within 15 working days.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
