import React, { useRef, useEffect } from "react";
import { Mic, MicOff, Send, Paperclip, Square, Loader2 } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  disabled: boolean;
  isListening: boolean;
  hasSpeechSupport: boolean;
  toggleListening: () => void;
  isHindi: boolean;
  onCancelGeneration?: () => void;
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
  onCancelGeneration,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="w-full font-sans">
      <div className="relative bg-white/90 dark:bg-[#181715]/90 backdrop-blur-md border border-[#ECE7DF] dark:border-[#2A2722] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus-within:border-[#9E1C20] dark:focus-within:border-[#C9A227] transition-all duration-300 p-2.5">
        
        {/* Auto-growing Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isHindi
              ? "पूछें या कहानी सबमिशन का विवरण लिखें... (Enter दबाएं)"
              : "Ask assistant or write story details... (Press Enter)"
          }
          maxLength={2000}
          disabled={disabled}
          className="w-full bg-transparent text-[#1D1D1D] dark:text-[#FBF8F3] text-xs sm:text-sm placeholder:text-[#666666]/60 dark:placeholder:text-[#A09D96]/60 outline-none resize-none px-3 pt-1.5 pb-2 scrollbar-none leading-relaxed max-h-[140px]"
        />

        {/* Toolbar & Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#ECE7DF]/60 dark:border-[#2A2722]/60 px-2 text-xs">
          {/* Left tools: Attach & Speech */}
          <div className="flex items-center gap-1.5 text-[#666666] dark:text-[#A09D96]">
            <button
              type="button"
              className="p-2 rounded-xl hover:bg-[#FBF8F3] dark:hover:bg-[#2A2722] hover:text-[#9E1C20] transition-colors cursor-pointer"
              title={isHindi ? "संलग्न करें (शीघ्र आ रहा है)" : "Attach image / document (Coming soon)"}
            >
              <Paperclip className="size-4" />
            </button>

            {hasSpeechSupport && (
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isListening
                    ? "bg-[#9E1C20]/10 text-[#9E1C20] animate-pulse"
                    : "hover:bg-[#FBF8F3] dark:hover:bg-[#2A2722] hover:text-[#9E1C20]"
                }`}
                title={isListening ? (isHindi ? "सुन रहा है..." : "Listening...") : (isHindi ? "आवाज़ से बोलें" : "Dictate with voice")}
              >
                {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
              </button>
            )}
          </div>

          {/* Right actions: Counter & Send / Stop Button */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-[#666666] dark:text-[#A09D96] font-mono">
              {value.length}/2000
            </span>

            {disabled && onCancelGeneration ? (
              <button
                type="button"
                onClick={onCancelGeneration}
                className="size-9 rounded-xl bg-[#9E1C20] hover:bg-[#851619] text-white flex items-center justify-center shadow-md transition-all cursor-pointer"
                title={isHindi ? "उत्पादन रोकें" : "Stop generation"}
              >
                <Square className="size-4 fill-white" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onSend}
                disabled={disabled || !value.trim()}
                className="size-9 rounded-xl bg-[#9E1C20] hover:bg-[#851619] disabled:bg-[#ECE7DF] dark:disabled:bg-[#2A2722] disabled:text-[#666666]/40 text-white font-bold flex items-center justify-center shadow-md shadow-[#9E1C20]/20 disabled:shadow-none transition-all cursor-pointer hover:scale-[1.03] active:scale-[0.97]"
              >
                <Send className="size-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
