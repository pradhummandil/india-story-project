import React, { useEffect, useState, useMemo, useRef } from "react";
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
  Search,
  Compass,
  ArrowUpRight,
} from "lucide-react";
import { useI18nStore } from "@/lib/i18n";

interface MegaMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MegaMenuDrawer({ isOpen, onClose }: MegaMenuDrawerProps) {
  const lang = useI18nStore((s) => s.lang);
  const isHindi = lang === "hi";
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
      if (typeof document !== "undefined") {
        document.body.style.touchAction = "auto";
      }
    } else {
      unlockScroll();
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      unlockScroll();
    };
  }, [isOpen, onClose]);

  const CATEGORIES = useMemo(
    () => [
      {
        id: "visual",
        title: isHindi ? "दृश्य और मीडिया पुरालेख" : "Visual & Cinema Archives",
        subtitle: isHindi ? "मल्टीमीडिया, वीडियो और मानचित्र" : "60s Visuals, Documentaries & Maps",
        icon: Film,
        color: "from-[#D32F2F]/10 to-[#B8860B]/10 text-[#D32F2F] border-[#D32F2F]/30",
        badgeColor: "bg-[#D32F2F]/10 text-[#D32F2F] border-[#D32F2F]/20",
        links: [
          {
            to: "/web-stories",
            label: isHindi ? "वेब स्टोरीज़ (60s विज़ुअल्स)" : "Web Stories (60s Visuals)",
            desc: isHindi ? "लघु विजुअल कार्ड्स और कहानियाँ" : "Bite-sized vertical story cards",
            icon: Smartphone,
            tag: "60s Cards",
            hot: true,
          },
          {
            to: "/videos",
            label: isHindi ? "सिनेमा वीडियोज़ और यूट्यूब शॉर्ट्स" : "Cinema Dispatches & Shorts",
            desc: isHindi ? "डॉक्यूमेंट्री और यूट्यूब वीडियो" : "Documentaries and video dispatches",
            icon: Film,
            tag: "Documentary",
            hot: true,
          },
          {
            to: "/map",
            label: isHindi ? "इंटरैक्टिव भारत कहानी मानचित्र" : "Interactive Story Map of India",
            desc: isHindi ? "राज्यों के अनुसार कहानियाँ खोजें" : "Explore grassroots stories geographically",
            icon: MapPin,
            tag: "Interactive Map",
            hot: true,
          },
        ],
      },
      {
        id: "impact",
        title: isHindi ? "जमीनी प्रभाव और अवसर" : "Grassroots Impact & Careers",
        subtitle: isHindi ? "सामाजिक बदलाव और करियर" : "Measuring Impact & Openings",
        icon: TrendingUp,
        color: "from-emerald-700/10 to-teal-700/10 text-emerald-800 border-emerald-700/30",
        badgeColor: "bg-emerald-700/10 text-emerald-800 border-emerald-700/20",
        links: [
          {
            to: "/impact",
            label: isHindi ? "ग्राउंड इम्पैक्ट पहल" : "Grassroots Impact Initiatives",
            desc: isHindi ? "जमीनी बदलाव का मापन" : "Measuring real-world slow journalism impact",
            icon: TrendingUp,
            tag: "Impact Report",
          },
          {
            to: "/careers",
            label: isHindi ? "करियर और अवसर" : "Careers & Editorial Openings",
            desc: isHindi ? "उपलब्ध पद और फ़ेलोशिप" : "Open editorial and reporter positions",
            icon: Briefcase,
            tag: "Fellowships",
          },
          {
            to: "/advertise",
            label: isHindi ? "ब्रांड पार्टनरशिप और विज्ञापन" : "Advertise & Brand Partnerships",
            desc: isHindi ? "ब्रांड प्रायोजन और सहयोग" : "Sponsorships and custom storytelling",
            icon: Megaphone,
            tag: "Partnerships",
          },
        ],
      },
      {
        id: "editorial",
        title: isHindi ? "संपादकीय मानक और सत्यता" : "Editorial Ethics & Verification",
        subtitle: isHindi ? "सत्यापन और पारदर्शिता" : "Journalistic Ethics & Source Code",
        icon: ShieldCheck,
        color: "from-sky-700/10 to-blue-700/10 text-sky-800 border-sky-700/30",
        badgeColor: "bg-sky-700/10 text-sky-800 border-sky-700/20",
        links: [
          {
            to: "/editorial-standards",
            label: isHindi ? "संपादकीय मानक और दिशानिर्देश" : "Editorial Standards & Code",
            desc: isHindi ? "हमारी निष्पक्षता और सिद्धांत" : "Journalistic ethics and story verification",
            icon: ShieldCheck,
            tag: "Ethics Code",
          },
          {
            to: "/fact-check-policy",
            label: isHindi ? "तथ्य-जांच नीति" : "Fact-Checking Policy",
            desc: isHindi ? "तथ्य सत्यापन की प्रक्रिया" : "Rigorous source and claim verification",
            icon: CheckCircle2,
            tag: "Verified",
          },
          {
            to: "/corrections-policy",
            label: isHindi ? "संशोधन रिकॉर्ड और नीति" : "Corrections Policy & Log",
            desc: isHindi ? "पारदर्शी संशोधन प्रक्रिया" : "Transparent record of updates & edits",
            icon: FileCheck2,
            tag: "Transparency",
          },
          {
            to: "/grievance",
            label: isHindi ? "शिकायत निवारण अधिकारी" : "Grievance Redressal Officer",
            desc: isHindi ? "शिकायत निवारण तंत्र" : "Formal grievance officer contacts",
            icon: AlertTriangle,
            tag: "Redressal",
          },
        ],
      },
      {
        id: "legal",
        title: isHindi ? "पाठक विश्वास और नीतियां" : "Reader Trust & Policies",
        subtitle: isHindi ? "डेटा सुरक्षा और उपयोग की शर्तें" : "Terms, Security & Access Standard",
        icon: Lock,
        color: "from-amber-700/10 to-orange-700/10 text-amber-800 border-amber-700/30",
        badgeColor: "bg-amber-700/10 text-amber-800 border-amber-700/20",
        links: [
          {
            to: "/terms",
            label: isHindi ? "सेवा की शर्तें" : "Terms of Service",
            desc: isHindi ? "उपयोग की शर्तें और नियम" : "User terms and conditions",
            icon: FileText,
            tag: "Terms",
          },
          {
            to: "/privacy",
            label: isHindi ? "गोपनीयता नीति" : "Privacy Policy & Security",
            desc: isHindi ? "डेटा सुरक्षा और अधिकार" : "Data handling and user privacy",
            icon: Lock,
            tag: "Security",
          },
          {
            to: "/cookies",
            label: isHindi ? "कुकी नीति" : "Cookie Policy",
            desc: isHindi ? "कुकीज़ का उपयोग" : "How we use browser storage",
            icon: Cookie,
            tag: "Cookies",
          },
          {
            to: "/disclaimer",
            label: isHindi ? "अस्वीकरण" : "Editorial Disclaimer",
            desc: isHindi ? "सामग्री अस्वीकरण" : "Content and opinion disclaimers",
            icon: HelpCircle,
            tag: "Disclaimer",
          },
          {
            to: "/accessibility",
            label: isHindi ? "पहुंच-योग्यता कथन" : "Accessibility Statement",
            desc: isHindi ? "डिजिटल पहुंच-योग्यता" : "Inclusive design & access standard",
            icon: Accessibility,
            tag: "Access",
          },
        ],
      },
    ],
    [isHindi]
  );

  // Filter links by search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return CATEGORIES;
    const q = searchQuery.toLowerCase().trim();
    return CATEGORIES.map((cat) => ({
      ...cat,
      links: cat.links.filter(
        (l) => l.label.toLowerCase().includes(q) || l.desc.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.links.length > 0);
  }, [CATEGORIES, searchQuery]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Soft Warm Semi-Transparent Backdrop */}
          <motion.div
            key="mega-menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[1000000] bg-[#1A1816]/75 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Slide-Over Side Drawer: Soft Warm Cream & Royal Red Theme */}
          <motion.div
            key="mega-menu-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 bottom-0 h-screen w-full max-w-2xl z-[1000001] bg-gradient-to-b from-[#FFFDF9] via-[#FAF7F2] to-[#F5F0E6] border-l border-[#E5DFD3] text-[#1A1816] shadow-[-25px_0_70px_rgba(26,24,22,0.2)] overflow-hidden flex flex-col"
          >
            {/* Top Header Bar */}
            <div className="sticky top-0 z-30 p-6 md:p-8 border-b border-[#EAE4D8] bg-[#FFFDF9]/95 backdrop-blur-2xl shrink-0 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#D32F2F] text-white p-0.5 shadow-lg shadow-[#D32F2F]/25 flex items-center justify-center">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-serif font-bold text-[#1A1816] leading-tight tracking-tight">
                      {isHindi ? "भारत कहानी नेविगेटर" : "India Story Navigator"}
                    </h2>
                    <p className="text-xs text-[#6B625B] font-medium">
                      {isHindi ? "प्रामाणिक आख्यान, मीडिया संग्रह और दिशानिर्देश" : "Discover authentic human dispatches, multimedia & editorial standards"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-[#F2ECE1] hover:bg-[#D32F2F] border border-[#E5DFD3] text-[#1A1816] hover:text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Interactive Live Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#D32F2F] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isHindi ? "मीडिया, मानचित्र, या नीतियां खोजें..." : "Search dispatches, videos, maps, ethics..."}
                  className="w-full bg-[#FFFFFF] border border-[#E5DFD3] rounded-xl pl-11 pr-4 py-2.5 text-xs text-[#1A1816] placeholder-[#8C827A] outline-none focus:border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F] transition-all shadow-sm font-sans"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C827A] hover:text-[#1A1816]"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Trending Dispatches Quick Launch Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-[11px] font-semibold">
                <span className="text-[10px] uppercase text-[#D32F2F] tracking-wider shrink-0 font-bold">
                  {isHindi ? "त्वरित खोज:" : "Trending Dispatches:"}
                </span>
                <Link
                  to="/web-stories"
                  onClick={onClose}
                  className="px-3 py-1 rounded-full bg-[#D32F2F]/10 border border-[#D32F2F]/30 text-[#D32F2F] hover:bg-[#D32F2F] hover:text-white transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <span>🎬 {isHindi ? "वेब स्टोरीज़" : "Web Stories"}</span>
                </Link>
                <Link
                  to="/map"
                  onClick={onClose}
                  className="px-3 py-1 rounded-full bg-[#9A7B1C]/10 border border-[#9A7B1C]/30 text-[#8B6508] hover:bg-[#9A7B1C] hover:text-white transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <span>🗺️ {isHindi ? "कहानी मानचित्र" : "Story Map"}</span>
                </Link>
                <Link
                  to="/impact"
                  onClick={onClose}
                  className="px-3 py-1 rounded-full bg-emerald-700/10 border border-emerald-700/30 text-emerald-800 hover:bg-emerald-700 hover:text-white transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <span>📊 {isHindi ? "प्रभाव रिपोर्ट" : "Impact Report"}</span>
                </Link>
                <Link
                  to="/fact-check-policy"
                  onClick={onClose}
                  className="px-3 py-1 rounded-full bg-sky-700/10 border border-sky-700/30 text-sky-800 hover:bg-sky-700 hover:text-white transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <span>🛡️ {isHindi ? "तथ्य जांच" : "Fact Check"}</span>
                </Link>
              </div>
            </div>

            {/* Scrollable Categories Body */}
            <div
              ref={scrollContainerRef}
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              className="p-6 md:p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar touch-pan-y"
            >
              {filteredCategories.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <Search className="w-10 h-10 text-[#D32F2F]/40 mx-auto" />
                  <p className="text-sm font-semibold text-[#1A1816]">
                    {isHindi ? "कोई मेल खाते गंतव्य नहीं मिले" : "No matching dispatches found"}
                  </p>
                  <p className="text-xs text-[#6B625B]">
                    {isHindi ? "कृपया किसी अन्य खोज शब्द का प्रयास करें" : "Try searching for stories, videos, or editorial policies"}
                  </p>
                </div>
              ) : (
                filteredCategories.map((cat) => (
                  <div key={cat.id} className="space-y-3">
                    {/* Category Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-[#EAE4D8]">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl bg-gradient-to-r border ${cat.color}`}>
                          <cat.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-serif font-bold text-[#1A1816] tracking-wide">
                            {cat.title}
                          </h3>
                          <p className="text-[11px] text-[#6B625B] font-sans">{cat.subtitle}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${cat.badgeColor}`}>
                        {cat.links.length} {isHindi ? "अनुभाग" : "Sections"}
                      </span>
                    </div>

                    {/* Links Grid (Soft Cream Cards) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {cat.links.map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.to}
                            to={link.to}
                            onClick={onClose}
                            className="group relative p-4 rounded-2xl bg-[#FFFFFF] hover:bg-[#FFFDF9] border border-[#EAE4D8] hover:border-[#D32F2F]/40 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="w-9 h-9 rounded-xl bg-[#F4EFE6] border border-[#E5DFD3] flex items-center justify-center text-[#D32F2F] group-hover:bg-[#D32F2F] group-hover:text-white transition-all shadow-sm shrink-0">
                                <Icon className="w-4 h-4" />
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-md bg-[#F4EFE6] border border-[#E5DFD3] text-[#5A524C] text-[9px] font-mono font-semibold">
                                  {link.tag}
                                </span>
                                {(link as any).hot && (
                                  <span className="px-2 py-0.5 rounded-md bg-[#D32F2F] text-white text-[9px] font-bold uppercase tracking-wider">
                                    Popular
                                  </span>
                                )}
                                <ArrowUpRight className="w-4 h-4 text-[#8C827A] group-hover:text-[#D32F2F] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                              </div>
                            </div>

                            <div>
                              <h4 className="text-xs font-serif font-bold text-[#1A1816] group-hover:text-[#D32F2F] transition-colors leading-snug">
                                {link.label}
                              </h4>
                              <p className="text-[11px] font-sans text-[#6B625B] line-clamp-2 leading-relaxed mt-1">
                                {link.desc}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Footer Bar */}
            <div className="p-5 border-t border-[#EAE4D8] bg-[#F3EDE2] flex items-center justify-between text-xs font-sans text-[#5A524C] shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D32F2F]" />
                <span className="font-serif font-bold text-[#1A1816]">India Story Project</span>
                <span className="text-[#8C827A]">•</span>
                <span className="text-[11px] font-medium">{isHindi ? "2026 आधिकारिक नेविगेटर" : "2026 Official Navigator"}</span>
              </div>

              <div className="text-[11px] font-mono font-bold text-[#D32F2F]">
                {isHindi ? "संपादकीय मानक सत्यापित" : "Verified Editorial Standards"}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
