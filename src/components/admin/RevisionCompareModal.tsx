import React from "react";
import { GitCompare, History, ArrowLeft, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Revision {
  id: string;
  version: number;
  title: string;
  excerpt: string;
  content: string;
  createdAt: string;
}

interface RevisionCompareModalProps {
  currentTitle: string;
  currentContent: string;
  selectedRevision: Revision | null;
  onClose: () => void;
  onRevert?: (rev: Revision) => void;
}

export function RevisionCompareModal({
  currentTitle,
  currentContent,
  selectedRevision,
  onClose,
  onRevert,
}: RevisionCompareModalProps) {
  if (!selectedRevision) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm">
                Comparing Version {selectedRevision.version} vs Current Active Version
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                Revision saved on {new Date(selectedRevision.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Side-by-side comparison body */}
        <div className="grid grid-cols-2 divide-x divide-border flex-1 overflow-y-auto p-4 gap-4 text-xs font-mono">
          {/* Older Version Column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-amber-500 uppercase">Version {selectedRevision.version} (Historical)</span>
            </div>
            <div className="space-y-2 bg-muted/20 p-3 rounded border border-border">
              <span className="font-semibold block text-foreground">{selectedRevision.title}</span>
              <p className="text-muted-foreground italic">{selectedRevision.excerpt}</p>
              <div className="whitespace-pre-wrap pt-2 border-t text-muted-foreground leading-relaxed">
                {selectedRevision.content}
              </div>
            </div>
          </div>

          {/* Current Version Column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-emerald-500 uppercase">Current Working Version</span>
            </div>
            <div className="space-y-2 bg-emerald-500/5 p-3 rounded border border-emerald-500/30">
              <span className="font-semibold block text-foreground">{currentTitle}</span>
              <div className="whitespace-pre-wrap pt-2 border-t text-foreground leading-relaxed">
                {currentContent}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Reverting will restore title, excerpt, and content from Version {selectedRevision.version}.
          </span>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            {onRevert && (
              <Button
                size="sm"
                onClick={() => {
                  onRevert(selectedRevision);
                  onClose();
                }}
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs"
              >
                Revert to Version {selectedRevision.version}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
