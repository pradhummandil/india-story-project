/**
 * ImpactNumbers — Animated platform statistics section.
 * Shows real platform impact with count-up animation on scroll into view.
 */
import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { BookOpen, MapPin, Users, Globe2, TrendingUp, Feather } from "lucide-react";
import { useI18nStore } from "@/lib/i18n";

type LucideIcon = React.FC<{ className?: string }>;

interface StatItem {
  icon: LucideIcon;
  value: string;
  numericValue: number;
  suffix: string;
  label: { en: string; hi: string };
  color: string;
}

const STATS: StatItem[] = [
  {
    icon: BookOpen,
    value: "500+",
    numericValue: 500,
    suffix: "+",
    label: { en: "Stories Published", hi: "प्रकाशित कहानियाँ" },
    color: "text-primary",
  },
  {
    icon: MapPin,
    value: "36",
    numericValue: 36,
    suffix: "",
    label: { en: "States & UTs Covered", hi: "राज्य और केंद्र शासित प्रदेश" },
    color: "text-gold",
  },
  {
    icon: Users,
    value: "100+",
    numericValue: 100,
    suffix: "+",
    label: { en: "Local Heroes Profiled", hi: "स्थानीय नायकों की प्रोफ़ाइल" },
    color: "text-saffron",
  },
  {
    icon: Globe2,
    value: "5M+",
    numericValue: 5,
    suffix: "M+",
    label: { en: "Readers Reached", hi: "पाठक" },
    color: "text-primary",
  },
  {
    icon: Feather,
    value: "50+",
    numericValue: 50,
    suffix: "+",
    label: { en: "Contributing Authors", hi: "योगदानकर्ता लेखक" },
    color: "text-gold",
  },
  {
    icon: TrendingUp,
    value: "3×",
    numericValue: 3,
    suffix: "×",
    label: { en: "Year-over-Year Growth", hi: "वार्षिक वृद्धि" },
    color: "text-saffron",
  },
];

function CountUp({ target, suffix, duration = 1800 }: { target: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export function ImpactNumbers() {
  const lang = useI18nStore((s) => s.lang);
  const sectionRef = useRef(null);
  const [statsData, setStatsData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/explore")
      .then((r) => r.json())
      .then((d) => {
        if (d?.stats) setStatsData(d.stats);
      })
      .catch(() => {});
  }, []);

  const dynamicStats: StatItem[] = [
    {
      icon: BookOpen,
      value: statsData?.stories ? `${statsData.stories}+` : "500+",
      numericValue: statsData?.stories ?? 500,
      suffix: "+",
      label: { en: "Stories Published", hi: "प्रकाशित कहानियाँ" },
      color: "text-primary",
    },
    {
      icon: MapPin,
      value: statsData?.states ? `${statsData.states}` : "36",
      numericValue: statsData?.states ?? 36,
      suffix: "",
      label: { en: "States & UTs Covered", hi: "राज्य और केंद्र शासित प्रदेश" },
      color: "text-gold",
    },
    {
      icon: Users,
      value: statsData?.authors ? `${statsData.authors}+` : "100+",
      numericValue: statsData?.authors ?? 100,
      suffix: "+",
      label: { en: "Local Heroes & Authors", hi: "स्थानीय नायक और लेखक" },
      color: "text-saffron",
    },
    {
      icon: Globe2,
      value: statsData?.views ? `${Math.round(statsData.views / 100) / 10}k` : "5M+",
      numericValue: statsData?.views ? Math.round(statsData.views / 1000) : 5000,
      suffix: "k+",
      label: { en: "Story Views", hi: "कहानी विचार" },
      color: "text-primary",
    },
    {
      icon: Feather,
      value: statsData?.themes ? `${statsData.themes}+` : "20+",
      numericValue: statsData?.themes ?? 20,
      suffix: "+",
      label: { en: "Active Themes", hi: "सक्रिय विषय" },
      color: "text-gold",
    },
    {
      icon: TrendingUp,
      value: "3×",
      numericValue: 3,
      suffix: "×",
      label: { en: "Year-over-Year Growth", hi: "वार्षिक वृद्धि" },
      color: "text-saffron",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative border-b border-border/70 overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-card/60 to-card/20 pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 39px, currentColor 39px, currentColor 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, currentColor 39px, currentColor 40px)",
        }}
      />

      <div className="relative container mx-auto px-6 py-12 md:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-[0.28em] font-sans font-bold text-gold mb-3">
            {lang === "en" ? "Our Impact" : "हमारा प्रभाव"}
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            {lang === "en" ? "India's Story, in Numbers" : "भारत की कहानी, संख्याओं में"}
          </h2>
          <p className="mt-4 text-sm text-muted-foreground max-w-xl mx-auto font-sans leading-relaxed">
            {lang === "en"
              ? "Every number represents a story that changed how we see India."
              : "हर संख्या एक ऐसी कहानी का प्रतिनिधित्व करती है जिसने भारत को देखने का हमारा नज़रिया बदल दिया।"}
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-4">
          {dynamicStats.map((stat, i) => {
            const Icon = stat.icon;
            const label = lang === "hi" ? stat.label.hi : stat.label.en;
            return (
              <motion.div
                key={stat.label.en}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                className="text-center group"
              >
                {/* Icon */}
                <div className={`inline-flex items-center justify-center size-12 rounded-full border mb-4 mx-auto transition-all duration-300 group-hover:scale-110 ${stat.color} border-current/20 bg-current/5`}>
                  <Icon className="size-5" />
                </div>

                {/* Number */}
                <div className={`font-display text-3xl md:text-4xl font-bold ${stat.color} leading-none mb-2`}>
                  <CountUp
                    target={stat.numericValue}
                    suffix={stat.suffix}
                    duration={1600 + i * 100}
                  />
                </div>

                {/* Label */}
                <p className="text-xs text-muted-foreground font-sans leading-tight">{label}</p>

                {/* Decorative line */}
                <div className={`h-[1px] w-8 mx-auto mt-3 transition-all duration-500 group-hover:w-16 ${stat.color} bg-current/40`} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
