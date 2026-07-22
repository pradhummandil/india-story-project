import React, { useState, useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MessageSquare,
  Trash2,
  Bookmark,
  Heart,
  Settings
} from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { useI18nStore } from "@/lib/i18n";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { ChatHeader, CompanionLogo } from "@/components/site/chatbot/ChatHeader";
import { ChatMessages } from "@/components/site/chatbot/ChatMessages";
import { ChatInput } from "@/components/site/chatbot/ChatInput";
import { SuggestionChips } from "@/components/site/chatbot/SuggestionChips";

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

export const Route = createFileRoute("/chatbot")({
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
          ? "माफ़ कीजिये, अभी संपर्क स्थापित नहीं हो पाया। कृपया पुनः प्रयास करें।"
          : "Sorry, I am facing connectivity issues. Please try again in a moment.",
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
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <SiteLayout>
      <div className="min-h-[calc(100vh-6rem)] bg-neutral-950 text-white flex flex-col md:flex-row overflow-hidden font-sans border-t border-neutral-800">
        
        {/* === Sidebar (ChatGPT style) === */}
        <aside className="w-full md:w-80 bg-neutral-900/40 border-b md:border-b-0 md:border-r border-neutral-800 flex flex-col shrink-0">
          <div className="p-4 border-b border-neutral-800">
            <Button
              onClick={createNewSession}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center gap-2 transition-all rounded-xl h-11 border border-red-500/20"
            >
              <Plus className="size-4" />
              {isHindi ? "नई बातचीत" : "New Chat"}
            </Button>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 max-h-[250px] md:max-h-none">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 px-3 mb-2">
              {isHindi ? "हालिया बातचीत" : "Recent Conversations"}
            </h4>
            {sessions.map((s) => {
              const isActive = s.id === activeSessionId;
              return (
                <div
                  key={s.id}
                  onClick={() => switchSession(s.id)}
                  className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left cursor-pointer ${
                    isActive
                      ? "bg-neutral-800 text-white font-semibold border border-neutral-700"
                      : "hover:bg-neutral-900 border border-transparent text-neutral-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MessageSquare className={`size-4 shrink-0 ${isActive ? "text-red-500" : "text-neutral-400"}`} />
                    <span className="text-xs truncate">{s.title}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSession(s.id, e)}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-500 p-1 rounded-lg hover:bg-neutral-800 transition-all ml-1"
                    title="Delete Chat"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Sidebar Footer Buttons */}
          <div className="p-3 border-t border-neutral-800 bg-neutral-950/20 space-y-1">
            <Link
              to="/dashboard"
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition-colors"
            >
              <Bookmark className="size-4 text-red-500" />
              {isHindi ? "बुकमार्क की गई कहानियां" : "Bookmarks & Favorites"}
            </Link>
            <button
              onClick={handleClearActiveHistory}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition-colors text-left"
            >
              <Trash2 className="size-4 text-red-500" />
              {isHindi ? "चैट साफ़ करें" : "Clear Active Chat"}
            </button>
          </div>
        </aside>

        {/* === Main Chat Workspace === */}
        <section className="flex-1 flex flex-col justify-between overflow-hidden relative bg-neutral-950">
          
          {/* Top Bar */}
          <header className="bg-neutral-900 border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <CompanionLogo className="size-5 text-red-500" />
              </div>
              <div>
                <h2 className="font-display font-bold text-sm sm:text-base tracking-wide text-white">
                  India Story Assistant
                </h2>
                <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  Online
                </p>
              </div>
            </div>
            
            {/* Model Badge */}
            <div className="bg-neutral-800 border border-neutral-700 text-red-500 text-[10px] uppercase font-bold px-3 py-1 rounded-full">
              Gemini 2.0 Flash
            </div>
          </header>

          {/* Scrollable chat messages pane */}
          <div className="flex-1 overflow-hidden flex flex-col justify-between">
            
            <ChatMessages
              messages={messages}
              loading={loading}
              isHindi={isHindi}
              lastQuery={lastQuery}
              onRetry={handleSend}
              onCopy={copyToClipboard}
              messagesEndRef={messagesEndRef}
              onCancelGeneration={handleCancelGeneration}
            />

            {/* Quick action prompts */}
            {!loading && messages.length > 0 && (
              <div className="px-6 py-2 border-t border-neutral-800 bg-neutral-900/10 flex gap-2 overflow-x-auto scrollbar-none shrink-0">
                <button
                  onClick={() => handleSend(isHindi ? "कहानी कैसे सबमिट करें?" : "How to submit my story?")}
                  className="flex-shrink-0 text-[10px] bg-neutral-900 hover:bg-neutral-800 border border-neutral-850 text-neutral-300 hover:text-white px-3.5 py-1.5 rounded-full transition-colors font-bold uppercase tracking-wide cursor-pointer"
                >
                  Story Submission Guide
                </button>
                <button
                  onClick={() => handleSend(isHindi ? "राजस्थान" : "Explore Rajasthan")}
                  className="flex-shrink-0 text-[10px] bg-neutral-900 hover:bg-neutral-800 border border-neutral-850 text-neutral-300 hover:text-white px-3.5 py-1.5 rounded-full transition-colors font-bold uppercase tracking-wide cursor-pointer"
                >
                  Explore Rajasthan
                </button>
                <button
                  onClick={() => handleSend(isHindi ? "गुमनाम नायक" : "Unsung heroes")}
                  className="flex-shrink-0 text-[10px] bg-neutral-900 hover:bg-neutral-800 border border-neutral-850 text-neutral-300 hover:text-white px-3.5 py-1.5 rounded-full transition-colors font-bold uppercase tracking-wide cursor-pointer"
                >
                  Unsung Heroes
                </button>
              </div>
            )}

            {/* Suggestions panel */}
            {suggestions.length > 0 && !loading && (
              <div className="px-6 py-3.5 border-t border-neutral-800 bg-neutral-900/20 shrink-0">
                <SuggestionChips suggestions={suggestions} onSelect={handleSend} />
              </div>
            )}

            {/* Composer Input Bar */}
            <footer className="p-4 border-t border-neutral-800 bg-neutral-950 flex gap-3 shrink-0">
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
            </footer>

          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
