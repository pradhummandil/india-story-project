import React from "react";
import { Sparkles } from "lucide-react";

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (text: string) => void;
}

export function SuggestionChips({ suggestions, onSelect }: SuggestionChipsProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none whitespace-nowrap shrink-0 font-sans snap-x max-w-full">
      {suggestions.map((s, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(s)}
          className="inline-flex items-center gap-1.5 text-xs bg-white dark:bg-[#181715] hover:bg-[#FBF8F3] dark:hover:bg-[#2A2722] border border-[#ECE7DF] dark:border-[#2A2722] hover:border-[#C9A227]/60 text-[#1D1D1D] dark:text-[#FBF8F3] px-3 py-1 rounded-full transition-all duration-200 shadow-2xs cursor-pointer shrink-0 snap-start whitespace-nowrap hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="size-3 text-[#C9A227]" />
          <span>{s}</span>
        </button>
      ))}
    </div>
  );
}
