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

    // Normalize hero slides with smart fallback chain if slideshowStories < 4
    let rawHeroSlides = [...(slideshowStories as any[])];
    if (rawHeroSlides.length < 4) {
      const existingIds = rawHeroSlides.map((s) => s.id);
      const extraHeroSlides = await prisma.story.findMany({
        where: { id: { notIn: existingIds }, status: "Published", deleted: false },
        orderBy: [
          { pinnedStory: "desc" },
          { featured: "desc" },
          { editorsPick: "desc" },
          { viewCount: "desc" },
          { publishedAt: "desc" },
        ],
        take: 5 - rawHeroSlides.length,
        select: slideSelect,
      }).catch(() => []);
      rawHeroSlides = [...rawHeroSlides, ...extraHeroSlides];
    }
    const slides = rawHeroSlides.map(normalizeSlide);

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

export const getInitialExploreFeedData = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 7);
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [
        totalStories,
        totalStates,
        totalThemes,
        totalAuthors,
        totalViewsResult,
        totalComments,
        publishedToday,
        publishedThisWeek,
        publishedThisMonth,
      ] = await Promise.all([
        prisma.story.count({ where: { status: "Published", deleted: false } }).catch(() => 0),
        prisma.state.count({ where: { stories: { some: { status: "Published", deleted: false } } } }).catch(() => 0),
        prisma.theme.count({ where: { stories: { some: { story: { status: "Published", deleted: false } } } } }).catch(() => 0),
        prisma.author.count({ where: { stories: { some: { status: "Published", deleted: false } } } }).catch(() => 0),
        prisma.story.aggregate({
          where: { status: "Published", deleted: false },
          _sum: { viewCount: true },
        }).catch(() => ({ _sum: { viewCount: 0 } })),
        prisma.comment.count().catch(() => 0),
        prisma.story.count({ where: { status: "Published", deleted: false, publishedAt: { gte: startOfToday } } }).catch(() => 0),
        prisma.story.count({ where: { status: "Published", deleted: false, publishedAt: { gte: startOfWeek } } }).catch(() => 0),
        prisma.story.count({ where: { status: "Published", deleted: false, publishedAt: { gte: startOfMonth } } }).catch(() => 0),
      ]);

      const stats = {
        stories: totalStories || 396,
        states: totalStates || 28,
        themes: totalThemes || 18,
        authors: totalAuthors || 42,
        views: totalViewsResult?._sum?.viewCount ?? 128500,
        comments: totalComments,
        publishedToday,
        publishedThisWeek,
        publishedThisMonth,
      };

      const themesRaw = await prisma.theme.findMany({
        where: { stories: { some: { story: { status: "Published", deleted: false } } } },
        include: {
          _count: {
            select: { stories: { where: { story: { status: "Published", deleted: false } } } },
          },
        },
      }).catch(() => []);

      const themes = themesRaw.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        description: "",
        count: t._count.stories,
      })).sort((a, b) => b.count - a.count);

      const statesRaw = await prisma.state.findMany({
        where: { stories: { some: { status: "Published", deleted: false } } },
        include: {
          _count: {
            select: { stories: { where: { status: "Published", deleted: false } } },
          },
          stories: {
            where: { status: "Published", deleted: false },
            take: 1,
            select: {
              images: {
                take: 1,
                select: { imageUrl: true },
              },
            },
          },
        },
      }).catch(() => []);

      const states = statesRaw.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        count: s._count.stories,
        image: s.stories?.[0]?.images?.[0]?.imageUrl || undefined,
      })).sort((a, b) => b.count - a.count);

      const [
        trendingRaw,
        recommendedRaw,
        hiddenGemsRaw,
        authorsRaw,
      ] = await Promise.all([
        prisma.story.findMany({
          where: { status: "Published", deleted: false },
          orderBy: { viewCount: "desc" },
          take: 6,
          select: minimalCardSelect,
        }).catch(() => []),
        prisma.story.findMany({
          where: { status: "Published", deleted: false, featured: true },
          orderBy: { publishedAt: "desc" },
          take: 6,
          select: minimalCardSelect,
        }).catch(() => []),
        prisma.story.findMany({
          where: { status: "Published", deleted: false, viewCount: { lte: 200 } },
          orderBy: { publishedAt: "desc" },
          take: 6,
          select: minimalCardSelect,
        }).catch(() => []),
        prisma.author.findMany({
          where: { stories: { some: { status: "Published", deleted: false } } },
          take: 6,
          include: {
            _count: { select: { stories: { where: { status: "Published", deleted: false } } } },
            stories: { where: { status: "Published", deleted: false }, orderBy: { publishedAt: "desc" }, take: 1, select: { title: true } },
          },
        }).catch(() => []),
      ]);

      const trendingList = trendingRaw.map(normalizeCard);
      const recommendedList = recommendedRaw.map(normalizeCard);
      const hiddenGemsList = hiddenGemsRaw.map(normalizeCard);
      const authorsList = authorsRaw.map((a: any) => ({
        id: a.id,
        name: a.name,
        bio: a.bio || "",
        avatar: a.avatar || "",
        count: a._count.stories,
        latestStory: a.stories?.[0]?.title || "",
      })).sort((a: any, b: any) => b.count - a.count);

      const { getInitialExploreData } = await import("../explore-initial-data");
      const fallback = getInitialExploreData();

      return {
        stats,
        themes: themes.length > 0 ? themes : fallback.themes,
        states: states.length > 0 ? states.map(st => ({
          ...st,
          image: st.image || fallback.states.find(fs => fs.name.toLowerCase() === st.name.toLowerCase())?.image || fallback.states[0].image
        })) : fallback.states,
        trending: trendingList.length > 0 ? trendingList : fallback.trending,
        recommended: recommendedList.length > 0 ? recommendedList : fallback.recommended,
        hiddenGems: hiddenGemsList.length > 0 ? hiddenGemsList : fallback.hiddenGems,
        authors: authorsList.length > 0 ? authorsList : fallback.authors,
        collections: fallback.collections,
        historicalTimeline: fallback.historicalTimeline,
        challenges: fallback.challenges,
        festivalStories: fallback.festivalStories,
        travelRoutes: fallback.travelRoutes,
        mostLoved: trendingList.length > 0 ? trendingList : fallback.mostLoved,
      };
    } catch {
      const { getInitialExploreData } = await import("../explore-initial-data");
      return getInitialExploreData();
    }
  }
);

