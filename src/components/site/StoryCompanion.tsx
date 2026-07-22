import React, { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Send,
  User,
  Bot,
  Loader2,
  Mic,
  MicOff,
  Copy,
  Trash2,
  CornerDownRight,
  Flame,
  Clock,
  Compass,
  ArrowRight,
  MapPin,
  HelpCircle,
  HelpCircle as QuestionIcon
} from "lucide-react";
import { useI18nStore } from "@/lib/i18n";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  stories?: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    themes: string[];
    region: string;
    readTime: string;
    image: string;
  }>;
};

export function StoryCompanion() {
  const lang = useI18nStore((s) => s.lang);
  const { session } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isHindi = lang === "hi";

  // Speech Recognition setup
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = isHindi ? "hi-IN" : "en-IN";
        rec.onresult = (e: any) => {
          const text = e.results[0][0].transcript;
          setInputValue(text);
          setIsListening(false);
        };
        rec.onerror = () => {
          setIsListening(false);
        };
        rec.onend = () => {
          setIsListening(false);
        };
        recognitionRef.current = rec;
      }
    }
  }, [isHindi]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Pre-configured suggestions
  const defaultSuggestions = isHindi
    ? [
        "राजस्थान की कहानियाँ",
        "स्वतंत्रता सेनानी",
        "5 मिनट से कम समय की कहानियाँ",
        "प्रसिद्ध त्योहार",
      ]
    : [
        "Explore Rajasthan",
        "Recommend history stories",
        "Stories under 5 minutes",
        "Unsung heroes",
      ];

  // Load chat history from localStorage or set default greeting
  useEffect(() => {
    const key = session ? `isp_chat_history_${session.user.id}` : "isp_chat_history_guest";
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(
          parsed.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }))
        );
      } catch {
        setDefaultGreeting();
      }
    } else {
      setDefaultGreeting();
    }
    setSuggestions(defaultSuggestions);
  }, [lang, session]);

  const setDefaultGreeting = () => {
    const greetText = isHindi
      ? "नमस्ते! मैं आपका भारत स्टोरी एआई साथी हूँ। मैं आपको भारत की लोक कथाओं, गुमनाम नायकों और सांस्कृतिक धरोहरों के बारे में बता सकता हूँ। आप क्या जानना चाहेंगे?"
      : "Namaste! I am your India Story AI Companion. Ask me about cultural heritage, unsung heroes, states, festivals, or local innovations across India.";
    setMessages([
      {
        id: "greet",
        sender: "bot",
        text: greetText,
        timestamp: new Date(),
      },
    ]);
  };

  // Save messages to localStorage
  const saveChatHistory = (msgs: Message[]) => {
    const key = session ? `isp_chat_history_${session.user.id}` : "isp_chat_history_guest";
    localStorage.setItem(key, JSON.stringify(msgs));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substring(2, 9),
      sender: "user",
      text: trimmed,
      timestamp: new Date(),
    };

    const updatedMsgs = [...messages, userMsg];
    setMessages(updatedMsgs);
    saveChatHistory(updatedMsgs);
    setInputValue("");
    setLoading(true);
    setSuggestions([]);

    // Abort controller for cancel option
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({ message: trimmed, lang }),
        signal: controller.signal,
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: Message = {
          id: Math.random().toString(36).substring(2, 9),
          sender: "bot",
          text: data.reply,
          timestamp: new Date(),
          stories: data.stories || [],
        };
        const finalMsgs = [...updatedMsgs, botMsg];
        setMessages(finalMsgs);
        saveChatHistory(finalMsgs);
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
        } else {
          setSuggestions(defaultSuggestions);
        }
      } else {
        throw new Error();
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      const errorMsg: Message = {
        id: "err-" + Math.random().toString(36).substring(2, 9),
        sender: "bot",
        text: isHindi
          ? "माफ़ कीजिये, अभी संपर्क स्थापित नहीं हो पाया। कृपया पुनः प्रयास करें।"
          : "Sorry, I am facing connectivity issues. Please try again in a moment.",
        timestamp: new Date(),
      };
      const finalMsgs = [...updatedMsgs, errorMsg];
      setMessages(finalMsgs);
      saveChatHistory(finalMsgs);
      setSuggestions(defaultSuggestions);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
      const cancelMsg: Message = {
        id: "cancel-" + Math.random().toString(36).substring(2, 9),
        sender: "bot",
        text: isHindi ? "पीढ़ी रद्द कर दी गई।" : "Generation cancelled.",
        timestamp: new Date(),
      };
      const finalMsgs = [...messages, cancelMsg];
      setMessages(finalMsgs);
      saveChatHistory(finalMsgs);
      setSuggestions(defaultSuggestions);
    }
  };

  const handleClearHistory = () => {
    const key = session ? `isp_chat_history_${session.user.id}` : "isp_chat_history_guest";
    localStorage.removeItem(key);
    setDefaultGreeting();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Keyboard accessibility handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-[60] font-sans">
      {/* ── Trigger FAB Button ── */}
      <motion.button
        id="chatbot-trigger"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI Story Companion"
        className="size-14 rounded-full bg-gradient-to-br from-gold to-saffron text-gold-foreground flex items-center justify-center shadow-glow relative cursor-pointer border border-gold/30 hover:border-gold/50"
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
              <Sparkles className="size-6" />
              <span className="absolute -top-1.5 -right-1.5 size-3 bg-red-500 rounded-full animate-pulse border border-black" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── Chat Window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-18 right-0 w-[92vw] sm:w-[410px] h-[550px] bg-zinc-950/95 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-gold/10 to-saffron/5 border-b border-white/10 px-4 py-3 flex.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-gold/15 flex items-center justify-center border border-gold/30">
                  <Sparkles className="size-4.5 text-gold" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gradient-gold">
                    India Story AI Companion
                  </h3>
                  <span className="text-[9px] text-emerald-400 flex items-center gap-1 font-bold">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                    Interactive Guide
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearHistory}
                  title="Clear history"
                  className="text-white/40 hover:text-white/80 p-1 rounded hover:bg-white/5 transition-colors"
                >
                  <Trash2 className="size-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Message Pane */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m) => {
                const isBot = m.sender === "bot";
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col gap-1.5 ${isBot ? "items-start" : "items-end"}`}
                  >
                    <div className={`flex gap-2.5 max-w-[85%] ${isBot ? "justify-start" : "justify-end"}`}>
                      {isBot && (
                        <div className="size-7 rounded-full bg-gold/15 border border-gold/20 flex items-center justify-center shrink-0">
                          <Bot className="size-3.5 text-gold" />
                        </div>
                      )}
                      <div className="space-y-2">
                        <div
                          className={`rounded-xl p-3 text-xs leading-relaxed font-sans ${
                            isBot
                              ? "bg-white/5 border border-white/5 text-white/90"
                              : "bg-gradient-to-br from-gold to-saffron text-gold-foreground font-semibold shadow-glow"
                          }`}
                        >
                          {m.text}
                        </div>
                        
                        {/* Copy / Actions under Bot replies */}
                        {isBot && m.id !== "greet" && (
                          <div className="flex items-center gap-2 pl-1">
                            <button
                              onClick={() => copyToClipboard(m.text)}
                              title="Copy response"
                              className="text-[10px] text-muted-foreground hover:text-white flex items-center gap-1 transition-colors"
                            >
                              <Copy className="size-3" />
                              Copy
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rich database story cards matching results */}
                    {isBot && m.stories && m.stories.length > 0 && (
                      <div className="w-full pl-9 pr-4 pt-1 space-y-2.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gold flex items-center gap-1">
                          <CornerDownRight className="size-3" />
                          Matched Stories:
                        </span>
                        <div className="grid grid-cols-1 gap-2.5">
                          {m.stories.map((story) => (
                            <div
                              key={story.id}
                              className="bg-card/45 border border-border/30 rounded-xl overflow-hidden p-3 flex gap-3 hover:border-gold/30 transition-all duration-300"
                            >
                              <div className="size-16 rounded-lg overflow-hidden shrink-0 bg-stone-900 relative">
                                <img
                                  src={story.image}
                                  alt={story.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2 text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                                    <span className="flex items-center gap-0.5 text-gold">
                                      <MapPin className="size-2.5" />
                                      {story.region}
                                    </span>
                                    <span>•</span>
                                    <span>{story.readTime}</span>
                                  </div>
                                  <h4 className="font-display font-bold text-xs text-white line-clamp-1">
                                    {story.title}
                                  </h4>
                                </div>
                                <div className="flex justify-end">
                                  <Link
                                    to="/stories/$slug"
                                    params={{ slug: story.slug }}
                                    onClick={() => setIsOpen(false)}
                                    className="inline-flex items-center gap-1 text-gold hover:text-white transition-colors uppercase font-bold tracking-wider text-[9px]"
                                  >
                                    Read Story
                                    <ArrowRight className="size-2.5" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing indicator */}
              {loading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="size-7 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                    <Sparkles className="size-3.5 text-gold animate-pulse" />
                  </div>
                  <div className="space-y-2 max-w-[80%]">
                    <div className="bg-white/5 border border-white/5 text-white/40 rounded-xl px-3 py-2 text-[10px] font-sans flex items-center gap-1.5">
                      <span>Companion is thinking</span>
                      <div className="flex gap-1 items-center h-2">
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
                    <button
                      onClick={handleCancelGeneration}
                      className="text-[9px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider pl-1"
                    >
                      Cancel Generation
                    </button>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick action buttons */}
            {!loading && messages.length > 0 && (
              <div className="px-4 py-1.5 border-t border-white/5 bg-black/30 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
                <button
                  onClick={() => handleSend(isHindi ? "राजस्थान" : "Explore Rajasthan")}
                  className="flex-shrink-0 text-[9px] bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-gold px-2.5 py-1 rounded-full transition-colors font-bold uppercase tracking-wide cursor-pointer"
                >
                  Explore Rajasthan
                </button>
                <button
                  onClick={() => handleSend(isHindi ? "ऐतिहासिक कहानियाँ" : "Recommend history stories")}
                  className="flex-shrink-0 text-[9px] bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-gold px-2.5 py-1 rounded-full transition-colors font-bold uppercase tracking-wide cursor-pointer"
                >
                  History Stories
                </button>
                <button
                  onClick={() => handleSend(isHindi ? "गुमनाम नायक" : "Unsung heroes")}
                  className="flex-shrink-0 text-[9px] bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-gold px-2.5 py-1 rounded-full transition-colors font-bold uppercase tracking-wide cursor-pointer"
                >
                  Unsung Heroes
                </button>
              </div>
            )}

            {/* Suggestions panel */}
            {suggestions.length > 0 && !loading && (
              <div className="px-4 py-2 border-t border-white/5 bg-black/40 flex flex-wrap gap-1.5 shrink-0">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s)}
                    className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white px-2.5 py-1 rounded-full transition-colors cursor-pointer"
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
              className="p-3 border-t border-white/10 bg-black flex gap-2 shrink-0"
            >
              <div className="relative flex-1">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={isHindi ? "संदेश लिखें..." : "Ask AI companion..."}
                  disabled={loading}
                  className="h-9 w-full bg-white/5 border-white/10 text-white text-xs placeholder:text-white/20 focus:border-gold/50 pr-8"
                />
                {recognitionRef.current && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full ${
                      isListening ? "text-red-500 animate-pulse" : "text-white/40 hover:text-white"
                    }`}
                  >
                    {isListening ? <MicOff className="size-3.5" /> : <Mic className="size-3.5" />}
                  </button>
                )}
              </div>
              <Button
                type="submit"
                disabled={loading || !inputValue.trim()}
                className="h-9 w-9 p-0 shrink-0 bg-gradient-to-br from-gold to-saffron text-gold-foreground flex items-center justify-center rounded-lg"
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
