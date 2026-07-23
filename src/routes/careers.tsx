import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  Mail,
  Rss,
  ArrowLeft,
  HeartHandshake,
  ShieldCheck,
  Compass,
  Briefcase,
  Star,
  MapPin,
} from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers — India Story Project" },
      {
        name: "description",
        content:
          "Join our team of journalists, developers, designers, and editors exploring India's stories.",
      },
    ],
  }),
  component: CareersPage,
});

const openings = [
  {
    title: "Editorial Assistant (Hindi / English)",
    location: "Remote (Delhi/NCR preferred)",
    type: "Full-time",
    desc: "Coordinate with ground contributors, review incoming story pitches, verify primary facts, and oversee publication schedules.",
  },
  {
    title: "Senior Full Stack React/TS Developer",
    location: "Remote (India)",
    type: "Contract / Full-time",
    desc: "Maintain and upgrade the India Story platform, implement PWA capabilities, and build out interactive data maps and dashboard visualizations.",
  },
  {
    title: "Independent Ground Journalists",
    location: "Various (All States)",
    type: "Freelance",
    desc: "File dispatches on organic farming systems, rural changemakers, indigenous folklore, and community-led preservation projects in your state.",
  },
];

import { useI18nStore, uiText } from "@/lib/i18n";

function CareersPage() {
  const lang = useI18nStore((s) => s.lang);
  const carText = uiText[lang].careers;

  const openings = [
    {
      title: lang === "hi" ? "संपादकीय सहायक (हिंदी / अंग्रेजी)" : "Editorial Assistant (Hindi / English)",
      location: lang === "hi" ? "रिमोट (दिल्ली/एनसीआर अधिमान्य)" : "Remote (Delhi/NCR preferred)",
      type: lang === "hi" ? "पूर्णकालिक" : "Full-time",
      desc: lang === "hi"
        ? "जमीनी संवाददाताओं के साथ समन्वय करें, कहानियों की समीक्षा करें और प्रकाशन का प्रबंधन करें।"
        : "Coordinate with ground contributors, review incoming story pitches, verify primary facts, and oversee publication schedules.",
    },
    {
      title: lang === "hi" ? "वरिष्ठ फुल-स्टैक डेवलपर (React/TS)" : "Senior Full Stack React/TS Developer",
      location: lang === "hi" ? "रिमोट (भारत)" : "Remote (India)",
      type: lang === "hi" ? "अनुबंध / पूर्णकालिक" : "Contract / Full-time",
      desc: lang === "hi"
        ? "इंडिया स्टोरी प्लेटफॉर्म का रख-रखाव और विकास करें, तथा इंटरैक्टिव डेटा मानचित्र तैयार करें।"
        : "Maintain and upgrade the India Story platform, implement PWA capabilities, and build out interactive data maps and dashboard visualizations.",
    },
    {
      title: lang === "hi" ? "स्वतंत्र क्षेत्रीय पत्रकार" : "Independent Ground Journalists",
      location: lang === "hi" ? "विभिन्न (सभी राज्य)" : "Various (All States)",
      type: lang === "hi" ? "फ्रीलांस" : "Freelance",
      desc: lang === "hi"
        ? "जैविक खेती, ग्रामीण बदलाव के नायकों, और स्थानीय धरोहर पर अपने राज्य से रिपोर्ट तैयार करें।"
        : "File dispatches on organic farming systems, rural changemakers, indigenous folklore, and community-led preservation projects in your state.",
    },
  ];

  return (
    <SiteLayout>
      <div className="bg-background min-h-screen py-24 md:py-32">
        {/* Header */}
        <div className="container mx-auto px-6 border-b border-border/40 pb-10 mb-12">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-sans font-bold mb-3 flex items-center gap-2">
              <Briefcase className="size-4 text-gold fill-gold" /> {carText.openings}
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-none tracking-tight">
              {lang === "hi" ? "उद्देश्य के साथ " : "Work with "}
              <span className="text-primary italic">{lang === "hi" ? "कार्य करें।" : "Purpose."}</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-sm md:text-base leading-relaxed font-sans font-medium">
              {carText.subtitle}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 max-w-4xl space-y-12">
          <div className="space-y-6">
            {openings.map((op) => (
              <div
                key={op.title}
                className="border border-border/60 bg-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-gold/30 transition-colors"
              >
                <div className="space-y-1">
                  <h3 className="font-display text-lg font-bold text-white">{op.title}</h3>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-sans">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3 text-gold/85" /> {op.location}
                    </span>
                    <span>•</span>
                    <span>{op.type}</span>
                  </div>
                  <p className="text-xs text-muted-foreground/90 font-sans leading-relaxed pt-2 max-w-2xl">
                    {op.desc}
                  </p>
                </div>
                <Link
                  to="/contact"
                  className="px-4 py-2 border border-border bg-transparent text-white font-sans text-xs uppercase tracking-widest hover:border-gold/50 transition-colors"
                >
                  {lang === "hi" ? "आवेदन करें" : "Apply"}
                </Link>
              </div>
            ))}
          </div>

          {/* General Pitch */}
          <div className="border border-border/80 bg-card/60 p-8 md:p-12 text-center shadow-elegant">
            <h3 className="font-display text-2xl font-bold mb-2">
              {lang === "hi" ? "उपयुक्त पद नहीं मिला?" : "Don't see a matching role?"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6 font-sans">
              {lang === "hi" ? "अपनी क्षमताएं हमारे साथ साझा करें।" : "Pitch us your skills. Tell us how you can help scale our mission."}
            </p>
            <p className="text-lg font-bold text-white font-sans">careers@indiastoryproject.org</p>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
