import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Disclaimer — India Story Project" },
      { name: "description", content: "Platform disclaimer and editorial policies of the India Story Project." },
    ],
  }),
  component: DisclaimerPage,
});

function DisclaimerPage() {
  return (
    <SiteLayout>
      <div className="bg-background min-h-screen py-24 md:py-32">
        {/* Header */}
        <div className="container mx-auto px-6 border-b border-border/40 pb-10 mb-12">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-sans font-bold mb-3 flex items-center gap-2">
              <ShieldAlert className="size-4" /> Legal
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-none tracking-tight">
              General <span className="text-primary italic">Disclaimer.</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-sm md:text-base leading-relaxed font-sans font-medium">
              Editorial policies and disclaimer declarations for users and contributors.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 max-w-3xl bg-card border border-border/80 p-8 md:p-12 space-y-6 text-muted-foreground/90 font-sans leading-relaxed text-sm">
          <h2 className="font-display text-xl font-bold text-white mb-2">Editorial Information &amp; Claims</h2>
          <p>
            The content, opinions, and visual dispatches hosted on the India Story Project platform represent the investigations, reporting, and views of individual chroniclers and writers. While our editorial board makes every effort to verify facts, dates, and historical details, the platform cannot guarantee the absolute precision of all statements.
          </p>
          <h2 className="font-display text-xl font-bold text-white pt-4 mb-2">External Links &amp; Resources</h2>
          <p>
            Our stories and articles may contain links to external web resources, non-governmental organizations (NGOs), craft portals, or government portals. These links are provided for supplementary information purposes only. The India Story Project does not endorse or assume liability for third-party operations, products, or service offerings.
          </p>
          <div className="pt-8 border-t border-border/40">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gold hover:text-saffron font-semibold transition-colors uppercase tracking-widest text-xs"
            >
              <ArrowLeft className="size-4" /> Return to Home
            </Link>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
