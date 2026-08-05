import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, X, Sparkles } from "lucide-react";
import { useI18nStore } from "@/lib/i18n";
import { useAuthStore } from "@/lib/auth-store";
import { ChatHeader } from "./chatbot/ChatHeader";
import { ChatMessages } from "./chatbot/ChatMessages";
import { ChatInput } from "./chatbot/ChatInput";
import { SuggestionChips } from "./chatbot/SuggestionChips";
import { StoryPayload } from "./chatbot/StoryCards";

type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  stories?: StoryPayload[];
  exactMatch?: StoryPayload | null;
};

export function StoryCompanion() {
  const lang = useI18nStore((s) => s.lang);
  const { session } = useAuthStore();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [lastQuery, setLastQuery] = useState("");

  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const userScrolledUpRef = useRef(false);

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
        "राजस्थान की कहानियाँ",
        "कहानी कैसे प्रकाशित करें?",
        "पोचमपल्ली की बुनकर कहानी",
        "गुमनाम नायकों की गाथा",
      ]
    : [
        "Stories from Rajasthan",
        "How to publish my story?",
        "The Weaver of Pochampally",
        "Unsung Freedom Fighters",
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
      ? "नमस्ते! मैं आपका भारत स्टोरी एआई सहायक हूँ। मैं आपको कहानियाँ खोजने, भारत के सांस्कृतिक इतिहास को जानने, या अपनी खुद की कहानी लिखकर सबमिट करने में मदद कर सकता हूँ।"
      : "Namaste! I am your official India Story AI Assistant. I can help you discover heritage stories, explore Indian history, or guide you step-by-step to write and publish your own story.";
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

  // Smart Auto-scroll without locking user scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 80;
    userScrolledUpRef.current = !isNearBottom;
  };

  useEffect(() => {
    if (isOpen && !userScrolledUpRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  const handleToggleOpen = () => {
    setIsOpen((prev) => {
      if (!prev) setHasUnread(false);
      return !prev;
    });
  };

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setLastQuery(trimmed);
    userScrolledUpRef.current = false; // Reset on send

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

      const chatHistory = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({ message: trimmed, lang, history: chatHistory }),
        signal: controller.signal,
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: Message = {
          id: Math.random().toString(36).substring(2, 9),
          sender: "bot",
          text: data.reply || "",
          timestamp: new Date(),
          stories: data.stories || [],
          exactMatch: data.exactMatch || null,
        };
        const finalMsgs = [...updatedMsgs, botMsg];
        setMessages(finalMsgs);
        saveChatHistory(finalMsgs);
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions.slice(0, 4));
        } else {
          setSuggestions(defaultSuggestions);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        const errDetailText = errData.error || res.statusText || "HTTP Error";
        const botErrMsg: Message = {
          id: "err-" + Math.random().toString(36).substring(2, 9),
          sender: "bot",
          text: `[API Error ${res.status}]: ${errDetailText}`,
          timestamp: new Date(),
        };
        const finalMsgs = [...updatedMsgs, botErrMsg];
        setMessages(finalMsgs);
        saveChatHistory(finalMsgs);
        setSuggestions(defaultSuggestions);
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      const errorMsg: Message = {
        id: "err-" + Math.random().toString(36).substring(2, 9),
        sender: "bot",
        text: `[Connection Exception]: ${err.message || "Failed to reach server"}`,
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
    void navigate({ to: "/chatbot" });
  };

  return (
    <>
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-22 right-6 z-[999] bg-[#121110] text-[#FBF8F3] border border-[#ECE7DF]/20 text-[10px] uppercase font-bold tracking-wider px-3.5 py-2 rounded-xl whitespace-nowrap shadow-2xl pointer-events-none"
          >
            {isHindi ? "भारत स्टोरी एआई सहायक" : "India Story AI Assistant"}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Circular Black FAB Trigger Button ── */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[999] font-sans mb-safe">
        <motion.button
          id="chatbot-trigger"
          onClick={handleToggleOpen}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          animate={{
            y: isOpen ? 0 : [0, -3, 0],
          }}
          transition={{
            y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          aria-label="Open India Story AI Assistant"
          className="size-14 sm:size-15 rounded-full bg-[#121110] text-white flex items-center justify-center shadow-[0_10px_35px_rgba(0,0,0,0.4)] border-2 border-[#C9A227]/60 cursor-pointer relative min-h-[44px] min-w-[44px] overflow-hidden group"
        >
          {/* Glow Ring & Pulse */}
          <span className="absolute inset-0 rounded-full bg-[#C9A227]/20 animate-ping opacity-75 pointer-events-none" />
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#9E1C20] via-[#C9A227] to-[#9E1C20] opacity-30 blur-md group-hover:opacity-75 transition-opacity" />

          {/* Unread indicator */}
          {hasUnread && !isOpen && (
            <span className="absolute top-1 right-1 size-3 rounded-full bg-[#9E1C20] border-2 border-black z-20 shadow-sm animate-pulse" />
          )}

          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                className="z-10"
              >
                <X className="size-6 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="logo"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="z-10 flex items-center justify-center p-1"
              >
                <img
                  src="/Logo-ISP.jpg"
                  alt="India Story Project Logo"
                  className="size-11 sm:size-12 rounded-full object-cover shadow-inner"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* ── Fixed Position Floating Drawer Container (Never cut off at top!) ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            data-lenis-prevent-touch="true"
            className="fixed bottom-20 right-3 sm:bottom-24 sm:right-6 z-[998] w-[calc(100vw-1.5rem)] sm:w-[410px] h-[min(560px,calc(100vh-6.5rem))] bg-[#FCFAF6]/98 dark:bg-[#121110]/98 backdrop-blur-2xl border border-[#ECE7DF] dark:border-[#2A2722] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden"
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

            {/* Scrollable Messages Area */}
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
              scrollRef={scrollContainerRef}
              onScroll={handleScroll}
            />

            {/* Suggestions Panel */}
            {suggestions.length > 0 && !loading && (
              <div className="px-3.5 py-1.5 border-t border-[#ECE7DF]/60 dark:border-[#2A2722]/60 bg-white/40 dark:bg-[#181715]/40 shrink-0">
                <SuggestionChips suggestions={suggestions} onSelect={handleSend} />
              </div>
            )}

            {/* Input Bar */}
            <div className="p-2.5 sm:p-3 border-t border-[#ECE7DF] dark:border-[#2A2722] bg-[#FCFAF6] dark:bg-[#121110] shrink-0">
              <ChatInput
                value={inputValue}
                onChange={setInputValue}
                onSend={() => handleSend(inputValue)}
                disabled={loading}
                isListening={isListening}
                hasSpeechSupport={!!recognitionRef.current}
                toggleListening={toggleListening}
                isHindi={isHindi}
                onCancelGeneration={handleCancelGeneration}
              />
            </div>

            {/* Full workspace shortcut */}
            <div className="bg-white/90 dark:bg-[#181715]/90 border-t border-[#ECE7DF] dark:border-[#2A2722] py-2 text-center text-[10px] uppercase font-bold tracking-wider shrink-0">
              <Link
                to="/chatbot"
                onClick={() => setIsOpen(false)}
                className="text-[#9E1C20] dark:text-[#C9A227] hover:underline inline-flex items-center gap-1.5"
              >
                <span>{isHindi ? "पूर्ण एआई वर्कस्पेस खोलें" : "Open Full AI Workspace"}</span>
                <Maximize2 className="size-3" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
