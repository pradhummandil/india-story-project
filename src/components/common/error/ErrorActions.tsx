import React from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Compass,
  BookOpen,
  RotateCcw,
  Home,
  Map,
  Dna,
  PenTool,
  Bot,
  ArrowRight,
} from "lucide-react";
import { useI18nStore } from "@/lib/i18n";

interface ErrorActionsProps {
  onRetry?: () => void;
  showQuickNav?: boolean;
}

export function ErrorActions({ onRetry, showQuickNav = true }: ErrorActionsProps) {
  const lang = useI18nStore((s) => s.lang);
  const isHindi = lang === "hi";

  const quickLinks = [
    {
      to: "/",
      label: isHindi ? "मुख्य पृष्ठ" : "Home",
      icon: Home,
    },
    {
      to: "/stories",
      label: isHindi ? "कहानी संग्रह" : "Browse Stories",
      icon: BookOpen,
    },
    {
      to: "/map",
      label: isHindi ? "मानचित्र" : "Explore Map",
      icon: Map,
    },
    {
      to: "/explore",
      label: isHindi ? "डीएनए एक्सप्लोरर" : "DNA Explorer",
      icon: Dna,
    },
    {
      to: "/share-story",
      label: isHindi ? "कहानी भेजें" : "Share Story",
      icon: PenTool,
    },
    {
      to: "/chatbot",
      label: isHindi ? "एआई सहायक" : "AI Assistant",
      icon: Bot,
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Primary & Secondary Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* Primary: Continue Exploring */}
        <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-[#A50000] via-[#C89A3D] to-[#A50000] text-white font-sans font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#A50000]/25 hover:shadow-xl hover:shadow-[#C89A3D]/30 transition-all duration-300 border border-[#C89A3D]/40"
          >
            <Compass className="size-4 text-[#F1E5D0]" />
            <span>{isHindi ? "खोज जारी रखें" : "Continue Exploring"}</span>
            <ArrowRight className="size-3.5 text-[#F1E5D0]" />
          </Link>
        </motion.div>

        {/* Secondary: Browse Stories */}
        <motion.div whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}>
          <Link
            to="/stories"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#FAF7F1] dark:bg-[#1C1B18] text-[#111111] dark:text-[#F8F6F1] font-sans font-semibold text-xs border border-[#C89A3D]/40 hover:border-[#C89A3D] hover:bg-[#F3EAD9] dark:hover:bg-[#282622] transition-all duration-200 shadow-sm"
          >
            <BookOpen className="size-4 text-[#C89A3D]" />
            <span>{isHindi ? "कहानियां देखें" : "Browse Stories"}</span>
          </Link>
        </motion.div>

        {/* Tertiary: Try Again */}
        {onRetry && (
          <motion.button
            onClick={onRetry}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-transparent text-[#666] dark:text-[#AAA] hover:text-[#111] dark:hover:text-white font-sans text-xs border border-transparent hover:border-[#C89A3D]/30 transition-all duration-200 cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>{isHindi ? "पुनः प्रयास करें" : "Try Again"}</span>
          </motion.button>
        )}
      </div>

      {/* Quick Navigation Links */}
      {showQuickNav && (
        <div className="pt-4 border-t border-[#C89A3D]/15">
          <p className="text-[10px] uppercase tracking-widest font-mono text-[#888] dark:text-[#999] text-center mb-3">
            {isHindi ? "त्वरित नेविगेशन" : "Quick Navigation"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/40 dark:bg-white/5 border border-[#C89A3D]/20 hover:border-[#C89A3D]/60 hover:bg-[#FAF7F1] dark:hover:bg-white/10 text-xs text-[#333] dark:text-[#DDD] transition-all duration-200 font-sans shadow-2xs hover:scale-105"
                >
                  <Icon className="size-3 text-[#C89A3D]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
