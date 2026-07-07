import { useEffect, useSyncExternalStore } from "react";

import type { Story } from "@/components/site/StoryCard";
import { fetchStoriesCatalogue } from "@/lib/stories-api";

import rawJson from "../../stories.json";

type RawStory = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  region: string;
  readTime?: string;
  image?: string;
  imageAlt?: string;
  url?: string;
  content?: string;
  gradient?: string;

  // Extra fields may exist in the generated JSON (author, publishDate, ...)
  [key: string]: unknown;
};

type StoriesJson = {
  fetchedAt?: string;
  categories?: readonly string[];
  stories: RawStory[];
};

type StoriesDataState = {
  stories: Story[];
  categories: readonly string[];
  loading: boolean;
  error: string | null;
};

const RAW = rawJson as unknown as StoriesJson;
const FALLBACK_STORIES = (RAW.stories ?? []).map((story) => normalizeStory(story));
const FALLBACK_CATEGORIES = (RAW.categories as readonly string[] | undefined) ?? ["All", "कहानी"];

export let stories: Story[] = [...FALLBACK_STORIES];
export let categories: string[] = [...FALLBACK_CATEGORIES];

const listeners = new Set<() => void>();
let loadPromise: Promise<void> | null = null;
let hasLoadedRemote = false;
let error: string | null = null;

function normalizeStory(raw: RawStory | Record<string, unknown>): Story {
  const getString = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);

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
  };
}

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function replaceData(nextStories: Story[], nextCategories: readonly string[]) {
  stories.splice(0, stories.length, ...nextStories);
  categories.splice(0, categories.length, ...nextCategories);
  hasLoadedRemote = true;
  error = null;
  emit();
}

function setError(message: string) {
  error = message;
  emit();
}

function getSnapshot(): StoriesDataState {
  return {
    stories: [...stories],
    categories: [...categories],
    loading: !hasLoadedRemote && !error,
    error,
  };
}

function getServerSnapshot(): StoriesDataState {
  return {
    stories: [...FALLBACK_STORIES],
    categories: [...FALLBACK_CATEGORIES],
    loading: false,
    error: null,
  };
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
}
