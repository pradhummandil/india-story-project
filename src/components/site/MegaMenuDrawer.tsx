import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import {
  X,
  Film,
  Smartphone,
  MapPin,
  Users,
  HeartHandshake,
  TrendingUp,
  Briefcase,
  Megaphone,
  Award,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  AlertTriangle,
  FileText,
  Lock,
  Cookie,
  HelpCircle,
  Accessibility,
  Menu,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useI18nStore } from "@/lib/i18n";

interface MegaMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MegaMenuDrawer({ isOpen, onClose }: MegaMenuDrawerProps) {
  const lang = useI18nStore((s) => s.lang);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      lockScroll();
    } else {
      unlockScroll();
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      unlockScroll();
    };
  }, [isOpen, onClose]);

  const CATEGORIES = [
    {
      title: lang === "hi" ? "दृश्य और मीडिया कहानियाँ" : "Visual & Cinema Dispatches",
      icon: Film,
      color: "text-gold",
      links: [
        {
          to: "/web-stories",
          label: lang === "hi" ? "वेब स्टोरीज़ (60s विज़ुअल्स)" : "Web Stories (60s Visuals)",
          desc: lang === "hi" ? "लघु विजुअल कार्ड्स और कहानियाँ" : "Bite-sized vertical story cards",
          icon: Smartphone,
        },
        {
          to: "/videos",
          label: lang === "hi" ? "सिनेमा वीडियोज़ और यूट्यूब शॉर्ट्स" : "Cinema Dispatches & YouTube Shorts",
          desc: lang === "hi" ? "डॉक्यूमेंट्री और यूट्यूब वीडियो" : "Documentaries and YouTube Short dispatches",
          icon: Film,
        },
        {
          to: "/map",
          label: lang === "hi" ? "इंटरैक्टिव भारत कहानी मानचित्र" : "Interactive Story Map of India",
          desc: lang === "hi" ? "राज्यों के अनुसार कहानियाँ खोजें" : "Explore grassroots stories geographically",
          icon: MapPin,
        },
        {
          to: "/community",
          label: lang === "hi" ? "समुदाय और फ़ोरम" : "Grassroots Community & Forums",
          desc: lang === "hi" ? "लेखकों और पाठकों का नेटवर्क" : "Engage with chroniclers and readers",
          icon: Users,
          hidden: true,
        },
      ],
    },
    {
      title: lang === "hi" ? "जुड़ें और प्रभाव पहल" : "Engage, Career & Impact",
      icon: TrendingUp,
      color: "text-emerald-400",
      links: [
        {
          to: "/join",
          label: lang === "hi" ? "आंदोलन से जुड़ें (फ़ेलोशिप)" : "Join the Movement (Fellowships)",
          desc: lang === "hi" ? "हमारे क्षेत्रीय नेटवर्क में शामिल हों" : "Join our field chroniclers network",
          icon: HeartHandshake,
          hidden: true,
        },
        {
          to: "/impact",
          label: lang === "hi" ? "ग्राउंड इम्पैक्ट पहल" : "Grassroots Impact Initiatives",
          desc: lang === "hi" ? "जमीनी बदलाव का मापन" : "Measuring real-world slow journalism impact",
          icon: TrendingUp,
        },
        {
          to: "/careers",
          label: lang === "hi" ? "करियर और अवसर" : "Careers & Openings",
          desc: lang === "hi" ? "उपलब्ध पद और फ़ेलोशिप" : "Open editorial and reporter positions",
          icon: Briefcase,
        },
        {
          to: "/advertise",
          label: lang === "hi" ? "ब्रांड पार्टनरशिप और विज्ञापन" : "Advertise & Brand Partnerships",
          desc: lang === "hi" ? "ब्रांड प्रायोजन और सहयोग" : "Sponsorships and custom storytelling",
          icon: Megaphone,
        },
        {
          to: "/media-kit",
          label: lang === "hi" ? "मीडिया और प्रेस किट" : "Press & Official Media Kit",
          desc: lang === "hi" ? "आधिकारिक संपत्तियां और प्रेस संपर्क" : "Logos, brand guidelines, and press assets",
          icon: Award,
          hidden: true,
        },
      ],
    },
    {
      title: lang === "hi" ? "संपादकीय सत्यता और नीतियां" : "Editorial Integrity & Trust",
      icon: ShieldCheck,
      color: "text-sky-400",
      links: [
        {
          to: "/editorial-standards",
          label: lang === "hi" ? "संपादकीय मानक और दिशानिर्देश" : "Editorial Standards & Code",
          desc: lang === "hi" ? "हमारी निष्पक्षता और सिद्धांत" : "Journalistic ethics and story verification",
          icon: ShieldCheck,
        },
        {
          to: "/fact-check-policy",
          label: lang === "hi" ? "तथ्य-जांच नीति" : "Fact-Checking Policy",
          desc: lang === "hi" ? "तथ्य सत्यापन की प्रक्रिया" : "Rigorous source and claim verification",
          icon: CheckCircle2,
        },
        {
          to: "/corrections-policy",
          label: lang === "hi" ? "संशोधन रिकॉर्ड और नीति" : "Corrections Policy & Log",
          desc: lang === "hi" ? "पारदर्शी संशोधन प्रक्रिया" : "Transparent record of updates & edits",
          icon: FileCheck2,
        },
        {
          to: "/grievance",
          label: lang === "hi" ? "शिकायत निवारण अधिकारी" : "Grievance Redressal Officer",
          desc: lang === "hi" ? "शिकायत निवारण तंत्र" : "Formal grievance officer contacts",
          icon: AlertTriangle,
        },
      ],
    },
    {
      title: lang === "hi" ? "कानूनी और डेटा सुरक्षा" : "Legal & Compliance",
      icon: Lock,
      color: "text-amber-400",
      links: [
        {
          to: "/terms",
          label: lang === "hi" ? "सेवा की शर्तें" : "Terms of Service",
          desc: lang === "hi" ? "उपयोग की शर्तें और नियम" : "User terms and conditions",
          icon: FileText,
        },
        {
          to: "/privacy",
          label: lang === "hi" ? "गोपनीयता नीति" : "Privacy Policy & Security",
          desc: lang === "hi" ? "डेटा सुरक्षा और अधिकार" : "Data handling and user privacy",
          icon: Lock,
        },
        {
          to: "/cookies",
          label: lang === "hi" ? "कुकी नीति" : "Cookie Policy",
          desc: lang === "hi" ? "कुकीज़ का उपयोग" : "How we use browser storage",
          icon: Cookie,
        },
        {
          to: "/disclaimer",
          label: lang === "hi" ? "अस्वीकरण" : "Editorial Disclaimer",
          desc: lang === "hi" ? "सामग्री अस्वीकरण" : "Content and opinion disclaimers",
          icon: HelpCircle,
        },
        {
          to: "/accessibility",
          label: lang === "hi" ? "पहुंच-योग्यता कथन" : "Accessibility Statement",
          desc: lang === "hi" ? "डिजिटल पहुंच-योग्यता" : "Inclusive design & access standard",
          icon: Accessibility,
        },
      ],
    },
  ];

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark Blur Backdrop */}
          <motion.div
            key="mega-menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000000] bg-black/85 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Right Slide-Over Side Drawer */}
          <motion.div
            key="mega-menu-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 h-screen w-full max-w-lg md:max-w-xl z-[1000001] bg-[#141416] border-l border-white/15 text-white shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-y-auto flex flex-col select-none"
          >
            {/* Header Bar */}
            <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#141416] shrink-0 shadow-md">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                  <Menu className="size-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-white leading-tight">
                    {lang === "hi" ? "संपूर्ण साइट डायरेक्टरी" : "Explore All Directory & Pages"}
                  </h2>
                  <p className="text-xs text-white/50 font-sans">
                    {lang === "hi" ? "सभी 18 महत्वपूर्ण पेज और पोर्टल" : "All 18 core portals, media, & policies"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="size-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Main Categories List */}
            <div className="p-6 space-y-8 flex-1 overflow-y-auto">
              {CATEGORIES.map((cat) => (
                <div key={cat.title} className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                    <cat.icon className={`size-4 ${cat.color}`} />
                    <h3 className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-white/80">
                      {cat.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {cat.links.filter((link) => !(link as any).hidden).map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={onClose}
                        className="group flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/5 hover:border-gold/30 transition-all duration-200 cursor-pointer"
                      >
                        <div className="size-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gold shrink-0 group-hover:bg-gold group-hover:text-black transition-colors">
                          <link.icon className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-sans font-bold text-white group-hover:text-gold transition-colors truncate">
                              {link.label}
                            </span>
                            <ChevronRight className="size-3.5 text-white/30 group-hover:text-gold group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                          </div>
                          <p className="text-[11px] font-sans text-white/50 truncate mt-0.5">
                            {link.desc}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-white/10 bg-black/60 flex items-center justify-between text-xs font-sans text-white/50 shrink-0">
              <span className="flex items-center gap-1.5 font-medium text-white/70">
                <Sparkles className="size-3.5 text-gold" />
                India Story Project
              </span>
              <span>18 Direct Portals</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
