import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { ShieldCheck, Search, CheckCircle2, FileCheck } from "lucide-react";

export const Route = createFileRoute("/fact-check-policy")({
  head: () => ({ meta: [{ title: "Fact Check Policy — India Story Project" }] }),
  component: FactCheckPolicyPage,
});

function FactCheckPolicyPage() {
  return (
    <SiteLayout>
      <div className="min-h-screen bg-[#F8F5EF] pt-24 pb-20 px-6 font-sans text-foreground">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="font-serif font-bold text-3xl md:text-4xl text-foreground">
              Fact Check Methodology & Policy
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Transparent criteria for verifying historical dates, cultural practices, statistics, and primary sources.
            </p>
          </div>

          <div className="bg-white border border-border/80 p-8 space-y-6 shadow-sm">
            <h2 className="font-serif font-bold text-xl text-foreground border-b pb-3">
              Our 4-Point Fact Checking Protocol
            </h2>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Primary Source Validation:</strong> Oral histories, archival documents, census records, and academic monographs are cross-referenced.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Geographic & State Verification:</strong> District boundaries, heritage monuments, and local names are checked with field chroniclers.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">AI + Human Hybrid Audit:</strong> AI tools extract entity timelines, which are then vetted by domain editors.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
