import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, sanitizeInput, checkRateLimit, getClientIp, authenticate } from "@/routes/api/-_utils";
import { StoryStatus } from "@prisma/client";

// Projection for returning high-fidelity story card details
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
  state: { select: { id: true, name: true, slug: true } },
  author: { select: { id: true, name: true, bio: true, avatar: true } },
  images: {
    orderBy: [{ heroImage: "desc" as any }, { sortOrder: "asc" as any }],
    select: { id: true, imageUrl: true, caption: true },
    take: 1,
  },
  themes: {
    select: {
      theme: { select: { name: true } },
    },
  },
};

function formatReadTime(readingTime: number | null) {
  return readingTime != null && readingTime > 0 ? `${readingTime} min read` : "4 min read";
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ip = getClientIp(request);
        const { allowed } = checkRateLimit(ip, 30, 60 * 1000); // 30 requests per minute limit
        if (!allowed) {
          return json({ error: "Too many requests. Please try again later." }, { status: 429 });
        }

        try {
          const body = await request.json();
          const message = sanitizeInput(String(body.message || ""));
          const lang = body.lang || "en";
          const isHindi = lang === "hi";

          if (!message.trim()) {
            return json({ error: "Message is required" }, { status: 400 });
          }

          // 1. Optional Authentication & Personalization context
          const user = await authenticate(request);
          let userContext = "";
          if (user) {
            const [bookmarks, likes, progress] = await Promise.all([
              prisma.bookmark.findMany({
                where: { userId: user.id },
                take: 3,
                include: { story: { select: { title: true } } },
              }),
              prisma.storyLike.findMany({
                where: { userId: user.id },
                take: 3,
                include: { story: { select: { title: true } } },
              }),
              prisma.readingProgress.findMany({
                where: { userId: user.id, completed: false },
                take: 3,
                include: { story: { select: { title: true } } },
              }),
            ]);

            const bookmarkedTitles = bookmarks.map((b) => b.story.title).join(", ");
            const likedTitles = likes.map((l) => l.story.title).join(", ");
            const readingTitles = progress.map((p) => p.story.title).join(", ");

            userContext = `
Authenticated User Context:
- User is logged in.
- Bookmarks: ${bookmarkedTitles || "None"}
- Liked Stories: ${likedTitles || "None"}
- Currently Reading: ${readingTitles || "None"}
Please use this context to personalize your response if relevant (e.g. recommending similar themes).
`;
          }

          // 2. Keyword & Intent Extraction (Database Search / RAG)
          const cleanQuery = message.toLowerCase();
          const where: any = { status: StoryStatus.Published };
          const andConditions: any[] = [];

          // Theme/State keyword matchers
          const matchedStates = await prisma.state.findMany({
            where: { name: { contains: cleanQuery, mode: "insensitive" } },
            select: { name: true },
          });

          const matchedThemes = await prisma.theme.findMany({
            where: { name: { contains: cleanQuery, mode: "insensitive" } },
            select: { name: true },
          });

          if (matchedStates.length > 0) {
            andConditions.push({
              state: {
                name: { in: matchedStates.map((s) => s.name), mode: "insensitive" },
              },
            });
          }

          if (matchedThemes.length > 0) {
            andConditions.push({
              themes: {
                some: {
                  theme: {
                    name: { in: matchedThemes.map((t) => t.name), mode: "insensitive" },
                  },
                },
              },
            });
          }

          // Filters based on natural speech patterns
          if (cleanQuery.includes("under 5") || cleanQuery.includes("short story") || cleanQuery.includes("कम समय")) {
            andConditions.push({ readingTime: { lte: 5 } });
          }

          if (cleanQuery.includes("hindi") || cleanQuery.includes("हिंदी") || cleanQuery.includes("हिन्दी")) {
            andConditions.push({ titleHi: { not: null } });
          }

          if (cleanQuery.includes("hidden gem") || cleanQuery.includes("unexplored") || cleanQuery.includes("अनोखी")) {
            andConditions.push({ viewCount: { lte: 100 } });
          }

          if (andConditions.length === 0) {
            // General text match fallback if no specific keywords matched
            andConditions.push({
              OR: [
                { title: { contains: cleanQuery, mode: "insensitive" } },
                { excerpt: { contains: cleanQuery, mode: "insensitive" } },
                { content: { contains: cleanQuery, mode: "insensitive" } },
                { seoKeywords: { contains: cleanQuery, mode: "insensitive" } },
              ],
            });
          }

          where.AND = andConditions;

          // Execute search on Prisma
          const storiesRaw = await prisma.story.findMany({
            where,
            take: 4,
            select: storyCardSelect,
          });

          // Format context to feed Gemini
          const databaseContext = storiesRaw
            .map(
              (story) => `
Story Title: ${story.title}
Hindi Title: ${story.titleHi ?? ""}
State: ${story.state?.name ?? "India"}
Themes: ${story.themes?.map((t: any) => t.theme?.name).filter(Boolean).join(", ") ?? ""}
Excerpt: ${story.excerpt}
Slug: ${story.slug}
`
            )
            .join("\n---------------------\n");

          // System prompt with strict instructions
          const prompt = `
You are the "India Story AI Companion", the official AI guide for the India Story Project.

User's Question: "${message}"
Language: ${isHindi ? "Hindi (हिन्दी)" : "English"}

${userContext}

Below are the most relevant stories matching the user's query from our PostgreSQL database:
${databaseContext || "No exact matching stories found in the database."}

INSTRUCTIONS:
1. Answer the user's query in a highly engaging, friendly, and narrative tone.
2. If matching stories from the database are provided, refer to them naturally and suggest the user click on the interactive story cards rendered directly below the chat bubble.
3. NEVER hallucinate stories that do not exist. Only recommend or reference stories present in the provided list.
4. If there are no relevant database stories, use your general knowledge to answer, but ensure your answer is strictly about Indian history, culture, heritage, tourism, festivals, innovations, or unsung heroes. Do not discuss unrelated topics.
5. Keep your response concise (maximum 200 words).
6. Format your reply with clean Markdown (bold text, bullet points).
7. If responding in Hindi, use standard Devanagari script.
`;

          let replyText = "";
          const hasApiKey = !!process.env.GEMINI_API_KEY;

          const getFallbackReply = (stories: any[], isHindiLanguage: boolean) => {
            if (stories.length > 0) {
              const storyList = stories
                .map(
                  (s) =>
                    `* [${isHindiLanguage && s.titleHi ? s.titleHi : s.title}](/stories/${s.slug}) (${s.state?.name ?? "India"})`
                )
                .join("\n");
              return isHindiLanguage
                ? `नमस्ते! वर्तमान में हमारी एआई साथी सेवा अत्यधिक व्यस्त है या दैनिक सीमा पार हो गई है, लेकिन मैंने डेटाबेस में आपकी खोज से संबंधित ये कहानियाँ पाई हैं:\n\n${storyList}\n\nकृपया इन्हें पढ़ें और भारत की प्रेरणादायक कहानियों का अनुभव लें!`
                : `Hello! While our advanced AI companion is currently experiencing high demand or rate limits, I successfully queried our database and found these relevant stories for you:\n\n${storyList}\n\nFeel free to explore these articles!`;
            } else {
              return isHindiLanguage
                ? `नमस्ते! वर्तमान में हमारी एआई सेवा अत्यधिक व्यस्त है, और हमें डेटाबेस में कोई कहानी नहीं मिली। कृपया राजस्थान, केरल या स्वतंत्रता सेनानियों के बारे में अन्य प्रश्नों के साथ प्रयास करें!`
                : `Hello! Our advanced AI services are currently heavily loaded. I couldn't find matching stories directly, but you can try asking about specific states like Kerala, Rajasthan, or sustainable farming!`;
            }
          };

          if (hasApiKey) {
            try {
              const { GoogleGenAI } = await import("@google/genai");
              const ai = new GoogleGenAI({
                apiKey: process.env.GEMINI_API_KEY!,
              });
              const result = await ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: prompt,
              });
              replyText = result.text || "";
            } catch (geminiError: any) {
              console.error("[Gemini API Quota/Connection Error] Failed to call generateContent:", geminiError);
              replyText = getFallbackReply(storiesRaw, isHindi);
            }
          } else {
            replyText = getFallbackReply(storiesRaw, isHindi);
          }

          // Format matching stories to return to frontend for rich card rendering
          const formattedStories = storiesRaw.map((s: any) => {
            const image = s.images?.[0] ?? null;
            return {
              id: s.id,
              slug: s.slug,
              title: isHindi && s.titleHi ? s.titleHi : s.title,
              excerpt: isHindi && s.excerptHi ? s.excerptHi : s.excerpt,
              themes: s.themes?.map((t: any) => t.theme?.name).filter(Boolean) ?? [],
              region: s.state?.name ?? "India",
              readTime: formatReadTime(s.readingTime),
              image: image?.imageUrl || "/Logo-ISP.jpg",
            };
          });

          // Contextual follow-up suggestions
          const suggestions = isHindi
            ? ["राजस्थान की कहानियाँ", "प्रसिद्ध त्योहार", "स्वतंत्रता सेनानी", "5 मिनट से कम समय की कहानियाँ"]
            : ["Explore Rajasthan", "Recommend festival stories", "Freedom fighters", "Stories under 5 minutes"];

          return json({
            reply: replyText,
            stories: formattedStories,
            suggestions,
          });
        } catch (error: any) {
          console.error("Explore AI Error:", error);
          return json({ error: error.message || "Failed to process chat" }, { status: 500 });
        }
      },
    },
  },
});
