import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";
import { StoryStatus } from "@prisma/client";

export const Route = createFileRoute("/api/themes/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { slug } = params;

        try {
          // Find the theme
          const theme = await prisma.theme.findUnique({
            where: { slug },
          });

          if (!theme) {
            return json({ error: "Theme not found" }, { status: 404 });
          }

          // Fetch all stories belonging to this theme
          const storyRelations = await prisma.storyTheme.findMany({
            where: {
              themeId: theme.id,
              story: {
                status: StoryStatus.Published,
              },
            },
            include: {
              story: {
                include: {
                  state: { select: { id: true, name: true, slug: true } },
                  author: { select: { id: true, name: true, bio: true, avatar: true } },
                  images: {
                    orderBy: { sortOrder: "asc" },
                    select: { id: true, imageUrl: true, caption: true, heroImage: true },
                    take: 1,
                  },
                  themes: {
                    include: {
                      theme: true,
                    },
                  },
                },
              },
            },
          });

          const stories = storyRelations.map((sr) => {
            const story = sr.story;
            const img = story.images?.[0] || null;
            return {
              id: story.id,
              slug: story.slug,
              title: story.title,
              excerpt: story.excerpt,
              titleHi: story.titleHi,
              excerptHi: story.excerptHi,
              publishedAt: story.publishedAt?.toISOString(),
              createdAt: story.createdAt.toISOString(),
              viewCount: story.viewCount,
              readingTime: story.readingTime ? `${story.readingTime} min read` : "3 min read",
              image: img?.imageUrl,
              imageAlt: img?.caption || undefined,
              region: story.state?.name || "India",
              authorName: story.author?.name || "India Story Project Bureau",
              authorBio: story.author?.bio,
              authorAvatar: story.author?.avatar,
              themes: story.themes.map((st) => st.theme.name),
              editorsPick: story.editorsPick,
              featured: story.featured,
            };
          });

          // 1. Hero Story (Featured or Newest)
          const heroStory = stories.find((s) => s.featured) || stories[0] || null;

          // 2. Trending Stories (Sorted by viewCount desc)
          const trendingStories = [...stories]
            .sort((a, b) => b.viewCount - a.viewCount)
            .slice(0, 4);

          // 3. Editor's Picks
          const editorsPicks = stories.filter((s) => s.editorsPick).slice(0, 4);

          // 4. Latest Stories
          const latestStories = [...stories]
            .sort((a, b) => {
              const d1 = a.publishedAt
                ? new Date(a.publishedAt).getTime()
                : new Date(a.createdAt).getTime();
              const d2 = b.publishedAt
                ? new Date(b.publishedAt).getTime()
                : new Date(b.createdAt).getTime();
              return d2 - d1;
            })
            .slice(0, 6);

          // 5. Popular Authors (Deduplicated list of authors on this theme)
          const authorsMap = new Map();
          stories.forEach((s) => {
            if (s.authorName && !authorsMap.has(s.authorName)) {
              authorsMap.set(s.authorName, {
                name: s.authorName,
                avatar: s.authorAvatar,
                bio: s.authorBio,
              });
            }
          });
          const popularAuthors = Array.from(authorsMap.values()).slice(0, 4);

          // 6. Related Themes (Deduplicated themes across all stories, except the current theme)
          const relatedThemesSet = new Set<string>();
          stories.forEach((s) => {
            s.themes.forEach((t) => {
              if (t.toLowerCase() !== theme.name.toLowerCase() && t.toLowerCase() !== "general") {
                relatedThemesSet.add(t);
              }
            });
          });
          const relatedThemes = Array.from(relatedThemesSet).slice(0, 5);

          return json({
            theme,
            heroStory,
            trendingStories,
            latestStories,
            editorsPicks,
            popularAuthors,
            relatedThemes,
            totalStoriesCount: stories.length,
          });
        } catch (e: any) {
          return json({ error: e.message || "Failed to load theme data" }, { status: 500 });
        }
      },
    },
  },
});
