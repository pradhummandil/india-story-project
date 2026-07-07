import type { Story } from "@/components/site/StoryCard";

export type StoriesCatalogueResponse = {
  stories: Story[];
  categories: readonly string[];
  fetchedAt: string;
};

type StoryListResponse = {
  stories?: Array<Record<string, unknown>>;
  total?: number;
  page?: number;
  pageSize?: number;
  pageCount?: number;
};

type CategoryPayload = string[] | Array<{ name?: string; slug?: string }> | undefined | null;

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

function normalizeCategories(payload: CategoryPayload): readonly string[] {
  if (!Array.isArray(payload)) return [];

  if (payload.every((entry) => typeof entry === "string")) {
    return payload as string[];
  }

  return payload
    .map((entry) => {
      if (typeof entry === "object" && entry && "name" in entry && typeof entry.name === "string") {
        return entry.name;
      }
      return undefined;
    })
    .filter((entry): entry is string => Boolean(entry));
}

async function fetchAllStories(): Promise<Story[]> {
  const stories: Story[] = [];
  const pageSize = 60;

  for (let page = 1; ; page += 1) {
    const payload = (await requestJson(`/api/stories?page=${page}&pageSize=${pageSize}`)) as StoryListResponse;
    const pageStories = Array.isArray(payload.stories) ? payload.stories : [];
    stories.push(...pageStories.map((story) => mapStory(story as Record<string, unknown>)));

    if (page >= (payload.pageCount ?? 1) || pageStories.length === 0) {
      break;
    }
  }

  return stories;
}

export async function fetchStoriesCatalogue(): Promise<StoriesCatalogueResponse> {
  const [stories, categoriesPayload] = await Promise.all([
    fetchAllStories(),
    requestJson("/api/categories").catch(() => []),
  ]);

  const categories = normalizeCategories(categoriesPayload as CategoryPayload);

  return {
    stories,
    categories: categories.length ? ["All", ...categories] : ["All", "कहानी"],
    fetchedAt: new Date().toISOString(),
  };
}
