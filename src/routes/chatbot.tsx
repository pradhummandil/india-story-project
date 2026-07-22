import React, { useState, useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  Loader2,
  Mic,
  MicOff,
  Copy,
  Trash2,
  RotateCcw,
  CornerDownRight,
  ArrowRight,
  MapPin,
  Plus,
  MessageSquare,
  ChevronRight,
  Info,
  Clock
} from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { useI18nStore } from "@/lib/i18n";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  timestamp: string;
};

export const Route = createFileRoute("/chatbot" as any)({
  head: () => ({
    meta: [
      { title: "AI Story Companion — Discovery & Submission Guide | India Story Project" },
      {
        name: "description",
        content: "Discover heritage stories, ask platform guide FAQs, or get mentored step-by-step to submit your own story through our interactive AI Companion.",
      },
    ],
  }),
  component: ChatbotPage,
});

function ChatbotPage() {
  const lang = useI18nStore((s) => s.lang);
  const { session } = useAuthStore();
  const isHindi = lang === "hi";

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [lastQuery, setLastQuery] = useState("");

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
        "कहानी कैसे सबमिट करें?",
        "राजस्थान की कहानियाँ",
        "स्वतंत्रता सेनानी",
        "5 मिनट से कम समय की कहानियाँ",
      ]
    : [
        "How do I submit a story?",
        "Explore Rajasthan stories",
        "Unsung freedom fighters",
        "Stories under 5 minutes",
      ];

  const getStorageKey = () => {
    return session ? `isp_chatbot_sessions_${session.user.id}` : "isp_chatbot_sessions_guest";
  };

  // Load chatbot sessions
  useEffect(() => {
    const key = getStorageKey();
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed: ChatSession[] = JSON.parse(saved);
        if (parsed.length > 0) {
          setSessions(parsed);
          const lastActive = parsed[0];
          setActiveSessionId(lastActive.id);
          setMessages(lastActive.messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })));
        } else {
          createNewSession();
        }
      } catch {
        createNewSession();
      }
    } else {
      createNewSession();
    }
    setSuggestions(defaultSuggestions);
  }, [lang, session]);

  const createNewSession = () => {
    const defaultText = isHindi
      ? "नमस्ते! मैं आपका भारत स्टोरी एआई साथी हूँ। मैं आपको कहानियाँ खोजने, प्लेटफॉर्म के उपयोग, या अपनी खुद की कहानी लिखने और सबमिट करने में मार्गदर्शन कर सकता हूँ।"
      : "Namaste! I am your India Story AI Companion. I can help you discover stories, explain platform features, or guide you step-by-step to write and submit your own story.";

    const newSess: ChatSession = {
      id: Math.random().toString(36).substring(2, 9),
      title: isHindi ? "नई बातचीत" : "New Chat",
      timestamp: new Date().toISOString(),
      messages: [
        {
          id: "greet",
          sender: "bot",
          text: defaultText,
          timestamp: new Date(),
        },
      ],
    };

    setSessions((prev) => {
      const updated = [newSess, ...prev.filter((s) => s.id !== newSess.id)];
      const key = getStorageKey();
      localStorage.setItem(key, JSON.stringify(updated));
      return updated;
    });
    setActiveSessionId(newSess.id);
    setMessages(newSess.messages);
    setSuggestions(defaultSuggestions);
  };

  const switchSession = (id: string) => {
    const found = sessions.find((s) => s.id === id);
    if (found) {
      setActiveSessionId(id);
      setMessages(found.messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })));
    }
  };

  const saveCurrentSessionMessages = (msgs: Message[]) => {
    setSessions((prev) => {
      const updated = prev.map((s) => {
        if (s.id === activeSessionId) {
          // Generate title from first user query if generic
          let title = s.title;
          if (title === "New Chat" || title === "नई बातचीत") {
            const firstUserMsg = msgs.find((m) => m.sender === "user");
            if (firstUserMsg) {
              title = firstUserMsg.text.length > 25 ? firstUserMsg.text.slice(0, 25) + "..." : firstUserMsg.text;
            }
          }
          return { ...s, title, messages: msgs, timestamp: new Date().toISOString() };
        }
        return s;
      });
      const key = getStorageKey();
      localStorage.setItem(key, JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    const key = getStorageKey();
    localStorage.setItem(key, JSON.stringify(updated));

    if (updated.length > 0) {
      switchSession(updated[0].id);
    } else {
      createNewSession();
    }
  };

  const handleClearActiveHistory = () => {
    const defaultText = isHindi
      ? "नमस्ते! मैं आपका भारत स्टोरी एआई साथी हूँ। मैं आपको कहानियाँ खोजने, प्लेटफॉर्म के उपयोग, या अपनी खुद की कहानी लिखने और सबमिट करने में मार्गदर्शन कर सकता हूँ।"
      : "Namaste! I am your India Story AI Companion. I can help you discover stories, explain platform features, or guide you step-by-step to write and submit your own story.";
    
    const clearedMsgs = [
      {
        id: "greet",
        sender: "bot" as const,
        text: defaultText,
        timestamp: new Date(),
      }
    ];
    setMessages(clearedMsgs);
    saveCurrentSessionMessages(clearedMsgs);
  };

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
    saveCurrentSessionMessages(updatedMsgs);
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
        saveCurrentSessionMessages(finalMsgs);
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
      saveCurrentSessionMessages(finalMsgs);
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
      saveCurrentSessionMessages(finalMsgs);
      setSuggestions(defaultSuggestions);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <SiteLayout>
      <div className="min-h-[calc(100vh-6rem)] bg-stone-950 text-white flex flex-col md:flex-row overflow-hidden font-sans border-t border-gold/10">
        
        {/* === Sidebar (Conversations History List) === */}
        <aside className="w-full md:w-80 bg-stone-900/60 border-b md:border-b-0 md:border-r border-gold/15 flex flex-col shrink-0">
          <div className="p-4 border-b border-gold/15">
            <Button
              onClick={createNewSession}
              className="w-full bg-gradient-to-br from-gold to-saffron text-black font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all rounded-xl h-11"
            >
              <Plus className="size-4" />
              {isHindi ? "नई बातचीत" : "New Chat"}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 max-h-[250px] md:max-h-none">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-gold/60 px-3 mb-2">
              {isHindi ? "हालिया बातचीत" : "Recent Conversations"}
            </h4>
            {sessions.map((s) => {
              const isActive = s.id === activeSessionId;
              return (
                <button
                  key={s.id}
                  onClick={() => switchSession(s.id)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all text-left ${
                    isActive
                      ? "bg-gold/15 border border-gold/30 text-gold font-semibold"
                      : "hover:bg-white/5 border border-transparent text-stone-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MessageSquare className={`size-4 shrink-0 ${isActive ? "text-gold" : "text-stone-400"}`} />
                    <span className="text-xs truncate">{s.title}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSession(s.id, e)}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-0.5 rounded transition-all ml-1"
                    title="Delete Chat"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </button>
              );
            })}
          </div>
        </aside>

        {/* === Main Workspace (Chat Pane) === */}
        <section className="flex-1 flex flex-col justify-between overflow-hidden relative">
          
          {/* Header */}
          <header className="bg-gradient-to-r from-gold/10 to-saffron/5 border-b border-gold/15 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-gold/15 flex items-center justify-center border border-gold/30">
                <Sparkles className="size-5 text-gold animate-pulse" />
              </div>
              <div>
                <h2 className="font-display font-bold text-sm sm:text-base tracking-wide text-gradient-gold">
                  India Story AI Companion
                </h2>
                <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-gold animate-ping inline-block" />
                  Interactive Guide & submission assistant
                </p>
              </div>
            </div>
            <button
              onClick={handleClearActiveHistory}
              title="Clear active chat history"
              className="text-[10px] border border-gold/20 hover:border-gold/50 text-gold/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors uppercase font-bold"
            >
              <Trash2 className="size-3.5" />
              {isHindi ? "इतिहास मिटाएं" : "Clear Chat"}
            </button>
          </header>

          {/* Active conversation panels */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                      <div className="size-8 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center shrink-0">
                        <Sparkles className="size-4.5 text-gold" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <div
                        className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed font-sans ${
                          isBot
                            ? "bg-stone-900/60 border border-white/5 text-stone-200 rounded-tl-sm shadow-md"
                            : "bg-gradient-to-br from-gold/20 to-saffron/10 border border-gold/25 text-gold font-semibold rounded-tr-sm"
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
                        <div className="flex items-center gap-4 pl-1">
                          <button
                            onClick={() => copyToClipboard(m.text)}
                            className="text-[10px] text-gold/60 hover:text-gold flex items-center gap-1 transition-colors uppercase font-bold"
                          >
                            <Copy className="size-3" />
                            {isHindi ? "कॉपी" : "Copy Response"}
                          </button>
                          {isErrorMessage && lastQuery && (
                            <button
                              onClick={() => handleSend(lastQuery)}
                              className="text-[10px] text-gold/60 hover:text-gold flex items-center gap-1 transition-colors uppercase font-bold"
                            >
                              <RotateCcw className="size-3" />
                              {isHindi ? "पुनः प्रयास" : "Retry"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* recommended clickable story cards */}
                  {isBot && m.stories && m.stories.length > 0 && (
                    <div className="w-full pl-11 pr-4 pt-1 space-y-3 max-w-[85%]">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gold flex items-center gap-1">
                        <CornerDownRight className="size-3.5 text-gold" />
                        {isHindi ? "अनुशंसित कहानियाँ:" : "Recommended Stories:"}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {m.stories.map((story) => (
                          <div
                            key={story.id}
                            className="bg-stone-900/50 border border-gold/15 rounded-xl overflow-hidden p-3.5 flex gap-3 hover:border-gold/30 transition-all duration-300 shadow-lg"
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
                                  className="inline-flex items-center gap-1 text-gold hover:text-white transition-colors uppercase font-bold tracking-wider text-[9px]"
                                >
                                  {isHindi ? "कहानी पढ़ें" : "Read Story"}
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

            {/* Loading / Typing indicator */}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="size-8 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center shrink-0">
                  <Sparkles className="size-4.5 text-gold animate-pulse" />
                </div>
                <div className="space-y-2 max-w-[80%]">
                  <div className="bg-stone-900/60 border border-white/5 text-stone-400 rounded-xl px-4 py-2 text-xs font-sans flex items-center gap-2">
                    <span>Companion is thinking</span>
                    <div className="flex gap-1 items-center h-2">
                      <motion.span
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                        className="size-1.5 rounded-full bg-gold inline-block"
                      />
                      <motion.span
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
                        className="size-1.5 rounded-full bg-gold inline-block"
                      />
                      <motion.span
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
                        className="size-1.5 rounded-full bg-gold inline-block"
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

          {/* Quick Actions Panel */}
          {!loading && messages.length > 0 && (
            <div className="px-6 py-2 border-t border-gold/10 bg-black/30 flex gap-2 overflow-x-auto scrollbar-none shrink-0">
              <button
                onClick={() => handleSend(isHindi ? "कहानी कैसे सबमिट करें?" : "How to submit my story?")}
                className="flex-shrink-0 text-[10px] bg-stone-900 hover:bg-stone-800 border border-gold/20 text-stone-300 hover:text-gold px-3.5 py-1.5 rounded-full transition-colors font-bold uppercase tracking-wide cursor-pointer"
              >
                Story Submission Guide
              </button>
              <button
                onClick={() => handleSend(isHindi ? "राजस्थान" : "Explore Rajasthan")}
                className="flex-shrink-0 text-[10px] bg-stone-900 hover:bg-stone-800 border border-gold/20 text-stone-300 hover:text-gold px-3.5 py-1.5 rounded-full transition-colors font-bold uppercase tracking-wide cursor-pointer"
              >
                Explore Rajasthan
              </button>
              <button
                onClick={() => handleSend(isHindi ? "गुमनाम नायक" : "Unsung heroes")}
                className="flex-shrink-0 text-[10px] bg-stone-900 hover:bg-stone-800 border border-gold/20 text-stone-300 hover:text-gold px-3.5 py-1.5 rounded-full transition-colors font-bold uppercase tracking-wide cursor-pointer"
              >
                Unsung Heroes
              </button>
              <button
                onClick={() => handleSend(isHindi ? "डैशबोर्ड" : "How does bookmarks and profile work?")}
                className="flex-shrink-0 text-[10px] bg-stone-900 hover:bg-stone-800 border border-gold/20 text-stone-300 hover:text-gold px-3.5 py-1.5 rounded-full transition-colors font-bold uppercase tracking-wide cursor-pointer"
              >
                Platform features
              </button>
            </div>
          )}

          {/* Suggested prompts list */}
          {suggestions.length > 0 && !loading && (
            <div className="px-6 py-3.5 border-t border-gold/10 bg-black/45 flex flex-wrap gap-2 shrink-0">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s)}
                  className="text-xs bg-stone-900 hover:bg-stone-800 border border-gold/20 text-stone-300 hover:text-gold px-3.5 py-2 rounded-full transition-colors cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Composer Input Box */}
          <footer className="p-4 border-t border-gold/10 bg-black flex gap-3 shrink-0">
            <div className="relative flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isHindi ? "पूछें या कहानी सबमिशन का विवरण लिखें..." : "Ask companion or dictate your story..."}
                disabled={loading}
                className="h-11 w-full bg-stone-900 border-white/10 text-white text-xs sm:text-sm placeholder:text-stone-500 focus:border-gold/40 focus:ring-0 pr-10 rounded-xl"
              />
              {recognitionRef.current && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${
                    isListening ? "text-red-500 animate-pulse bg-red-500/10" : "text-white/40 hover:text-white"
                  }`}
                >
                  {isListening ? <MicOff className="size-4.5" /> : <Mic className="size-4.5" />}
                </button>
              )}
            </div>
            <Button
              type="button"
              onClick={() => handleSend(inputValue)}
              disabled={loading || !inputValue.trim()}
              className="h-11 w-11 p-0 shrink-0 bg-gradient-to-br from-gold to-saffron text-black font-bold flex items-center justify-center rounded-xl hover:opacity-90"
            >
              <Send className="size-4" />
            </Button>
          </footer>

        </section>
      </div>
    </SiteLayout>
  );
}
