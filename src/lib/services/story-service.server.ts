import {
  StoryRepository,
  storyRepository,
  type StoryCardCompatible,
} from "@/lib/repositories/story-repository.server";

export type StoryListFilters = {
  query?: string;
  category?: string;
  region?: string;
  author?: string;
  tag?: string;
  sortBy?: string;
};

export type StoryPagination = {
  page?: number;
  pageSize?: number;
};

export type StoryListOptions = StoryListFilters & StoryPagination;

export type PaginatedStories = {
  stories: StoryCardCompatible[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 60;

function normalize(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function normalizePage(value: number | undefined) {
  return Number.isInteger(value) && value != null && value > 0 ? value : DEFAULT_PAGE;
}

function normalizePageSize(value: number | undefined) {
  if (!Number.isInteger(value) || value == null || value <= 0) return DEFAULT_PAGE_SIZE;
  return Math.min(value, MAX_PAGE_SIZE);
}

function paginate(stories: StoryCardCompatible[], pagination: StoryPagination): PaginatedStories {
  const page = normalizePage(pagination.page);
  const pageSize = normalizePageSize(pagination.pageSize);
  const pageCount = Math.max(1, Math.ceil(stories.length / pageSize));
  const start = (Math.min(page, pageCount) - 1) * pageSize;

  return {
    stories: stories.slice(start, start + pageSize),
    total: stories.length,
    page: Math.min(page, pageCount),
    pageSize,
    pageCount,
  };
}

function matchesFilters(story: StoryCardCompatible, filters: StoryListFilters) {
  const query = normalize(filters.query);
  const category = normalize(filters.category);
  const region = normalize(filters.region);
  const author = filters.author?.trim().toLowerCase();
  const tag = filters.tag?.trim().toLowerCase();

  const matchesQuery =
    !query ||
    story.title.toLowerCase().includes(query) ||
    story.excerpt.toLowerCase().includes(query) ||
    story.category.toLowerCase().includes(query) ||
    story.region.toLowerCase().includes(query) ||
    (story.content?.toLowerCase().includes(query) ?? false);

  const matchesCategory =
    !category || category === "all" || story.category.toLowerCase() === category;
  const matchesRegion = !region || story.region.toLowerCase() === region;
  const matchesAuthor = !author || story.authorName?.toLowerCase() === author;
  const matchesTag = !tag || (story.tags && story.tags.some((t) => t.toLowerCase() === tag));

  return matchesQuery && matchesCategory && matchesRegion && matchesAuthor && matchesTag;
}

function recommendationScore(base: StoryCardCompatible, candidate: StoryCardCompatible) {
  let score = 0;
  if (candidate.category === base.category) score += 4;
  if (candidate.region === base.region) score += 2;
  if (candidate.title.toLowerCase().includes(base.category.toLowerCase())) score += 1;
  return score;
}

export class StoryService {
  constructor(private readonly stories = storyRepository) {}

  async getPublishedStories(options: StoryListOptions = {}): Promise<PaginatedStories> {
    const stories = await this.stories.listPublished();
    const filtered = stories.filter((story) => matchesFilters(story, options));

    // Sort options: newest / oldest / views / readTime
    if (options.sortBy === "oldest") {
      filtered.sort((a, b) => {
        const d1 = a.publishedAt
          ? new Date(a.publishedAt).getTime()
          : a.createdAt
            ? new Date(a.createdAt).getTime()
            : 0;
        const d2 = b.publishedAt
          ? new Date(b.publishedAt).getTime()
          : b.createdAt
            ? new Date(b.createdAt).getTime()
            : 0;
        return d1 - d2;
      });
    } else if (options.sortBy === "views") {
      filtered.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    } else if (options.sortBy === "readTime") {
      filtered.sort((a, b) => {
        const t1 = parseInt(a.readTime) || 0;
        const t2 = parseInt(b.readTime) || 0;
        return t2 - t1; // Longest read first
      });
    } else {
      // Default: newest
      filtered.sort((a, b) => {
        const d1 = a.publishedAt
          ? new Date(a.publishedAt).getTime()
          : a.createdAt
            ? new Date(a.createdAt).getTime()
            : 0;
        const d2 = b.publishedAt
          ? new Date(b.publishedAt).getTime()
          : b.createdAt
            ? new Date(b.createdAt).getTime()
            : 0;
        return d2 - d1;
      });
    }

    return paginate(filtered, options);
  }

  async getStoryBySlug(slug: string): Promise<StoryCardCompatible | null> {
    return this.stories.findPublishedBySlug(slug);
  }

  async getFeaturedStories(limit = 3): Promise<StoryCardCompatible[]> {
    return this.stories.listFeatured(limit);
  }

  async getHeroOfTheDay(): Promise<StoryCardCompatible | null> {
    return this.stories.findHeroOfTheDay();
  }

  async getLatestStories(limit = 6): Promise<StoryCardCompatible[]> {
    const stories = await this.stories.listPublished();
    return stories.slice(0, Math.max(0, limit));
  }

  async searchStories(query: string, pagination: StoryPagination = {}): Promise<PaginatedStories> {
    return this.getPublishedStories({ ...pagination, query });
  }

  async getRecommendedStories(slug: string, limit = 3): Promise<StoryCardCompatible[]> {
    const base = await this.stories.findPublishedBySlug(slug);
    if (!base) return [];

    const stories = await this.stories.listPublished();
    return stories
      .filter((story) => story.slug !== base.slug)
      .map((story) => ({ story, score: recommendationScore(base, story) }))
      .sort(
        (left, right) =>
          right.score - left.score || left.story.title.localeCompare(right.story.title),
      )
      .slice(0, Math.max(0, limit))
      .map(({ story }) => story);
  }
}

export const storyService = new StoryService();
