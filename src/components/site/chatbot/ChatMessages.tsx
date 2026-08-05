import React from "react";
import { Copy, RotateCcw, Sparkles, Check, ExternalLink } from "lucide-react";
import { StoryCards, StoryPayload } from "./StoryCards";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  stories?: StoryPayload[];
  exactMatch?: StoryPayload | null;
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
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
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
  scrollRef,
  onScroll,
}: ChatMessagesProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const formatTime = (date: Date) => {
    try {
      return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const handleCopyText = (id: string, text: string) => {
    if (onCopy) onCopy(text);
    setCopiedId(id);
    toast.success(isHindi ? "पाठ कॉपी किया गया!" : "Response text copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Custom Markdown parser for rich formatting (Headers, Lists, Links, Bold, Code)
  const renderFormattedMarkdown = (content: string) => {
    if (!content) return null;
    const lines = content.split("\n");

    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;

      if (trimmed.startsWith("### ")) {
        return (
          <h3 key={idx} className="font-display font-bold text-xs sm:text-sm text-[#9E1C20] dark:text-[#C9A227] mt-2.5 mb-1 leading-snug">
            {trimmed.slice(4)}
          </h3>
        );
      }
      if (trimmed.startsWith("## ")) {
        return (
          <h2 key={idx} className="font-display font-bold text-sm sm:text-base text-[#9E1C20] dark:text-[#C9A227] mt-3 mb-1.5 leading-snug">
            {trimmed.slice(3)}
          </h2>
        );
      }

      if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
        const bulletText = trimmed.replace(/^[\*\-\•]\s*/, "");
        return (
          <li key={idx} className="list-disc ml-4 my-0.5 pl-1 text-xs leading-relaxed text-[#1D1D1D] dark:text-[#FBF8F3]">
            {parseInlineMarkdown(bulletText)}
          </li>
        );
      }

      if (/^\d+\.\s/.test(trimmed)) {
        const listText = trimmed.replace(/^\d+\.\s*/, "");
        return (
          <div key={idx} className="flex gap-1.5 my-0.5 text-xs leading-relaxed text-[#1D1D1D] dark:text-[#FBF8F3]">
            <span className="font-bold text-[#9E1C20] dark:text-[#C9A227]">{trimmed.match(/^\d+\./)?.[0]}</span>
            <span>{parseInlineMarkdown(listText)}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="mb-1.5 last:mb-0 text-xs leading-relaxed">
          {parseInlineMarkdown(line)}
        </p>
      );
    });
  };

  const parseInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-bold text-[#9E1C20] dark:text-[#C9A227]">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={i} className="px-1 py-0.5 rounded bg-[#FBF8F3] dark:bg-[#2A2722] text-[#9E1C20] dark:text-[#C9A227] font-mono text-[10px]">{part.slice(1, -1)}</code>;
      }
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const linkLabel = linkMatch[1];
        const linkUrl = linkMatch[2];
        if (linkUrl.startsWith("/")) {
          return (
            <Link key={i} to={linkUrl as any} className="text-[#9E1C20] dark:text-[#C9A227] font-bold underline inline-flex items-center gap-0.5">
              <span>{linkLabel}</span>
            </Link>
          );
        }
        return (
          <a key={i} href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-[#9E1C20] dark:text-[#C9A227] font-bold underline inline-flex items-center gap-0.5">
            <span>{linkLabel}</span>
            <ExternalLink className="size-2.5" />
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      data-lenis-prevent="true"
      data-lenis-prevent-wheel="true"
      data-lenis-prevent-touch="true"
      className="flex-1 overflow-y-auto overscroll-contain space-y-4 p-3.5 sm:p-5 font-sans scroll-smooth"
    >
      {messages.map((m) => {
        const isBot = m.sender === "bot";
        const isErrorMessage = m.id.startsWith("err-");

        return (
          <div
            key={m.id}
            className={`flex flex-col gap-1.5 ${isBot ? "items-start" : "items-end"}`}
          >
            <div className={`flex gap-2.5 max-w-[94%] sm:max-w-[88%] ${isBot ? "justify-start" : "justify-end"}`}>
              
              {/* Bot Avatar Badge with ISP Logo */}
              {isBot && (
                <div className="size-8 rounded-xl bg-[#121110] border border-[#C9A227]/40 flex items-center justify-center shrink-0 shadow-xs mt-0.5 overflow-hidden">
                  <img
                    src="/Logo-ISP.jpg"
                    alt="AI Avatar"
                    className="size-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-1.5 flex-1 min-w-0">
                {/* Bubble Container */}
                <div
                  className={`rounded-2xl p-3.5 sm:p-4 text-xs leading-relaxed ${
                    isBot
                      ? "bg-white dark:bg-[#181715] border border-[#ECE7DF] dark:border-[#2A2722] text-[#1D1D1D] dark:text-[#FBF8F3] rounded-tl-xs shadow-[0_2px_15px_rgba(0,0,0,0.03)]"
                      : "bg-[#9E1C20] text-white font-medium rounded-tr-xs shadow-md shadow-[#9E1C20]/20"
                  }`}
                >
                  {isBot ? renderFormattedMarkdown(m.text) : <p className="whitespace-pre-wrap">{m.text}</p>}
                </div>

                {/* Footer Controls */}
                <div className={`flex items-center gap-2.5 px-1 text-[10px] text-[#666666] dark:text-[#A09D96] ${isBot ? "justify-start" : "justify-end"}`}>
                  <span>{formatTime(m.timestamp)}</span>

                  {isBot && m.id !== "greet" && (
                    <>
                      <span>•</span>
                      <button
                        onClick={() => handleCopyText(m.id, m.text)}
                        className="hover:text-[#9E1C20] dark:hover:text-[#C9A227] flex items-center gap-1 transition-colors uppercase font-bold tracking-wider cursor-pointer"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="size-3 text-emerald-500" />
                            <span className="text-emerald-500">{isHindi ? "कॉपी हुआ" : "Copied"}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3" />
                            <span>{isHindi ? "कॉपी" : "Copy"}</span>
                          </>
                        )}
                      </button>

                      {isErrorMessage && lastQuery && onRetry && (
                        <button
                          onClick={() => onRetry(lastQuery)}
                          className="hover:text-[#9E1C20] dark:hover:text-[#C9A227] flex items-center gap-1 transition-colors uppercase font-bold tracking-wider cursor-pointer ml-1"
                        >
                          <RotateCcw className="size-3" />
                          <span>{isHindi ? "पुनः प्रयास" : "Retry"}</span>
                        </button>
                      )}
                    </>
                  )}
                </div>

              </div>
            </div>

            {/* Story Cards */}
            {isBot && m.stories && m.stories.length > 0 && (
              <div className="w-full pl-10 max-w-[96%] sm:max-w-[92%]">
                <StoryCards stories={m.stories} isHindi={isHindi} onStoryClick={onStoryClick} />
              </div>
            )}
          </div>
        );
      })}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex gap-2.5 justify-start items-start">
          <div className="size-8 rounded-xl bg-[#121110] border border-[#C9A227]/40 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
            <img src="/Logo-ISP.jpg" alt="AI Avatar" className="size-full object-cover animate-pulse" />
          </div>
          <div className="space-y-1.5 max-w-[85%]">
            <div className="bg-white dark:bg-[#181715] border border-[#ECE7DF] dark:border-[#2A2722] text-[#1D1D1D] dark:text-[#FBF8F3] rounded-2xl rounded-tl-xs px-3.5 py-2.5 text-xs flex items-center gap-2.5 shadow-xs">
              <span className="font-bold text-[#9E1C20] dark:text-[#C9A227]">
                {isHindi ? "भारत स्टोरी एआई शोध कर रहा है..." : "Searching India Story repository..."}
              </span>
              <div className="flex gap-1 items-center h-2">
                <span className="size-1.5 rounded-full bg-[#9E1C20] animate-bounce inline-block" />
                <span className="size-1.5 rounded-full bg-[#C9A227] animate-bounce inline-block [animation-delay:0.2s]" />
                <span className="size-1.5 rounded-full bg-[#9E1C20] animate-bounce inline-block [animation-delay:0.4s]" />
              </div>
            </div>

            {onCancelGeneration && (
              <button
                onClick={onCancelGeneration}
                className="text-[10px] text-[#9E1C20] dark:text-[#C9A227] hover:underline font-bold uppercase tracking-wider pl-1 cursor-pointer"
              >
                {isHindi ? "उत्पादन रद्द करें" : "Cancel Generation"}
              </button>
            )}
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
