import { StoryStatus } from "@/generated/prisma/client.ts";
import type { Category, State, Story, StoryImage } from "@/generated/prisma/client.ts";

import { prisma } from "./prisma.server";

export type StoryCardCompatible = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  region: string;
  readTime: string;
  image?: string;
  imageAlt?: string;
  url: string;
  content?: string;
  gradient?: string;
};

type StoryWithDisplayRelations = Story & {
  category: Category;
  state: State;
  images: StoryImage[];
};

const storyIncludes = {
  category: true,
  state: true,
  images: {
    orderBy: [{ heroImage: "desc" as const }, { sortOrder: "asc" as const }],
  },
};

function formatReadTime(readingTime: number | null) {
  return readingTime != null && readingTime > 0 ? `${readingTime} min read` : "";
}

function toStoryCardCompatible(story: StoryWithDisplayRelations): StoryCardCompatible {
  const image = story.images[0] ?? null;

  return {
    id: story.id,
    slug: story.slug,
    title: story.title,
    excerpt: story.excerpt,
    category: story.category.name,
    region: story.state.name,
    readTime: formatReadTime(story.readingTime),
    image: image?.imageUrl,
    imageAlt: image?.caption ?? undefined,
    url: story.slug,
    content: story.content,
  };
}

export class StoryRepository {
  constructor(private readonly db = prisma) {}

  async findPublishedBySlug(slug: string): Promise<StoryCardCompatible | null> {
    const story = await this.db.story.findFirst({
      where: {
        slug,
        status: StoryStatus.Published,
      },
      include: storyIncludes,
    });

    return story ? toStoryCardCompatible(story) : null;
  }

  async listPublished(): Promise<StoryCardCompatible[]> {
    const stories = await this.db.story.findMany({
      where: {
        status: StoryStatus.Published,
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      include: storyIncludes,
    });

    return stories.map(toStoryCardCompatible);
  }

  async listFeatured(limit = 3): Promise<StoryCardCompatible[]> {
    const stories = await this.db.story.findMany({
      where: {
        status: StoryStatus.Published,
        featured: true,
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: limit,
      include: storyIncludes,
    });

    return stories.map(toStoryCardCompatible);
  }

  async findHeroOfTheDay(): Promise<StoryCardCompatible | null> {
    const story = await this.db.story.findFirst({
      where: {
        status: StoryStatus.Published,
        heroOfTheDay: true,
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      include: storyIncludes,
    });

    return story ? toStoryCardCompatible(story) : null;
  }
}

export const storyRepository = new StoryRepository();
