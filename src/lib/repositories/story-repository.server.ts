import { StoryStatus } from "@prisma/client";
import type { State, Story, StoryImage, Author, Tag } from "@prisma/client";
import { prisma } from "./prisma.server";

export type StoryCardCompatible = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  themes: string[];
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
  homepageSlideshow?: boolean;
  slideshowOrder?: number;
  seoKeywords?: string | null;
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
  homepageSlideshow: true,
  slideshowOrder: true,
  seoKeywords: true,
  status: true,
  stateId: true,
  authorId: true,
  state: { select: { id: true, name: true, slug: true } },
  author: { select: { id: true, name: true, bio: true, avatar: true } },
  tags: {
    select: {
      tag: {
        select: {
          name: true,
        },
      },
    },
  },
  themes: {
    select: {
      theme: { select: { id: true, name: true, slug: true } },
    },
  },
  images: {
    // Prefer a hero image if present; otherwise lowest sortOrder.
    orderBy: [{ heroImage: "desc" as any }, { sortOrder: "asc" as any }],
    select: { id: true, imageUrl: true, caption: true, heroImage: true },
    take: 1,
  },
};

const storyDetailSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  content: true,
  publishedAt: true,
  readingTime: true,
  seoTitle: true,
  seoDescription: true,
  featured: true,
  heroOfTheDay: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  contentHi: true,
  excerptHi: true,
  titleHi: true,
  viewCount: true,
  deleted: true,
  homepageSlideshow: true,
  seoKeywords: true,
  slideshowOrder: true,
  state: { select: { id: true, name: true, slug: true } },
  author: { select: { id: true, name: true, bio: true, avatar: true } },
  tags: {
    select: {
      tag: { select: { name: true } },
    },
  },
  themes: {
    select: {
      theme: { select: { id: true, name: true, slug: true } },
    },
  },
  images: {
    orderBy: [{ heroImage: "desc" as const }, { sortOrder: "asc" as const }],
    select: { id: true, imageUrl: true, caption: true, heroImage: true },
  },
};

function formatReadTime(readingTime: number | null) {
  return readingTime != null && readingTime > 0 ? `${readingTime} min read` : "";
}

function toStoryCardCompatible(story: any): StoryCardCompatible {
  const image = story.images?.[0] ?? null;

  return {
    id: story.id,
    slug: story.slug,
    title: story.title,
    excerpt: story.excerpt,
    themes: story.themes?.map((t: any) => t.theme?.name).filter(Boolean) ?? [],
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
    homepageSlideshow: story.homepageSlideshow,
    slideshowOrder: story.slideshowOrder,
    seoKeywords: story.seoKeywords,
  };
}

export class StoryRepository {
  constructor(private readonly db = prisma) {}

  // Temporary debug logs used during incident response; keep query logic unchanged.

  async findPublishedBySlug(slug: string): Promise<StoryCardCompatible | null> {
    const story = await this.db.story.findFirst({
      where: {
        slug,
        status: StoryStatus.Published,
      },
      select: storyDetailSelect,
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
    theme?: string;
    region?: string;
    author?: string;
    tag?: string;
    sortBy?: string;
    page: number;
    pageSize: number;
  }): Promise<{ stories: StoryCardCompatible[]; total: number }> {
    const where: any = { status: StoryStatus.Published };

    if (options.theme && options.theme.toLowerCase() !== "all") {
      const themeList = options.theme.split(/[ ,+]+/).filter(Boolean);
      if (themeList.length > 0) {
        where.themes = {
          some: {
            theme: {
              OR: [
                { slug: { in: themeList, mode: "insensitive" } },
                { name: { in: themeList, mode: "insensitive" } },
              ],
            },
          },
        };
      }
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
    if (options.tag) {
      where.tags = {
        some: {
          tag: {
            name: { equals: options.tag, mode: "insensitive" },
          },
        },
      };
    }
    if (options.query) {
      const q = options.query;
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
        { themes: { some: { theme: { name: { contains: q, mode: "insensitive" } } } } },
        { state: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    let orderBy: any = [{ publishedAt: "desc" }, { createdAt: "desc" }];
    if (options.sortBy === "views") {
      orderBy = [{ viewCount: "desc" }, { publishedAt: "desc" }];
    } else if (options.sortBy === "title") {
      orderBy = [{ title: "asc" }];
    }

    const skip = (options.page - 1) * options.pageSize;
    const take = options.pageSize;

    const [stories, total] = await Promise.all([
      this.db.story.findMany({
        where,
        orderBy,
        skip,
        take,
        select: storyCardSelect,
      }),
      // Exact total for the same filter set.
      this.db.story.count({ where }),
    ]);

    const mappedStories = stories.map(toStoryCardCompatible);

    return {
      // Preserve API response shape
      stories: mappedStories,
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
