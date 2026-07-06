import type { Story } from "@/components/site/StoryCard";

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

  // Extra fields may exist in the generated JSON (author, publishDate, ...)
  [key: string]: unknown;
};

type StoriesJson = {
  fetchedAt?: string;
  categories?: readonly string[];
  stories: RawStory[];
};

// Phase 1: removed runtime dependency on stories.json.
// Until DB endpoints are fully wired, this module provides empty defaults
// so the UI does not silently fall back to legacy content.

const RAW = rawJson as unknown as StoriesJson;

const getStr = (v: unknown): string => (typeof v === "string" ? v : "");

export const stories: Story[] = (RAW.stories ?? []).map((s) => {
  const id = getStr(s.id);
  const slug = getStr(s.slug);

  return {
    id,
    slug,
    title: getStr(s.title),
    excerpt: getStr(s.excerpt),
    category: getStr(s.category) || "All",
    region: getStr(s.region) || "India",
    readTime: getStr(s.readTime),
    image: typeof s.image === "string" && s.image.trim() ? s.image : undefined,
    imageAlt: typeof s.imageAlt === "string" && s.imageAlt.trim() ? s.imageAlt : undefined,
    content: typeof s.content === "string" && s.content.length ? s.content : undefined,
    url: (typeof s.url === "string" && s.url.trim()) || slug,
  };
});

export const categories: readonly string[] = (RAW.categories as readonly string[] | undefined) ?? [
  "All",
  "कहानी",
];
