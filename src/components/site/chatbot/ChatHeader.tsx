import React from "react";
import { X, Minimize2, Maximize2, Trash2 } from "lucide-react";

interface ChatHeaderProps {
  onClose?: () => void;
  onMinimize?: () => void;
  onExpand?: () => void;
  onClearHistory?: () => void;
  isCompact?: boolean;
  isHindi: boolean;
  sessionTitle?: string;
}

export function ChatHeader({
  onClose,
  onMinimize,
  onExpand,
  onClearHistory,
  isCompact = false,
  isHindi,
  sessionTitle,
}: ChatHeaderProps) {
  return (
    <header className={`bg-white/95 dark:bg-[#181715]/95 backdrop-blur-md border-b border-[#ECE7DF] dark:border-[#2A2722] ${isCompact ? "px-4 py-3" : "px-6 py-4"} flex items-center justify-between shrink-0 transition-colors duration-300 gap-3`}>
      {/* Left: Assistant Logo & Title */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="size-9 rounded-xl bg-[#121110] border border-[#C9A227]/50 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
          <img
            src="/Logo-ISP.jpg"
            alt="ISP AI Logo"
            className="size-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="font-display font-bold text-sm sm:text-base text-[#1D1D1D] dark:text-[#FBF8F3] truncate whitespace-nowrap">
              {isHindi ? "भारत स्टोरी सहायक" : "India Story Assistant"}
            </h2>
            {sessionTitle && sessionTitle !== "New Chat" && sessionTitle !== "नई बातचीत" && (
              <span className="hidden sm:inline-block text-xs text-[#666666] dark:text-[#A09D96] font-medium truncate max-w-[120px]">
                — {sessionTitle}
              </span>
            )}
          </div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#666666] dark:text-[#A09D96] flex items-center gap-1.5 mt-0.5 font-sans leading-none">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <span>{isHindi ? "ऑनलाइन" : "Online"}</span>
          </p>
        </div>
      </div>

      {/* Right: Action Controls */}
      <div className="flex items-center gap-1 text-[#666666] dark:text-[#A09D96] shrink-0">
        {onClearHistory && (
          <button
            onClick={onClearHistory}
            title={isHindi ? "चैट इतिहास साफ़ करें" : "Clear Active Chat"}
            className="p-1.5 sm:p-2 rounded-xl hover:bg-[#FBF8F3] dark:hover:bg-[#2A2722] hover:text-[#9E1C20] transition-colors cursor-pointer"
          >
            <Trash2 className="size-4" />
          </button>
        )}
        {onExpand && (
          <button
            onClick={onExpand}
            title={isHindi ? "बड़ा करें" : "Expand to Full Workspace"}
            className="p-1.5 sm:p-2 rounded-xl hover:bg-[#FBF8F3] dark:hover:bg-[#2A2722] hover:text-[#1D1D1D] dark:hover:text-white transition-colors cursor-pointer"
          >
            <Maximize2 className="size-4" />
          </button>
        )}
        {onMinimize && (
          <button
            onClick={onMinimize}
            title={isHindi ? "छोटा करें" : "Minimize"}
            className="p-1.5 sm:p-2 rounded-xl hover:bg-[#FBF8F3] dark:hover:bg-[#2A2722] hover:text-[#1D1D1D] dark:hover:text-white transition-colors cursor-pointer"
          >
            <Minimize2 className="size-4" />
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            title={isHindi ? "बंद करें" : "Close"}
            className="p-1.5 sm:p-2 rounded-xl hover:bg-[#FBF8F3] dark:hover:bg-[#2A2722] hover:text-[#9E1C20] transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </header>
  );
}
