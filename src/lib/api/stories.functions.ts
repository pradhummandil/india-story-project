import { createServerFn } from "@tanstack/react-start";
import { storyService } from "../services/story-service.server";
import { themeService } from "../services/theme-service.server";
import { prisma } from "../repositories/prisma.server";
import { storyRepository } from "../repositories/story-repository.server";
import { normalizeStateName } from "../utils/state-normalizer";

const FALLBACK_IMAGE = "/Logo-ISP.jpg";

/** Shared image selector for slideshow/hero queries */
const slideSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  titleHi: true,
  excerptHi: true,
  readingTime: true,
  themes: {
    select: {
      theme: { select: { name: true } },
    },
  },
  state: { select: { name: true } },
  author: { select: { name: true } },
  images: {
    orderBy: [{ heroImage: "desc" as const }, { sortOrder: "asc" as const }] as any[],
    select: { imageUrl: true, heroImage: true },
    take: 1,
  },
};

/** Minimal card select for editors picks / hidden gems */
const minimalCardSelect = {
  id: true,
  slug: true,
  title: true,
  titleHi: true,
  excerpt: true,
  excerptHi: true,
  readingTime: true,
  viewCount: true,
  publishedAt: true,
  themes: { select: { theme: { select: { name: true } } } },
  state: { select: { name: true } },
  author: { select: { name: true } },
  images: {
    orderBy: [{ heroImage: "desc" as const }, { sortOrder: "asc" as const }] as any[],
    select: { imageUrl: true },
    take: 1,
  },
};

function normalizeSlide(s: any) {
  const heroImage = s.images?.[0]?.imageUrl ?? FALLBACK_IMAGE;
  return {
    id: s.id as string,
    storyId: s.id as string,
    slug: s.slug as string,
    title: s.title as string,
    excerpt: s.excerpt as string,
    titleHi: (s.titleHi ?? undefined) as string | undefined,
    excerptHi: (s.excerptHi ?? undefined) as string | undefined,
    themes: (s.themes?.map((t: any) => t.theme?.name).filter(Boolean) ?? []) as string[],
    state: (s.state?.name ?? null) as string | null,
    author: (s.author?.name ?? null) as string | null,
    readingTime: s.readingTime as number | string | undefined,
    image: heroImage as string,
    caption: undefined as string | undefined,
  };
}

function normalizeCard(s: any) {
  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    titleHi: s.titleHi ?? null,
    excerpt: s.excerpt,
    excerptHi: s.excerptHi ?? null,
    author: s.author?.name ?? null,
    region: s.state?.name ?? null,
    themes: s.themes?.map((t: any) => t.theme?.name).filter(Boolean) ?? [],
    readingTime: s.readingTime,
    viewCount: s.viewCount ?? 0,
    publishedAt: s.publishedAt,
    image: s.images?.[0]?.imageUrl ?? null,
  };
}

export const getInitialStoriesAndCategories = createServerFn({ method: "GET" }).handler(
  async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      storiesResult,
      themesResult,
      slideshowStoriesResult,
      featuredStoriesResult,
      trendingResult,
      stateCountsListResult,
      editorsPicksResult,
      hiddenGemsResult,
      weeklyStoriesResult,
    ] = await Promise.allSettled([
      // 1. Latest 12 published stories
      storyService.getPublishedStories({ page: 1, pageSize: 12 }),
      // 2. All theme names
      themeService.getAllThemeNames(),
      // 3. Hero slideshow stories
      prisma.story.findMany({
        where: { homepageSlideshow: true, status: "Published", deleted: false },
        orderBy: { slideshowOrder: "asc" },
        select: slideSelect,
      }),
      // 4. 1 featured story
      storyRepository.listFeatured(1).catch(() => []),
      // 5. 6 trending stories (by viewCount)
      storyService.getPublishedStories({ sortBy: "views", page: 1, pageSize: 6 }),
      // 6. State story counts
      prisma.state.findMany({
        select: {
          name: true,
          _count: {
            select: {
              stories: { where: { status: "Published", deleted: false } },
            },
          },
        },
      }),
      // 7. Editor's picks (up to 4)
      prisma.story.findMany({
        where: { editorsPick: true, status: "Published", deleted: false },
        orderBy: { publishedAt: "desc" },
        take: 4,
        select: minimalCardSelect,
      }),
      // 8. Hidden gems: published stories with low viewCount (< 200) — good for discovery
      prisma.story.findMany({
        where: { status: "Published", deleted: false, viewCount: { lt: 200 } },
        orderBy: { publishedAt: "desc" },
        take: 4,
        select: minimalCardSelect,
      }),
      // 9. Stories published in last 7 days
      prisma.story.findMany({
        where: {
          status: "Published",
          deleted: false,
          publishedAt: { gte: sevenDaysAgo },
        },
        orderBy: { publishedAt: "desc" },
        take: 6,
        select: minimalCardSelect,
      }),
    ]);

    // Unwrap allSettled results with fallbacks
    const storiesData = storiesResult.status === "fulfilled" ? storiesResult.value : { stories: [] };
    const themes = themesResult.status === "fulfilled" ? themesResult.value : [];
    const slideshowStories = slideshowStoriesResult.status === "fulfilled" ? slideshowStoriesResult.value : [];
    const featuredStories = featuredStoriesResult.status === "fulfilled" ? featuredStoriesResult.value : [];
    const trendingData = trendingResult.status === "fulfilled" ? trendingResult.value : { stories: [] };
    const stateCountsList = stateCountsListResult.status === "fulfilled" ? stateCountsListResult.value : [];
    const editorsPicksRaw = editorsPicksResult.status === "fulfilled" ? editorsPicksResult.value : [];
    const hiddenGemsRaw = hiddenGemsResult.status === "fulfilled" ? hiddenGemsResult.value : [];
    const weeklyStoriesRaw = weeklyStoriesResult.status === "fulfilled" ? weeklyStoriesResult.value : [];

    // Build state counts map
    const stateCountsResult: Record<string, number> = {};
    (stateCountsList as any[]).forEach((s: any) => {
      if (s._count.stories > 0) {
        const canonicalName = normalizeStateName(s.name);
        stateCountsResult[canonicalName] = (stateCountsResult[canonicalName] || 0) + s._count.stories;
      }
    });

    // Normalize hero slides
    const slides = (slideshowStories as any[]).map(normalizeSlide);

    return {
      stories: (storiesData as any).stories ?? [],
      themes,
      categories: themes,
      heroSlides: slides,
      featuredStory: (featuredStories as any[])[0] || null,
      trendingStories: (trendingData as any).stories ?? [],
      stateCounts: stateCountsResult,
      editorsPicks: (editorsPicksRaw as any[]).map(normalizeCard),
      hiddenGems: (hiddenGemsRaw as any[]).map(normalizeCard),
      weeklyStories: (weeklyStoriesRaw as any[]).map(normalizeCard),
    };
  },
);
