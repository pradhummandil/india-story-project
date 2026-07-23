import React, { useState } from "react";
import {
  Sparkles,
  Search,
  CheckCircle2,
  FileText,
  Copy,
  Check,
  Languages,
  ShieldAlert,
  Link2,
  Image,
  Share2,
  Mail,
  Sliders,
  Loader2,
  Wand2,
  BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIEditorialAssistantProps {
  title: string;
  excerpt: string;
  content: string;
  onApplyTitle?: (val: string) => void;
  onApplyExcerpt?: (val: string) => void;
  onApplySlug?: (val: string) => void;
  onApplyContent?: (val: string) => void;
  onApplyMeta?: (val: string) => void;
  onApplyKeywords?: (val: string) => void;
  sessionToken?: string;
}

const AI_TASKS = [
  { id: "seo-title", label: "AI Title Suggestions", icon: Search, group: "SEO & Discovery" },
  { id: "headline-improve", label: "Headline Improver", icon: Wand2, group: "Editorial & Content" },
  { id: "scores", label: "Quality Score", icon: BarChart2, group: "Editorial & Content" },
  { id: "meta", label: "Meta Description", icon: FileText, group: "SEO & Discovery" },
  { id: "keywords", label: "Keyword Suggestions", icon: Search, group: "SEO & Discovery" },
  { id: "summary", label: "Summary Generation", icon: FileText, group: "Editorial & Content" },
  { id: "grammar", label: "Grammar & Proofread", icon: CheckCircle2, group: "Editorial & Content" },
  { id: "readability", label: "Readability Simplifier", icon: Sliders, group: "Editorial & Content" },
  { id: "tone-consistency", label: "Tone Improvement", icon: Sliders, group: "Editorial & Content" },
  { id: "fact-checklist", label: "Fact Check Suggestions", icon: ShieldAlert, group: "Fact Check & Verification" },
  { id: "slug", label: "Slug Generation", icon: Link2, group: "SEO & Discovery" },
  { id: "english-improve", label: "English Refinement", icon: Languages, group: "Language & Translation" },
  { id: "hindi-improve", label: "Hindi Improvement", icon: Languages, group: "Language & Translation" },
  { id: "internal-links", label: "Internal Links", icon: Link2, group: "Fact Check & Verification" },
  { id: "image-caption", label: "Image Caption", icon: Image, group: "Media & Captions" },
  { id: "alt-text", label: "Alt Text", icon: Image, group: "Media & Captions" },
  { id: "tags", label: "Tags Extraction", icon: Search, group: "SEO & Discovery" },
  { id: "social-captions", label: "Social Captions", icon: Share2, group: "Distribution & Growth" },
  { id: "newsletter", label: "Newsletter Snippet", icon: Mail, group: "Distribution & Growth" },
];

export function AIEditorialAssistant({
  title,
  excerpt,
  content,
  onApplyTitle,
  onApplyExcerpt,
  onApplySlug,
  onApplyContent,
  onApplyMeta,
  onApplyKeywords,
  sessionToken,
}: AIEditorialAssistantProps) {
  const [selectedTask, setSelectedTask] = useState<string>("headline-improve");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [scoresData, setScoresData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleRunTask = async (taskId: string) => {
    setSelectedTask(taskId);
    setLoading(true);
    setResult("");
    setScoresData(null);
    try {
      const res = await fetch("/api/admin/newsroom/ai-helper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
        },
        body: JSON.stringify({
          task: taskId,
          title,
          excerpt,
          content,
        }),
      });
      const data = await res.json();
      if (taskId === "scores" && data.headlineScore !== undefined) {
        setScoresData(data);
        setResult(
          `📊 Quality Score Evaluation:\n- Headline Score: ${data.headlineScore}/100 (${data.headlineFeedback})\n- SEO Score: ${data.seoScore}/100 (${data.seoFeedback})\n- Readability Score: ${data.readabilityScore}/100 (${data.readabilityFeedback})`
        );
      } else if (data.resultText) {
        setResult(data.resultText);
      } else if (typeof data === "object") {
        setResult(JSON.stringify(data, null, 2));
      } else {
        setResult("Task completed successfully.");
      }
    } catch {
      setResult("Failed to execute AI assistant task.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#121212] border border-white/5 rounded-xl p-5 shadow-lg flex flex-col space-y-4 font-sans text-xs">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-[#C8A96A]/10 text-[#C8A96A] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white tracking-wide">AI Editor Assistant</h3>
            <p className="text-[10px] text-white/50">Gemini-powered editorial, SEO, grammar & Quality scores</p>
          </div>
        </div>
        <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-[#C8A96A]/10 text-[#C8A96A] font-bold">
          Gemini AI
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
        {AI_TASKS.map((t) => {
          const Icon = t.icon;
          const isActive = selectedTask === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleRunTask(t.id)}
              className={`flex items-center space-x-2 p-2 text-left rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-[#C8A96A]/15 border border-[#C8A96A]/40 text-[#C8A96A]"
                  : "bg-white/5 hover:bg-white/10 text-white/80 border border-transparent"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{t.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="min-h-28 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-lg bg-white/5 space-y-2 p-4">
          <Loader2 className="w-5 h-5 text-[#C8A96A] animate-spin" />
          <span className="text-[11px] font-sans text-white/60 animate-pulse">
            Analyzing story with Gemini AI…
          </span>
        </div>
      ) : result ? (
        <div className="border border-white/10 rounded-lg bg-[#161616] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-white/40 uppercase">
              Suggestions & Output
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <Button size="sm" variant="ghost" className="h-7 text-[10px] text-white/70" onClick={copyToClipboard}>
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span className="ml-1">{copied ? "Copied" : "Copy"}</span>
              </Button>
              {(selectedTask === "seo-title" || selectedTask === "headline-improve") && onApplyTitle && (
                <Button size="sm" variant="outline" className="h-7 text-[10px] border-[#C8A96A]/40 text-[#C8A96A] hover:bg-[#C8A96A]/10" onClick={() => onApplyTitle(result)}>
                  Apply Title
                </Button>
              )}
              {selectedTask === "meta" && onApplyMeta && (
                <Button size="sm" variant="outline" className="h-7 text-[10px] border-[#C8A96A]/40 text-[#C8A96A] hover:bg-[#C8A96A]/10" onClick={() => onApplyMeta(result)}>
                  Apply Meta
                </Button>
              )}
              {selectedTask === "summary" && onApplyExcerpt && (
                <Button size="sm" variant="outline" className="h-7 text-[10px] border-[#C8A96A]/40 text-[#C8A96A] hover:bg-[#C8A96A]/10" onClick={() => onApplyExcerpt(result)}>
                  Apply Summary
                </Button>
              )}
              {(selectedTask === "keywords" || selectedTask === "tags") && onApplyKeywords && (
                <Button size="sm" variant="outline" className="h-7 text-[10px] border-[#C8A96A]/40 text-[#C8A96A] hover:bg-[#C8A96A]/10" onClick={() => onApplyKeywords(result)}>
                  Apply Keywords
                </Button>
              )}
              {selectedTask === "slug" && onApplySlug && (
                <Button size="sm" variant="outline" className="h-7 text-[10px] border-[#C8A96A]/40 text-[#C8A96A] hover:bg-[#C8A96A]/10" onClick={() => onApplySlug(result)}>
                  Apply Slug
                </Button>
              )}
              {(selectedTask === "grammar" || selectedTask === "readability" || selectedTask === "hindi-improve" || selectedTask === "english-improve") &&
                onApplyContent && (
                  <Button size="sm" variant="outline" className="h-7 text-[10px] border-[#C8A96A]/40 text-[#C8A96A] hover:bg-[#C8A96A]/10" onClick={() => onApplyContent(result)}>
                    Apply Content
                  </Button>
                )}
            </div>
          </div>

          {scoresData && (
            <div className="grid grid-cols-3 gap-2 bg-white/5 p-3 rounded-lg border border-white/5 text-center">
              <div>
                <span className="block text-[9px] uppercase font-bold text-white/40">Headline</span>
                <span className="font-bold text-sm text-[#C8A96A]">{scoresData.headlineScore}/100</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase font-bold text-white/40">SEO</span>
                <span className="font-bold text-sm text-emerald-400">{scoresData.seoScore}/100</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase font-bold text-white/40">Readability</span>
                <span className="font-bold text-sm text-amber-400">{scoresData.readabilityScore}/100</span>
              </div>
            </div>
          )}

          <textarea
            value={result}
            onChange={(e) => setResult(e.target.value)}
            rows={5}
            className="w-full text-xs font-mono p-2.5 bg-black/40 border border-white/10 text-white/90 rounded-md focus:outline-none focus:ring-1 focus:ring-[#C8A96A]"
          />
        </div>
      ) : (
        <div className="min-h-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-lg bg-white/5 p-4 text-center">
          <p className="text-[11px] text-white/40">Click any AI tool above to generate instant recommendations</p>
        </div>
      )}
    </div>
  );
}
