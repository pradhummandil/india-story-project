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

export const Route = createFileRoute("/api/explore")({
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

          // 6. Hidden Gems (Random stories with low views <= 200)
          const hiddenGemsRaw = await prisma.story.findMany({
            where: { status: StoryStatus.Published, viewCount: { lte: 200 } },
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

          // 10. Reading / Story Challenges
          let challenges = await prisma.storyChallenge.findMany({
            where: { isActive: true },
            take: 4,
            include: {
              entries: {
                take: 3,
                include: {
                  story: {
                    select: { title: true, slug: true }
                  }
                }
              }
            }
          });

          if (challenges.length === 0) {
            const defaultAuthor = await prisma.author.findFirst();
            const authorId = defaultAuthor?.id || "";
            challenges = [
              {
                id: "c1",
                title: "Monsoon Chronicles",
                slug: "monsoon-chronicles",
                description: "Write and share stories about the magic of Indian Monsoons — from local tea stalls to rain-soaked heritage streets.",
                rules: "Story must be set in India during the monsoon season. Minimum 500 words. Must contain at least 2 original photographs.",
                theme: "Nature",
                prize: "Featured Showcase & 500 XP",
                startAt: new Date(),
                endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                isActive: true,
                isFeatured: true,
                createdBy: authorId,
                entries: []
              },
              {
                id: "c2",
                title: "Himalayan Tales",
                slug: "himalayan-tales",
                description: "Document stories of the people, high-altitude villages, and conservation efforts in the Indian Himalayan region.",
                rules: "Must focus on regions of Himachal, Uttarakhand, Ladakh, or Sikkim. Focus on local conservation.",
                theme: "Environment",
                prize: "ISP Print Edition feature & 1000 XP",
                startAt: new Date(),
                endAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                isActive: true,
                isFeatured: false,
                createdBy: authorId,
                entries: []
              }
            ] as any;
          }

          // 11. Curated collections with real DB stories
          const collectionsKeys = [
            { name: "UNESCO Heritage", keywords: ["heritage", "unesco", "monument", "temple", "architecture"] },
            { name: "Freedom Fighters", keywords: ["freedom", "independence", "fighter", "struggle", "history"] },
            { name: "Indian Cuisine", keywords: ["food", "cuisine", "recipe", "spices", "cooking", "taste"] },
            { name: "Ancient Temples", keywords: ["temple", "spiritual", "shrine", "mythology", "sacred"] },
          ];

          const collections = await Promise.all(collectionsKeys.map(async (col) => {
            const stories = await prisma.story.findMany({
              where: {
                status: StoryStatus.Published,
                OR: col.keywords.map((kw) => ({
                  OR: [
                    { title: { contains: kw, mode: "insensitive" } },
                    { excerpt: { contains: kw, mode: "insensitive" } },
                    { content: { contains: kw, mode: "insensitive" } },
                  ]
                }))
              },
              take: 3,
              select: storyCardSelect,
            });

            const normalizedStories = stories.map(toStoryCardCompatible);
            const repImage = normalizedStories.find(s => s.image)?.image || "/Logo-ISP.jpg";

            return {
              name: col.name,
              slug: col.name.toLowerCase().replace(/\s+/g, "-"),
              description: `A curated trail of stories exploring ${col.name.toLowerCase()} across different eras and states.`,
              stories: normalizedStories,
              image: repImage,
            };
          }));

          // 12. Historical Era Timeline
          const eras = [
            { name: "Ancient India", desc: "Pre-1200 CE: From the Indus Valley to classical kingdoms", keywords: ["ancient", "mauryan", "gupta", "chola", "harappa", "mythology", "vedic"] },
            { name: "Medieval Kingdoms", desc: "1200–1757 CE: Era of empires, poetry, and architecture", keywords: ["mughal", "sultanate", "rajput", "maratha", "vijayanagar", "medieval", "akbar"] },
            { name: "Colonial & Freedom", desc: "1757–1947 CE: The long walk to independence", keywords: ["british", "colonial", "gandhi", "freedom", "independence", "rebellion", "raj"] },
            { name: "Modern Renaissance", desc: "2000 CE–Present: Innovation, culture, and new stories", keywords: ["startup", "innovation", "modern", "digital", "contemporary", "change"] },
          ];

          const historicalTimeline = await Promise.all(eras.map(async (era) => {
            const stories = await prisma.story.findMany({
              where: {
                status: StoryStatus.Published,
                OR: era.keywords.map((kw) => ({
                  OR: [
                    { title: { contains: kw, mode: "insensitive" } },
                    { excerpt: { contains: kw, mode: "insensitive" } },
                  ]
                }))
              },
              take: 4,
              select: storyCardSelect,
            });

            return {
              era: era.name,
              desc: era.desc,
              stories: stories.map(toStoryCardCompatible),
            };
          }));

          // 13. Festival Calendar
          const festivalStoriesRaw = await prisma.story.findMany({
            where: {
              status: StoryStatus.Published,
              OR: [
                { title: { contains: "festival", mode: "insensitive" } },
                { title: { contains: "diwali", mode: "insensitive" } },
                { title: { contains: "holi", mode: "insensitive" } },
                { title: { contains: "eid", mode: "insensitive" } },
                { title: { contains: "dussehra", mode: "insensitive" } },
                { title: { contains: "pongal", mode: "insensitive" } },
                { title: { contains: "onam", mode: "insensitive" } },
                { title: { contains: "durga", mode: "insensitive" } },
                { excerpt: { contains: "festival", mode: "insensitive" } },
              ]
            },
            take: 6,
            select: storyCardSelect,
          });
          const festivalStories = festivalStoriesRaw.map(toStoryCardCompatible);

          // 14. Travel Routes (Chained states)
          const trailsKeys = [
            { name: "Golden Triangle Trail", states: ["Delhi", "Uttar Pradesh", "Rajasthan"], desc: "Architectural wonders and royal history spanning northern India." },
            { name: "Southern Heritage Trail", states: ["Karnataka", "Tamil Nadu", "Kerala"], desc: "Temples, spice routes, and coastal folklore of the south." },
            { name: "Himalayan Pathways", states: ["Himachal Pradesh", "Uttarakhand", "Jammu and Kashmir", "Ladakh", "Sikkim"], desc: "High mountain dispatches, conservation heroes, and pristine valleys." }
          ];

          const travelRoutes = await Promise.all(trailsKeys.map(async (trail) => {
            const stories = await prisma.story.findMany({
              where: {
                status: StoryStatus.Published,
                state: {
                  name: { in: trail.states }
                }
              },
              take: 3,
              select: storyCardSelect,
            });

            return {
              name: trail.name,
              desc: trail.desc,
              states: trail.states,
              stories: stories.map(toStoryCardCompatible),
            };
          }));

          // 15. Most Loved Stories
          const mostLovedRaw = await prisma.story.findMany({
            where: { status: StoryStatus.Published },
            orderBy: [
              { likes: { _count: "desc" } },
              { bookmarks: { _count: "desc" } },
            ],
            take: 6,
            select: storyCardSelect,
          });
          const mostLoved = mostLovedRaw.map(toStoryCardCompatible);

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
            challenges,
            collections,
            historicalTimeline,
            festivalStories,
            travelRoutes,
            mostLoved,
          });
        } catch (e: any) {
          console.error("Explore API error:", e);
          return json({ error: e.message || "Failed to aggregate explore modules" }, { status: 500 });
        }
      },
    },
  },
});
