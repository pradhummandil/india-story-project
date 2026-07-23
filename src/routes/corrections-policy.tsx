import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { History, FileText, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/corrections-policy")({
  head: () => ({ meta: [{ title: "Corrections & Revisions Policy — India Story Project" }] }),
  component: CorrectionsPolicyPage,
});

function CorrectionsPolicyPage() {
  return (
    <SiteLayout>
      <div className="min-h-screen bg-[#F8F5EF] pt-24 pb-20 px-6 font-sans text-foreground">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center mx-auto">
              <History className="w-6 h-6" />
            </div>
            <h1 className="font-serif font-bold text-3xl md:text-4xl text-foreground">
              Corrections & Revision Transparency Policy
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              We are committed to immediate, transparent correction of factual errors in our published chronicles.
            </p>
          </div>

          <div className="bg-white border border-border/80 p-8 space-y-6 shadow-sm">
            <h2 className="font-serif font-bold text-xl text-foreground border-b pb-3">
              How We Handle Corrections
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              If a substantial factual error is identified after publication, our editorial team immediately verifies the correction and publishes an updated version. Every major correction includes a visible note at the foot of the story specifying what was changed and when.
            </p>
            <div className="p-4 bg-muted/20 border border-border rounded text-xs space-y-2">
              <span className="font-semibold text-foreground">Submitting a Correction Request:</span>
              <p className="text-muted-foreground">
                Readers and subjects can submit correction notices to <span className="font-mono text-gold font-bold">editorial@indiastoryproject.com</span> with specific article URLs and reference documents.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
