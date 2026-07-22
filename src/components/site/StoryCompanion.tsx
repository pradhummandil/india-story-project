import React, { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Loader2,
  Mic,
  MicOff,
  Copy,
  Trash2,
  CornerDownRight,
  ArrowRight,
  MapPin,
  Sparkles,
  RotateCcw
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

// Premium Custom SVG Logo: Book + AI Sparkle
function CompanionLogo({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      {/* Book outline */}
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" strokeLinejoin="round" />
      {/* AI Sparkle */}
      <path d="M14 6l1.2 2.5L18 9l-2.8 2.3.6 2.7-2.8-1.2-2.8 1.2.6-2.7L8 9l2.8-.5L12 6z" fill="currentColor" stroke="none" className="text-gold animate-pulse" />
    </svg>
  );
}

export function StoryCompanion() {
  const lang = useI18nStore((s) => s.lang);
  const { session } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [lastQuery, setLastQuery] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isHindi = lang === "hi";
  const recognitionRef = useRef<any>(null);

  // Speech Recognition setup
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
        rec.onerror = () => setIsListening(false);
        rec.onend = () => setIsListening(false);
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

  const saveChatHistory = (msgs: Message[]) => {
    const key = session ? `isp_chat_history_${session.user.id}` : "isp_chat_history_guest";
    localStorage.setItem(key, JSON.stringify(msgs));
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages, loading, isOpen]);

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setLastQuery(trimmed);

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
          ? "माफ़ कीजिये, अभी संपर्क स्थापित नहीं हो पाया। कृपया पुनः प्रयास करें या नीचे दिए गए रीट्राय बटन पर क्लिक करें।"
          : "Sorry, I am facing connectivity issues. Please try again in a moment or click retry below.",
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
    setSuggestions(defaultSuggestions);
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
      {/* ── Trigger Button with Custom SVG Logo ── */}
      <motion.button
        id="chatbot-trigger"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI Story Companion"
        className="size-14 rounded-full bg-gradient-to-r from-stone-950 to-neutral-900 hover:from-neutral-900 hover:to-stone-950 text-gold flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.2)] border border-gold/30 hover:border-gold/50 cursor-pointer relative"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="size-6 text-gold" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.3, opacity: 0 }}
              className="relative"
            >
              <CompanionLogo className="size-6 text-gold" />
              <span className="absolute -top-1 -right-1 size-2.5 bg-gold rounded-full animate-pulse border border-black" />
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
            className="absolute bottom-18 right-0 w-[92vw] sm:w-[410px] h-[550px] bg-stone-950/98 border border-gold/20 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-gold/15 to-saffron/5 border-b border-gold/20 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-gold/15 flex items-center justify-center border border-gold/30">
                  <CompanionLogo className="size-4.5 text-gold" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gradient-gold">
                    India Story AI Companion
                  </h3>
                  <span className="text-[9px] text-gold/80 flex items-center gap-1 font-bold">
                    <span className="size-1.5 rounded-full bg-gold animate-ping inline-block" />
                    Storytelling Assistant
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearHistory}
                  title="Clear history"
                  className="text-gold/60 hover:text-gold p-1.5 rounded-lg hover:bg-gold/10 transition-colors"
                >
                  <Trash2 className="size-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gold/60 hover:text-gold p-1.5 rounded-lg hover:bg-gold/10 transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Message Pane */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m) => {
                const isBot = m.sender === "bot";
                const isErrorMessage = m.id.startsWith("err-");
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col gap-1.5 ${isBot ? "items-start" : "items-end"}`}
                  >
                    <div className={`flex gap-2.5 max-w-[85%] ${isBot ? "justify-start" : "justify-end"}`}>
                      {isBot && (
                        <div className="size-7 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center shrink-0">
                          <CompanionLogo className="size-4 text-gold" />
                        </div>
                      )}
                      <div className="space-y-2">
                        <div
                          className={`rounded-2xl p-3 text-xs leading-relaxed font-sans ${
                            isBot
                              ? "bg-stone-900/60 border border-white/5 text-stone-200 rounded-tl-sm"
                              : "bg-gradient-to-br from-gold/20 to-saffron/10 border border-gold/25 text-gold font-semibold rounded-tr-sm"
                          }`}
                        >
                          {m.text}
                        </div>
                        
                        {/* Actions under Bot replies */}
                        {isBot && m.id !== "greet" && (
                          <div className="flex items-center gap-3 pl-1">
                            <button
                              onClick={() => copyToClipboard(m.text)}
                              title="Copy response"
                              className="text-[9px] text-gold/60 hover:text-gold flex items-center gap-1 transition-colors uppercase font-bold"
                            >
                              <Copy className="size-2.5" />
                              Copy
                            </button>
                            {isErrorMessage && lastQuery && (
                              <button
                                onClick={() => handleSend(lastQuery)}
                                className="text-[9px] text-gold/60 hover:text-gold flex items-center gap-1 transition-colors uppercase font-bold"
                              >
                                <RotateCcw className="size-2.5" />
                                Retry
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rich matching stories cards */}
                    {isBot && m.stories && m.stories.length > 0 && (
                      <div className="w-full pl-9 pr-4 pt-1 space-y-2.5">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-gold flex items-center gap-1">
                          <CornerDownRight className="size-3 text-gold" />
                          Recommended Stories:
                        </span>
                        <div className="grid grid-cols-1 gap-2.5">
                          {m.stories.map((story) => (
                            <div
                              key={story.id}
                              className="bg-stone-900/40 border border-gold/15 rounded-xl overflow-hidden p-3 flex gap-3 hover:border-gold/30 transition-all duration-300 shadow-md"
                            >
                              <div className="size-16 rounded-lg overflow-hidden shrink-0 bg-stone-950 relative">
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
                    <CompanionLogo className="size-4 text-gold animate-pulse" />
                  </div>
                  <div className="space-y-2 max-w-[80%]">
                    <div className="bg-stone-900/60 border border-white/5 text-stone-400 rounded-xl px-3 py-2 text-[10px] font-sans flex items-center gap-1.5">
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
              <div className="px-4 py-1.5 border-t border-gold/10 bg-black/40 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
                <button
                  onClick={() => handleSend(isHindi ? "राजस्थान" : "Explore Rajasthan")}
                  className="flex-shrink-0 text-[9px] bg-stone-900 hover:bg-stone-800 border border-gold/20 text-stone-300 hover:text-gold px-2.5 py-1 rounded-full transition-colors font-bold uppercase tracking-wide cursor-pointer"
                >
                  Explore Rajasthan
                </button>
                <button
                  onClick={() => handleSend(isHindi ? "इतिहास की कहानियाँ" : "Recommend history stories")}
                  className="flex-shrink-0 text-[9px] bg-stone-900 hover:bg-stone-800 border border-gold/20 text-stone-300 hover:text-gold px-2.5 py-1 rounded-full transition-colors font-bold uppercase tracking-wide cursor-pointer"
                >
                  History Stories
                </button>
                <button
                  onClick={() => handleSend(isHindi ? "गुमनाम नायक" : "Unsung heroes")}
                  className="flex-shrink-0 text-[9px] bg-stone-900 hover:bg-stone-800 border border-gold/20 text-stone-300 hover:text-gold px-2.5 py-1 rounded-full transition-colors font-bold uppercase tracking-wide cursor-pointer"
                >
                  Unsung Heroes
                </button>
              </div>
            )}

            {/* Suggestions panel */}
            {suggestions.length > 0 && !loading && (
              <div className="px-4 py-2 border-t border-gold/10 bg-black/40 flex flex-wrap gap-1.5 shrink-0">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s)}
                    className="text-[10px] bg-stone-900 hover:bg-stone-800 border border-gold/20 text-stone-300 hover:text-gold px-2.5 py-1 rounded-full transition-colors cursor-pointer"
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
              className="p-3 border-t border-gold/20 bg-black flex gap-2 shrink-0"
            >
              <div className="relative flex-1">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={isHindi ? "संदेश लिखें..." : "Ask AI companion..."}
                  disabled={loading}
                  className="h-9 w-full bg-stone-900 border-white/10 text-white text-xs placeholder:text-stone-500 focus:border-gold/40 focus:ring-0 pr-8"
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
                className="h-9 w-9 p-0 shrink-0 bg-gradient-to-br from-gold to-saffron text-black font-bold flex items-center justify-center rounded-lg hover:opacity-90"
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
