import { GoogleGenAI } from "@google/genai";
import { prisma } from "../repositories/prisma.server";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const STOP_WORDS = new Set([
  "stories", "story", "about", "on", "from", "in", "of", "the", "a", "an", "and", "to", "for", "with", "by", "at", "is", "are"
]);

export class SemanticSearchService {
  /** Expand natural language query into relevant themes, keywords, and topics */
  async searchSemantic(rawQuery: string) {
    if (!rawQuery || rawQuery.trim() === "") return [];

    const cleanedQuery = rawQuery.trim();
    // Extract key words from natural language phrase
    const tokenWords = cleanedQuery
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => !STOP_WORDS.has(w) && w.length > 2);

    let expandedTerms = [...new Set([cleanedQuery, ...tokenWords])];

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `A user searched for "${cleanedQuery}" on India Story Project (a slow journalism & culture platform).
Extract key themes, related topics, states, or concepts to broaden search relevance.
For example: "stories about women changing villages" -> ["Women Empowerment", "Rural Development", "Education", "Villages", "Social Change"].
Return JSON format: { "keywords": ["term1", "term2", "term3", "term4"] }`,
        });

        const text = response.text || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed.keywords)) {
            expandedTerms = [...new Set([...expandedTerms, ...parsed.keywords])];
          }
        }
      } catch (err) {
        console.warn("Semantic search expansion fallback activated:", err);
      }
    }

    // Match stories against expanded search terms in PostgreSQL
    const orConditions = expandedTerms.flatMap((term) => [
      { title: { contains: term, mode: "insensitive" as const } },
      { titleHi: { contains: term, mode: "insensitive" as const } },
      { excerpt: { contains: term, mode: "insensitive" as const } },
      { excerptHi: { contains: term, mode: "insensitive" as const } },
      { content: { contains: term, mode: "insensitive" as const } },
      { seoKeywords: { contains: term, mode: "insensitive" as const } },
      { state: { name: { contains: term, mode: "insensitive" as const } } },
      { tags: { some: { tag: { name: { contains: term, mode: "insensitive" as const } } } } },
      { themes: { some: { theme: { name: { contains: term, mode: "insensitive" as const } } } } },
    ]);

    const storiesRaw = await prisma.story.findMany({
      where: {
        status: "Published",
        deleted: false,
        OR: orConditions,
      },
      take: 30,
      orderBy: { viewCount: "desc" },
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
        state: { select: { id: true, name: true, slug: true } },
        city: { select: { id: true, name: true } },
        images: {
          orderBy: [{ heroImage: "desc" as const }, { sortOrder: "asc" as const }],
          take: 1,
          select: { imageUrl: true, caption: true },
        },
        tags: { select: { tag: { select: { name: true, slug: true } } } },
        themes: { select: { theme: { select: { name: true, slug: true } } } },
      },
    });

    return storiesRaw.map((s) => ({
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
  }
}

export const semanticSearchService = new SemanticSearchService();
