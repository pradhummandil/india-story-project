import { create } from "zustand";

export type Lang = "en" | "hi";

type I18nState = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const STORAGE_KEY = "isp_lang";

function getInitialLang(): Lang {
  if (typeof window === "undefined") return "en";
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "hi" ? "hi" : "en";
}

export const useI18nStore = create<I18nState>((set) => ({
  lang: getInitialLang(),
  setLang: (lang) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, lang);
    }
    set({ lang });
  },
}));

export const uiText = {
  en: {
    nav: {
      home: "Home",
      stories: "Stories",
      join: "Join",
      about: "About",
      contact: "Contact",
      exploreIndia: "Explore India",
    },
    footer: {
      explore: "Explore",
      getInTouch: "Get in touch",
      home: "Home",
      stories: "Stories",
      about: "About",
      contact: "Contact",
      rights: "All rights reserved.",
      crafted: "Crafted with care, in India.",
      tagline:
        "A premium storytelling platform celebrating the changemakers, innovators, and unsung heroes shaping modern India.",
    },
    language: {
      label: "Language",
      en: "English",
      hi: "Hindi",
    },
    common: {
      readStory: "Read Story",
      watchJourney: "Watch Journey",
      readingTime: "Reading Time",
      published: "Published",
      category: "Category",
      theme: "Theme",
      region: "Region",
      heroTitle: "Every Story Lives Forever.",
      heroSubtitle: "Discover India's Untold Stories.",
      exploreIndiaBtn: "Explore India",
      viewAllStories: "View all stories",
      backToStories: "Back to Stories",
      exploreMore: "Explore More Stories",
      shareStory: "Share This Story",
      shareSubtitle: "Inspire others with this amazing story",
      relatedStories: "Related Stories",
      nextStory: "Next Story",
      searchPlaceholder: "Search stories, regions, themes…",
      filters: "Filters",
      noStories: "No stories match your search yet.",
      loadingStory: "Loading story…",
      storyNotFound: "Story Not Found",
      storyNotFoundDesc: "The story you're looking for doesn't exist.",
      journey: "The Journey",
      impact: "Impact",
      featuredToday: "Featured Today",
      celebratingHero: "Celebrating the stories shaping India.",
      editorsPicks: "Editor's Picks",
      latestStories: "Latest Stories",
      exploreByTheme: "Explore by theme",
      tagline: "To tell a billion stories with the craft they deserve.",
      missionDesc:
        "India Story Project is a slow journalism initiative — we travel, listen, and document the people quietly building the country's future. No clickbait. No noise. Just stories, beautifully told.",
      readOurStory: "Read our story",
    },
  },
  hi: {
    nav: {
      home: "होम",
      stories: "कहानियाँ",
      join: "जुड़ें",
      about: "हमारे बारे में",
      contact: "संपर्क",
      exploreIndia: "भारत खोजें",
    },
    footer: {
      explore: "खोजें",
      getInTouch: "संपर्क करें",
      home: "होम",
      stories: "कहानियाँ",
      about: "हमारे बारे में",
      contact: "संपर्क",
      rights: "सर्वाधिकार सुरक्षित।",
      crafted: "भारत में प्रेम के साथ बनाया गया।",
      tagline:
        "भारत को आकार देने वाले बदलाव लाने वालों, नवप्रवर्तकों और अनकहे नायकों की कहानियों का प्रीमियम मंच।",
    },
    language: {
      label: "भाषा",
      en: "अंग्रेज़ी",
      hi: "हिंदी",
    },
    common: {
      readStory: "कहानी पढ़ें",
      watchJourney: "सफरनामा देखें",
      readingTime: "पढ़ने का समय",
      published: "प्रकाशित",
      category: "श्रेणी",
      theme: "विषय",
      region: "राज्य / क्षेत्र",
      heroTitle: "हर कहानी अमर रहती है।",
      heroSubtitle: "भारत की अनकही कहानियों को खोजें।",
      exploreIndiaBtn: "भारत खोजें",
      viewAllStories: "सभी कहानियाँ देखें",
      backToStories: "कहानियों पर वापस जाएँ",
      exploreMore: "और कहानियाँ खोजें",
      shareStory: "कहानी साझा करें",
      shareSubtitle: "दूसरों को इस प्रेरक कहानी से प्रेरित करें",
      relatedStories: "सम्बन्धित कहानियाँ",
      nextStory: "अगली कहानी",
      searchPlaceholder: "कहानियाँ, राज्य, विषय खोजें…",
      filters: "फ़िल्टर्स",
      noStories: "आपकी खोज से मेल खाती कोई कहानी नहीं मिली।",
      loadingStory: "कहानी लोड हो रही है…",
      storyNotFound: "कहानी नहीं मिली",
      storyNotFoundDesc: "आप जिस कहानी की तलाश कर रहे हैं वह मौजूद नहीं है।",
      journey: "सफरनामा",
      impact: "प्रभाव",
      featuredToday: "आज की विशेष कहानी",
      celebratingHero: "भारत को नया आकार देने वाली कहानियों का उत्सव।",
      editorsPicks: "संपादक की पसंद",
      latestStories: "नवीनतम कहानियाँ",
      exploreByTheme: "विषयों के अनुसार खोजें",
      tagline: "एक अरब कहानियों को उस शिल्प के साथ बताना जिसके वे हकदार हैं।",
      missionDesc:
        "इंडिया स्टोरी प्रोजेक्ट एक धीमी पत्रकारिता पहल है — हम यात्रा करते हैं, सुनते हैं, और उन लोगों का दस्तावेजीकरण करते हैं जो चुपचाप देश के भविष्य का निर्माण कर रहे हैं। कोई क्लिकबेट नहीं। कोई शोर नहीं। बस कहानियाँ, खूबसूरती से कही गईं।",
      readOurStory: "हमारी कहानी पढ़ें",
    },
  },
} as const;

export function getNavText(lang: Lang) {
  return uiText[lang].nav;
}

export function getFooterText(lang: Lang) {
  return uiText[lang].footer;
}

export function getLanguageLabels(lang: Lang) {
  return uiText[lang].language;
}

export function getCommonText(lang: Lang) {
  return uiText[lang].common;
}

export function translateStory<
  T extends {
    themes: string[];
    region: string;
    title: string;
    excerpt: string;
    content?: string;
    titleHi?: string | null;
    excerptHi?: string | null;
    contentHi?: string | null;
  },
>(story: T, lang: Lang): T {
  if (lang === "en") return story;

  const themeTrans: Record<string, string> = {
    Heritage: "धरोहर",
    Innovation: "नवाचार",
    Sustainability: "सतत विकास",
    Science: "विज्ञान",
    Culture: "संस्कृति",
    Environment: "पर्यावरण",
    Food: "खान-पान",
    Festival: "त्योहार",
    Freedom: "स्वतंत्रता",
    History: "इतिहास",
    All: "सभी",
  };

  const regionTrans: Record<string, string> = {
    "Andaman and Nicobar Islands": "अंडमान और निकोबार द्वीप समूह",
    "Andhra Pradesh": "आंध्र प्रदेश",
    "Arunachal Pradesh": "अरुणाचल प्रदेश",
    Assam: "असम",
    Bihar: "बिहार",
    Chandigarh: "चंडीगढ़",
    Chhattisgarh: "छत्तीसगढ़",
    "Dadra and Nagar Haveli and Daman and Diu": "दादरा और नगर हवेली तथा दमन और दीव",
    Delhi: "दिल्ली",
    Goa: "गोवा",
    Gujarat: "गुजरात",
    Haryana: "हरियाणा",
    "Himachal Pradesh": "हिमाचल प्रदेश",
    "Jammu and Kashmir": "जम्मू और कश्मीर",
    Jharkhand: "झारखंड",
    Karnataka: "कर्नाटक",
    Kerala: "केरल",
    Ladakh: "लद्दाख",
    Lakshadweep: "लक्षद्वीप",
    "Madhya Pradesh": "मध्य प्रदेश",
    Maharashtra: "महाराष्ट्र",
    Manipur: "मणिपुर",
    Meghalaya: "मेघालय",
    Mizoram: "मिजोरम",
    Nagaland: "नागालैंड",
    Odisha: "ओडिशा",
    Puducherry: "पुडुचेरी",
    Punjab: "पंजाब",
    Rajasthan: "राजस्थान",
    Sikkim: "सिक्किम",
    "Tamil Nadu": "तमिलनाडु",
    Telangana: "तेलंगाना",
    Tripura: "त्रिपुरा",
    "Uttar Pradesh": "उत्तर प्रदेश",
    Uttarakhand: "उत्तराखंड",
    "West Bengal": "पश्चिम बंगाल",
    India: "भारत",
  };

  return {
    ...story,
    title: story.titleHi || story.title,
    excerpt: story.excerptHi || story.excerpt,
    content: story.contentHi || story.content,
    themes: story.themes?.map((t) => themeTrans[t] || t) ?? [],
    region: regionTrans[story.region] || story.region,
  };
}
