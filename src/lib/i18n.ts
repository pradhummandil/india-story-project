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
      explore: "Explore",
      shareStory: "Share Story",
      shareYourStory: "Share Your Story",
      signIn: "Sign In",
      signedInAs: "Signed in as",
      profile: "My Profile",
      adminCms: "Admin CMS",
      editorWorkspace: "Editor Workspace",
      authorDashboard: "Author Dashboard",
      signOut: "Sign Out",
    },
    footer: {
      exploreSection: "Explore & Community",
      companySection: "Company & Legal",
      home: "Home",
      stories: "Stories",
      exploreHub: "Explore Hub",
      interactiveMap: "Interactive Map",
      communityForums: "Community Forums",
      shareYourStory: "Share Your Story",
      podcastRss: "Podcast RSS Feed",
      aboutUs: "About Us",
      careers: "Careers",
      impactInitiatives: "Impact Initiatives",
      mediaKit: "Media & Press Kit",
      privacyPolicy: "Privacy Policy",
      contactSupport: "Contact Support",
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
      minRead: "min read",
    },
    recommended: {
      badgePersonalized: "Personalized for you",
      badgeDiscover: "Discover",
      headingPersonalized: "Recommended For You",
      headingDiscover: "Find your next story",
      subPersonalized: "Updated as you explore — based on the stories, regions and themes you've spent time with.",
      subDiscover: "Pick a discovery theme below. Your recommendations evolve as you read.",
      forYou: "For You",
      architecture: "Architecture",
      art: "Art",
      culture: "Culture",
      environment: "Environment",
      festivals: "Festivals",
      food: "Food",
      sustainability: "Sustainability",
      science: "Science",
      heritage: "Heritage",
      innovation: "Innovation",
    },
    editor: {
      title: "Editor Workspace",
      subtitle: "Enterprise Publishing Pipeline & Editorial AI Assistant",
      dashboard: "Dashboard",
      inbox: "Inbox",
      pipeline: "Pipeline",
      published: "Published",
      users: "Users",
      media: "Media",
      analytics: "Analytics",
      settings: "Settings",
    },
    profile: {
      title: "User Profile",
      overview: "Overview",
      bookmarks: "Bookmarks",
      history: "Reading History",
      collections: "Collections",
      badges: "Badges & XP",
      editProfile: "Edit Profile",
      memberSince: "Member Since",
      readingStreak: "Reading Streak",
      totalXP: "Total XP",
      readingTime: "Total Reading Time",
    },
    contact: {
      title: "Get in Touch",
      subtitle: "Have a story idea, feedback, or grievance? We are listening.",
      name: "Your Name",
      email: "Your Email",
      subject: "Subject",
      message: "Message",
      send: "Send Message",
      office: "Our Office",
      grievance: "Grievance Redressal",
    },
    about: {
      title: "About India Story Project",
      subtitle: "Slow Journalism. Deep Chronicles. Unsung Heroes.",
      mission: "Our Mission",
      team: "Editorial Board & Chroniclers",
    },
    explore: {
      title: "Explore Stories by Region & Theme",
      subtitle: "Journey across 28 States and Union Territories of India",
      allStates: "All States & UTs",
      allThemes: "All Themes",
      searchPlaceholder: "Search by state, city, hero name or keyword…",
    },
    shareStoryPage: {
      title: "Share Your Story",
      subtitle: "Document an unsung hero, grassroots innovation, or living heritage",
      storyTitle: "Story Title",
      excerpt: "Excerpt / Short Summary",
      content: "Full Story Content",
      state: "State",
      city: "City / District",
      authorName: "Author Name",
      submit: "Submit Story for Editorial Review",
    },
    storiesPage: {
      dnaTitle: "Story DNA & Narrative Intelligence",
      culturalRoots: "Cultural Roots & Heritage",
      historicalEra: "Historical Era / Context",
      narrativeDepth: "Narrative Depth",
      sentimentTone: "Sentiment & Tone",
      keyFigures: "Key Figures",
      slowJournalismIndex: "Slow Journalism Index",
    },
    careers: {
      title: "Careers & Fellowships",
      subtitle: "Join our network of field chroniclers, photojournalists, and editors.",
      openings: "Open Positions",
    },
    impactPage: {
      title: "Impact Initiatives",
      subtitle: "Measuring how slow journalism drives grassroots change across India.",
    },
    mediaKit: {
      title: "Media & Press Kit",
      subtitle: "Official assets, brand guidelines, and press contacts.",
    },
    privacyPage: {
      title: "Privacy Policy & Data Security",
      subtitle: "How we collect, protect, and respect your personal information.",
    },
    admin: {
      title: "Admin Panel & System Control",
      dashboard: "Dashboard",
      newsroom: "Newsroom Workflow",
      stories: "Stories Catalogue",
      submissions: "Submissions",
      authors: "Authors",
      themes: "Themes & Categories",
      states: "States & Cities",
      slideshow: "Slideshow & Hero",
      comments: "Comments Moderation",
      newsletter: "Newsletter Subscribers",
      achievements: "Badges & XP",
      users: "User Accounts",
      infrastructure: "System Infrastructure",
      settings: "Site Settings",
      calendar: "Editorial Calendar",
    },
    dashboard: {
      title: "Author Workspace",
      welcome: "Welcome back",
      myDrafts: "My Drafts",
      published: "Published Stories",
      pending: "Pending Review",
      analytics: "Story Analytics",
      comments: "Comments Feed",
      media: "Media Library",
      achievements: "Achievements",
      profile: "Author Profile",
      writeStory: "Write Story",
      totalStories: "Total Stories",
      totalReads: "Total Reads",
      estRevenue: "Est. Revenue",
      authorLevel: "Author Level",
      readingXP: "Reading XP",
      readingStreak: "Reading Streak",
      pendingSubmissions: "Pending Submissions",
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
      explore: "अन्वेषण",
      shareStory: "कहानी साझा करें",
      shareYourStory: "अपनी कहानी साझा करें",
      signIn: "साइन इन करें",
      signedInAs: "साइन इन किया है:",
      profile: "मेरी प्रोफाइल",
      adminCms: "एडमिन नियंत्रण",
      editorWorkspace: "संपादक कार्यस्थान",
      authorDashboard: "लेखक डैशबोर्ड",
      signOut: "साइन आउट",
    },
    footer: {
      exploreSection: "अन्वेषण और समुदाय",
      companySection: "कंपनी और कानूनी",
      home: "होम",
      stories: "कहानियाँ",
      exploreHub: "अन्वेषण हब",
      interactiveMap: "इंटरएक्टिव मानचित्र",
      communityForums: "समुदाय मंच",
      shareYourStory: "अपनी कहानी साझा करें",
      podcastRss: "पॉडकास्ट फीड",
      aboutUs: "हमारे बारे में",
      careers: "करियर",
      impactInitiatives: "प्रभाव पहल",
      mediaKit: "मीडिया और प्रेस किट",
      privacyPolicy: "गोपनीयता नीति",
      contactSupport: "सहायता संपर्क",
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
      minRead: "मिनट पढ़ें",
    },
    recommended: {
      badgePersonalized: "आपके लिए वैयक्तिकृत",
      badgeDiscover: "खोजें",
      headingPersonalized: "आपके लिए अनुशंसित कहानियाँ",
      headingDiscover: "अपनी अगली कहानी खोजें",
      subPersonalized: "जैसे-जैसे आप पढ़ते हैं अपडेट होता है — आपके पसंदीदा राज्यों और विषयों के आधार पर।",
      subDiscover: "नीचे दी गई श्रेणियों में से चुनें। कहानियाँ आपके पढ़ने के साथ बदलती हैं।",
      forYou: "आपके लिए",
      architecture: "वास्तुकला",
      art: "कला",
      culture: "संस्कृति",
      environment: "पर्यावरण",
      festivals: "त्योहार",
      food: "खान-पान",
      sustainability: "सतत विकास",
      science: "विज्ञान",
      heritage: "धरोहर",
      innovation: "नवाचार",
    },
    editor: {
      title: "संपादक कार्यस्थान",
      subtitle: "एंटरप्राइज प्रकाशन पाइपलाइन और एआई संपादकीय सहायक",
      dashboard: "डैशबोर्ड",
      inbox: "इनबॉक्स",
      pipeline: "प्रकाशन पाइपलाइन",
      published: "प्रकाशित कहानियां",
      users: "उपयोगकर्ता प्रबंध",
      media: "मीडिया लाइब्रेरी",
      analytics: "विश्लेषण",
      settings: "सेटिंग्स",
    },
    profile: {
      title: "उपयोगकर्ता प्रोफ़ाइल",
      overview: "अवलोकन",
      bookmarks: "सहेजी गई कहानियाँ",
      history: "पढ़ने का इतिहास",
      collections: "संग्रह",
      badges: "बैज और अनुभव अंक",
      editProfile: "प्रोफ़ाइल संपादित करें",
      memberSince: "सदस्यता तिथि",
      readingStreak: "पढ़ने का क्रम (स्ट्रिक)",
      totalXP: "कुल अनुभव (XP)",
      readingTime: "कुल पढ़ने का समय",
    },
    contact: {
      title: "संपर्क करें",
      subtitle: "क्या आपके पास कोई कहानी का विचार, सुझाव या शिकायत है? हम सुन रहे हैं।",
      name: "आपका नाम",
      email: "आपका ईमेल",
      subject: "विषय",
      message: "संदेश",
      send: "संदेश भेजें",
      office: "हमारा कार्यालय",
      grievance: "शिकायत निवारण",
    },
    about: {
      title: "इंडिया स्टोरी प्रोजेक्ट के बारे में",
      subtitle: "धीमी पत्रकारिता। गहरी कहानियाँ। अनकहे नायक।",
      mission: "हमारा उद्देश्य",
      team: "संपादकीय बोर्ड और लेखक",
    },
    explore: {
      title: "राज्य और विषय के अनुसार कहानियाँ खोजें",
      subtitle: "भारत के 28 राज्यों और केंद्र शासित प्रदेशों की यात्रा करें",
      allStates: "सभी राज्य और क्षेत्र",
      allThemes: "सभी विषय",
      searchPlaceholder: "राज्य, शहर, नायक या कीवर्ड से खोजें…",
    },
    shareStoryPage: {
      title: "अपनी कहानी साझा करें",
      subtitle: "किसी अनकहे नायक, जमीनी नवाचार या जीवंत विरासत का दस्तावेजीकरण करें",
      storyTitle: "कहानी का शीर्षक",
      excerpt: "संक्षिप्त विवरण",
      content: "कहानी का पूरा विवरण",
      state: "राज्य",
      city: "शहर / जिला",
      authorName: "लेखक का नाम",
      submit: "संपादकीय समीक्षा के लिए जमा करें",
    },
    storiesPage: {
      dnaTitle: "कहानी डीएनए और विश्लेषण",
      culturalRoots: "सांस्कृतिक जड़ें और विरासत",
      historicalEra: "ऐतिहासिक युग / संदर्भ",
      narrativeDepth: "कहानी की गहराई",
      sentimentTone: "भावना और स्वर",
      keyFigures: "प्रमुख व्यक्तित्व",
      slowJournalismIndex: "धीमी पत्रकारिता सूचकांक",
    },
    careers: {
      title: "करियर और फ़ेलोशिप",
      subtitle: "हमारे क्षेत्रीय लेखकों, फोटोपत्रकारों और संपादकों के नेटवर्क में शामिल हों।",
      openings: "उपलब्ध पद",
    },
    impactPage: {
      title: "प्रभाव पहल",
      subtitle: "मापना कि कैसे धीमी पत्रकारिता पूरे भारत में बदलाव ला रही है।",
    },
    mediaKit: {
      title: "मीडिया और प्रेस किट",
      subtitle: "आधिकारिक ब्रांड संपत्तियां, लोगो और प्रेस संपर्क।",
    },
    privacyPage: {
      title: "गोपनीयता नीति और डेटा सुरक्षा",
      subtitle: "हम आपकी व्यक्तिगत जानकारी कैसे एकत्र, सुरक्षित और सम्मानित करते हैं।",
    },
    admin: {
      title: "एडमिन कंट्रोल पैनल",
      dashboard: "डैशबोर्ड",
      newsroom: "न्यूज़रूम पाइपलाइन",
      stories: "कहानी सूची",
      submissions: "प्राप्त प्रस्तुतियाँ",
      authors: "लेखक सूची",
      themes: "विषय और श्रेणियां",
      states: "राज्य और शहर",
      slideshow: "स्लाइडशो और हीरो",
      comments: "टिप्पणी नियंत्रण",
      newsletter: "न्यूज़लेटर ग्राहक",
      achievements: "बैज और पुरस्कार",
      users: "उपयोगकर्ता खाते",
      infrastructure: "सिस्टम इंफ्रास्ट्रक्चर",
      settings: "साइट सेटिंग्स",
      calendar: "संपादकीय कैलेंडर",
    },
    dashboard: {
      title: "लेखक कार्यस्थान",
      welcome: "पुनः स्वागत है",
      myDrafts: "मेरे ड्राफ्ट",
      published: "प्रकाशित कहानियां",
      pending: "समीक्षाधीन",
      analytics: "कहानी विश्लेषण",
      comments: "टिप्पणियाँ",
      media: "मीडिया लाइब्रेरी",
      achievements: "उपलब्धियां",
      profile: "लेखक प्रोफ़ाइल",
      writeStory: "कहानी लिखें",
      totalStories: "कुल कहानियां",
      totalReads: "कुल पठन",
      estRevenue: "अनुमानित आय",
      authorLevel: "लेखक स्तर",
      readingXP: "पढ़ने का XP",
      readingStreak: "पढ़ने की स्ट्रिक",
      pendingSubmissions: "समीक्षाधीन कहानियां",
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

function isDevanagariText(text?: string | null): boolean {
  return /[\u0900-\u097F]/.test(text || "");
}

function slugToEnglishTitle(slug?: string | null): string {
  if (!slug) return "Story";
  return slug
    .replace(/-\d+$/, "")
    .split("-")
    .map((w) =>
      ["of", "the", "in", "a", "an", "to", "for", "and", "on", "with", "by"].includes(w)
        ? w
        : w.charAt(0).toUpperCase() + w.slice(1),
    )
    .join(" ")
    .replace(/^./, (c) => c.toUpperCase());
}

export function translateStory<
  T extends {
    slug?: string;
    themes: string[];
    region: string;
    title: string;
    excerpt: string;
    content?: string;
    readTime?: string;
    titleHi?: string | null;
    excerptHi?: string | null;
    contentHi?: string | null;
  },
>(story: T, lang: Lang): T {
  if (lang === "en") {
    let titleEn = story.title;
    if (isDevanagariText(titleEn)) {
      titleEn = slugToEnglishTitle(story.slug);
    }

    let excerptEn = story.excerpt;
    if (isDevanagariText(excerptEn)) {
      excerptEn = `${titleEn} — Documenting grassroots stories and unsung heroes across India.`;
    }

    let contentEn = story.content;
    if (contentEn && isDevanagariText(contentEn)) {
      contentEn = `${titleEn}\n\n${excerptEn}\n\nThis story documents impactful grassroots change in India. Toggle language options to view the complete Hindi text.`;
    }

    return {
      ...story,
      title: titleEn,
      excerpt: excerptEn,
      content: contentEn,
    };
  }

  const themeTrans: Record<string, string> = {
    Heritage: "धरोहर",
    Innovation: "नवाचार",
    Sustainability: "सतत विकास",
    Science: "विज्ञान",
    Culture: "संस्कृति",
    Environment: "पर्यावरण",
    Food: "खान-पान",
    Festival: "त्योहार",
    Festivals: "त्योहार",
    Freedom: "स्वतंत्रता",
    History: "इतिहास",
    Architecture: "वास्तुकला",
    Art: "कला",
    All: "सभी",
  };

  const readTimeTranslated = story.readTime
    ? story.readTime.replace(/(\d+)\s*min\s*read/i, "$1 मिनट पढ़ें")
    : "3 मिनट पढ़ें";

  const titleHi = story.titleHi || (isDevanagariText(story.title) ? story.title : story.title);
  const excerptHi = story.excerptHi || (isDevanagariText(story.excerpt) ? story.excerpt : story.excerpt);
  const contentHi =
    story.contentHi || (story.content && isDevanagariText(story.content) ? story.content : story.content);

  return {
    ...story,
    title: titleHi,
    excerpt: excerptHi,
    content: contentHi,
    readTime: readTimeTranslated,
    themes: story.themes?.map((t) => translateThemeName(t, lang) || themeTrans[t] || t) ?? [],
    region: translateStateName(story.region, lang),
  };
}

export function translateStateName(stateName: string | null | undefined, lang: Lang): string {
  if (lang === "en" || !stateName || typeof stateName !== "string") return stateName || "India";

  const regionTrans: Record<string, string> = {
    "andaman and nicobar islands": "अंडमान और निकोबार द्वीप समूह",
    "andhra pradesh": "आंध्र प्रदेश",
    "arunachal pradesh": "अरुणाचल प्रदेश",
    assam: "असम",
    bihar: "बिहार",
    chandigarh: "चंडीगढ़",
    chhattisgarh: "छत्तीसगढ़",
    "dadra and nagar haveli and daman and diu": "दादरा और नगर हवेली तथा दमन और दीव",
    "daman and diu": "दमन और दीव",
    delhi: "दिल्ली",
    goa: "गोवा",
    gujarat: "गुजरात",
    haryana: "हरियाणा",
    "himachal pradesh": "हिमाचल प्रदेश",
    "jammu and kashmir": "जम्मू और कश्मीर",
    jharkhand: "झारखंड",
    karnataka: "कर्नाटक",
    kerala: "केरल",
    ladakh: "लद्दाख",
    lakshadweep: "लक्षद्वीप",
    "madhya pradesh": "मध्य प्रदेश",
    maharashtra: "महाराष्ट्र",
    manipur: "मणिपुर",
    meghalaya: "मेघालय",
    mizoram: "मिजोरम",
    nagaland: "नागालैंड",
    odisha: "ओडिशा",
    puducherry: "पुडुचेरी",
    punjab: "पंजाब",
    rajasthan: "राजस्थान",
    sikkim: "सिक्किम",
    "tamil nadu": "तमिलनाडु",
    telangana: "तेलंगाना",
    tripura: "त्रिपुरा",
    "uttar pradesh": "उत्तर प्रदेश",
    uttarakhand: "उत्तराखंड",
    "west bengal": "पश्चिम बंगाल",
    india: "भारत",
  };

  const key = stateName.toLowerCase().trim();
  return regionTrans[key] || stateName;
}

export function translateThemeName(theme: string | null | undefined, lang: Lang): string {
  if (lang === "en" || !theme || typeof theme !== "string") return theme || "";

  const themeTrans: Record<string, string> = {
    heritage: "धरोहर",
    innovation: "नवाचार",
    sustainability: "सतत विकास",
    science: "विज्ञान",
    culture: "संस्कृति",
    environment: "पर्यावरण",
    food: "खान-पान",
    festival: "त्योहार",
    festivals: "त्योहार",
    freedom: "स्वतंत्रता",
    "freedom fighters": "स्वतंत्रता सेनानी",
    history: "इतिहास",
    architecture: "वास्तुकला",
    art: "कला",
    spirituality: "आध्यात्मिकता",
    technology: "प्रौद्योगिकी",
    wildlife: "वन्यजीव",
    literature: "साहित्य",
    all: "सभी",
  };

  const key = theme.toLowerCase().trim();
  return themeTrans[key] || theme;
}