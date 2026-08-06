import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Calendar, Sparkles, ChevronRight, MapPin, History, Bookmark } from "lucide-react";
import type { Story } from "@/components/site/StoryCard";
import { useI18nStore } from "@/lib/i18n";

export interface TimelineEra {
  id: string;
  yearRange: string;
  eraTitleEn: string;
  eraTitleHi: string;
  historicalEventEn: string;
  historicalEventHi: string;
  cultureTheme: string;
  image: string;
  summaryEn: string;
  summaryHi: string;
}

export const TIMELINE_ERAS: TimelineEra[] = [
  {
    id: "ancient",
    yearRange: "3000 BCE – 1200 CE",
    eraTitleEn: "Vedic & Ancient Heritage",
    eraTitleHi: "वैदिक एवं प्राचीन विरासत",
    historicalEventEn: "Sacred Rivers, Architectural Marvels & Silk Route Craftsmanship",
    historicalEventHi: "पवित्र नदियाँ, स्थापत्य कला एवं रेशम मार्ग कारीगरी",
    cultureTheme: "Sacred Crafts & Temple Architecture",
    image: "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=800&q=80",
    summaryEn: "Centuries of artisan traditions, classical music, medicinal wisdom, and monumental architecture built across the subcontinental river valleys.",
    summaryHi: "उपमहाद्वीप के नदी घाटियों में निर्मित कारीगर परंपराएं, शास्त्रीय संगीत, औषधीय ज्ञान और भव्य वास्तुकला।",
  },
  {
    id: "independence",
    yearRange: "1857 – 1947",
    eraTitleEn: "Swadeshi & Freedom Movement",
    eraTitleHi: "स्वदेशी एवं स्वतंत्रता संग्राम",
    historicalEventEn: "Khadi Revolution, Grassroots Movement & Subcontinental Awakening",
    historicalEventHi: "खादी क्रांति, जमीनी आंदोलन और उपमहाद्वीपीय चेतना",
    cultureTheme: "Grassroots Resistance & Craft Revival",
    image: "https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=800&q=80",
    summaryEn: "Handloom weavers and rural communities unified to pioneer sustainable self-reliance, local enterprise, and cultural pride.",
    summaryHi: "हथकरघा बुनकरों और ग्रामीण समुदायों ने टिकाऊ आत्मनिर्भरता और सांस्कृतिक गौरव को आगे बढ़ाया।",
  },
  {
    id: "green-white",
    yearRange: "1960 – 1990",
    eraTitleEn: "Agricultural & White Revolutions",
    eraTitleHi: "हरित एवं श्वेत क्रांति का युग",
    historicalEventEn: "Amul Milk Cooperatives, Seed Conservation & Village Reform",
    historicalEventHi: "अमूल दुग्ध सहकारिता, बीज संरक्षण एवं ग्राम सुधार",
    cultureTheme: "Cooperative Empowerment & Farmers Unity",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
    summaryEn: "Rural cooperatives transformed millions of smallholder dairy farmers and grain growers into self-sustaining community networks.",
    summaryHi: "ग्रामीण सहकारिताओं ने लाखों डेयरी किसानों और अनाज उत्पादकों को आत्मनिर्भर सामुदायिक नेटवर्क में बदल दिया।",
  },
  {
    id: "grassroots",
    yearRange: "1995 – 2015",
    eraTitleEn: "Eco-Revival & Women SHGs",
    eraTitleHi: "पर्यावरण पुनरुद्धार एवं महिला स्वयं सहायता समूह",
    historicalEventEn: "Chipko Movement Legacy, Rainwater Harvesting & Forest Guardians",
    historicalEventHi: "चिपको आंदोलन की विरासत, वर्षा जल संचयन और वन रक्षक",
    cultureTheme: "Ecological Stewardship & Tribal Knowledge",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    summaryEn: "Indigenous forest guards and women collective networks pioneered eco-restoration across the Western Ghats and Himalayan foothills.",
    summaryHi: "स्वदेशी वन रक्षकों और महिला नेटवर्क ने पश्चिमी घाटों और हिमालयी तलहटी में पर्यावरण-पुनरुद्धार की शुरुआत की।",
  },
  {
    id: "modern",
    yearRange: "2016 – Present",
    eraTitleEn: "Digital & Next-Gen Innovation",
    eraTitleHi: "डिजिटल एवं अगली पीढ़ी का नवाचार",
    historicalEventEn: "Solar Micro-grids, Agritech Revolution & Youth Changemakers",
    historicalEventHi: "सौर माइक्रो-ग्रिड, एग्रीटेक क्रांति एवं युवा बदलावकर्ता",
    cultureTheme: "Clean Tech & High-Impact Social Enterprise",
    image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80",
    summaryEn: "Combining traditional wisdom with cutting-edge tech to power clean energy, digital literacy, and sustainable rural livelihood.",
    summaryHi: "पारंपरिक ज्ञान को आधुनिक तकनीक के साथ मिलाकर स्वच्छ ऊर्जा और डिजिटल साक्षरता को बढ़ावा देना।",
  },
];

interface DnaStoryTimelineProps {
  stories: Story[];
  onSelectStory?: (id: string) => void;
}

export function DnaStoryTimeline({ stories, onSelectStory }: DnaStoryTimelineProps) {
  const lang = useI18nStore((s) => s.lang);
  const [activeEraId, setActiveEraId] = useState<string>("modern");

  const activeEra = TIMELINE_ERAS.find((e) => e.id === activeEraId) || TIMELINE_ERAS[4];

  return (
    <section className="py-20 px-6 bg-[#0D0D0D] text-[#F8F6F1] border-b border-[#C89A3D]/20 overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs font-mono text-[#C89A3D] uppercase tracking-widest mb-2">
            <History className="size-4" />
            <span>{lang === "hi" ? "ऐतिहासिक समयरेखा" : "INTERACTIVE CHRONOLOGICAL TIMELINE"}</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-[#F8F6F1] tracking-tight">
            {lang === "hi" ? "युगों के माध्यम से कहानी की यात्रा" : "Story Journey Across the Eras of India"}
          </h2>
          <p className="text-sm text-[#F1E5D0]/70 mt-3 font-sans leading-relaxed">
            {lang === "hi"
              ? "प्राचीन विरासत से लेकर आधुनिक डिजिटल क्रांति तक, देखें कि कैसे भारत के बदलाव का डीएनए समय के साथ विकसित हुआ है।"
              : "From ancient sacred crafts to modern clean-tech revolutions, explore how India's DNA of change has evolved through centuries of impact."}
          </p>
        </div>

        {/* Horizontal Timeline Track Bar */}
        <div className="relative my-8 py-6">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 -translate-y-1/2 z-0" />
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#A50000] via-[#C89A3D] to-emerald-500 -translate-y-1/2 z-0" />

          {/* Timeline Nodes Carousel */}
          <div className="relative z-10 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar px-4">
            {TIMELINE_ERAS.map((era) => {
              const isActive = era.id === activeEraId;
              return (
                <button
                  key={era.id}
                  onClick={() => setActiveEraId(era.id)}
                  className={`group flex flex-col items-center cursor-pointer transition-all duration-300 min-w-[150px] ${
                    isActive ? "scale-105" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  {/* Year Tag */}
                  <span className={`text-xs font-mono mb-3 font-bold transition-colors ${
                    isActive ? "text-[#C89A3D]" : "text-[#F1E5D0]/60 group-hover:text-white"
                  }`}>
                    {era.yearRange}
                  </span>

                  {/* Pulsing Node Ring */}
                  <div
                    className={`size-6 rounded-full border-2 grid place-items-center transition-all duration-300 ${
                      isActive
                        ? "bg-[#C89A3D] border-[#F8F6F1] shadow-[0_0_20px_rgba(200,154,61,0.9)] scale-125"
                        : "bg-[#111111] border-[#C89A3D]/40 group-hover:border-[#C89A3D]"
                    }`}
                  >
                    {isActive && <div className="size-2 rounded-full bg-[#111111]" />}
                  </div>

                  {/* Era Title Pill */}
                  <span className={`text-[11px] font-sans font-bold mt-3 text-center truncate max-w-[140px] ${
                    isActive ? "text-white" : "text-[#F1E5D0]/50"
                  }`}>
                    {lang === "hi" ? era.eraTitleHi : era.eraTitleEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Era Interactive Card View */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeEra.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mt-8 rounded-3xl bg-[#141414] border border-[#C89A3D]/30 p-6 md:p-10 shadow-2xl grid lg:grid-cols-2 gap-8 items-center"
          >
            {/* Era Image */}
            <div className="relative h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden group">
              <img
                src={activeEra.image}
                alt={activeEra.eraTitleEn}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[#C89A3D] text-xs font-mono font-bold border border-[#C89A3D]/40">
                {activeEra.yearRange}
              </div>
            </div>

            {/* Era Details Content */}
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#C89A3D] font-bold">
                  {activeEra.cultureTheme}
                </span>
                <h3 className="font-display text-2xl sm:text-4xl font-extrabold text-[#F8F6F1] mt-1 leading-tight">
                  {lang === "hi" ? activeEra.eraTitleHi : activeEra.eraTitleEn}
                </h3>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs uppercase font-mono text-[#F1E5D0]/60 mb-1">
                  {lang === "hi" ? "ऐतिहासिक मील का पत्थर" : "Historical Milestone"}
                </p>
                <p className="text-sm sm:text-base font-semibold text-[#F1E5D0]">
                  {lang === "hi" ? activeEra.historicalEventHi : activeEra.historicalEventEn}
                </p>
              </div>

              <p className="text-sm text-[#F1E5D0]/80 leading-relaxed font-sans">
                {lang === "hi" ? activeEra.summaryHi : activeEra.summaryEn}
              </p>

              <div className="pt-2 flex items-center gap-3">
                <div className="text-xs text-[#C89A3D] font-mono flex items-center gap-1.5">
                  <Sparkles className="size-4" />
                  <span>{lang === "hi" ? "इस युग की कहानियों की खोज करें" : "Stories rooted in this era active"}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
