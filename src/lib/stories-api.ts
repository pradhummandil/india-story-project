import type { Story } from "@/components/site/StoryCard";

export type StoriesCatalogueResponse = {
  stories: Story[];
  themes: readonly string[];
  fetchedAt: string;
};

type StoryListResponse = {
  stories?: Array<Record<string, unknown>>;
  total?: number;
  page?: number;
  pageSize?: number;
  pageCount?: number;
};

type ThemePayload = string[] | Array<{ name?: string; slug?: string }> | undefined | null;

async function requestJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: {
      accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }

  return res.json();
}

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

function geocodeStoryRegion(title: string, excerpt: string, content: string, fallbackIndex = 0): string {
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

function mapStory(raw: Record<string, unknown>): Story {
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
  };
}

function normalizeThemes(payload: ThemePayload): readonly string[] {
  if (!Array.isArray(payload)) return [];

  let list: string[] = [];
  if (payload.every((entry) => typeof entry === "string")) {
    list = payload as string[];
  } else {
    list = payload
      .map((entry) => {
        if (
          typeof entry === "object" &&
          entry &&
          "name" in entry &&
          typeof entry.name === "string"
        ) {
          return entry.name;
        }
        return undefined;
      })
      .filter((entry): entry is string => Boolean(entry));
  }

  const unique = Array.from(new Set(list))
    .filter((t) => t && t !== "All" && t.toLowerCase() !== "general")
    .sort((a, b) => a.localeCompare(b));

  return unique;
}

async function fetchAllStories(existingStories: Story[] = []): Promise<Story[]> {
  const stories: Story[] = [...existingStories];
  const pageSize = 12;
  const startPage =
    existingStories.length > 0 ? Math.floor(existingStories.length / pageSize) + 1 : 1;

  const isServer = typeof window === "undefined";
  const requestType = isServer
    ? "SSR request"
    : existingStories.length > 0
      ? "Background request"
      : "Hydration request";

  for (let page = startPage; ; page += 1) {
    console.log(`[${requestType}] fetching /api/stories page=${page} pageSize=${pageSize}`);
    console.log({
      caller: "stories-api.ts:fetchAllStories",
      page,
      pageSize,
      stack: new Error().stack,
    });

    const payload = (await requestJson(
      `/api/stories?page=${page}&pageSize=${pageSize}`,
    )) as StoryListResponse;
    const pageStories = Array.isArray(payload.stories) ? payload.stories : [];
    
    // Simple deduplication based on slug/id
    for (const raw of pageStories) {
      const mapped = mapStory(raw as Record<string, unknown>);
      if (!stories.some((s) => s.id === mapped.id || s.slug === mapped.slug)) {
        stories.push(mapped);
      }
    }

    if (page >= (payload.pageCount ?? 1) || pageStories.length === 0) {
      break;
    }
  }

  return stories;
}

export async function fetchStoriesCatalogue(existingStories: Story[] = []): Promise<StoriesCatalogueResponse> {
  const [stories, themesPayload] = await Promise.all([
    fetchAllStories(existingStories),
    requestJson("/api/themes").catch(() => []),
  ]);

  const themes = normalizeThemes(themesPayload as ThemePayload);

  return {
    stories,
    themes: themes.length ? ["All", ...themes] : ["All", "Heritage"],
    fetchedAt: new Date().toISOString(),
  };
}
