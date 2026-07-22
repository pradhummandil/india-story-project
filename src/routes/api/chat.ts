import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, sanitizeInput, checkRateLimit, getClientIp, authenticate } from "@/routes/api/-_utils";
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
        const { allowed } = checkRateLimit(ip, 40, 60 * 1000); // 40 requests per minute limit
        if (!allowed) {
          return json({ error: "Too many requests. Please try again later." }, { status: 429 });
        }

        try {
          const body = await request.json();
          const message = sanitizeInput(String(body.message || ""));
          const lang = body.lang || "en";
          const isHindi = lang === "hi";
          const history = body.history || [];

          const historyContext = history.length > 0
            ? history.map((m: any) => `${m.sender.toUpperCase()}: ${m.text}`).join("\n")
            : "No previous messages in this session.";

          if (!message.trim()) {
            return json({ error: "Message is required" }, { status: 400 });
          }

          // 1. Fetch User Context for Personalization
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
Authenticated User Profile:
- User is logged in as: ${user.email}
- Bookmarked Stories: ${bookmarkedTitles || "None yet"}
- Liked Stories: ${likedTitles || "None yet"}
- Current Reading Progress: ${readingTitles || "None active"}`;
          }

          // 2. Keyword & Intent Extraction (RAG database search)
          const cleanQuery = message.toLowerCase();
          const where: any = { status: StoryStatus.Published };
          const andConditions: any[] = [];

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

          // Search Prisma
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

          // System Prompt with complete platform context, submission steps, motivational support and website FAQs
          const prompt = `
You are the "India Story AI Companion", the official AI guide for the India Story Project.

=== CONVERSATION HISTORY ===
${historyContext}

USER'S CURRENT QUESTION: "${message}"
LANGUAGE: ${isHindi ? "Hindi (हिन्दी)" : "English"}

${userContext}

=== DATABASE STORIES ===
${databaseContext || "No exact matching stories found in the database."}

=== WEBSITE & PLATFORM KNOWLEDGE ===
- **About the Platform**: India Story Project is a digital repository celebrating local heritage, unsung heroes, cultural traditions, history, art, and local innovations.
- **Key Routes**:
  - Homepage: \`/\`
  - Explore Portal: \`/explore\` (State filters, theme cards, universal search, timeline navigation).
  - Share Story Guide: \`/share-story\` (For submitting new stories).
  - Contributor Signup: \`/join\`
  - User Dashboard: \`/dashboard\` (Bookmarks, liked stories, reading history).
  - Settings/Profile: \`/profile\` (Avatar uploads, account preferences).
- **Core Functions**:
  - Bookmarking: Save articles to read later. Shown in User Dashboard.
  - Avatar Uploads: Handled in Profile page, syncs globally.
  - Submissions: Content contributors can submit articles. These undergo editorial reviews.

=== STORY SUBMISSION ASSISTANT FLOW ===
If the user indicates they want to submit/write a story:
- You must act as an encouraging submission guide.
- Ask for details one-by-one to avoid overwhelming them:
  1. Story Title
  2. Associated State/District
  3. Theme / Short Summary
  4. Full Story & References/Sources
- Once you gather their details, direct them to submit it at the official page: "/share-story".

=== MOTIVATIONAL & EMOTIONAL SUPPORT ===
If the user feels stuck, lacks confidence, or says they don't know how to write:
- Respond with warm, empathetic, and encouraging language.
- Suggest a basic narrative template:
  1. Introduction (The setting/hero)
  2. The Conflict / Action (What did they do?)
  3. The Impact / Lesson (What changed?)
- Reassure them that every voice matters in documentating India's heritage.

=== GENERAL INSTRUCTIONS ===
1. Answer in a warm, narrative, and engaging human tone.
2. If matching database stories are provided, refer to them naturally and guide the user to click the interactive story cards rendered directly below the chat bubble.
3. NEVER fabricate stories that do not exist.
4. If there are no relevant database stories, use your general knowledge to answer, keeping it focused strictly on Indian history, heritage, culture, or tourism.
5. Format your reply with clean Markdown (bold text, bullet points). Keep response under 250 words.
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
                ? `नमस्ते! वर्तमान में हमारी एआई सेवा व्यस्त है, लेकिन मैंने डेटाबेस में आपकी खोज से संबंधित ये कहानियाँ पाई हैं:\n\n${storyList}\n\nकृपया इन्हें पढ़ें और प्रेरणा लें!`
                : `Hello! While our advanced AI companion is currently experiencing high demand, I successfully retrieved these relevant stories from our database:\n\n${storyList}\n\nFeel free to explore these articles!`;
            } else {
              return isHindiLanguage
                ? `नमस्ते! एआई सेवा व्यस्त है और डेटाबेस में कोई कहानी नहीं मिली। कृपया राजस्थान, केरल या स्वतंत्रता सेनानियों के बारे में पूछें!`
                : `Hello! Our advanced AI services are currently heavily loaded. I couldn't find matching stories directly, but you can try asking about specific states like Kerala, Rajasthan, or search themes like sustainable farming!`;
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
              console.error("[Gemini API Error] failed inside chat.ts:", geminiError);
              replyText = getFallbackReply(storiesRaw, isHindi);
            }
          } else {
            replyText = getFallbackReply(storiesRaw, isHindi);
          }

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

          const suggestions = isHindi
            ? [
                "कहानी कैसे सबमिट करें?",
                "राजस्थान की लोक कला",
                "प्रसिद्ध स्वतंत्रता सेनानी",
                "डैशबोर्ड कैसे काम करता है?",
              ]
            : [
                "How to submit a story?",
                "Rajasthan local heritage",
                "Unsung freedom fighters",
                "How does the dashboard work?",
              ];

          return json({
            reply: replyText,
            stories: formattedStories,
            suggestions,
          });
        } catch (error: any) {
          console.error("Chat API Error:", error);
          return json({ error: error.message || "Failed to process chat" }, { status: 500 });
        }
      },
    },
  },
});
