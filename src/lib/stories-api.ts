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

function mapStory(raw: Record<string, unknown>): Story {
  const getString = (value: unknown, fallback = "") =>
    typeof value === "string" ? value : fallback;

  return {
    id: getString(raw.id),
    slug: getString(raw.slug),
    title: getString(raw.title),
    excerpt: getString(raw.excerpt),
    themes: Array.isArray(raw.themes)
      ? raw.themes.map(String)
      : typeof raw.category === "string" && raw.category
        ? [raw.category]
        : typeof raw.theme === "string" && raw.theme
          ? [raw.theme]
          : [],
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

async function fetchAllStories(): Promise<Story[]> {
  const stories: Story[] = [];
  const pageSize = 60;

  for (let page = 1; ; page += 1) {
    const payload = (await requestJson(
      `/api/stories?page=${page}&pageSize=${pageSize}`,
    )) as StoryListResponse;
    const pageStories = Array.isArray(payload.stories) ? payload.stories : [];
    stories.push(...pageStories.map((story) => mapStory(story as Record<string, unknown>)));

    if (page >= (payload.pageCount ?? 1) || pageStories.length === 0) {
      break;
    }
  }

  return stories;
}

export async function fetchStoriesCatalogue(): Promise<StoriesCatalogueResponse> {
  const [stories, themesPayload] = await Promise.all([
    fetchAllStories(),
    requestJson("/api/themes").catch(() => []),
  ]);

  const themes = normalizeThemes(themesPayload as ThemePayload);

  return {
    stories,
    themes: themes.length ? ["All", ...themes] : ["All", "कहानी"],
    fetchedAt: new Date().toISOString(),
  };
}
