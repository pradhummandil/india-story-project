import { StoryStatus } from "@prisma/client";
import type { State, Story, StoryImage, Author, Tag } from "@prisma/client";
import { prisma } from "./prisma.server";
import { normalizeStateName, stateNameToSlug } from "../utils/state-normalizer";

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
  homepageSlideshow?: boolean;
  slideshowOrder?: number;
  seoKeywords?: string | null;
  authorId?: string;
};

// Projections: Select specific columns to reduce egress (exclude content/contentHi/themes/tags in lists)
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
  homepageSlideshow: true,
  slideshowOrder: true,
  seoKeywords: true,
  status: true,
  stateId: true,
  authorId: true,
  state: { select: { id: true, name: true, slug: true } },
  author: { select: { id: true, name: true, bio: true, avatar: true } },
  images: {
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

function isDevanagari(str?: string | null) {
  return /[\u0900-\u097F]/.test(str || "");
}

function slugToEnglishTitle(slug?: string | null) {
  if (!slug) return "Story";
  return slug
    .replace(/-\d+$/, "")
    .split("-")
    .map((w) =>
      ["of", "the", "in", "a", "an", "to", "for", "and", "on", "with", "by"].includes(w)
        ? w
        : w.charAt(0).toUpperCase() + w.slice(1),
    )
    .join(" ")
    .replace(/^./, (c) => c.toUpperCase());
}

function toStoryCardCompatible(story: any): StoryCardCompatible {
  const image = story.images?.[0] ?? null;

  let title = story.title;
  let titleHi = story.titleHi;
  if (isDevanagari(title)) {
    titleHi = titleHi || title;
    title = slugToEnglishTitle(story.slug);
  }

  let excerpt = story.excerpt;
  let excerptHi = story.excerptHi;
  if (isDevanagari(excerpt)) {
    excerptHi = excerptHi || excerpt;
    excerpt = `${title} — Documenting grassroots stories and unsung heroes across India.`;
  }

  let content = story.content;
  let contentHi = story.contentHi;
  if (content && isDevanagari(content)) {
    contentHi = contentHi || content;
    content = `${title}\n\n${excerpt}\n\nThis story documents impactful grassroots change in India. Toggle language options to view the complete Hindi text.`;
  }

  return {
    id: story.id,
    slug: story.slug,
    title,
    excerpt,
    themes: story.themeNames ?? story.themes?.map((t: any) => t.theme?.name).filter(Boolean) ?? [],
    region: story.state?.name ?? "India",
    readTime: formatReadTime(story.readingTime),
    image: image?.imageUrl,
    imageAlt: image?.caption ?? undefined,
    url: story.slug,
    content,
    titleHi,
    excerptHi,
    contentHi,
    authorName: story.author?.name,
    authorBio: story.author?.bio,
    authorAvatar: story.author?.avatar,
    tags: story.tagNames ?? story.tags?.map((t: any) => t.tag.name) ?? [],
    publishedAt: story.publishedAt,
    createdAt: story.createdAt,
    viewCount: story.viewCount,
    featured: story.featured,
    homepageSlideshow: story.homepageSlideshow,
    slideshowOrder: story.slideshowOrder,
    seoKeywords: story.seoKeywords,
    authorId: story.authorId,
  };
}

async function populateThemesAndTagsForStories(stories: any[]) {
  if (stories.length === 0) return;
  const storyIds = stories.map((s) => s.id);

  console.time("theme query time");
  const [storyThemes, storyTags] = await Promise.all([
    prisma.storyTheme.findMany({
      where: { storyId: { in: storyIds } },
      select: {
        storyId: true,
        theme: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.storyTag.findMany({
      where: { storyId: { in: storyIds } },
      select: {
        storyId: true,
        tag: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);
  console.timeEnd("theme query time");

  // Group by storyId
  const themesMap = new Map<string, string[]>();
  for (const st of storyThemes) {
    if (st.theme?.name) {
      const list = themesMap.get(st.storyId) || [];
      list.push(st.theme.name);
      themesMap.set(st.storyId, list);
    }
  }

  const tagsMap = new Map<string, string[]>();
  for (const st of storyTags) {
    if (st.tag?.name) {
      const list = tagsMap.get(st.storyId) || [];
      list.push(st.tag.name);
      tagsMap.set(st.storyId, list);
    }
  }

  for (const s of stories) {
    s.themeNames = themesMap.get(s.id) || [];
    s.tagNames = tagsMap.get(s.id) || [];
  }
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

    await populateThemesAndTagsForStories(stories);

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
    district?: string;
    language?: string;
    readTime?: string;
    era?: string;
    collection?: string;
  }): Promise<{ stories: StoryCardCompatible[]; total: number }> {
    const andConditions: any[] = [{ status: StoryStatus.Published }];

    if (options.theme && options.theme.toLowerCase() !== "all") {
      const themeList = options.theme.split(/[ ,+]+/).filter(Boolean);
      if (themeList.length > 0) {
        andConditions.push({
          themes: {
            some: {
              theme: {
                OR: [
                  { slug: { in: themeList, mode: "insensitive" } },
                  { name: { in: themeList, mode: "insensitive" } },
                ],
              },
            },
          },
        });
      }
    }
    if (options.region) {
      const normalizedName = normalizeStateName(options.region);
      const normalizedSlug = stateNameToSlug(options.region);
      andConditions.push({
        state: {
          OR: [
            { slug: { equals: normalizedSlug, mode: "insensitive" } },
            { name: { equals: normalizedName, mode: "insensitive" } },
            { name: { equals: options.region, mode: "insensitive" } },
            { slug: { equals: options.region, mode: "insensitive" } },
          ],
        },
      });
    }
    if (options.author) {
      andConditions.push({
        author: { name: { equals: options.author, mode: "insensitive" } },
      });
    }
    if (options.tag) {
      andConditions.push({
        tags: {
          some: {
            tag: {
              name: { equals: options.tag, mode: "insensitive" },
            },
          },
        },
      });
    }
    if (options.query) {
      const q = options.query;
      andConditions.push({
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { excerpt: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
          { themes: { some: { theme: { name: { contains: q, mode: "insensitive" } } } } },
          { state: { name: { contains: q, mode: "insensitive" } } },
        ],
      });
    }
    if (options.district) {
      const d = options.district;
      andConditions.push({
        OR: [
          { city: { name: { contains: d, mode: "insensitive" } } },
          { state: { name: { contains: d, mode: "insensitive" } } },
        ],
      });
    }
    if (options.language && options.language !== "all") {
      if (options.language === "hi") {
        andConditions.push({ titleHi: { not: null } });
      } else if (options.language === "en") {
        andConditions.push({ title: { not: "" } });
      }
    }
    if (options.readTime && options.readTime !== "all") {
      if (options.readTime === "short") {
        andConditions.push({ readingTime: { lte: 3 } });
      } else if (options.readTime === "medium") {
        andConditions.push({ readingTime: { gte: 4, lte: 6 } });
      } else if (options.readTime === "long") {
        andConditions.push({ readingTime: { gt: 6 } });
      }
    }
    if (options.era) {
      const eraKeywords: Record<string, string[]> = {
        ancient: ["ancient", "harappa", "vedic", "mauryan", "gupta", "chola", "temple", "dynasty"],
        medieval: ["medieval", "delhi sultanate", "mughal", "maratha", "rajput", "vijayanagara"],
        freedom: ["freedom", "independence", "gandhi", "british", "satyagraha", "revolution"],
        modern: ["modern", "nehru", "post-independence", "1950", "1960", "1970", "1980"],
        contemporary: ["contemporary", "today", "digital", "startups", "it hub", "now"],
      };
      const words = eraKeywords[options.era.toLowerCase()] || [];
      if (words.length > 0) {
        andConditions.push({
          OR: [
            ...words.map((w) => ({ title: { contains: w, mode: "insensitive" as const } })),
            ...words.map((w) => ({ excerpt: { contains: w, mode: "insensitive" as const } })),
          ],
        });
      }
    }
    if (options.collection) {
      const collKeywords: Record<string, string[]> = {
        "freedom fighters": ["freedom", "fighter", "independence"],
        "unesco heritage": ["unesco", "heritage", "monument"],
        "indian festivals": ["festival", "festivals", "celebration"],
        "ancient temples": ["temple", "temples", "shrines"],
        "royal kingdoms": ["royal", "kingdom", "palace", "king"],
        "hidden villages": ["village", "villages", "tribe"],
        "folk tales": ["folk", "folklore", "tale", "legend"],
        "indian cuisine": ["cuisine", "food", "dish", "dishes"],
      };
      const words = collKeywords[options.collection.toLowerCase()] || [];
      if (words.length > 0) {
        andConditions.push({
          OR: [
            ...words.map((w) => ({ title: { contains: w, mode: "insensitive" as const } })),
            ...words.map((w) => ({ excerpt: { contains: w, mode: "insensitive" as const } })),
          ],
        });
      }
    }

    const where = { AND: andConditions };

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

    await populateThemesAndTagsForStories(stories);

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

    await populateThemesAndTagsForStories(stories);

    return stories.map(toStoryCardCompatible);
  }

}

export const storyRepository = new StoryRepository();
export { toStoryCardCompatible, storyCardSelect };
