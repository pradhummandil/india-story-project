import React, { useState, useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MessageSquare,
  Trash2,
  Bookmark,
  Sparkles,
  Search,
  Feather,
  Compass,
  Pin,
  Edit2,
  Check,
  MapPin,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Landmark,
  FileText,
} from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { useI18nStore } from "@/lib/i18n";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { ChatHeader } from "@/components/site/chatbot/ChatHeader";
import { ChatMessages } from "@/components/site/chatbot/ChatMessages";
import { ChatInput } from "@/components/site/chatbot/ChatInput";
import { SuggestionChips } from "@/components/site/chatbot/SuggestionChips";
import { StoryPayload } from "@/components/site/chatbot/StoryCards";

type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  stories?: StoryPayload[];
  exactMatch?: StoryPayload | null;
};

type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  timestamp: string;
  isPinned?: boolean;
};

export const Route = createFileRoute("/chatbot")({
  head: () => ({
    meta: [
      { title: "Flagship AI Story Assistant | India Story Project" },
      {
        name: "description",
        content: "Discover Indian heritage stories, explore regional folklore, or get step-by-step guidance to write and publish your own story with our production AI Assistant.",
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

  const [searchQuery, setSearchQuery] = useState("");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
        "पोचमपल्ली की बुनकर कहानी",
        "कहानी कैसे प्रकाशित करें?",
        "गुमनाम स्वतंत्रता सेनानी",
      ]
    : [
        "Stories from Rajasthan",
        "The Weaver of Pochampally",
        "How to publish my story",
        "Unsung Freedom Fighters",
      ];

  const getStorageKey = () => {
    return session ? `isp_chatbot_sessions_${session.user.id}` : "isp_chatbot_sessions_guest";
  };

  useEffect(() => {
    const key = getStorageKey();
    const historyKey = session ? `isp_chat_history_${session.user.id}` : "isp_chat_history_guest";

    const savedSessions = localStorage.getItem(key);
    const savedHistory = localStorage.getItem(historyKey);

    let parsedSessions: ChatSession[] = [];
    if (savedSessions) {
      try {
        parsedSessions = JSON.parse(savedSessions);
      } catch {
        parsedSessions = [];
      }
    }

    // Check if popup history has user messages that need to be synced into workspace
    if (savedHistory) {
      try {
        const historyMsgs: Message[] = JSON.parse(savedHistory);
        const hasUserMsg = historyMsgs.some((m) => m.sender === "user");

        if (hasUserMsg) {
          const firstUserMsg = historyMsgs.find((m) => m.sender === "user");
          const title = firstUserMsg
            ? firstUserMsg.text.length > 28
              ? firstUserMsg.text.slice(0, 28) + "..."
              : firstUserMsg.text
            : isHindi
              ? "सक्रिय बातचीत"
              : "Active Chat";

          if (parsedSessions.length === 0) {
            parsedSessions = [
              {
                id: "synced_session",
                title,
                timestamp: new Date().toISOString(),
                messages: historyMsgs,
              },
            ];
          } else {
            // Update the top active session with the messages from the popup widget
            parsedSessions[0] = {
              ...parsedSessions[0],
              messages: historyMsgs,
              timestamp: new Date().toISOString(),
            };
          }
          localStorage.setItem(key, JSON.stringify(parsedSessions));
        }
      } catch {
        /* ignore */
      }
    }

    if (parsedSessions.length > 0) {
      setSessions(parsedSessions);
      const lastActive = parsedSessions[0];
      setActiveSessionId(lastActive.id);
      setMessages(lastActive.messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })));
    } else {
      createNewSession();
    }
    setSuggestions(defaultSuggestions);
  }, [lang, session]);

  const createNewSession = () => {
    const defaultText = isHindi
      ? "नमस्ते! मैं आपका भारत स्टोरी एआई सहायक हूँ। मैं आपको कहानियाँ खोजने, भारत के सांस्कृतिक इतिहास को जानने, या अपनी खुद की कहानी लिखकर सबमिट करने में मदद कर सकता हूँ।"
      : "Namaste! I am your official India Story AI Assistant. I can help you discover heritage stories, explore Indian history, or guide you step-by-step to write and publish your own story.";

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
    // Save to widget history key for instant popup sync
    const historyKey = session ? `isp_chat_history_${session.user.id}` : "isp_chat_history_guest";
    try {
      localStorage.setItem(historyKey, JSON.stringify(msgs));
    } catch {
      /* ignore */
    }

    setSessions((prev) => {
      const updated = prev.map((s) => {
        if (s.id === activeSessionId) {
          let title = s.title;
          if (title === "New Chat" || title === "नई बातचीत") {
            const firstUserMsg = msgs.find((m) => m.sender === "user");
            if (firstUserMsg) {
              title = firstUserMsg.text.length > 28 ? firstUserMsg.text.slice(0, 28) + "..." : firstUserMsg.text;
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

  const togglePinSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s));
      const key = getStorageKey();
      localStorage.setItem(key, JSON.stringify(updated));
      return updated;
    });
  };

  const startRenameSession = (s: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(s.id);
    setEditingTitle(s.title);
  };

  const saveRenameSession = (id: string) => {
    if (editingTitle.trim()) {
      setSessions((prev) => {
        const updated = prev.map((s) => (s.id === id ? { ...s, title: editingTitle.trim() } : s));
        const key = getStorageKey();
        localStorage.setItem(key, JSON.stringify(updated));
        return updated;
      });
    }
    setEditingSessionId(null);
  };

  const handleClearActiveHistory = () => {
    const defaultText = isHindi
      ? "नमस्ते! मैं आपका भारत स्टोरी एआई सहायक हूँ। मैं आपको कहानियाँ खोजने, भारत के सांस्कृतिक इतिहास को जानने, या अपनी खुद की कहानी लिखकर प्रकाशित करने में मदद कर सकता हूँ।"
      : "Namaste! I am your official India Story AI Assistant. I can help you discover stories, explore cultural heritage, or guide you step-by-step to write and publish your own story.";

    const clearedMsgs = [
      {
        id: "greet",
        sender: "bot" as const,
        text: defaultText,
        timestamp: new Date(),
      },
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
          text: data.reply || "",
          timestamp: new Date(),
          stories: data.stories || [],
          exactMatch: data.exactMatch || null,
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
        saveCurrentSessionMessages(finalMsgs);
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

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedSessions = filteredSessions.filter((s) => s.isPinned);
  const unpinnedSessions = filteredSessions.filter((s) => !s.isPinned);

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const isInitialWelcomeState = messages.length <= 1;

  return (
    <SiteLayout>
      <div className="min-h-[calc(100vh-6rem)] bg-[#FCFAF6] dark:bg-[#121110] text-[#1D1D1D] dark:text-[#FBF8F3] flex flex-col md:flex-row overflow-hidden font-sans border-t border-[#ECE7DF] dark:border-[#2A2722] transition-colors duration-300">
        
        {/* ─── 1. Luxury Resizable Conversation Sidebar ─── */}
        <aside className="w-full md:w-80 lg:w-84 bg-[#F7F4EE] dark:bg-[#161513] border-b md:border-b-0 md:border-r border-[#ECE7DF] dark:border-[#2A2722] flex flex-col shrink-0 transition-all duration-300">
          
          {/* New Chat Button */}
          <div className="p-4 border-b border-[#ECE7DF] dark:border-[#2A2722]">
            <Button
              onClick={createNewSession}
              className="w-full bg-[#9E1C20] hover:bg-[#851619] text-white font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all rounded-xl h-11 shadow-md shadow-[#9E1C20]/20 cursor-pointer min-h-[44px]"
            >
              <Plus className="size-4" />
              <span>{isHindi ? "नई बातचीत शुरू करें" : "New Conversation"}</span>
            </Button>
          </div>

          {/* Search Conversations Input */}
          <div className="p-3 border-b border-[#ECE7DF] dark:border-[#2A2722]">
            <div className="relative">
              <Search className="size-3.5 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isHindi ? "बातचीत खोजें..." : "Search conversations..."}
                className="w-full bg-white dark:bg-[#181715] border border-[#ECE7DF] dark:border-[#2A2722] text-xs text-[#1D1D1D] dark:text-[#FBF8F3] placeholder:text-[#666666]/60 rounded-xl pl-9 pr-3 py-2 outline-none focus:border-[#9E1C20] dark:focus:border-[#C9A227] transition-colors"
              />
            </div>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4 max-h-[260px] md:max-h-none scrollbar-none">
            
            {pinnedSessions.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C9A227] px-3 mb-1.5 flex items-center gap-1.5">
                  <Pin className="size-3 text-[#C9A227] fill-[#C9A227]" />
                  <span>{isHindi ? "पिन की गई बातचीत" : "Pinned Chats"}</span>
                </h4>
                {pinnedSessions.map((s) => (
                  <SessionItem
                    key={s.id}
                    session={s}
                    isActive={s.id === activeSessionId}
                    isEditing={editingSessionId === s.id}
                    editingTitle={editingTitle}
                    setEditingTitle={setEditingTitle}
                    onSwitch={() => switchSession(s.id)}
                    onPin={(e) => togglePinSession(s.id, e)}
                    onDelete={(e) => handleDeleteSession(s.id, e)}
                    onStartRename={(e) => startRenameSession(s, e)}
                    onSaveRename={() => saveRenameSession(s.id)}
                  />
                ))}
              </div>
            )}

            <div className="space-y-1">
              <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#666666] dark:text-[#A09D96] px-3 mb-1.5 font-sans">
                {isHindi ? "हालिया बातचीत" : "Recent Conversations"}
              </h4>
              {unpinnedSessions.length === 0 && pinnedSessions.length === 0 ? (
                <p className="text-xs text-[#666666] dark:text-[#A09D96] px-3 py-2 italic">
                  {isHindi ? "कोई बातचीत नहीं मिली" : "No conversations found"}
                </p>
              ) : (
                unpinnedSessions.map((s) => (
                  <SessionItem
                    key={s.id}
                    session={s}
                    isActive={s.id === activeSessionId}
                    isEditing={editingSessionId === s.id}
                    editingTitle={editingTitle}
                    setEditingTitle={setEditingTitle}
                    onSwitch={() => switchSession(s.id)}
                    onPin={(e) => togglePinSession(s.id, e)}
                    onDelete={(e) => handleDeleteSession(s.id, e)}
                    onStartRename={(e) => startRenameSession(s, e)}
                    onSaveRename={() => saveRenameSession(s.id)}
                  />
                ))
              )}
            </div>

          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-[#ECE7DF] dark:border-[#2A2722] bg-white/60 dark:bg-[#181715]/60 space-y-1">
            <Link
              to="/dashboard"
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#666666] dark:text-[#A09D96] hover:text-[#9E1C20] dark:hover:text-[#C9A227] rounded-xl hover:bg-[#FBF8F3] dark:hover:bg-[#2A2722] transition-colors"
            >
              <Bookmark className="size-4 text-[#C9A227]" />
              <span>{isHindi ? "सहेजी गई कहानियाँ" : "Saved Bookmarks"}</span>
            </Link>
            <button
              onClick={handleClearActiveHistory}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#666666] dark:text-[#A09D96] hover:text-[#9E1C20] rounded-xl hover:bg-[#FBF8F3] dark:hover:bg-[#2A2722] transition-colors text-left cursor-pointer"
            >
              <Trash2 className="size-4 text-[#9E1C20]" />
              <span>{isHindi ? "सक्रिय चैट साफ़ करें" : "Clear Active Chat"}</span>
            </button>
          </div>

        </aside>

        {/* ─── 2. Flagship AI Workspace Canvas ─── */}
        <section className="flex-1 flex flex-col justify-between overflow-hidden relative bg-[#FCFAF6] dark:bg-[#121110]">
          
          <ChatHeader
            isHindi={isHindi}
            sessionTitle={activeSession?.title}
            onClearHistory={handleClearActiveHistory}
          />

          <div className="flex-1 overflow-hidden flex flex-col justify-between relative">
            
            {isInitialWelcomeState ? (
              <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex flex-col items-center justify-center text-center space-y-8 max-w-4xl mx-auto">
                
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-3"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C9A227]/40 bg-[#C9A227]/10 text-[#9E1C20] dark:text-[#C9A227] text-xs font-bold uppercase tracking-[0.2em]">
                    <Sparkles className="size-3.5 text-[#C9A227]" />
                    <span>{isHindi ? "भारत स्टोरी एआई 3.0" : "India Story AI 3.0"}</span>
                  </div>
                  <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#1D1D1D] dark:text-[#FBF8F3]">
                    {isHindi ? "भारत की अनकही कहानियाँ खोजें" : "Discover India's Untold Stories"}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#666666] dark:text-[#A09D96] max-w-xl mx-auto leading-relaxed">
                    {isHindi
                      ? "कहानियाँ खोजें, भारत के समृद्ध सांस्कृतिक इतिहास को जानें, या अपनी खुद की कहानी लिखने के लिए मार्गदर्शन प्राप्त करें।"
                      : "Search repository stories, explore rich Indian history, or get guided step-by-step assistance to craft and publish your own story."}
                  </p>
                </motion.div>

                {/* Flagship Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left"
                >
                  <button
                    type="button"
                    onClick={() => handleSend("The Weaver of Pochampally")}
                    className="p-5 rounded-2xl bg-white dark:bg-[#181715] border border-[#ECE7DF] dark:border-[#2A2722] hover:border-[#C9A227] shadow-xs hover:shadow-lg transition-all duration-300 group cursor-pointer space-y-3"
                  >
                    <div className="size-10 rounded-xl bg-[#9E1C20]/10 text-[#9E1C20] dark:text-[#C9A227] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Sparkles className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm text-[#1D1D1D] dark:text-[#FBF8F3] group-hover:text-[#9E1C20] dark:group-hover:text-[#C9A227] transition-colors">
                        {isHindi ? "मुख्य कहानी (Exact Match)" : "Exact Story Title"}
                      </h3>
                      <p className="text-xs text-[#666666] dark:text-[#A09D96] leading-relaxed mt-1">
                        {isHindi ? '"पोचमपल्ली की बुनकर कहानी" खोजें।' : 'Search "The Weaver of Pochampally" to open rich card.'}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSend(isHindi ? "राजस्थान की कहानियाँ" : "Stories from Rajasthan")}
                    className="p-5 rounded-2xl bg-white dark:bg-[#181715] border border-[#ECE7DF] dark:border-[#2A2722] hover:border-[#9E1C20] shadow-xs hover:shadow-lg transition-all duration-300 group cursor-pointer space-y-3"
                  >
                    <div className="size-10 rounded-xl bg-[#9E1C20]/10 text-[#9E1C20] dark:text-[#C9A227] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Compass className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm text-[#1D1D1D] dark:text-[#FBF8F3] group-hover:text-[#9E1C20] dark:group-hover:text-[#C9A227] transition-colors">
                        {isHindi ? "राज्य एवं विषय खोजें" : "Explore State & Topics"}
                      </h3>
                      <p className="text-xs text-[#666666] dark:text-[#A09D96] leading-relaxed mt-1">
                        {isHindi ? "राजस्थान, पानी, शिक्षा, या स्वतंत्रता सेनानियों की कहानियाँ खोजें।" : "Filter by Rajasthan, Water, Education, or Freedom Fighters."}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSend(isHindi ? "कहानी सबमिट करने के चरण" : "Guide me step-by-step to publish my story")}
                    className="p-5 rounded-2xl bg-white dark:bg-[#181715] border border-[#ECE7DF] dark:border-[#2A2722] hover:border-[#C9A227] shadow-xs hover:shadow-lg transition-all duration-300 group cursor-pointer space-y-3"
                  >
                    <div className="size-10 rounded-xl bg-[#9E1C20]/10 text-[#9E1C20] dark:text-[#C9A227] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Feather className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm text-[#1D1D1D] dark:text-[#FBF8F3] group-hover:text-[#9E1C20] dark:group-hover:text-[#C9A227] transition-colors">
                        {isHindi ? "कहानी लेखन सहायक" : "Step-by-step Story Writer"}
                      </h3>
                      <p className="text-xs text-[#666666] dark:text-[#A09D96] leading-relaxed mt-1">
                        {isHindi ? "शीर्षक, स्थान और ड्राफ्ट बनाने में एआई मार्गदर्शन लें।" : "Interactive assistant to write title, location, and story draft."}
                      </p>
                    </div>
                  </button>
                </motion.div>

                {/* Suggested Prompts */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="space-y-2 w-full"
                >
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C9A227]">
                    {isHindi ? "सुझाए गए प्रश्न" : "Suggested Prompts"}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {defaultSuggestions.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(prompt)}
                        className="text-xs bg-white dark:bg-[#181715] hover:bg-[#FBF8F3] dark:hover:bg-[#2A2722] border border-[#ECE7DF] dark:border-[#2A2722] hover:border-[#9E1C20] text-[#1D1D1D] dark:text-[#FBF8F3] px-4 py-2 rounded-full transition-all duration-200 shadow-xs cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </motion.div>

              </div>
            ) : (
              <ChatMessages
                messages={messages}
                loading={loading}
                isHindi={isHindi}
                lastQuery={lastQuery}
                onRetry={handleSend}
                onCopy={(t) => navigator.clipboard.writeText(t)}
                messagesEndRef={messagesEndRef}
                onCancelGeneration={handleCancelGeneration}
              />
            )}

            {suggestions.length > 0 && !loading && !isInitialWelcomeState && (
              <div className="px-6 py-2 border-t border-[#ECE7DF]/60 dark:border-[#2A2722]/60 bg-white/40 dark:bg-[#181715]/40 shrink-0">
                <SuggestionChips suggestions={suggestions} onSelect={handleSend} />
              </div>
            )}

            <footer className="p-4 sm:p-6 border-t border-[#ECE7DF] dark:border-[#2A2722] bg-[#FCFAF6] dark:bg-[#121110] flex justify-center shrink-0">
              <div className="max-w-4xl w-full">
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
            </footer>

          </div>
        </section>
      </div>
    </SiteLayout>
  );
}

interface SessionItemProps {
  session: ChatSession;
  isActive: boolean;
  isEditing: boolean;
  editingTitle: string;
  setEditingTitle: (t: string) => void;
  onSwitch: () => void;
  onPin: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onStartRename: (e: React.MouseEvent) => void;
  onSaveRename: () => void;
}

function SessionItem({
  session: s,
  isActive,
  isEditing,
  editingTitle,
  setEditingTitle,
  onSwitch,
  onPin,
  onDelete,
  onStartRename,
  onSaveRename,
}: SessionItemProps) {
  if (isEditing) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#181715] border border-[#9E1C20] rounded-xl">
        <input
          type="text"
          value={editingTitle}
          onChange={(e) => setEditingTitle(e.target.value)}
          autoFocus
          className="w-full text-xs bg-transparent outline-none text-[#1D1D1D] dark:text-[#FBF8F3]"
        />
        <button onClick={onSaveRename} className="p-1 text-emerald-600 hover:text-emerald-500">
          <Check className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={onSwitch}
      className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 text-left cursor-pointer ${
        isActive
          ? "bg-white dark:bg-[#181715] text-[#1D1D1D] dark:text-[#FBF8F3] font-semibold border border-[#ECE7DF] dark:border-[#2A2722] shadow-xs"
          : "hover:bg-white/60 dark:hover:bg-[#181715]/60 text-[#666666] dark:text-[#A09D96] hover:text-[#1D1D1D] dark:hover:text-white"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <MessageSquare className={`size-4 shrink-0 ${isActive ? "text-[#9E1C20] dark:text-[#C9A227]" : "text-[#666666]/60"}`} />
        <span className="text-xs truncate">{s.title}</span>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onPin}
          className={`p-1 rounded-lg hover:bg-[#FBF8F3] dark:hover:bg-[#2A2722] transition-all ${
            s.isPinned ? "text-[#C9A227]" : "text-[#666666] hover:text-[#C9A227]"
          }`}
          title={s.isPinned ? "Unpin Chat" : "Pin Chat"}
        >
          <Pin className="size-3" />
        </button>
        <button
          onClick={onStartRename}
          className="p-1 rounded-lg hover:bg-[#FBF8F3] dark:hover:bg-[#2A2722] text-[#666666] hover:text-[#1D1D1D] transition-all"
          title="Rename Chat"
        >
          <Edit2 className="size-3" />
        </button>
        <button
          onClick={onDelete}
          className="p-1 rounded-lg hover:bg-[#FBF8F3] dark:hover:bg-[#2A2722] text-[#666666] hover:text-[#9E1C20] transition-all"
          title="Delete Chat"
        >
          <Trash2 className="size-3" />
        </button>
      </div>
    </div>
  );
}
