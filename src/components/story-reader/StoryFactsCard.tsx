import { motion } from "framer-motion";
import { MapPin, Users, Target, Globe, Landmark, Calendar, Sparkles, BookOpen, Layers } from "lucide-react";
import type { Story } from "@/components/site/StoryCard";
import { useI18nStore } from "@/lib/i18n";

interface StoryFactsCardProps {
  story: Story;
}

export function StoryFactsCard({ story }: StoryFactsCardProps) {
  const lang = useI18nStore((s) => s.lang);
  const isHindi = lang === "hi";

  const district = (story as any).district || (isHindi ? "क्षेत्रीय जिला" : "Regional District");
  const state = story.region || "India";
  const theme = (story as any).category || (story as any).themes?.[0] || (isHindi ? "सांस्कृतिक विरासत" : "Cultural Heritage");
  const impact = isHindi ? "स्थानीय विरासत का संरक्षण और सामुदायिक सशक्तिकरण" : ((story as any).impact || "Preserving local heritage & community empowerment");
  const peopleAffected = isHindi ? "10,000+ स्थानीय कारीगर और कहानीकार" : ((story as any).peopleCount || "10,000+ local artisans & storytellers");
  const sdgGoal = isHindi ? "एसडीजी 11: सतत समुदाय" : ((story as any).sdg || "SDG 11: Sustainable Communities");
  const timePeriod = isHindi ? "समकालीन और ऐतिहासिक" : ((story as any).timePeriod || "Contemporary & Historical");
  const language = isHindi ? "अंग्रेजी और क्षेत्रीय बोलियां" : ((story as any).language || "English & Regional Dialects");

  const facts = [
    { icon: MapPin, label: isHindi ? "स्थान और जिला" : "Location & District", value: `${district}, ${state}` },
    { icon: Target, label: isHindi ? "मुख्य विषय" : "Core Theme", value: theme },
    { icon: Users, label: isHindi ? "सामुदायिक प्रभाव" : "Community Impact", value: peopleAffected },
    { icon: Globe, label: isHindi ? "सतत विकास लक्ष्य" : "UN SDG Goal Alignment", value: sdgGoal },
    { icon: Landmark, label: isHindi ? "सांस्कृतिक विरासत" : "Cultural Heritage", value: impact },
    { icon: Calendar, label: isHindi ? "कालखंड / समय" : "Time Era / Period", value: timePeriod },
    { icon: BookOpen, label: isHindi ? "मूल भाषाएं" : "Original Languages", value: language },
    { icon: Layers, label: isHindi ? "कहानी का वर्गीकरण" : "Story Classification", value: isHindi ? "सत्यापित आईएसपी प्रेषण" : "Verified ISP Dispatch" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7 }}
      className="my-12 relative rounded-3xl bg-[#1A1816]/90 border border-[#FAF7F2]/15 p-6 md:p-8 shadow-2xl backdrop-blur-xl overflow-hidden"
    >
      {/* Gold Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D32F2F] via-[#D4AF37] to-[#D32F2F]" />

      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#FAF7F2]/10">
        <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-serif font-bold text-white">
            {isHindi ? "कहानी के तथ्य और विवरण" : "Story Facts & Metadata"}
          </h3>
          <p className="text-xs text-[#FAF7F2]/60">
            {isHindi ? "इंडिया स्टोरी आर्काइव से सत्यापित प्रासंगिक विवरण" : "Verified contextual details from the India Story Archive"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {facts.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#24201D]/70 border border-[#FAF7F2]/10 hover:border-[#D4AF37]/40 transition-all duration-300 group"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#FAF7F2]/50">
                  {item.label}
                </span>
              </div>
              <p className="text-sm font-semibold text-white leading-snug">{item.value}</p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
