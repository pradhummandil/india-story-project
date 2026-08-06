import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BookOpen, MapPin, Globe2, Users, Sparkles } from "lucide-react";
import { useI18nStore } from "@/lib/i18n";

function AnimatedNumber({ value, duration = 2 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const stepTime = Math.abs(Math.floor((duration * 1000) / value));
    const timer = setInterval(() => {
      start += Math.ceil(value / 40);
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export function DnaStoryStats() {
  const lang = useI18nStore((s) => s.lang);

  const stats = [
    {
      id: "stories",
      number: 1500,
      suffix: "+",
      labelEn: "Stories Documented",
      labelHi: "कहानियाँ सहेजी गईं",
      icon: BookOpen,
      gradient: "from-[#C89A3D]/20 to-[#A50000]/20 border-[#C89A3D]/40",
    },
    {
      id: "districts",
      number: 300,
      suffix: "+",
      labelEn: "Districts Covered",
      labelHi: "जिले कवर किए गए",
      icon: MapPin,
      gradient: "from-blue-600/20 to-indigo-800/20 border-blue-500/40",
    },
    {
      id: "states",
      number: 28,
      suffix: "",
      labelEn: "States & Territories",
      labelHi: "राज्य एवं केंद्र शासित प्रदेश",
      icon: Globe2,
      gradient: "from-emerald-600/20 to-teal-800/20 border-emerald-500/40",
    },
    {
      id: "authors",
      number: 800,
      suffix: "+",
      labelEn: "Changemaker Authors",
      labelHi: "बदलावकर्ता लेखक",
      icon: Users,
      gradient: "from-purple-600/20 to-pink-800/20 border-purple-500/40",
    },
  ];

  return (
    <section className="py-20 px-6 bg-[#111111] text-[#F8F6F1] border-b border-[#C89A3D]/20">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C89A3D]/15 border border-[#C89A3D]/40 text-[#C89A3D] text-xs font-mono font-bold tracking-widest uppercase mb-3">
            <Sparkles className="size-3.5" />
            <span>{lang === "hi" ? "जीवंत प्रभाव आंकड़े" : "LIVING IMPACT STATISTICS"}</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-[#F8F6F1] tracking-tight">
            {lang === "hi" ? "संख्याओं में भारत की कहानी" : "Quantifying India's Story Network"}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                whileHover={{ scale: 1.03, y: -4 }}
                className={`p-8 rounded-3xl bg-gradient-to-b ${stat.gradient} border backdrop-blur-xl shadow-2xl flex flex-col justify-between space-y-6 text-center group`}
              >
                <div className="size-14 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-[#C89A3D] group-hover:scale-110 transition-transform">
                  <Icon className="size-7" />
                </div>

                <div>
                  <h3 className="font-display text-4xl sm:text-5xl font-extrabold text-[#F8F6F1] tracking-tight">
                    <AnimatedNumber value={stat.number} />
                    <span className="text-[#C89A3D]">{stat.suffix}</span>
                  </h3>
                  <p className="text-xs sm:text-sm font-sans font-semibold text-[#F1E5D0]/80 mt-2 uppercase tracking-wider">
                    {lang === "hi" ? stat.labelHi : stat.labelEn}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
