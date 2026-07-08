import { useEffect, useSyncExternalStore } from "react";

import type { Story } from "@/components/site/StoryCard";
import { fetchStoriesCatalogue } from "@/lib/stories-api";

type StoriesDataState = {
  stories: Story[];
  categories: readonly string[];
  loading: boolean;
  error: string | null;
};

function normalizeStory(raw: Record<string, unknown>): Story {
  const getString = (value: unknown, fallback = "") =>
    typeof value === "string" ? value : fallback;

  return {
    id: getString(raw.id),
    slug: getString(raw.slug),
    title: getString(raw.title),
    excerpt: getString(raw.excerpt),
    category: getString(raw.category) || "All",
    region: getString(raw.region) || "India",
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
  };
}

let initialStories: Story[] = [];
let initialCategories: string[] = [
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
    const fallbackJson = (await import("@/../stories-backup.json")).default;
    initialStories = (fallbackJson.stories || []).map((s: Record<string, unknown>) =>
      normalizeStory(s),
    );
    const fallbackCategories = (fallbackJson.categories as string[]) || [];
    initialCategories = fallbackCategories.length
      ? ["All", ...fallbackCategories]
      : initialCategories;
  } catch (e) {
    console.error("Failed to load initial server fallback stories:", e);
  }
} else if (
  typeof window !== "undefined" &&
  (window as unknown as Record<string, { stories: Story[]; categories: string[] }>).__STORIES_DATA__
) {
  initialStories = (window as unknown as Record<string, { stories: Story[]; categories: string[] }>)
    .__STORIES_DATA__.stories;
  initialCategories = (
    window as unknown as Record<string, { stories: Story[]; categories: string[] }>
  ).__STORIES_DATA__.categories;
}

export const stories: Story[] = [...initialStories];
export const categories: string[] = [...initialCategories];

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

function replaceData(nextStories: Story[], nextCategories: readonly string[]) {
  if (nextStories.length > 0) {
    stories.splice(0, stories.length, ...nextStories);
  }
  if (nextCategories.length > 0) {
    categories.splice(0, categories.length, ...nextCategories);
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
      categories: [...categories],
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
      categories: [...initialCategories],
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
      replaceData(catalogue.stories, catalogue.categories);
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
