import { useEffect, useSyncExternalStore } from "react";

import type { Story } from "@/components/site/StoryCard";
import { fetchStoriesCatalogue } from "@/lib/stories-api";

type StoriesDataState = {
  stories: Story[];
  themes: readonly string[];
  /** @deprecated Use themes */
  categories: readonly string[];
  loading: boolean;
  error: string | null;
};

const STATE_KEYWORDS = [
  { name: "Andhra Pradesh", keywords: ["andhra", "hyderabad", "tirupati", "आंध्र"] },
  { name: "Arunachal Pradesh", keywords: ["arunachal", "itanagar", "अरुणाचल"] },
  { name: "Assam", keywords: ["assam", "guwahati", "dispur", "असम"] },
  { name: "Bihar", keywords: ["bihar", "patna", "nalanda", "बिहार", "पटना"] },
  { name: "Chhattisgarh", keywords: ["chhattisgarh", "raipur", "छत्तीसगढ़"] },
  { name: "Goa", keywords: ["goa", "panaji", "गोवा"] },
  { name: "Gujarat", keywords: ["gujarat", "ahmedabad", "gandhinagar", "गुजरात"] },
  { name: "Haryana", keywords: ["haryana", "gurugram", "panipat", "हरियाणा"] },
  { name: "Himachal Pradesh", keywords: ["himachal", "shimla", "manali", "हिमाचल"] },
  { name: "Jammu and Kashmir", keywords: ["kashmir", "srinagar", "jammu", "जम्मू", "कश्मीर"] },
  { name: "Jharkhand", keywords: ["jharkhand", "ranchi", "झारखंड"] },
  { name: "Karnataka", keywords: ["karnataka", "bengaluru", "bangalore", "कर्नाटक", "बेंगलुरु"] },
  { name: "Kerala", keywords: ["kerala", "kochi", "केरल"] },
  { name: "Madhya Pradesh", keywords: ["madhya pradesh", "bhopal", "indore", "मध्य प्रदेश"] },
  { name: "Maharashtra", keywords: ["maharashtra", "mumbai", "pune", "महाराष्ट्र", "मुंबई", "पुणे"] },
  { name: "Manipur", keywords: ["manipur", "मणिपुर"] },
  { name: "Meghalaya", keywords: ["meghalaya", "shillong", "मेघालय"] },
  { name: "Mizoram", keywords: ["mizoram", "मिजोरम"] },
  { name: "Nagaland", keywords: ["nagaland", "नागालैंड"] },
  { name: "Odisha", keywords: ["odisha", "bhubaneswar", "ओडिशा", "उड़ीसा"] },
  { name: "Punjab", keywords: ["punjab", "amritsar", "पंजाब"] },
  { name: "Rajasthan", keywords: ["rajasthan", "jaipur", "udaipur", "राजस्थान", "जयपुर"] },
  { name: "Sikkim", keywords: ["sikkim", "gangtok", "सिक्किम"] },
  { name: "Tamil Nadu", keywords: ["tamil nadu", "chennai", "तमिलनाडु", "चेन्नई"] },
  { name: "Telangana", keywords: ["telangana", "hyderabad", "तेलंगाना"] },
  { name: "Tripura", keywords: ["tripura", "त्रिपुरा"] },
  { name: "Uttar Pradesh", keywords: ["uttar pradesh", "lucknow", "varanasi", "उत्तर प्रदेश", "यूपी"] },
  { name: "Uttarakhand", keywords: ["uttarakhand", "dehradun", "उत्तराखंड"] },
  { name: "West Bengal", keywords: ["bengal", "kolkata", "पश्चिम बंगाल", "बंगाल"] },
  { name: "Delhi", keywords: ["delhi", "दिल्ली"] },
  { name: "Chandigarh", keywords: ["chandigarh", "चंडीगढ़"] },
  { name: "Puducherry", keywords: ["puducherry", "पुडुचेरी"] },
  { name: "Lakshadweep", keywords: ["lakshadweep", "लक्षद्वीप"] },
  { name: "Andaman and Nicobar Islands", keywords: ["andaman", "अंडमान"] }
];

export function geocodeStoryRegion(title: string, excerpt: string, content: string, fallbackIndex = 0): string {
  const text = `${title} ${excerpt} ${content}`.toLowerCase();
  for (const config of STATE_KEYWORDS) {
    if (config.keywords.some(kw => text.includes(kw))) {
      return config.name;
    }
  }
  const fallbackStates = [
    "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat", "Rajasthan", "Uttar Pradesh", "West Bengal",
    "Madhya Pradesh", "Bihar", "Kerala", "Assam", "Odisha", "Punjab", "Haryana", "Andhra Pradesh"
  ];
  return fallbackStates[fallbackIndex % fallbackStates.length];
}

const getDeterministicSeed = (str: string) => {
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    sum += str.charCodeAt(i);
  }
  return sum;
};

function normalizeStory(raw: Record<string, unknown>): Story {
  const getString = (value: unknown, fallback = "") =>
    typeof value === "string" ? value : fallback;

  const rawTitle = getString(raw.title);
  const rawExcerpt = getString(raw.excerpt);
  const rawContent = getString(raw.content);
  const rawRegion = getString(raw.region);

  const region = (!rawRegion || rawRegion.toLowerCase() === "india")
    ? geocodeStoryRegion(rawTitle, rawExcerpt, rawContent, getDeterministicSeed(rawTitle || "default"))
    : rawRegion;

  return {
    id: getString(raw.id),
    slug: getString(raw.slug),
    title: rawTitle,
    excerpt: rawExcerpt,
    themes: Array.isArray(raw.themes)
      ? raw.themes.map(String)
      : typeof raw.category === "string" && raw.category
        ? [raw.category]
        : typeof raw.theme === "string" && raw.theme
          ? [raw.theme]
          : [],
    region,
    readTime: getString(raw.readTime),
    image: typeof raw.image === "string" && raw.image.trim() ? raw.image : undefined,
    imageAlt: typeof raw.imageAlt === "string" && raw.imageAlt.trim() ? raw.imageAlt : undefined,
    content: typeof raw.content === "string" && raw.content.length ? raw.content : undefined,
    url: getString(raw.url) || getString(raw.slug),
    gradient: typeof raw.gradient === "string" ? raw.gradient : undefined,
    titleHi: getString(raw.titleHi) || undefined,
    excerptHi: getString(raw.excerptHi) || undefined,
    contentHi: getString(raw.contentHi) || undefined,
    authorName: getString(raw.authorName) || undefined,
    authorBio: getString(raw.authorBio) || undefined,
    authorAvatar: getString(raw.authorAvatar) || undefined,
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    viewCount: typeof raw.viewCount === "number" ? raw.viewCount : 0,
    publishedAt: getString(raw.publishedAt) || undefined,
    createdAt: getString(raw.createdAt) || undefined,
    featured: !!raw.featured,
    heroOfTheDay: !!raw.heroOfTheDay,
    homepageSlideshow: !!raw.homepageSlideshow,
    slideshowOrder: typeof raw.slideshowOrder === "number" ? raw.slideshowOrder : 0,
    seoKeywords: typeof raw.seoKeywords === "string" ? raw.seoKeywords : null,
  };
}

let initialStories: Story[] = [];
let initialThemes: string[] = [
  "All",
  "Heritage",
  "Innovation",
  "Sustainability",
  "Science",
  "Culture",
  "Environment",
];

if (typeof window === "undefined") {
  try {
    const fallbackJson = (await import("@/../stories-backup.json")).default as any;
    initialStories = (fallbackJson.stories || []).map((s: Record<string, unknown>) =>
      normalizeStory(s),
    );
    const fallbackThemes =
      (fallbackJson.themes as string[]) || (fallbackJson.categories as string[]) || [];
    const normalized = Array.from(new Set(fallbackThemes))
      .filter((t) => t && t !== "All" && t.toLowerCase() !== "general")
      .sort((a, b) => a.localeCompare(b));
    initialThemes = normalized.length ? ["All", ...normalized] : initialThemes;
  } catch (e) {
    console.error("Failed to load initial server fallback stories:", e);
  }
} else if (
  typeof window !== "undefined" &&
  (
    window as unknown as Record<
      string,
      { stories: Story[]; themes: string[]; categories?: string[] }
    >
  ).__STORIES_DATA__
) {
  const windowData = (
    window as unknown as Record<
      string,
      { stories: Story[]; themes: string[]; categories?: string[] }
    >
  ).__STORIES_DATA__;
  initialStories = windowData.stories;
  initialThemes = windowData.themes || windowData.categories || [];
}

export const stories: Story[] = [...initialStories];
export const themes: string[] = [...initialThemes];
/** @deprecated Use `themes` instead — kept for backward compatibility */
export const categories: string[] = themes;

const listeners = new Set<() => void>();
let loadPromise: Promise<void> | null = null;
let hasLoadedRemote = false;
let error: string | null = null;

let cachedSnapshot: StoriesDataState | null = null;
let cachedServerSnapshot: StoriesDataState | null = null;

function emit() {
  cachedSnapshot = null;
  for (const listener of listeners) {
    listener();
  }
}

function replaceData(nextStories: Story[], nextThemes: readonly string[]) {
  if (nextStories.length > 0) {
    stories.splice(0, stories.length, ...nextStories);
  }
  if (nextThemes.length > 0) {
    themes.splice(0, themes.length, ...nextThemes);
  }
  hasLoadedRemote = true;
  error = null;
  emit();
}

function setError(message: string) {
  error = message;
  emit();
}

function getSnapshot(): StoriesDataState {
  if (!cachedSnapshot) {
    cachedSnapshot = {
      stories: [...stories],
      themes: [...themes],
      categories: [...themes],
      loading: !hasLoadedRemote && !error,
      error,
    };
  }
  return cachedSnapshot;
}

function getServerSnapshot(): StoriesDataState {
  if (!cachedServerSnapshot) {
    cachedServerSnapshot = {
      stories: [...initialStories],
      themes: [...initialThemes],
      categories: [...initialThemes],
      loading: false,
      error: null,
    };
  }
  return cachedServerSnapshot;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function loadStoriesData(force = false): Promise<void> {
  if (!force && (hasLoadedRemote || loadPromise)) {
    return loadPromise ?? Promise.resolve();
  }

  loadPromise = (async () => {
    try {
      const catalogue = await fetchStoriesCatalogue();
      replaceData(catalogue.stories, catalogue.themes);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to load stories";
      setError(message);
      hasLoadedRemote = true;
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
}

export function useStoriesData(): StoriesDataState {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    void loadStoriesData();
  }, []);

  return state;
}

if (typeof window !== "undefined") {
  void loadStoriesData();
  const channel = new BroadcastChannel("isp-stories-updates");
  channel.onmessage = () => {
    void loadStoriesData(true);
  };
}
