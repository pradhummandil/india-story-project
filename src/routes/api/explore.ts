import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";
import { StoryStatus } from "@prisma/client";

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
  _count: {
    select: {
      likes: true,
      bookmarks: true,
    },
  },
};

function formatReadTime(readingTime: number | null) {
  return readingTime != null && readingTime > 0 ? `${readingTime} min read` : "";
}

function toStoryCardCompatible(story: any) {
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
    titleHi: story.titleHi,
    excerptHi: story.excerptHi,
    authorName: story.author?.name,
    authorBio: story.author?.bio,
    authorAvatar: story.author?.avatar,
    publishedAt: story.publishedAt,
    createdAt: story.createdAt,
    viewCount: story.viewCount,
    featured: story.featured,
    likesCount: story._count?.likes ?? 0,
    bookmarksCount: story._count?.bookmarks ?? 0,
  };
}

export const Route = createFileRoute("/api/explore" as any)({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const user = await authenticate(request);

          // 1. Live stats counters
          const [totalStories, totalStates, totalThemes, totalAuthors, totalViewsResult] = await Promise.all([
            prisma.story.count({ where: { status: StoryStatus.Published } }),
            prisma.state.count({ where: { stories: { some: { status: StoryStatus.Published } } } }),
            prisma.theme.count({ where: { stories: { some: { story: { status: StoryStatus.Published } } } } }),
            prisma.author.count({ where: { stories: { some: { status: StoryStatus.Published } } } }),
            prisma.story.aggregate({
              where: { status: StoryStatus.Published },
              _sum: { viewCount: true },
            }),
          ]);

          const stats = {
            stories: totalStories,
            states: totalStates,
            themes: totalThemes,
            authors: totalAuthors,
            views: totalViewsResult._sum.viewCount ?? 0,
          };

          // 2. Themes with counts
          const themesRaw = await prisma.theme.findMany({
            where: { stories: { some: { story: { status: StoryStatus.Published } } } },
            include: {
              _count: {
                select: { stories: { where: { story: { status: StoryStatus.Published } } } },
              },
            },
          });

          const themes = themesRaw.map((t) => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            description: "",
            count: t._count.stories,
          })).sort((a, b) => b.count - a.count);

          // 3. States list with counts and representative images
          const statesRaw = await prisma.state.findMany({
            where: { stories: { some: { status: StoryStatus.Published } } },
            include: {
              _count: {
                select: { stories: { where: { status: StoryStatus.Published } } },
              },
              stories: {
                where: { status: StoryStatus.Published },
                take: 1,
                select: {
                  images: {
                    take: 1,
                    select: { imageUrl: true },
                  },
                },
              },
            },
          });

          const states = statesRaw.map((s) => ({
            id: s.id,
            name: s.name,
            slug: s.slug,
            count: s._count.stories,
            image: s.stories?.[0]?.images?.[0]?.imageUrl || "/Logo-ISP.jpg",
          })).sort((a, b) => b.count - a.count);

          // 4. Trending dispatches (Top view counts)
          const trendingStoriesRaw = await prisma.story.findMany({
            where: { status: StoryStatus.Published },
            orderBy: { viewCount: "desc" },
            take: 6,
            select: {
              ...storyCardSelect,
              themes: { select: { theme: { select: { name: true } } } },
            },
          });
          const trending = trendingStoriesRaw.map(toStoryCardCompatible);

          // 5. Latest dispatches
          const latestStoriesRaw = await prisma.story.findMany({
            where: { status: StoryStatus.Published },
            orderBy: { publishedAt: "desc" },
            take: 6,
            select: {
              ...storyCardSelect,
              themes: { select: { theme: { select: { name: true } } } },
            },
          });
          const latest = latestStoriesRaw.map(toStoryCardCompatible);

          // 6. Hidden Gems (Random stories with low views <= 120)
          const hiddenGemsRaw = await prisma.story.findMany({
            where: { status: StoryStatus.Published, viewCount: { lte: 120 } },
            take: 20,
            select: {
              ...storyCardSelect,
              themes: { select: { theme: { select: { name: true } } } },
            },
          });
          const hiddenGems = hiddenGemsRaw
            .sort(() => 0.5 - Math.random())
            .slice(0, 6)
            .map(toStoryCardCompatible);

          // 7. Author spotlight
          const topAuthorsRaw = await prisma.author.findMany({
            where: { stories: { some: { status: StoryStatus.Published } } },
            take: 6,
            include: {
              _count: {
                select: { stories: { where: { status: StoryStatus.Published } } },
              },
              stories: {
                where: { status: StoryStatus.Published },
                orderBy: { publishedAt: "desc" },
                take: 1,
                select: { title: true, slug: true },
              },
            },
          });

          const authors = topAuthorsRaw.map((a) => ({
            id: a.id,
            name: a.name,
            bio: a.bio || "",
            avatar: a.avatar || "",
            count: a._count.stories,
            latestStory: a.stories?.[0]?.title || "",
          })).sort((a, b) => b.count - a.count);

          // 8. Continue reading (Incomplete progress)
          let continueReading: any[] = [];
          if (user) {
            const progressRaw = (await prisma.readingProgress.findMany({
              where: { userId: user.id, completed: false, progressPercent: { gt: 0 } },
              include: {
                story: {
                  select: {
                    ...storyCardSelect,
                    themes: { select: { theme: { select: { name: true } } } },
                  },
                },
              },
              orderBy: { lastReadAt: "desc" },
              take: 6,
            })) as any[];
            continueReading = progressRaw.map((p) => ({
              progressPercent: p.progressPercent,
              scrollPosition: p.scrollPosition,
              lastReadAt: p.lastReadAt,
              story: toStoryCardCompatible(p.story),
            }));
          }

          // 9. Recommended for you (Based on similar themes from user likes)
          let recommended: any[] = [];
          if (user) {
            const userLikes = await prisma.storyLike.findMany({
              where: { userId: user.id },
              select: { storyId: true },
            });
            const likedIds = userLikes.map((l) => l.storyId);

            if (likedIds.length > 0) {
              const recRaw = await prisma.story.findMany({
                where: {
                  status: StoryStatus.Published,
                  id: { notIn: likedIds },
                  themes: {
                    some: {
                      theme: {
                        stories: {
                          some: {
                            storyId: { in: likedIds },
                          },
                        },
                      },
                    },
                  },
                },
                take: 6,
                select: {
                  ...storyCardSelect,
                  themes: { select: { theme: { select: { name: true } } } },
                },
              });
              recommended = recRaw.map(toStoryCardCompatible);
            }
          }

          return json({
            stats,
            themes,
            states,
            trending,
            latest,
            hiddenGems,
            authors,
            continueReading,
            recommended,
          });
        } catch (e: any) {
          console.error("Explore API error:", e);
          return json({ error: e.message || "Failed to aggregation explore modules" }, { status: 500 });
        }
      },
    },
  },
});
