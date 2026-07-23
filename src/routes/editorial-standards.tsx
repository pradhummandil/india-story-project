import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { ShieldCheck, BookOpen, Scale, Award, Heart, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/editorial-standards")({
  head: () => ({ meta: [{ title: "Editorial Standards & Ethics — India Story Project" }] }),
  component: EditorialStandardsPage,
});

function EditorialStandardsPage() {
  return (
    <SiteLayout>
      <div className="min-h-screen bg-[#F8F5EF] pt-24 pb-20 px-6 font-sans text-foreground">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="font-serif font-bold text-3xl md:text-4xl text-foreground">
              Editorial Standards & Journalism Code
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Our pledge to integrity, verification, cultural dignity, and slow journalism excellence across every published dispatch.
            </p>
          </div>

          <div className="bg-white border border-border/80 p-8 space-y-8 shadow-sm">
            <div className="space-y-4">
              <h2 className="font-serif font-bold text-xl text-foreground flex items-center gap-2 border-b pb-3">
                <BookOpen className="w-5 h-5 text-gold" />
                1. Narrative Accuracy & Deep Verification
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Every story published on India Story Project undergoes rigorous multi-tier editorial review. Facts, historical dates, geographic names, and primary source citations are validated by dedicated fact-checkers before publication.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-serif font-bold text-xl text-foreground flex items-center gap-2 border-b pb-3">
                <Scale className="w-5 h-5 text-gold" />
                2. Cultural Respect & Authenticity
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We chronicle India’s living heritage, indigenous communities, classical arts, and unsung heroes with profound dignity and regional authenticity. We adhere strictly to unbiased representation.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-serif font-bold text-xl text-foreground flex items-center gap-2 border-b pb-3">
                <Award className="w-5 h-5 text-gold" />
                3. Author Integrity & AI Transparency
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We clearly demarcate verified authors, field chroniclers, and guest contributors. Artificial Intelligence tools are utilized solely for editorial assistance (proofreading, SEO, readability) under human supervision.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
