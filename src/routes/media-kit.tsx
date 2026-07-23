import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  Mail,
  Rss,
  ArrowLeft,
  HeartHandshake,
  ShieldCheck,
  Compass,
  FileText,
  Download,
  Star,
} from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";

export const Route = createFileRoute("/media-kit")({
  head: () => ({
    meta: [
      { title: "Media Kit — India Story Project" },
      {
        name: "description",
        content:
          "Download the India Story Project brand assets, logos, and media kit. Learn about our readership demographics.",
      },
    ],
  }),
  component: MediaKitPage,
});

import { useI18nStore, uiText } from "@/lib/i18n";

function MediaKitPage() {
  const lang = useI18nStore((s) => s.lang);
  const mkText = uiText[lang].mediaKit;

  return (
    <SiteLayout>
      <div className="bg-background min-h-screen py-24 md:py-32">
        {/* Header */}
        <div className="container mx-auto px-6 border-b border-border/40 pb-10 mb-12">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-sans font-bold mb-3 flex items-center gap-2">
              <FileText className="size-4 text-gold fill-gold" /> {mkText.title}
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-none tracking-tight">
              {lang === "hi" ? "मीडिया किट और " : "Media Kit & "}
              <span className="text-primary italic">{lang === "hi" ? "ब्रांड संपत्तियां।" : "Assets."}</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-sm md:text-base leading-relaxed font-sans font-medium">
              {mkText.subtitle}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 max-w-4xl space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-border/60 bg-card p-6 flex flex-col justify-between items-start gap-4">
              <div>
                <h3 className="font-display text-lg font-bold">Brand Guidelines &amp; Logos</h3>
                <p className="text-xs text-muted-foreground font-sans leading-relaxed mt-2">
                  Contains vertical and horizontal logo files in SVG and high-resolution PNG
                  formats, along with our typography specs and hex color palettes.
                </p>
              </div>
              <button className="h-9 px-4 bg-primary text-white font-sans text-xs uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-primary/90">
                <Download className="size-4" /> Download ZIP (4.2 MB)
              </button>
            </div>

            <div className="border border-border/60 bg-card p-6 flex flex-col justify-between items-start gap-4">
              <div>
                <h3 className="font-display text-lg font-bold">ISP Demographics Sheet (PDF)</h3>
                <p className="text-xs text-muted-foreground font-sans leading-relaxed mt-2">
                  Up-to-date document showing our geographical coverage, readership statistics,
                  average reading session durations, and user interests analysis.
                </p>
              </div>
              <button className="h-9 px-4 bg-primary text-white font-sans text-xs uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-primary/90">
                <Download className="size-4" /> Download PDF (1.1 MB)
              </button>
            </div>
          </div>

          <div className="border border-border/80 bg-card/60 p-8 md:p-12 text-center shadow-elegant">
            <h3 className="font-display text-2xl font-bold mb-2">Media &amp; Press Inquiries</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6 font-sans">
              To request comments, interviews, or speak with our editorial directors, contact us.
            </p>
            <p className="text-lg font-bold text-white font-sans">press@indiastoryproject.org</p>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
