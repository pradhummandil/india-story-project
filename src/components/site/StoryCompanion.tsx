import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { useRouterState } from "@tanstack/react-router";
import { Sparkles, X, Send, Languages, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Lang = "en" | "hi";

const SUGGESTIONS: Record<Lang, string[]> = {
  en: [
    "What can I learn from today's hero?",
    "Show me stories about women empowerment",
    "Explain India Story Project in simple words",
    "Recommend stories from the Himalayas",
    "Which story created the biggest impact?",
  ],
  hi: [
    "आज के हीरो से क्या सीख सकते हैं?",
    "महिला सशक्तिकरण की कहानियाँ दिखाएँ",
    "इंडिया स्टोरी प्रोजेक्ट क्या है?",
    "हिमालय की प्रेरक कहानियाँ सुझाएँ",
    "सबसे बड़ा बदलाव किसने लाया?",
  ],
};

const LABELS = {
  en: {
    title: "Story Companion",
    subtitle: "Your AI guide to India's stories",
    placeholder: "Ask anything about India's stories…",
    empty:
      "Hi 👋 I'm your Story Companion. Ask me about heroes, regions, themes, or pick a prompt below.",
    thinking: "Thinking…",
  },
  hi: {
    title: "स्टोरी कम्पैनियन",
    subtitle: "भारत की कहानियों के लिए AI गाइड",
    placeholder: "भारत की कहानियों के बारे में पूछें…",
    empty:
      "नमस्ते 👋 मैं आपका स्टोरी कम्पैनियन हूँ। कोई भी सवाल पूछें या नीचे से एक प्रॉम्प्ट चुनें।",
    thinking: "सोच रहा हूँ…",
  },
} as const;

export function StoryCompanion() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [input, setInput] = useState("");
  const { location } = useRouterState();
  const scrollerRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages, id }) => ({
          body: {
            id,
            messages,
            context: { route: location.pathname, language: lang },
          },
        }),
      }),
    [location.pathname, lang],
  );

  const { messages, sendMessage, status, error } = useChat({
    id: "story-companion",
    transport,
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  // Persist messages to localStorage (one conversation)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("story-companion-messages");
      if (saved && messages.length === 0) {
        // No direct setter; rely on transport, skip restore.
      }
    } catch {
      /* noop */
    }
  }, [messages.length]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    void sendMessage({ text: t });
    setInput("");
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        //onClick={() => setOpen((v) => !v)}
        //initial={{ scale: 0, opacity: 0 }}
        //animate={{ scale: 1, opacity: 1 }}
        //transition={{ delay: 0.6, type: "spring", stiffness: 220, damping: 18 }}
        //whileHover={{ scale: 1.06 }}
        //whileTap={{ scale: 0.94 }}
        //aria-label="Open Story Companion"
        //className="fixed bottom-6 right-6 z-[60] grid place-items-center size-14 rounded-full bg-gradient-to-br from-gold to-saffron text-gold-foreground shadow-glow border border-gold/40"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              //key="x"
              //initial={{ rotate: -90, opacity: 0 }}
              //animate={{ rotate: 0, opacity: 1 }}
              //exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="size-6" />
            </motion.span>
          ) : (
            <motion.span
              //key="s"
              //initial={{ rotate: 90, opacity: 0 }}
              //animate={{ rotate: 0, opacity: 1 }}
              //exit={{ rotate: -90, opacity: 0 }}
            >
              <Sparkles className="size-6" />
            </motion.span>
          )}
        </AnimatePresence>
        {!open && (
          <motion.span
            //className="absolute inset-0 rounded-full bg-gold/30"
            //animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
            //transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-[59] bottom-24 right-4 left-4 sm:left-auto sm:right-6 sm:w-[400px] max-h-[78dvh] flex flex-col rounded-3xl glass-strong border border-gold/20 shadow-glow overflow-hidden"
          >
            {/* Header */}
            <div className="relative px-5 py-4 border-b border-border/60 bg-gradient-to-br from-gold/10 to-saffron/5">
              <div className="flex items-center gap-3">
                <div className="grid place-items-center size-9 rounded-full bg-gradient-to-br from-gold to-saffron text-gold-foreground shadow-glow">
                  <Sparkles className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-base leading-tight text-gradient-gold">
                    {LABELS[lang].title}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{LABELS[lang].subtitle}</div>
                </div>
                <button
                  onClick={() => setLang(lang === "en" ? "hi" : "en")}
                  className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border border-border/60 hover:border-gold/40 hover:text-gold transition-colors"
                  aria-label="Toggle language"
                >
                  <Languages className="size-3" />
                  {lang === "en" ? "हिं" : "EN"}
                </button>
              </div>
              {/* Floating particles */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.span
                    key={i}
                    className="absolute size-1 rounded-full bg-gold/60"
                    style={{ left: `${10 + i * 15}%`, top: "70%" }}
                    animate={{ y: [0, -30, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 4 + i * 0.4, repeat: Infinity, delay: i * 0.5 }}
                  />
                ))}
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollerRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth"
            >
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-muted-foreground leading-relaxed"
                >
                  {LABELS[lang].empty}
                </motion.div>
              )}

              {messages.map((m: UIMessage) => (
                <MessageBubble key={m.id} message={m} />
              ))}

              {status === "submitted" && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="size-3 animate-spin" />
                  <span>{LABELS[lang].thinking}</span>
                </div>
              )}

              {error && (
                <div className="text-xs text-red-400/90 border border-red-500/30 rounded-lg p-2 bg-red-500/5">
                  {error.message || "Something went wrong. Please try again."}
                </div>
              )}
            </div>

            {/* Suggestion chips */}
            {messages.length === 0 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {SUGGESTIONS[lang].slice(0, 4).map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="text-[11px] px-3 py-1.5 rounded-full border border-gold/30 text-foreground/80 hover:text-gold hover:border-gold/60 hover:bg-gold/5 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Composer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="p-3 border-t border-border/60 bg-background/40"
            >
              <div className="flex items-end gap-2 rounded-2xl border border-border/60 bg-background/60 focus-within:border-gold/50 transition-colors px-3 py-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  rows={1}
                  placeholder={LABELS[lang].placeholder}
                  className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground/70 max-h-32"
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  aria-label="Send"
                  className="grid place-items-center size-8 rounded-full bg-gradient-to-br from-gold to-saffron text-gold-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-transform shadow-glow"
                >
                  <Send className="size-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const text = message.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      {isUser ? (
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm px-3.5 py-2 bg-gradient-to-br from-gold to-saffron text-gold-foreground text-sm shadow-glow">
          {text}
        </div>
      ) : (
        <div className="max-w-[90%] text-sm leading-relaxed text-foreground/90 prose-companion">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
      )}
    </motion.div>
  );
}
