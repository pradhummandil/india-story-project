import React from "react";
import { Mic, MicOff, Send, Paperclip } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  disabled: boolean;
  isListening: boolean;
  hasSpeechSupport: boolean;
  toggleListening: () => void;
  isHindi: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
  isListening,
  hasSpeechSupport,
  toggleListening,
  isHindi,
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex gap-2.5 items-center w-full">
      <div className="relative flex-1">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isHindi ? "पूछें या कहानी सबमिशन का विवरण लिखें..." : "Ask assistant or write story details..."}
          disabled={disabled}
          className="h-11 w-full bg-neutral-900 border-neutral-800 focus:border-red-500/50 text-white text-xs sm:text-sm placeholder:text-neutral-500 focus:ring-0 pr-18 pl-4 rounded-xl"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {/* Attach file (future-ready) */}
          <button
            type="button"
            className="text-neutral-500 hover:text-neutral-300 p-1.5 rounded-full transition-colors"
            title="Attach references (future-ready)"
          >
            <Paperclip className="size-4" />
          </button>
          {hasSpeechSupport && (
            <button
              type="button"
              onClick={toggleListening}
              className={`p-1.5 rounded-full transition-all ${
                isListening ? "text-red-500 animate-pulse bg-red-500/10" : "text-neutral-500 hover:text-neutral-300"
              }`}
              title={isListening ? "Listening..." : "Dictate with voice"}
            >
              {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
            </button>
          )}
        </div>
      </div>
      <button
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className="h-11 w-11 shrink-0 bg-red-600 hover:bg-red-700 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-white font-bold flex items-center justify-center rounded-xl transition-all shadow-md"
      >
        <Send className="size-4" />
      </button>
    </div>
  );
}
