import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";
import { supabase } from "@/lib/supabase-client";

async function authenticate(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.substring(7);
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

// In-memory cache for frequently searched queries to prevent duplicate DB requests
type CacheEntry = {
  data: any;
  expiry: number;
};
const searchCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const Route = createFileRoute("/api/search")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const query = url.searchParams.get("query")?.trim() ?? "";
        const cacheKey = query.toLowerCase();

        // 1. Return cached results if available and not expired
        const now = Date.now();
        const cached = searchCache.get(cacheKey);
        if (cached && cached.expiry > now) {
          return json(cached.data);
        }

        try {
          if (!query) {
            // Return empty-state suggestions: popular/trending items
            const [popularStories, popularThemes, popularAuthors, popularStates, popularTags, trendingQueries] = await Promise.all([
              prisma.story.findMany({
                where: { status: "Published" },
                orderBy: { viewCount: "desc" },
                take: 5,
                select: {
                  id: true,
                  title: true,
                  titleHi: true,
                  slug: true,
                  excerpt: true,
                  excerptHi: true,
                  publishedAt: true,
                  author: { select: { name: true } },
                  state: { select: { name: true } },
                  images: { take: 1, select: { imageUrl: true } },
                }
              }),
              prisma.theme.findMany({
                take: 5,
                select: { id: true, name: true, slug: true }
              }),
              prisma.author.findMany({
                take: 5,
                select: { id: true, name: true, bio: true, avatar: true }
              }),
              prisma.state.findMany({
                take: 5,
                select: { id: true, name: true, slug: true }
              }),
              prisma.tag.findMany({
                take: 5,
                select: { id: true, name: true, slug: true }
              }),
              prisma.searchQueryTracker.findMany({
                orderBy: { count: "desc" },
                take: 5,
                select: { query: true }
              })
            ]);

            const payload = {
              stories: popularStories,
              themes: popularThemes,
              authors: popularAuthors,
              states: popularStates,
              tags: popularTags,
              trending: trendingQueries.map(t => t.query),
              videos: [],
              webStories: [],
              isSuggestions: true
            };

            // Don't cache empty suggestions for long, but a tiny TTL is fine
            searchCache.set("", { data: payload, expiry: now + 30 * 1000 });
            return json(payload);
          }

          // 2. Perform live multi-category database search
          const [stories, themes, authors, videos, webStories, states, tags, community] = await Promise.all([
            prisma.story.findMany({
              where: {
                status: "Published",
                OR: [
                  { title: { contains: query, mode: "insensitive" } },
                  { titleHi: { contains: query, mode: "insensitive" } },
                  { excerpt: { contains: query, mode: "insensitive" } },
                  { excerptHi: { contains: query, mode: "insensitive" } },
                  { content: { contains: query, mode: "insensitive" } },
                  { contentHi: { contains: query, mode: "insensitive" } },
                  { author: { name: { contains: query, mode: "insensitive" } } },
                  { state: { name: { contains: query, mode: "insensitive" } } },
                  { tags: { some: { tag: { name: { contains: query, mode: "insensitive" } } } } },
                  { themes: { some: { theme: { name: { contains: query, mode: "insensitive" } } } } },
                ]
              },
              take: 5,
              select: {
                id: true,
                title: true,
                titleHi: true,
                excerpt: true,
                excerptHi: true,
                slug: true,
                publishedAt: true,
                author: { select: { name: true } },
                state: { select: { name: true } },
                images: { take: 1, select: { imageUrl: true } },
              }
            }),
            prisma.theme.findMany({
              where: {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { slug: { contains: query, mode: "insensitive" } },
                ]
              },
              take: 5,
              select: { id: true, name: true, slug: true }
            }),
            prisma.author.findMany({
              where: {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { bio: { contains: query, mode: "insensitive" } },
                ]
              },
              take: 5,
              select: { id: true, name: true, bio: true, avatar: true }
            }),
            prisma.video.findMany({
              where: {
                status: "Published",
                OR: [
                  { title: { contains: query, mode: "insensitive" } },
                  { titleHi: { contains: query, mode: "insensitive" } },
                  { excerpt: { contains: query, mode: "insensitive" } },
                  { excerptHi: { contains: query, mode: "insensitive" } },
                ]
              },
              take: 5,
              select: { id: true, title: true, titleHi: true, slug: true, thumbnail: true }
            }),
            prisma.webStory.findMany({
              where: {
                status: "Published",
                OR: [
                  { title: { contains: query, mode: "insensitive" } },
                  { titleHi: { contains: query, mode: "insensitive" } },
                  { excerpt: { contains: query, mode: "insensitive" } },
                ]
              },
              take: 5,
              select: { id: true, title: true, titleHi: true, slug: true, coverImage: true }
            }),
            prisma.state.findMany({
              where: { name: { contains: query, mode: "insensitive" } },
              take: 5,
              select: { id: true, name: true, slug: true }
            }),
            prisma.tag.findMany({
              where: { name: { contains: query, mode: "insensitive" } },
              take: 5,
              select: { id: true, name: true, slug: true }
            }),
            prisma.discussionTopic.findMany({
              where: {
                OR: [
                  { title: { contains: query, mode: "insensitive" } },
                  { content: { contains: query, mode: "insensitive" } },
                ]
              },
              take: 5,
              select: { id: true, title: true, content: true }
            })
          ]);

          const CAREER_OPENINGS = [
            { id: "career-1", title: "Storytelling Fellow", location: "Lucknow / Remote", desc: "Crafting narratives of changemakers and rural innovations." },
            { id: "career-2", title: "Video Documentary Producer", location: "New Delhi", desc: "Producing cinematic, deep-dive documentaries on regional heroes." },
            { id: "career-3", title: "Community Manager", location: "Bhopal", desc: "Engaging and cultivating dialogue across local story circles." },
          ];

          const IMPACT_MILESTONES = [
            { id: "impact-1", title: "500+ Changemakers Cataloged", desc: "Directly tracking local heroes across multiple states." },
            { id: "impact-2", title: "20+ Regional States Mapped", desc: "Bringing underrepresented dispatches to national attention." },
            { id: "impact-3", title: "10M+ Reader Impressions", desc: "Driving tangible policy attention and community support." },
          ];

          const matchedCareers = CAREER_OPENINGS.filter(c =>
            c.title.toLowerCase().includes(cacheKey) || c.desc.toLowerCase().includes(cacheKey)
          );

          const matchedImpact = IMPACT_MILESTONES.filter(m =>
            m.title.toLowerCase().includes(cacheKey) || m.desc.toLowerCase().includes(cacheKey)
          );

          const payload = {
            stories,
            themes,
            authors,
            videos,
            webStories,
            states,
            tags,
            community,
            careers: matchedCareers,
            impact: matchedImpact,
            isSuggestions: false
          };

          // Cache query results for future lookups
          searchCache.set(cacheKey, { data: payload, expiry: now + CACHE_TTL });

          // Asynchronously record search log for trending computation
          if (query.length >= 2) {
            prisma.searchQueryTracker.upsert({
              where: { query },
              update: { count: { increment: 1 } },
              create: { query, count: 1 }
            }).catch(e => console.error("Failed to track query count:", e));
          }

          return json(payload);
        } catch (error: any) {
          console.error("Search query execution failed:", error);
          return json({ error: "Failed to perform search query" }, { status: 500 });
        }
      }
    }
  }
});
