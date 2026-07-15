import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Mail, Rss, ArrowLeft, HeartHandshake, ShieldCheck, Compass, Megaphone, Star, Globe } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/advertise")({
  head: () => ({
    meta: [
      { title: "Advertise with Us — India Story Project" },
      { name: "description", content: "Partner with India's premier slow journalism platform. Discover brand opportunities, campaigns, and sponsorships." },
    ],
  }),
  component: AdvertisePage,
});

function AdvertisePage() {
  return (
    <SiteLayout>
      <div className="bg-background min-h-screen py-24 md:py-32">
        {/* Header */}
        <div className="container mx-auto px-6 border-b border-border/40 pb-10 mb-12">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-sans font-bold mb-3 flex items-center gap-2">
              <Megaphone className="size-4 text-gold fill-gold" /> Brand Partnerships
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-none tracking-tight">
              Align with <span className="text-primary italic">Authenticity.</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-sm md:text-base leading-relaxed font-sans font-medium">
              Connect your brand with highly engaged readers who care about sustainability, heritage, craftsmanship, and local change.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 max-w-4xl space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-border/60 bg-card p-6 space-y-3">
              <Star className="size-8 text-gold" />
              <h3 className="font-display text-lg font-bold">Sponsored Dispatches</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                Fund high-quality, editorial dispatches centered on organic farming, local art, or green tech. Zero clickbait, full authenticity.
              </p>
            </div>
            <div className="border border-border/60 bg-card p-6 space-y-3">
              <Globe className="size-8 text-gold" />
              <h3 className="font-display text-lg font-bold">Brand Campaigns</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                Tell your brand's sustainability journey through beautiful, custom-designed photo-essays and visual media.
              </p>
            </div>
            <div className="border border-border/60 bg-card p-6 space-y-3">
              <HeartHandshake className="size-8 text-gold" />
              <h3 className="font-display text-lg font-bold">Impact Sponsorships</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                Directly sponsor our annual contributor awards, writing challenges, or local artisan grants.
              </p>
            </div>
          </div>

          {/* Contact Box */}
          <div className="border border-border/80 bg-card/60 p-8 md:p-12 text-center shadow-elegant">
            <Mail className="size-10 text-gold mx-auto mb-4" />
            <h3 className="font-display text-2xl md:text-3xl font-bold mb-2">Request Media Kit &amp; Rates</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6 font-sans">
              Reach out to our partnerships desk to discover tailored collaborations for your organization.
            </p>
            <p className="text-lg font-bold text-white font-sans">partnerships@indiastoryproject.org</p>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
