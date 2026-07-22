import React from "react";
import { Copy, RotateCcw, Sparkles } from "lucide-react";
import { StoryCards } from "./StoryCards";

type StoryPayload = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  themes: string[];
  region: string;
  readTime: string;
  image: string;
};

type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  stories?: StoryPayload[];
};

interface ChatMessagesProps {
  messages: Message[];
  loading: boolean;
  isHindi: boolean;
  lastQuery?: string;
  onRetry?: (text: string) => void;
  onCopy?: (text: string) => void;
  onStoryClick?: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onCancelGeneration?: () => void;
}

export function ChatMessages({
  messages,
  loading,
  isHindi,
  lastQuery,
  onRetry,
  onCopy,
  onStoryClick,
  messagesEndRef,
  onCancelGeneration,
}: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto space-y-5 p-4 scroll-smooth">
      {messages.map((m) => {
        const isBot = m.sender === "bot";
        const isErrorMessage = m.id.startsWith("err-");
        return (
          <div
            key={m.id}
            className={`flex flex-col gap-2 ${isBot ? "items-start" : "items-end"}`}
          >
            <div className={`flex gap-3 max-w-[85%] ${isBot ? "justify-start" : "justify-end"}`}>
              {isBot && (
                <div className="size-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <Sparkles className="size-4 text-red-500" />
                </div>
              )}
              <div className="space-y-1.5">
                <div
                  className={`rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed font-sans ${
                    isBot
                      ? "bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tl-sm shadow-sm"
                      : "bg-red-600 text-white font-semibold rounded-tr-sm shadow-md"
                  }`}
                >
                  {m.text.split("\n").map((line, idx) => {
                    if (line.startsWith("* ")) {
                      return (
                        <li key={idx} className="list-disc ml-4 my-1">
                          {line.slice(2)}
                        </li>
                      );
                    }
                    return <p key={idx} className="mb-2 last:mb-0">{line}</p>;
                  })}
                </div>

                {/* Actions */}
                {isBot && m.id !== "greet" && (
                  <div className="flex items-center gap-3.5 pl-1.5">
                    {onCopy && (
                      <button
                        onClick={() => onCopy(m.text)}
                        className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1 transition-colors uppercase font-bold"
                      >
                        <Copy className="size-3" />
                        {isHindi ? "कॉपी" : "Copy"}
                      </button>
                    )}
                    {isErrorMessage && lastQuery && onRetry && (
                      <button
                        onClick={() => onRetry(lastQuery)}
                        className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1 transition-colors uppercase font-bold"
                      >
                        <RotateCcw className="size-3" />
                        {isHindi ? "पुनः प्रयास" : "Retry"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Story cards list matching RAG search results */}
            {isBot && m.stories && m.stories.length > 0 && (
              <div className="w-full pl-11 max-w-[85%]">
                <StoryCards stories={m.stories} isHindi={isHindi} onStoryClick={onStoryClick} />
              </div>
            )}
          </div>
        );
      })}

      {/* Typing indicator */}
      {loading && (
        <div className="flex gap-3 justify-start">
          <div className="size-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="size-4 text-red-500 animate-pulse" />
          </div>
          <div className="space-y-2 max-w-[80%]">
            <div className="bg-neutral-900 border border-neutral-800 text-neutral-400 rounded-xl px-4 py-2.5 text-xs font-sans flex items-center gap-2">
              <span>{isHindi ? "सहायक सोच रहा है" : "Assistant is thinking"}</span>
              <div className="flex gap-1 items-center h-2">
                <span className="size-1.5 rounded-full bg-red-500 animate-bounce inline-block" />
                <span className="size-1.5 rounded-full bg-red-500 animate-bounce inline-block [animation-delay:0.2s]" />
                <span className="size-1.5 rounded-full bg-red-500 animate-bounce inline-block [animation-delay:0.4s]" />
              </div>
            </div>
            {onCancelGeneration && (
              <button
                onClick={onCancelGeneration}
                className="text-[9px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider pl-1.5"
              >
                {isHindi ? "रद्द करें" : "Cancel Generation"}
              </button>
            )}
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
