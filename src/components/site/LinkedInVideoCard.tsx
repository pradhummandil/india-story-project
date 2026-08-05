import { Linkedin, Play, ExternalLink } from "lucide-react";
import { useI18nStore } from "@/lib/i18n";

export interface LinkedInVideoItem {
  id: string;
  title: string;
  titleHi?: string;
  subtitle?: string;
  subtitleHi?: string;
  description?: string;
  descriptionHi?: string;
  thumbnail?: string;
  embedUrl: string;
  linkedinUrl: string;
  duration?: string;
  isPodcast?: boolean;
}

export const LINKEDIN_PODCAST_VIDEOS: LinkedInVideoItem[] = [
  {
    id: "pod-1",
    title: "ISP Podcast Ep 1 — Culture & Heritage",
    titleHi: "आईएसपी पॉडकास्ट एपिसोड 1 — संस्कृति और धरोहर",
    subtitle: "Conversations with Grassroots Changemakers",
    subtitleHi: "जमीनी स्तर के बदलाव लाने वालों से बातचीत",
    description: "Deep dive into preserving tribal weaving, traditional crafts, and folk heritage across India.",
    descriptionHi: "भारत भर में जनजातीय बुनाई, पारंपरिक शिल्प और लोक विरासत के संरक्षण का गहराई से अध्ययन।",
    thumbnail: "/Logo-ISP.jpg",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6947372114651799552",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6947372114651799552",
    duration: "28 mins",
    isPodcast: true,
  },
  {
    id: "pod-2",
    title: "ISP Podcast Ep 2 — Innovations from India",
    titleHi: "आईएसपी पॉडकास्ट एपिसोड 2 — भारत से नवाचार",
    subtitle: "Grassroots Scientists & Innovators",
    subtitleHi: "जमीनी स्तर के वैज्ञानिक और नवप्रवर्तक",
    description: "Extraordinary stories of rural inventors turning plastic waste into durable building materials.",
    descriptionHi: "प्लास्टिक कचरे को टिकाऊ निर्माण सामग्री में बदलने वाले ग्रामीण वैज्ञानिकों की असाधारण कहानियाँ।",
    thumbnail: "/Logo-ISP.jpg",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6941623712496394240",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6941623712496394240",
    duration: "34 mins",
    isPodcast: true,
  },
  {
    id: "pod-3",
    title: "ISP Podcast Ep 3 — Ancient Traditions",
    titleHi: "आईएसपी पॉडकास्ट एपिसोड 3 — प्राचीन परंपराएं",
    subtitle: "Sacred Groves & Botanical Wisdom",
    subtitleHi: "पवित्र उपवन और वनस्पति विज्ञान का ज्ञान",
    description: "Uncovering centuries-old conservation practices guarded by indigenous forest communities.",
    descriptionHi: "स्वदेशी वन समुदायों द्वारा संरक्षित सदियों पुरानी संरक्षण प्रथाओं का खुलासा।",
    thumbnail: "/Logo-ISP.jpg",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6937614206263255040",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6937614206263255040",
    duration: "22 mins",
    isPodcast: true,
  },
];

export const LINKEDIN_STORY_VIDEOS: LinkedInVideoItem[] = [
  {
    id: "story-vid-1",
    title: "Cdr Abhilash Tomy — Valour & Ocean Sailing",
    titleHi: "कमांडर अभिलाष टॉमी — वीरता और महासागर नौकायन",
    subtitle: "India's Golden Boy of Adventure",
    subtitleHi: "साहस के प्रतीक भारत के वीर पुत्र",
    description: "Decorated Naval Officer Cdr Abhilash Tomy's story of solo ocean circumnavigation and courage.",
    descriptionHi: "सम्मानित नौसेना अधिकारी कमांडर अभिलाष टॉमी की अकेले समुद्री परिक्रमा की साहसी कहानी।",
    thumbnail: "/Logo-ISP.jpg",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6932161045494927361",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6932161045494927361",
    duration: "4 mins",
  },
  {
    id: "story-vid-2",
    title: "Wonder Woman of India — Dr. Seema Rao",
    titleHi: "भारत की वंडर वुमन — डॉ. सीमा राव",
    subtitle: "India's Only Female Commando Trainer",
    subtitleHi: "भारत की एकमात्र महिला कमांडो ट्रेनर",
    description: "Over 20 years training elite special forces without taking compensation.",
    descriptionHi: "बिना कोई वेतन लिए 20 से अधिक वर्षों से विशिष्ट विशेष बलों को प्रशिक्षित कर रही हैं।",
    thumbnail: "/Logo-ISP.jpg",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6930844602346143745",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6930844602346143745",
    duration: "6 mins",
  },
  {
    id: "story-vid-3",
    title: "Plastic to Prosperity Innovation",
    titleHi: "प्लास्टिक से समृद्धि की ओर नवाचार",
    subtitle: "Eco-Building Innovation",
    subtitleHi: "पर्यावरण-अनुकूल भवन निर्माण नवाचार",
    description: "Transforming single-use plastic bottles into earthquake-resistant school structures.",
    descriptionHi: "एकल-उपयोग प्लास्टिक की बोतलों को भूकंप रोधी स्कूल संरचनाओं में बदलना।",
    thumbnail: "/Logo-ISP.jpg",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6929030595893170176",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6929030595893170176",
    duration: "3 mins",
  },
  {
    id: "story-vid-4",
    title: "Reviving Bastar Tribal Weaving",
    titleHi: "बस्तर जनजातीय बुनाई का पुनरुद्धार",
    subtitle: "Botanical Dyes & Heritage Weaves",
    subtitleHi: "प्राकृतिक रंग और पारंपरिक बुनाई",
    description: "Artisans in Chhattisgarh forests safeguarding 1000-year-old natural dye formulas.",
    descriptionHi: "छत्तीसगढ़ के जंगलों में कारीगर 1000 साल पुराने प्राकृतिक रंगों के नुस्खों को सहेज रहे हैं।",
    thumbnail: "/Logo-ISP.jpg",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6928339676780974080",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6928339676780974080",
    duration: "5 mins",
  },
  {
    id: "story-vid-5",
    title: "Miyawaki Forests of Urban Mumbai",
    titleHi: "शहरी मुंबई के मियावाकी जंगल",
    subtitle: "Dense Micro-Forest Movement",
    subtitleHi: "सघन सूक्ष्म वन अभियान",
    description: "Creating self-sustaining native urban forests in crowded metropolitan spaces.",
    descriptionHi: "भीड़भाड़ वाले महानगरीय स्थानों में आत्मनिर्भर देशी शहरी जंगलों का निर्माण।",
    thumbnail: "/Logo-ISP.jpg",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6928337525400834048",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6928337525400834048",
    duration: "4 mins",
  },
  {
    id: "story-vid-6",
    title: "Water Warrior of Bundelkhand",
    titleHi: "बुंदेलखंड के जल योद्धा",
    subtitle: "Reviving Ancient Stepwells",
    subtitleHi: "प्राचीन बावड़ियों का पुनरुद्धार",
    description: "Mobilizing villagers to restore 50+ traditional water harvesting structures.",
    descriptionHi: "50 से अधिक पारंपरिक जल संचयन संरचनाओं को बहाल करने के लिए ग्रामीणों को संगठित करना।",
    thumbnail: "/Logo-ISP.jpg",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6928190533802618880",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6928190533802618880",
    duration: "7 mins",
  },
  {
    id: "story-vid-7",
    title: "Solar Revolution in Himalayan Villages",
    titleHi: "हिमालयी गांवों में सौर क्रांति",
    subtitle: "Clean Energy at 12,000 Feet",
    subtitleHi: "12,000 फीट की ऊंचाई पर स्वच्छ ऊर्जा",
    description: "Powering remote mountain hamlets with indigenous solar microgrids.",
    descriptionHi: "स्वदेशी सौर माइक्रोग्रिड के साथ दूरस्थ पर्वतीय बस्तियों को बिजली प्रदान करना।",
    thumbnail: "/Logo-ISP.jpg",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6927464893264596992",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6927464893264596992",
    duration: "5 mins",
  },
  {
    id: "story-vid-8",
    title: "Zero-Budget Farming Pioneer",
    titleHi: "ज़ीरो-बजट खेती के अग्रदूत",
    subtitle: "Organic Soil Regeneration",
    subtitleHi: "जैविक मृदा पुनरुद्धार",
    description: "Transforming arid farmlands into fertile organic havens using traditional wisdom.",
    descriptionHi: "पारंपरिक ज्ञान का उपयोग करके शुष्क कृषि भूमि को उपजाऊ जैविक खेतों में बदलना।",
    thumbnail: "/Logo-ISP.jpg",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6926031915170889728",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6926031915170889728",
    duration: "6 mins",
  },
];

interface LinkedInVideoCardProps {
  video: LinkedInVideoItem;
  className?: string;
  showTitle?: boolean;
}

export function LinkedInVideoCard({ video, className = "", showTitle = false }: LinkedInVideoCardProps) {
  const lang = useI18nStore((s) => s.lang);

  const displayTitle = lang === "hi" && video.titleHi ? video.titleHi : video.title;
  const displaySubtitle = lang === "hi" && video.subtitleHi ? video.subtitleHi : video.subtitle;
  const displayDuration = video.duration
    ? lang === "hi"
      ? video.duration.replace("mins", "मिनट").replace("min", "मिनट")
      : video.duration
    : "";

  const openLinkedInPost = () => {
    window.open(video.linkedinUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={`group relative bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-gold/50 transition-all duration-300 flex flex-col justify-between ${className}`}
    >
      {/* High-Res Video Poster Box */}
      <div
        className="relative w-full aspect-video bg-black overflow-hidden rounded-t-2xl shrink-0 border-b border-border/40 cursor-pointer group"
        onClick={openLinkedInPost}
      >
        <img
          src={video.thumbnail}
          alt={displayTitle}
          className="size-full object-contain group-hover:scale-105 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

        {/* LinkedIn Badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-blue-600/90 text-white px-2.5 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider shadow-md backdrop-blur-sm">
          <Linkedin className="size-3 fill-current" />
          <span>{video.isPodcast ? (lang === "hi" ? "लिंक्डइन पॉडकास्ट" : "LinkedIn Podcast") : (lang === "hi" ? "लिंक्डइन वीडियो" : "LinkedIn Video")}</span>
        </div>

        {/* Duration Tag */}
        {displayDuration && (
          <div className="absolute top-3 right-3 z-10 bg-black/75 text-white/90 px-2 py-0.5 rounded text-[10px] font-mono font-semibold backdrop-blur-sm">
            {displayDuration}
          </div>
        )}

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="size-14 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-300">
            <Play className="size-6 fill-white text-white ml-1" />
          </div>
        </div>

        {/* Title Overlay in Poster */}
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <h4 className="font-display text-sm font-bold text-white line-clamp-1 group-hover:text-gold transition-colors">
            {displayTitle}
          </h4>
        </div>
      </div>

      {/* Card Content & Action Bar */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-card">
        <div className="space-y-1">
          <h4 className="font-display text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {displayTitle}
          </h4>
          {displaySubtitle && (
            <p className="text-xs text-muted-foreground font-sans line-clamp-2 leading-relaxed">
              {displaySubtitle}
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-border/40 flex items-center justify-between">
          <button
            onClick={openLinkedInPost}
            className="text-[11px] font-bold font-sans uppercase tracking-wider text-primary hover:text-gold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Play className="size-3 fill-current text-primary" />
            <span>{lang === "hi" ? "डिस्पैच चलाएं" : "Play Dispatch"}</span>
          </button>

          <a
            href={video.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold font-sans uppercase tracking-wider text-muted-foreground hover:text-blue-500 inline-flex items-center gap-1 transition-colors cursor-pointer"
            title="Open original LinkedIn post"
          >
            <span>LinkedIn</span>
            <ExternalLink className="size-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
