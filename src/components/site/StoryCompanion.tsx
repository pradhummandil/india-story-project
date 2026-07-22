import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Maximize2, X } from "lucide-react";
import { useI18nStore } from "@/lib/i18n";
import { useAuthStore } from "@/lib/auth-store";
import { ChatHeader, CompanionLogo } from "./chatbot/ChatHeader";
import { ChatMessages } from "./chatbot/ChatMessages";
import { ChatInput } from "./chatbot/ChatInput";
import { SuggestionChips } from "./chatbot/SuggestionChips";

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

export function StoryCompanion() {
  const lang = useI18nStore((s) => s.lang);
  const { session } = useAuthStore();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [lastQuery, setLastQuery] = useState("");

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const isHindi = lang === "hi";

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
          setInputValue(e.results[0][0].transcript);
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
        "5 मिनट से कम समय की कहानियाँ",
      ]
    : [
        "How do I submit a story?",
        "Explore Rajasthan stories",
        "Stories under 5 minutes",
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
      ? "नमस्ते! मैं आपका भारत स्टोरी सहायक हूँ। मैं आपको कहानियाँ खोजने या अपनी कहानी सबमिट करने में मार्गदर्शन कर सकता हूँ।"
      : "Namaste! I am your India Story Assistant. I can help you find stories, guide you on how to write, or help you submit one.";
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
          setSuggestions(data.suggestions.slice(0, 3));
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
    }
  };

  const handleClearHistory = () => {
    const key = session ? `isp_chat_history_${session.user.id}` : "isp_chat_history_guest";
    localStorage.removeItem(key);
    setDefaultGreeting();
    setSuggestions(defaultSuggestions);
  };

  const handleExpand = () => {
    setIsOpen(false);
    navigate({ to: "/chatbot" });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] font-sans">
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-16 right-0 bg-neutral-900 border border-neutral-800 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg whitespace-nowrap shadow-md"
          >
            {isHindi ? "कहानी सहायक" : "India Story Assistant"}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Trigger FAB Button (Red + White Branding) ── */}
      <motion.button
        id="chatbot-trigger"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI Story Companion"
        className="size-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:shadow-red-500/20 border border-red-500/30 cursor-pointer relative"
      >
        <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping opacity-75" />
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="size-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.3, opacity: 0 }}
            >
              <CompanionLogo className="size-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── Compact Chat Window (Glassmorphic Neutral Dark) ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-18 right-0 w-[92vw] sm:w-[380px] h-[480px] bg-neutral-950/90 backdrop-blur-md border border-neutral-800 rounded-2xl shadow-xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <ChatHeader
              onClose={() => setIsOpen(false)}
              onMinimize={() => setIsOpen(false)}
              onExpand={handleExpand}
              onClearHistory={handleClearHistory}
              isCompact={true}
              isHindi={isHindi}
            />

            {/* Messages */}
            <div className="flex-1 overflow-hidden flex flex-col justify-between">
              <ChatMessages
                messages={messages}
                loading={loading}
                isHindi={isHindi}
                lastQuery={lastQuery}
                onRetry={handleSend}
                onCopy={(text) => navigator.clipboard.writeText(text)}
                onStoryClick={() => setIsOpen(false)}
                messagesEndRef={messagesEndRef}
                onCancelGeneration={handleCancelGeneration}
              />

              {/* Suggestions Panel */}
              {suggestions.length > 0 && !loading && (
                <div className="px-4 py-1.5 border-t border-neutral-800 bg-neutral-900/30">
                  <SuggestionChips suggestions={suggestions} onSelect={handleSend} />
                </div>
              )}

              {/* Input Area */}
              <div className="p-3 border-t border-neutral-800 bg-neutral-950">
                <ChatInput
                  value={inputValue}
                  onChange={setInputValue}
                  onSend={() => handleSend(inputValue)}
                  disabled={loading}
                  isListening={isListening}
                  hasSpeechSupport={!!recognitionRef.current}
                  toggleListening={toggleListening}
                  isHindi={isHindi}
                />
              </div>

              {/* Footer link to full view */}
              <div className="bg-neutral-900/80 border-t border-neutral-800 py-2 text-center text-[10px] uppercase font-bold tracking-wider">
                <Link
                  to="/chatbot"
                  onClick={() => setIsOpen(false)}
                  className="text-red-500 hover:text-red-400 transition-colors inline-flex items-center gap-1"
                >
                  {isHindi ? "पूर्ण चैट खोलें" : "Open Full Chat"}
                  <Maximize2 className="size-2.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
