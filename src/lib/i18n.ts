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
      explore: "Explore",
      getInTouch: "संपर्क करें",
      home: "होम",
      stories: "कहानियाँ",
      about: "हमारे बारे में",
      contact: "संपर्क",
      rights: "सर्वाधिकार सुरक्षित।",
      crafted: "भारत में प्यार के साथ बनाया गया।",
      tagline:
        "भारत को आकार देने वाले बदलाव लाने वालों, नवप्रवर्तकों और अनकहे नायकों की कहानियों का प्रीमियम मंच।",
    },
    language: {
      label: "भाषा",
      en: "अंग्रेज़ी",
      hi: "हिंदी",
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

