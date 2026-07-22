import React from "react";

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (text: string) => void;
}

export function SuggestionChips({ suggestions, onSelect }: SuggestionChipsProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 py-1.5 shrink-0">
      {suggestions.map((s, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(s)}
          className="text-xs bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-red-500/30 text-neutral-300 hover:text-white px-3.5 py-1.5 rounded-full transition-all cursor-pointer"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
