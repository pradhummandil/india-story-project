import React from "react";
import {
  CheckCircle2,
  Clock,
  ChevronRight,
  UserCheck,
  ShieldCheck,
  FileCheck,
  Search,
  Scale,
  Calendar,
  Send,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const STAGES = [
  { key: "User", label: "User Submission", icon: UserCheck },
  { key: "Admin Review", label: "Admin Review", icon: ShieldCheck },
  { key: "Assign Editor", label: "Assign Editor", icon: UserCheck },
  { key: "Editor Revision", label: "Editor Revision", icon: FileCheck },
  { key: "Fact Checker", label: "Fact Checking", icon: ShieldCheck },
  { key: "Copy Editor", label: "Copy Editing", icon: FileCheck },
  { key: "SEO Review", label: "SEO Optimization", icon: Search },
  { key: "Legal Review", label: "Legal Review", icon: Scale },
  { key: "Final Admin Approval", label: "Admin Approval", icon: CheckCircle2 },
  { key: "Scheduled Publish", label: "Scheduled", icon: Calendar },
  { key: "Automatic Publish", label: "Published", icon: Send },
  { key: "Distribution", label: "Distribution", icon: Send },
  { key: "Analytics", label: "Analytics Tracking", icon: BarChart3 },
];

interface WorkflowTimelineTrackerProps {
  currentStage: string;
  stageTimestamps?: Record<string, string>;
  onAdvanceStage?: (nextStage: string) => void;
  disabled?: boolean;
}

export function WorkflowTimelineTracker({
  currentStage,
  stageTimestamps = {},
  onAdvanceStage,
  disabled = false,
}: WorkflowTimelineTrackerProps) {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStage);
  const safeCurrentIndex = currentIndex === -1 ? 3 : currentIndex;

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h4 className="font-serif font-bold text-sm">Enterprise Publishing Pipeline</h4>
        </div>
        <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-500">
          Stage {safeCurrentIndex + 1} of {STAGES.length}: {currentStage}
        </span>
      </div>

      <div className="relative overflow-x-auto py-2">
        <div className="flex items-center min-w-max space-x-3">
          {STAGES.map((st, idx) => {
            const Icon = st.icon;
            const isCompleted = idx < safeCurrentIndex;
            const isCurrent = idx === safeCurrentIndex;
            const timestamp = stageTimestamps[st.key];

            return (
              <div key={st.key} className="flex items-center space-x-2">
                <button
                  disabled={disabled}
                  onClick={() => onAdvanceStage && onAdvanceStage(st.key)}
                  className={`flex items-center space-x-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                    isCurrent
                      ? "bg-amber-500/15 border-amber-500/50 text-amber-500 shadow-sm"
                      : isCompleted
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                      : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <div className="flex flex-col text-left">
                    <span>{st.label}</span>
                    {timestamp && (
                      <span className="text-[9px] font-mono opacity-80">
                        {new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>
                </button>
                {idx < STAGES.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      {onAdvanceStage && safeCurrentIndex < STAGES.length - 1 && (
        <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
          <span className="text-muted-foreground">Advance to next publishing stage:</span>
          <Button
            size="sm"
            disabled={disabled}
            onClick={() => onAdvanceStage(STAGES[safeCurrentIndex + 1].key)}
            className="bg-amber-500 hover:bg-amber-600 text-black font-medium text-xs h-8"
          >
            Advance to {STAGES[safeCurrentIndex + 1].label}
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
