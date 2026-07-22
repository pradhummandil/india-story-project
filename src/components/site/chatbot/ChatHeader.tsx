import React from "react";
import { X, Minimize2, Maximize2, Sparkles, AlertCircle } from "lucide-react";

// Premium Custom SVG Logo: Book + Sparkle
export function CompanionLogo({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 7l1 2 2 .5-1.5 1.5.5 2-2-1-2 1 .5-2-1.5-1.5 2-.5z" fill="currentColor" stroke="none" className="text-red-500 animate-pulse" />
    </svg>
  );
}

interface ChatHeaderProps {
  onClose?: () => void;
  onMinimize?: () => void;
  onExpand?: () => void;
  onClearHistory?: () => void;
  isCompact?: boolean;
  isHindi: boolean;
}

export function ChatHeader({
  onClose,
  onMinimize,
  onExpand,
  onClearHistory,
  isCompact = false,
  isHindi,
}: ChatHeaderProps) {
  return (
    <div className="bg-neutral-900 border-b border-neutral-800 px-4 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="size-8 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
          <CompanionLogo className="size-4.5 text-red-500" />
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            {isHindi ? "कहानी सहायक" : "India Story Assistant"}
          </h3>
          <span className="text-[9px] text-neutral-400 flex items-center gap-1 font-semibold">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            {isHindi ? "ऑनलाइन" : "Online"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {onClearHistory && (
          <button
            onClick={onClearHistory}
            title={isHindi ? "इतिहास मिटाएं" : "Clear Chat"}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <AlertCircle className="size-4" />
          </button>
        )}
        {onExpand && (
          <button
            onClick={onExpand}
            title={isHindi ? "बड़ा करें" : "Expand to Page"}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <Maximize2 className="size-3.5" />
          </button>
        )}
        {onMinimize && (
          <button
            onClick={onMinimize}
            title={isHindi ? "छोटा करें" : "Minimize"}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <Minimize2 className="size-3.5" />
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            title={isHindi ? "बंद करें" : "Close"}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
