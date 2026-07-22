import { createServerFn } from "@tanstack/react-start";
import { storyService } from "../services/story-service.server";
import { themeService } from "../services/theme-service.server";
import { prisma } from "../repositories/prisma.server";
import { storyRepository } from "../repositories/story-repository.server";
import { normalizeStateName } from "../utils/state-normalizer";

const FALLBACK_IMAGE = "/Logo-ISP.jpg";

export const getInitialStoriesAndCategories = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
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
          orderBy: [{ heroImage: "desc" as const }, { sortOrder: "asc" as const }],
          select: { imageUrl: true, heroImage: true },
          take: 1,
        },
      };

      const [storiesResult, themesResult, slideshowStories, featuredStories, trendingResult, stateCountsList] = await Promise.all([
        storyService.getPublishedStories({ page: 1, pageSize: 12 }),
        themeService.getAllThemeNames(),
        prisma.story.findMany({
          where: {
            homepageSlideshow: true,
            status: "Published",
            deleted: false,
          },
          orderBy: {
            slideshowOrder: "asc",
          },
          select: slideSelect,
        }),
        storyRepository.listFeatured(1).catch(() => []),
        storyService.getPublishedStories({ sortBy: "views", page: 1, pageSize: 6 }),
        prisma.state.findMany({
          select: {
            name: true,
            _count: {
              select: {
                stories: {
                  where: {
                    status: "Published",
                    deleted: false,
                  },
                },
              },
            },
          },
        }),
      ]);

      const stateCountsResult: Record<string, number> = {};
      stateCountsList.forEach((s: any) => {
        if (s._count.stories > 0) {
          const canonicalName = normalizeStateName(s.name);
          stateCountsResult[canonicalName] = (stateCountsResult[canonicalName] || 0) + s._count.stories;
        }
      });

      const slides = slideshowStories.map((s: any) => {
        const heroImage = s.images?.[0]?.imageUrl ?? FALLBACK_IMAGE;
        return {
          id: s.id,
          storyId: s.id,
          slug: s.slug,
          title: s.title,
          excerpt: s.excerpt,
          titleHi: s.titleHi ?? null,
          excerptHi: s.excerptHi ?? null,
          themes: s.themes?.map((t: any) => t.theme?.name).filter(Boolean) ?? [],
          state: s.state?.name ?? null,
          author: s.author?.name ?? null,
          readingTime: s.readingTime,
          image: heroImage,
          caption: null,
        };
      });

      const featuredStory = featuredStories[0] || null;

      return {
        stories: storiesResult.stories,
        themes: themesResult,
        categories: themesResult,
        heroSlides: slides,
        featuredStory: featuredStory,
        trendingStories: trendingResult.stories,
        stateCounts: stateCountsResult,
      };
    } catch (err) {
      console.error("Failed to load initial stories in server function:", err);
      throw err;
    }
  },
);
