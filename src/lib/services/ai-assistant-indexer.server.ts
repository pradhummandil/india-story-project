import { prisma } from "@/lib/repositories/prisma.server";
import { StoryStatus } from "@prisma/client";

export interface FormattedStoryPayload {
  id: string;
  slug: string;
  title: string;
  titleHi?: string | null;
  excerpt: string;
  excerptHi?: string | null;
  stateName: string;
  cityName?: string | null;
  authorName: string;
  authorBio?: string | null;
  authorAvatar?: string | null;
  readTime: string;
  readingTimeMinutes: number;
  image: string;
  themes: string[];
  tags: string[];
  historicalSignificance?: string;
  culturalSignificance?: string;
  viewCount: number;
  publishedAt?: string | null;
  isExactMatch?: boolean;
}

const defaultStorySelect = {
  id: true,
  slug: true,
  title: true,
  titleHi: true,
  excerpt: true,
  excerptHi: true,
  content: true,
  seoKeywords: true,
  viewCount: true,
  readingTime: true,
  publishedAt: true,
  createdAt: true,
  featured: true,
  state: { select: { id: true, name: true, slug: true } },
  city: { select: { id: true, name: true, slug: true } },
  author: { select: { id: true, name: true, bio: true, avatar: true } },
  images: {
    orderBy: [{ heroImage: "desc" as any }, { sortOrder: "asc" as any }],
    select: { id: true, imageUrl: true, caption: true },
    take: 2,
  },
  themes: {
    select: {
      theme: { select: { name: true, slug: true } },
    },
  },
  tags: {
    select: {
      tag: { select: { name: true, slug: true } },
    },
  },
};

function formatReadTime(readingTime: number | null): string {
  return readingTime != null && readingTime > 0 ? `${readingTime} min read` : "4 min read";
}

function extractSignificance(content: string | null, excerpt: string) {
  let historical = "Deeply rooted in regional oral history and heritage traditions.";
  let cultural = "Represents living cultural memory and local community art.";

  if (content) {
    const lower = content.toLowerCase();
    if (lower.includes("history") || lower.includes("century") || lower.includes("dynasty") || lower.includes("freedom")) {
      historical = "Preserves significant historical milestones and heritage records.";
    }
    if (lower.includes("craft") || lower.includes("art") || lower.includes("weaving") || lower.includes("festival") || lower.includes("culture")) {
      cultural = "Embodies traditional craftsmanship and indigenous cultural identity.";
    }
  }

  return {
    historicalSignificance: historical,
    culturalSignificance: cultural,
  };
}

const STOP_WORDS = new Set([
  "stories", "story", "from", "the", "in", "of", "about", "show", "me", "tell",
  "give", "want", "like", "some", "any", "which", "what", "are", "have", "with",
  "and", "for", "please", "read", "display", "list", "top", "best", "good", "कहानियां",
  "कहानी", "की", "का", "के", "में", "से", "बताओ", "दिखाओ"
]);

export async function searchStoriesForAssistant(query: string, limit = 6): Promise<{
  exactMatch: FormattedStoryPayload | null;
  stories: FormattedStoryPayload[];
  matchedEntityType?: "title" | "state" | "theme" | "author" | "keyword";
}> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) {
    return { exactMatch: null, stories: [] };
  }

  // 1. Exact or Near-Exact Story Title Match
  const exactStory = await prisma.story.findFirst({
    where: {
      status: StoryStatus.Published,
      OR: [
        { title: { equals: cleanQuery, mode: "insensitive" } },
        { title: { contains: cleanQuery, mode: "insensitive" } },
        { titleHi: { contains: cleanQuery, mode: "insensitive" } },
        { slug: { equals: cleanQuery.replace(/\s+/g, "-"), mode: "insensitive" } },
      ],
    },
    select: defaultStorySelect,
    orderBy: { viewCount: "desc" },
  });

  let exactPayload: FormattedStoryPayload | null = null;
  if (exactStory) {
    const { historicalSignificance, culturalSignificance } = extractSignificance(
      exactStory.content,
      exactStory.excerpt || ""
    );
    exactPayload = {
      id: exactStory.id,
      slug: exactStory.slug,
      title: exactStory.title,
      titleHi: exactStory.titleHi,
      excerpt: exactStory.excerpt,
      excerptHi: exactStory.excerptHi,
      stateName: exactStory.state?.name ?? "India",
      cityName: exactStory.city?.name ?? null,
      authorName: exactStory.author?.name ?? "India Story Editorial",
      authorBio: exactStory.author?.bio ?? null,
      authorAvatar: exactStory.author?.avatar ?? null,
      readTime: formatReadTime(exactStory.readingTime),
      readingTimeMinutes: exactStory.readingTime ?? 4,
      image: exactStory.images?.[0]?.imageUrl || "/Logo-ISP.jpg",
      themes: exactStory.themes?.map((t: any) => t.theme?.name).filter(Boolean) ?? [],
      tags: exactStory.tags?.map((t: any) => t.tag?.name).filter(Boolean) ?? [],
      historicalSignificance,
      culturalSignificance,
      viewCount: exactStory.viewCount ?? 0,
      publishedAt: exactStory.publishedAt?.toISOString() ?? null,
      isExactMatch: true,
    };
  }

  // 2. Fetch all States & check if any state name is inside user query (e.g. "stories from rajasthan")
  const allStates = await prisma.state.findMany({ select: { id: true, name: true } });
  const matchedState = allStates.find((s) => cleanQuery.includes(s.name.toLowerCase()));

  // 3. Fetch all Themes & check if any theme name is inside user query
  const allThemes = await prisma.theme.findMany({ select: { id: true, name: true } });
  const matchedTheme = allThemes.find((t) => cleanQuery.includes(t.name.toLowerCase()));

  // 4. Fetch all Authors & check if any author name is inside user query
  const allAuthors = await prisma.author.findMany({ select: { id: true, name: true } });
  const matchedAuthor = allAuthors.find((a) => cleanQuery.includes(a.name.toLowerCase()));

  // Extract meaningful non-stop keywords
  const keywords = cleanQuery
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9\u0900-\u097F]/g, ""))
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const whereConditions: any = { status: StoryStatus.Published };
  const orConditions: any[] = [];
  let matchedEntityType: "title" | "state" | "theme" | "author" | "keyword" = "keyword";

  if (exactPayload) {
    matchedEntityType = "title";
  }

  if (matchedState) {
    matchedEntityType = "state";
    orConditions.push({ stateId: matchedState.id });
  }

  if (matchedTheme) {
    if (matchedEntityType === "keyword") matchedEntityType = "theme";
    orConditions.push({ themes: { some: { themeId: matchedTheme.id } } });
  }

  if (matchedAuthor) {
    if (matchedEntityType === "keyword") matchedEntityType = "author";
    orConditions.push({ authorId: matchedAuthor.id });
  }

  // Add keyword token match conditions
  if (keywords.length > 0) {
    for (const kw of keywords) {
      orConditions.push(
        { title: { contains: kw, mode: "insensitive" } },
        { excerpt: { contains: kw, mode: "insensitive" } },
        { content: { contains: kw, mode: "insensitive" } },
        { seoKeywords: { contains: kw, mode: "insensitive" } },
        { state: { name: { contains: kw, mode: "insensitive" } } },
        { city: { name: { contains: kw, mode: "insensitive" } } },
        { tags: { some: { tag: { name: { contains: kw, mode: "insensitive" } } } } }
      );
    }
  }

  if (orConditions.length > 0) {
    whereConditions.OR = orConditions;
  }

  let rawStories = await prisma.story.findMany({
    where: whereConditions,
    take: limit,
    orderBy: [
      { featured: "desc" },
      { viewCount: "desc" },
      { publishedAt: "desc" },
    ],
    select: defaultStorySelect,
  });

  // Fallback: If 0 stories found, fetch top featured/popular published stories
  if (rawStories.length === 0) {
    rawStories = await prisma.story.findMany({
      where: { status: StoryStatus.Published },
      take: limit,
      orderBy: [
        { featured: "desc" },
        { viewCount: "desc" },
      ],
      select: defaultStorySelect,
    });
  }

  const formattedStories: FormattedStoryPayload[] = rawStories.map((story) => {
    const { historicalSignificance, culturalSignificance } = extractSignificance(
      story.content,
      story.excerpt || ""
    );
    return {
      id: story.id,
      slug: story.slug,
      title: story.title,
      titleHi: story.titleHi,
      excerpt: story.excerpt,
      excerptHi: story.excerptHi,
      stateName: story.state?.name ?? "India",
      cityName: story.city?.name ?? null,
      authorName: story.author?.name ?? "India Story Editorial",
      authorBio: story.author?.bio ?? null,
      authorAvatar: story.author?.avatar ?? null,
      readTime: formatReadTime(story.readingTime),
      readingTimeMinutes: story.readingTime ?? 4,
      image: story.images?.[0]?.imageUrl || "/Logo-ISP.jpg",
      themes: story.themes?.map((t: any) => t.theme?.name).filter(Boolean) ?? [],
      tags: story.tags?.map((t: any) => t.tag?.name).filter(Boolean) ?? [],
      historicalSignificance,
      culturalSignificance,
      viewCount: story.viewCount ?? 0,
      publishedAt: story.publishedAt?.toISOString() ?? null,
    };
  });

  return {
    exactMatch: exactPayload,
    stories: formattedStories,
    matchedEntityType,
  };
}
