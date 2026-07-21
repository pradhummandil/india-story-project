import {
  StoryRepository,
  storyRepository,
  type StoryCardCompatible,
  toStoryCardCompatible,
  storyCardSelect,
} from "@/lib/repositories/story-repository.server";
import { StoryStatus } from "@prisma/client";
import { prisma } from "../repositories/prisma.server";

export type StoryListFilters = {
  query?: string;
  theme?: string;
  region?: string;
  author?: string;
  tag?: string;
  sortBy?: string;
  district?: string;
  language?: string;
  readTime?: string;
  era?: string;
  collection?: string;
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

function recommendationScore(base: StoryCardCompatible, candidate: StoryCardCompatible) {
  let score = 0;
  const sharedThemes = candidate.themes.filter((t) => base.themes.includes(t));
  score += sharedThemes.length * 2;
  if (candidate.region === base.region) score += 2;
  return score;
}

export class StoryService {
  constructor(private readonly stories = storyRepository) {}

  async getStoryBySlug(slug: string): Promise<StoryCardCompatible | null> {
    return this.stories.findPublishedBySlug(slug);
  }

  async getPublishedStories(options: StoryListOptions = {}): Promise<PaginatedStories> {
    const page = options.page && options.page > 0 ? options.page : DEFAULT_PAGE;
    const pageSize =
      options.pageSize && options.pageSize > 0
        ? Math.min(options.pageSize, MAX_PAGE_SIZE)
        : DEFAULT_PAGE_SIZE;

    const { stories, total } = await this.stories.findPublishedPaginated({
      query: options.query,
      theme: options.theme,
      region: options.region,
      author: options.author,
      tag: options.tag,
      sortBy: options.sortBy,
      page,
      pageSize,
      district: options.district,
      language: options.language,
      readTime: options.readTime,
      era: options.era,
      collection: options.collection,
    });

    return {
      stories,
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize),
    };
  }

  async getFeaturedStories(limit = 3): Promise<StoryCardCompatible[]> {
    return this.stories.listFeatured(limit);
  }

  async getLatestStories(limit = 6): Promise<StoryCardCompatible[]> {
    return this.stories.listPublished(limit);
  }

  async searchStories(query: string, pagination: StoryPagination = {}): Promise<PaginatedStories> {
    return this.getPublishedStories({ ...pagination, query });
  }

  async getRecommendedStories(slug: string, limit = 3): Promise<StoryCardCompatible[]> {
    const base = await this.stories.findPublishedBySlug(slug);
    if (!base) return [];

    // Query database directly for candidates matching same theme or region
    const candidates = await prisma.story.findMany({
      where: {
        status: StoryStatus.Published,
        slug: { not: slug },
        OR: [
          { themes: { some: { theme: { name: { in: base.themes } } } } },
          { state: { name: base.region } },
        ],
      },
      take: limit * 4,
      select: storyCardSelect,
    });

    const candidateCards = candidates.map(toStoryCardCompatible);
    return candidateCards
      .map((story) => ({ story, score: recommendationScore(base, story) }))
      .sort((a, b) => b.score - a.score || a.story.title.localeCompare(b.story.title))
      .slice(0, limit)
      .map(({ story }) => story);
  }
}

export const storyService = new StoryService();
