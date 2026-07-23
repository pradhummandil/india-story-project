import React, { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  Calendar,
  User,
  MapPin,
  Building,
  History,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIFactCheckModalProps {
  storyId?: string;
  title: string;
  content: string;
  stateName?: string;
  districtName?: string;
  sessionToken?: string;
  onClose?: () => void;
}

export function AIFactCheckModal({
  storyId,
  title,
  content,
  stateName,
  districtName,
  sessionToken,
  onClose,
}: AIFactCheckModalProps) {
  const [loading, setLoading] = useState(false);
  const [factData, setFactData] = useState<any | null>(null);

  const runFactCheck = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/newsroom/fact-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
        },
        body: JSON.stringify({
          title,
          content,
          stateName,
          districtName,
        }),
      });
      const data = await res.json();
      setFactData(data);
    } catch {
      setFactData({
        confidenceScore: 0,
        summary: "Failed to connect to fact check engine.",
        datesChecked: [],
        peopleChecked: [],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-xl space-y-5 max-w-2xl w-full mx-auto">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base">AI Fact-Checking Engine</h3>
            <p className="text-xs text-muted-foreground">Verification scan for dates, entities, locations & citations</p>
          </div>
        </div>
        {factData && (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-muted-foreground">Confidence:</span>
            <span
              className={`text-sm font-bold font-mono px-2.5 py-1 rounded-full ${
                factData.confidenceScore >= 80
                  ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                  : factData.confidenceScore >= 60
                  ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                  : "bg-rose-500/15 text-rose-500 border border-rose-500/30"
              }`}
            >
              {factData.confidenceScore}%
            </span>
          </div>
        )}
      </div>

      {!factData && !loading && (
        <div className="py-8 text-center space-y-3 border border-dashed border-border rounded-lg bg-muted/10">
          <Sparkles className="w-8 h-8 text-emerald-500 mx-auto opacity-70" />
          <p className="text-sm font-medium text-foreground">Ready to run full newsroom fact check</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Extracts dates, historical figures, organizations, state tags, and flags missing sources before publishing.
          </p>
          <Button onClick={runFactCheck} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs">
            Run Verification Scan
          </Button>
        </div>
      )}

      {loading && (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
          <p className="text-xs font-mono text-muted-foreground animate-pulse">
            Analyzing article entities against historical database & citations…
          </p>
        </div>
      )}

      {factData && !loading && (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="p-3.5 bg-muted/30 border border-border rounded-lg text-xs space-y-1">
            <span className="font-semibold text-foreground">Scan Summary:</span>
            <p className="text-muted-foreground leading-relaxed">{factData.summary}</p>
          </div>

          {factData.missingSources?.length > 0 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg space-y-1 text-xs text-amber-600 dark:text-amber-400">
              <div className="flex items-center space-x-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Missing Citation / Sources Needed:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1">
                {factData.missingSources.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {factData.datesChecked?.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-semibold uppercase text-muted-foreground flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Dates & Timelines Checked</span>
              </h4>
              <div className="grid grid-cols-1 gap-1.5">
                {factData.datesChecked.map((d: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/20 border border-border text-xs">
                    <span className="font-mono font-semibold">{d.entity}</span>
                    <span className="text-muted-foreground text-[11px] truncate max-w-xs">{d.note}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {factData.peopleChecked?.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-semibold uppercase text-muted-foreground flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5" />
                <span>People & Historical Figures</span>
              </h4>
              <div className="grid grid-cols-1 gap-1.5">
                {factData.peopleChecked.map((p: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/20 border border-border text-xs">
                    <span className="font-medium">{p.entity}</span>
                    <span className="text-muted-foreground text-[11px] truncate max-w-xs">{p.note}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-end space-x-3 border-t border-border pt-4">
        {factData && (
          <Button variant="outline" size="sm" onClick={runFactCheck} className="text-xs">
            Re-run Scan
          </Button>
        )}
        {onClose && (
          <Button size="sm" onClick={onClose} className="text-xs">
            Close Report
          </Button>
        )}
      </div>
    </div>
  );
}
