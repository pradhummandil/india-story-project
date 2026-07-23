import { createFileRoute } from "@tanstack/react-router";
import { json, checkRateLimit, getClientIp, sanitizeInput } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";
import { semanticSearchService } from "@/lib/services/semantic-search.service";

// ============================================================
// In-memory cache for search results (5-min TTL for trending/suggestions)
// ============================================================
type CacheEntry = { data: any; expiry: number };
const searchCache = new Map<string, CacheEntry>();
const CACHE_TTL_SUGGESTIONS = 2 * 60 * 1000; // 2 min for trending suggestions
const CACHE_TTL_RESULTS = 30 * 1000; // 30s for query results (fresh enough)

// ============================================================
// Input sanitization helpers
// ============================================================
function escapeIlike(str: string): string {
  // Escape PostgreSQL ILIKE wildcards to prevent injection
  return str.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

function clampInt(value: string | null, min: number, max: number, fallback: number): number {
  if (!value) return fallback;
  const n = parseInt(value, 10);
  if (!isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

const VALID_SORTS = new Set(["newest", "oldest", "views", "trending", "az", "za"]);

function buildOrderBy(sort: string | null): any {
  switch (sort) {
    case "oldest": return [{ publishedAt: "asc" }];
    case "views":  return [{ viewCount: "desc" }, { publishedAt: "desc" }];
    case "trending": return [{ viewCount: "desc" }, { publishedAt: "desc" }];
    case "az":     return [{ title: "asc" }];
    case "za":     return [{ title: "desc" }];
    default:       return [{ publishedAt: "desc" }, { createdAt: "desc" }];
  }
}

// ============================================================
// PostgreSQL FTS + AI Semantic Search
// ============================================================
async function searchStories(opts: {
  q: string;
  page: number;
  limit: number;
  sort: string | null;
  theme: string | null;
  state: string | null;
  author: string | null;
  minReadTime: number | null;
  maxReadTime: number | null;
}) {
  const { q, page, limit, sort, theme, state, author, minReadTime, maxReadTime } = opts;
  const skip = (page - 1) * limit;

  // 1. First attempt: AI Semantic Search via Gemini + concept expansion
  if (q && q.trim() !== "") {
    try {
      const semanticResults = await semanticSearchService.searchSemantic(q);
      if (semanticResults && semanticResults.length > 0) {
        let filtered = semanticResults;
        if (theme && theme.toLowerCase() !== "all") {
          filtered = filtered.filter((s: any) =>
            s.themes.some((t: any) => t.slug?.toLowerCase() === theme.toLowerCase() || t.name?.toLowerCase() === theme.toLowerCase())
          );
        }
        if (state && state.toLowerCase() !== "all") {
          filtered = filtered.filter((s: any) =>
            s.state?.slug?.toLowerCase() === state.toLowerCase() || s.state?.name?.toLowerCase() === state.toLowerCase()
          );
        }
        if (author) {
          filtered = filtered.filter((s: any) =>
            s.author?.name?.toLowerCase().includes(author.toLowerCase())
          );
        }
        if (filtered.length > 0) {
          const paginated = filtered.slice(skip, skip + limit);
          return { stories: paginated, total: filtered.length };
        }
      }
    } catch (e) {
      console.warn("Semantic search failed, activating keyword fallback:", e);
    }
  }

  // 2. Fallback: Multi-term token search across title, excerpt, content, tags, themes, state
  const baseWhere: any = {
    status: "Published",
    deleted: false,
  };

  // Filter: Theme
  if (theme && theme.toLowerCase() !== "all") {
    baseWhere.themes = {
      some: {
        theme: {
          OR: [
            { slug: { equals: theme, mode: "insensitive" } },
            { name: { equals: theme, mode: "insensitive" } },
          ],
        },
      },
    };
  }

  // Filter: State
  if (state && state.toLowerCase() !== "all") {
    baseWhere.state = {
      OR: [
        { slug: { equals: state, mode: "insensitive" } },
        { name: { equals: state, mode: "insensitive" } },
      ],
    };
  }

  // Filter: Author
  if (author) {
    baseWhere.author = { name: { contains: author, mode: "insensitive" } };
  }

  // Filter: Reading Time
  if (minReadTime !== null || maxReadTime !== null) {
    baseWhere.readingTime = {};
    if (minReadTime !== null) baseWhere.readingTime.gte = minReadTime;
    if (maxReadTime !== null) baseWhere.readingTime.lte = maxReadTime;
  }

  if (q) {
    const tokens = q
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 1);

    const termsToMatch = tokens.length > 0 ? tokens : [q];

    const orConditions = termsToMatch.flatMap((t) => {
      const safeT = escapeIlike(t);
      return [
        { title: { contains: safeT, mode: "insensitive" } },
        { titleHi: { contains: safeT, mode: "insensitive" } },
        { excerpt: { contains: safeT, mode: "insensitive" } },
        { excerptHi: { contains: safeT, mode: "insensitive" } },
        { slug: { contains: safeT, mode: "insensitive" } },
        { seoKeywords: { contains: safeT, mode: "insensitive" } },
        { author: { name: { contains: safeT, mode: "insensitive" } } },
        { state: { name: { contains: safeT, mode: "insensitive" } } },
        { city: { name: { contains: safeT, mode: "insensitive" } } },
        { tags: { some: { tag: { name: { contains: safeT, mode: "insensitive" } } } } },
        { themes: { some: { theme: { name: { contains: safeT, mode: "insensitive" } } } } },
      ];
    });

    baseWhere.OR = orConditions;
  }

  const orderBy = buildOrderBy(sort);

  const [stories, total] = await Promise.all([
    prisma.story.findMany({
      where: baseWhere,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        titleHi: true,
        excerpt: true,
        excerptHi: true,
        publishedAt: true,
        readingTime: true,
        viewCount: true,
        featured: true,
        author: { select: { id: true, name: true, avatar: true } },
        state:  { select: { id: true, name: true, slug: true } },
        city:   { select: { id: true, name: true } },
        images: {
          orderBy: [{ heroImage: "desc" as const }, { sortOrder: "asc" as const }],
          take: 1,
          select: { imageUrl: true, caption: true },
        },
        tags:   { select: { tag: { select: { name: true, slug: true } } } },
        themes: { select: { theme: { select: { name: true, slug: true } } } },
      },
    }),
    prisma.story.count({ where: baseWhere }),
  ]);

  // Normalize story shape
  const normalized = stories.map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    titleHi: s.titleHi,
    excerpt: s.excerpt,
    excerptHi: s.excerptHi,
    publishedAt: s.publishedAt,
    readingTime: s.readingTime,
    viewCount: s.viewCount,
    featured: s.featured,
    image: s.images[0]?.imageUrl ?? null,
    imageCaption: s.images[0]?.caption ?? null,
    author: s.author,
    state: s.state,
    city: s.city,
    tags: s.tags.map((t) => t.tag),
    themes: s.themes.map((t) => t.theme),
  }));

  return { stories: normalized, total };
}

// ============================================================
// Facets for filter sidebar counts
// ============================================================
async function getFacets(q: string) {
  const safeQ = escapeIlike(q);
  const baseWhere: any = {
    status: "Published",
    deleted: false,
  };
  if (q) {
    baseWhere.OR = [
      { title:   { contains: safeQ, mode: "insensitive" } },
      { titleHi: { contains: safeQ, mode: "insensitive" } },
      { excerpt: { contains: safeQ, mode: "insensitive" } },
      { author:  { name: { contains: safeQ, mode: "insensitive" } } },
      { state:   { name: { contains: safeQ, mode: "insensitive" } } },
      { tags:    { some: { tag: { name: { contains: safeQ, mode: "insensitive" } } } } },
      { themes:  { some: { theme: { name: { contains: safeQ, mode: "insensitive" } } } } },
    ];
  }

  // Get top themes and states from matching stories for filter sidebar
  const matchingStories = await prisma.story.findMany({
    where: baseWhere,
    take: 200, // Sample for facets
    select: {
      state:  { select: { name: true } },
      themes: { select: { theme: { select: { name: true } } } },
    },
  });

  const stateCounts = new Map<string, number>();
  const themeCounts = new Map<string, number>();

  for (const s of matchingStories) {
    if (s.state?.name) {
      stateCounts.set(s.state.name, (stateCounts.get(s.state.name) ?? 0) + 1);
    }
    for (const t of s.themes) {
      if (t.theme?.name) {
        themeCounts.set(t.theme.name, (themeCounts.get(t.theme.name) ?? 0) + 1);
      }
    }
  }

  const topStates = Array.from(stateCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  const topThemes = Array.from(themeCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  return { states: topStates, themes: topThemes };
}

// ============================================================
// Suggestion mode (for the overlay — fast, no facets)
// ============================================================
async function getSuggestions(q: string) {
  if (!q) {
    // Trending / popular suggestions for empty query
    const [popularStories, popularThemes, popularAuthors, popularStates, popularTags, trendingQueries] =
      await Promise.all([
        prisma.story.findMany({
          where: { status: "Published", deleted: false },
          orderBy: { viewCount: "desc" },
          take: 6,
          select: {
            id: true, title: true, titleHi: true, slug: true,
            excerpt: true, excerptHi: true, publishedAt: true,
            viewCount: true,
            author: { select: { name: true } },
            state:  { select: { name: true } },
            images: { take: 1, orderBy: { heroImage: "desc" as const }, select: { imageUrl: true } },
          },
        }),
        prisma.theme.findMany({ take: 6, select: { id: true, name: true, slug: true } }),
        prisma.author.findMany({ take: 5, select: { id: true, name: true, bio: true, avatar: true } }),
        prisma.state.findMany({ take: 6, select: { id: true, name: true, slug: true } }),
        prisma.tag.findMany({ take: 6, select: { id: true, name: true, slug: true } }),
        prisma.searchQueryTracker.findMany({
          orderBy: { count: "desc" },
          take: 8,
          select: { query: true },
        }),
      ]);

    return {
      isSuggestions: true,
      stories: popularStories,
      themes: popularThemes,
      authors: popularAuthors,
      states: popularStates,
      tags: popularTags,
      videos: [],
      webStories: [],
      trending: trendingQueries.map((t) => t.query),
    };
  }

  // Autocomplete suggestions for active query (fast, small result set)
  const safeQ = escapeIlike(q);
  const [stories, themes, authors, states, tags, videos, webStories] = await Promise.all([
    prisma.story.findMany({
      where: {
        status: "Published", deleted: false,
        OR: [
          { title:   { contains: safeQ, mode: "insensitive" } },
          { titleHi: { contains: safeQ, mode: "insensitive" } },
          { excerpt: { contains: safeQ, mode: "insensitive" } },
          { author:  { name: { contains: safeQ, mode: "insensitive" } } },
          { state:   { name: { contains: safeQ, mode: "insensitive" } } },
          { tags:    { some: { tag: { name: { contains: safeQ, mode: "insensitive" } } } } },
          { themes:  { some: { theme: { name: { contains: safeQ, mode: "insensitive" } } } } },
        ],
      },
      take: 6,
      orderBy: { viewCount: "desc" },
      select: {
        id: true, title: true, titleHi: true, slug: true,
        excerpt: true, excerptHi: true, publishedAt: true, viewCount: true,
        author: { select: { name: true } },
        state:  { select: { name: true } },
        images: { take: 1, orderBy: { heroImage: "desc" as const }, select: { imageUrl: true } },
      },
    }),
    prisma.theme.findMany({
      where: { OR: [{ name: { contains: safeQ, mode: "insensitive" } }, { slug: { contains: safeQ, mode: "insensitive" } }] },
      take: 4, select: { id: true, name: true, slug: true },
    }),
    prisma.author.findMany({
      where: { OR: [{ name: { contains: safeQ, mode: "insensitive" } }, { bio: { contains: safeQ, mode: "insensitive" } }] },
      take: 4, select: { id: true, name: true, bio: true, avatar: true },
    }),
    prisma.state.findMany({
      where: { name: { contains: safeQ, mode: "insensitive" } },
      take: 4, select: { id: true, name: true, slug: true },
    }),
    prisma.tag.findMany({
      where: { name: { contains: safeQ, mode: "insensitive" } },
      take: 4, select: { id: true, name: true, slug: true },
    }),
    prisma.video.findMany({
      where: {
        status: "Published",
        OR: [{ title: { contains: safeQ, mode: "insensitive" } }, { titleHi: { contains: safeQ, mode: "insensitive" } }],
      },
      take: 3, select: { id: true, title: true, titleHi: true, slug: true, thumbnail: true },
    }),
    prisma.webStory.findMany({
      where: {
        status: "Published",
        OR: [{ title: { contains: safeQ, mode: "insensitive" } }, { titleHi: { contains: safeQ, mode: "insensitive" } }],
      },
      take: 3, select: { id: true, title: true, titleHi: true, slug: true, coverImage: true },
    }),
  ]);

  return { isSuggestions: false, stories, themes, authors, states, tags, videos, webStories, trending: [] };
}

// ============================================================
// Route handler
// ============================================================
export const Route = createFileRoute("/api/search")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);

        // Rate limiting: 30 requests/min per IP
        const ip = getClientIp(request);
        const rateResult = checkRateLimit(ip, 30, 60 * 1000);
        if (!rateResult.allowed) {
          return json(
            { error: "Too many requests. Please slow down." },
            {
              status: 429,
              headers: {
                "Retry-After": String(Math.ceil((rateResult.resetAt - Date.now()) / 1000)),
              },
            },
          );
        }

        // Parse and validate query
        const rawQ = url.searchParams.get("q") ?? url.searchParams.get("query") ?? "";
        const q = sanitizeInput(rawQ.trim()).substring(0, 200); // Max 200 chars

        // Determine mode: 'suggestions' (overlay) vs 'results' (search page)
        const mode = url.searchParams.get("mode") ?? "suggestions";
        const isResultsMode = mode === "results";

        // Pagination (results mode only)
        const page  = clampInt(url.searchParams.get("page"),  1, 1000, 1);
        const limit = clampInt(url.searchParams.get("limit"), 1, 50, isResultsMode ? 20 : 6);

        // Filters (results mode)
        const sort      = url.searchParams.get("sort");
        const theme     = url.searchParams.get("theme");
        const state     = url.searchParams.get("state");
        const author    = url.searchParams.get("author");
        const minRT     = url.searchParams.get("minReadTime") ? clampInt(url.searchParams.get("minReadTime"), 1, 120, 1) : null;
        const maxRT     = url.searchParams.get("maxReadTime") ? clampInt(url.searchParams.get("maxReadTime"), 1, 120, 60) : null;

        const validSort = sort && VALID_SORTS.has(sort) ? sort : "newest";

        // Cache key
        const cacheKey = `${mode}:${q}:${page}:${limit}:${validSort}:${theme ?? ""}:${state ?? ""}:${author ?? ""}:${minRT}:${maxRT}`;
        const now = Date.now();
        const cached = searchCache.get(cacheKey);
        if (cached && cached.expiry > now) {
          return json(cached.data);
        }

        try {
          if (isResultsMode) {
            // Full paginated search for /search page
            const [searchResult, facets] = await Promise.all([
              searchStories({ q, page, limit, sort: validSort, theme: theme ?? null, state: state ?? null, author: author ?? null, minReadTime: minRT, maxReadTime: maxRT }),
              q ? getFacets(q) : Promise.resolve({ states: [], themes: [] }),
            ]);

            const payload = {
              stories: searchResult.stories,
              total: searchResult.total,
              page,
              limit,
              pageCount: Math.ceil(searchResult.total / limit),
              query: q,
              facets,
            };

            searchCache.set(cacheKey, { data: payload, expiry: now + CACHE_TTL_RESULTS });

            // Async: track query for trending computation
            if (q.length >= 2) {
              prisma.searchQueryTracker.upsert({
                where: { query: q.toLowerCase() },
                update: { count: { increment: 1 } },
                create: { query: q.toLowerCase(), count: 1 },
              }).catch(() => {});
            }

            return json(payload);
          } else {
            // Suggestion mode for search overlay
            const suggestions = await getSuggestions(q);

            const ttl = q ? CACHE_TTL_RESULTS : CACHE_TTL_SUGGESTIONS;
            searchCache.set(cacheKey, { data: suggestions, expiry: now + ttl });

            if (q.length >= 2) {
              prisma.searchQueryTracker.upsert({
                where: { query: q.toLowerCase() },
                update: { count: { increment: 1 } },
                create: { query: q.toLowerCase(), count: 1 },
              }).catch(() => {});
            }

            return json(suggestions);
          }
        } catch (error: any) {
          console.error("Search query failed:", error?.message);
          return json({ error: "Search temporarily unavailable." }, { status: 500 });
        }
      },
    },
  },
});
