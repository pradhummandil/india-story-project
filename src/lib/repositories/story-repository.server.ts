import { StoryStatus } from "@prisma/client";
import type { Category, State, Story, StoryImage, Author, Tag } from "@prisma/client";
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
  titleHi?: string | null;
  excerptHi?: string | null;
  contentHi?: string | null;
  authorName?: string;
  authorBio?: string | null;
  authorAvatar?: string | null;
  tags?: string[];
  publishedAt?: Date | null;
  createdAt?: Date;
  viewCount?: number;
  featured?: boolean;
  heroOfTheDay?: boolean;
};

// Projections: Select specific columns to reduce egress (exclude content/contentHi in lists)
const storyCardSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  titleHi: true,
  excerptHi: true,
  viewCount: true,
  readingTime: true,
  publishedAt: true,
  createdAt: true,
  featured: true,
  heroOfTheDay: true,
  status: true,
  categoryId: true,
  stateId: true,
  authorId: true,
  themeId: true,
  category: { select: { id: true, name: true, slug: true } },
  state: { select: { id: true, name: true, slug: true } },
  author: { select: { id: true, name: true, bio: true, avatar: true } },
  tags: {
    include: {
      tag: true,
    },
  },
  images: {
    orderBy: { sortOrder: "asc" as any },
    select: { id: true, imageUrl: true, caption: true, heroImage: true },
  },
};

const storyDetailIncludes = {
  category: true,
  state: true,
  author: true,
  tags: {
    include: {
      tag: true,
    },
  },
  images: {
    orderBy: [{ heroImage: "desc" as const }, { sortOrder: "asc" as const }],
  },
};

function formatReadTime(readingTime: number | null) {
  return readingTime != null && readingTime > 0 ? `${readingTime} min read` : "";
}

function toStoryCardCompatible(story: any): StoryCardCompatible {
  const image = story.images[0] ?? null;

  return {
    id: story.id,
    slug: story.slug,
    title: story.title,
    excerpt: story.excerpt,
    category: story.category?.name ?? "All",
    region: story.state?.name ?? "India",
    readTime: formatReadTime(story.readingTime),
    image: image?.imageUrl,
    imageAlt: image?.caption ?? undefined,
    url: story.slug,
    content: story.content, // undefined or populated depending on select
    titleHi: story.titleHi,
    excerptHi: story.excerptHi,
    contentHi: story.contentHi,
    authorName: story.author?.name,
    authorBio: story.author?.bio,
    authorAvatar: story.author?.avatar,
    tags: story.tags?.map((t: any) => t.tag.name) ?? [],
    publishedAt: story.publishedAt,
    createdAt: story.createdAt,
    viewCount: story.viewCount,
    featured: story.featured,
    heroOfTheDay: story.heroOfTheDay,
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
      include: storyDetailIncludes,
    });

    return story ? toStoryCardCompatible(story) : null;
  }

  async listPublished(limit?: number): Promise<StoryCardCompatible[]> {
    const stories = await this.db.story.findMany({
      where: {
        status: StoryStatus.Published,
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: storyCardSelect,
      ...(limit ? { take: limit } : {}),
    });

    return stories.map(toStoryCardCompatible);
  }

  async findPublishedPaginated(options: {
    query?: string;
    category?: string;
    region?: string;
    author?: string;
    tag?: string;
    sortBy?: string;
    page: number;
    pageSize: number;
  }): Promise<{ stories: StoryCardCompatible[]; total: number }> {
    const where: any = { status: StoryStatus.Published };

    if (options.category && options.category.toLowerCase() !== "all") {
      where.category = {
        OR: [
          { slug: { equals: options.category, mode: "insensitive" } },
          { name: { equals: options.category, mode: "insensitive" } },
        ],
      };
    }
    if (options.region) {
      where.state = {
        OR: [
          { slug: { equals: options.region, mode: "insensitive" } },
          { name: { equals: options.region, mode: "insensitive" } },
        ],
      };
    }
    if (options.author) {
      where.author = { name: { equals: options.author, mode: "insensitive" } };
    }
    if (options.query) {
      const q = options.query;
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
        { category: { name: { contains: q, mode: "insensitive" } } },
        { state: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    let orderBy: any = [{ publishedAt: "desc" }, { createdAt: "desc" }];
    if (options.sortBy === "views") {
      orderBy = [{ viewCount: "desc" }, { publishedAt: "desc" }];
    } else if (options.sortBy === "title") {
      orderBy = [{ title: "asc" }];
    }

    const [stories, total] = await Promise.all([
      this.db.story.findMany({
        where,
        orderBy,
        skip: (options.page - 1) * options.pageSize,
        take: options.pageSize,
        select: storyCardSelect,
      }),
      this.db.story.count({ where }),
    ]);

    return {
      stories: stories.map(toStoryCardCompatible),
      total,
    };
  }

  async listFeatured(limit = 3): Promise<StoryCardCompatible[]> {
    const stories = await this.db.story.findMany({
      where: {
        status: StoryStatus.Published,
        featured: true,
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: limit,
      select: storyCardSelect,
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
      select: storyCardSelect,
    });

    return story ? toStoryCardCompatible(story) : null;
  }
}

export const storyRepository = new StoryRepository();
export { toStoryCardCompatible, storyCardSelect };
