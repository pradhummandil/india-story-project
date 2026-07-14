import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Sparkles, User, Bot, Loader2 } from "lucide-react";
import { useI18nStore } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
};

function TypewriterText({ text, speed = 8 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <div className="space-y-1">
      {displayedText.split("\n\n").map((para, pIdx) => {
        let content: React.ReactNode = para;
        if (para.includes("**") || para.includes("[")) {
          const tokens = para.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
          content = tokens.map((tok, tIdx) => {
            if (tok.startsWith("**") && tok.endsWith("**")) {
              return <strong key={tIdx} className="text-gold font-bold">{tok.slice(2, -2)}</strong>;
            }
            if (tok.startsWith("[") && tok.includes("](")) {
              const label = tok.slice(1, tok.indexOf("]("));
              const url = tok.slice(tok.indexOf("](") + 2, -1);
              return (
                <a key={tIdx} href={url} className="text-gold underline hover:text-primary transition-colors font-bold inline-flex items-center gap-0.5">
                  {label}
                </a>
              );
            }
            return tok;
          });
        }
        return <p key={pIdx}>{content}</p>;
      })}
    </div>
  );
}

export function Chatbot() {
  const lang = useI18nStore((s) => s.lang);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [latestBotMsgId, setLatestBotMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isHindi = lang === "hi";

  // Default greeting suggestions
  const defaultSuggestions = isHindi
    ? ["केरल की कहानियाँ दिखाएँ", "गुमनाम नायकों के बारे में बताएं", "विरासत श्रेणी की कहानियाँ"]
    : ["Show stories from Kerala", "Tell me about local heroes", "Explore heritage category"];

  useEffect(() => {
    setSuggestions(defaultSuggestions);
    // Add default greeting
    const greetText = isHindi
      ? "नमस्ते! मैं भारत की लोक कथाओं और गुमनाम नायकों को खोजने में आपकी मदद कर सकता हूँ। आप क्या जानना चाहेंगे?"
      : "Namaste! I am your India Story Assistant. Ask me about unsung heroes, cultural heritage, or innovations across India.";
    setMessages([
      {
        id: "greet",
        sender: "bot",
        text: greetText,
        timestamp: new Date(),
      },
    ]);
  }, [lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);
    setSuggestions([]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), lang }),
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: Message = {
          id: Math.random().toString(),
          sender: "bot",
          text: data.reply,
          timestamp: new Date(),
        };
        setLatestBotMsgId(botMsg.id);
        setMessages((prev) => [...prev, botMsg]);
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions.slice(0, 3));
        } else {
          setSuggestions(defaultSuggestions);
        }
      } else {
        throw new Error();
      }
    } catch {
      const errorMsg: Message = {
        id: "err",
        sender: "bot",
        text: isHindi
          ? "माफ़ कीजिये, अभी संपर्क स्थापित नहीं हो पाया। कृपया पुनः प्रयास करें।"
          : "Sorry, I am facing connectivity issues. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setSuggestions(defaultSuggestions);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "A") {
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* ── Trigger Button ── */}
      <motion.button
        id="chatbot-trigger"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="size-14 rounded-full bg-primary hover:bg-primary/95 text-white flex items-center justify-center shadow-2xl relative cursor-pointer border border-white/10"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="size-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.3, opacity: 0 }}
              className="relative"
            >
              <MessageSquare className="size-6" />
              <span className="absolute -top-1.5 -right-1.5 size-3 bg-gold rounded-full animate-pulse border border-primary" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── Chat Window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-18 right-0 w-[90vw] sm:w-[380px] h-[500px] bg-zinc-950/95 backdrop-blur-lg border border-white/10 rounded-sm shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary/10 border-b border-white/15 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                  <Sparkles className="size-4 text-gold" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white">
                    {isHindi ? "कहानी सहायक" : "Story Assistant"}
                  </h3>
                  <span className="text-[9px] text-emerald-400 flex items-center gap-1 font-bold">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                    Online
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Message Pane */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4"
              onClick={handleLinkClick}
            >
              {messages.map((m) => {
                const isBot = m.sender === "bot";
                return (
                  <div
                    key={m.id}
                    className={`flex gap-2.5 ${isBot ? "justify-start" : "justify-end"}`}
                  >
                    {isBot && (
                      <div className="size-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Bot className="size-3.5 text-gold" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-sm p-3 text-xs leading-relaxed font-sans ${
                        isBot
                          ? "bg-white/5 border border-white/5 text-white/80"
                          : "bg-primary text-white"
                      }`}
                    >
                      {isBot && m.id === latestBotMsgId ? (
                        <TypewriterText text={m.text} speed={6} />
                      ) : (
                        <div className="space-y-1">
                          {m.text.split("\n\n").map((para, pIdx) => {
                            // Simple bold/link inline markdown formatter
                            let content: React.ReactNode = para;
                            if (para.includes("**") || para.includes("[")) {
                              const tokens = para.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
                              content = tokens.map((tok, tIdx) => {
                                if (tok.startsWith("**") && tok.endsWith("**")) {
                                  return <strong key={tIdx} className="text-gold font-bold">{tok.slice(2, -2)}</strong>;
                                }
                                if (tok.startsWith("[") && tok.includes("](")) {
                                  const label = tok.slice(1, tok.indexOf("]("));
                                  const url = tok.slice(tok.indexOf("](") + 2, -1);
                                  return (
                                    <a key={tIdx} href={url} className="text-gold underline hover:text-primary transition-colors font-bold inline-flex items-center gap-0.5">
                                      {label}
                                    </a>
                                  );
                                }
                                return tok;
                              });
                            }
                            return <p key={pIdx}>{content}</p>;
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {loading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="size-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Sparkles className="size-3.5 text-gold animate-pulse" />
                  </div>
                  <div className="bg-white/5 border border-white/5 text-white/40 rounded-sm px-3 py-2 text-[10px] font-sans flex items-center gap-1">
                    <span className="text-[10px] italic">Assistant is thinking</span>
                    <div className="flex gap-1 ml-1 items-center h-2">
                      <motion.span
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                        className="size-1 rounded-full bg-gold inline-block"
                      />
                      <motion.span
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
                        className="size-1 rounded-full bg-gold inline-block"
                      />
                      <motion.span
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
                        className="size-1 rounded-full bg-gold inline-block"
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions panel */}
            {suggestions.length > 0 && !loading && (
              <div className="px-4 py-2 border-t border-white/5 bg-black/40 flex flex-wrap gap-1.5">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s)}
                    className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white px-2 py-1 rounded-full transition-colors cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputValue);
              }}
              className="p-3 border-t border-white/10 bg-black flex gap-2"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isHindi ? "संदेश लिखें..." : "Ask assistant..."}
                disabled={loading}
                className="h-9 bg-white/5 border-white/10 text-white text-xs placeholder:text-white/20 focus:border-primary/50"
              />
              <Button
                type="submit"
                disabled={loading || !inputValue.trim()}
                className="h-9 w-9 p-0 shrink-0 bg-primary hover:bg-primary/90 text-white flex items-center justify-center rounded-sm"
              >
                <Send className="size-3.5" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
