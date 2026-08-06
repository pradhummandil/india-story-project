import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, sanitizeInput } from "@/routes/api/-_utils";
import { stories as fallbackStories } from "@/lib/stories-data";

export const Route = createFileRoute("/api/stories/ask")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const storyId = sanitizeInput(String(body.storyId || ""));
          const storySlug = sanitizeInput(String(body.storySlug || body.slug || ""));
          const question = sanitizeInput(String(body.question || ""));
          const lang = body.lang || "en";
          const isHindi = lang === "hi";

          // Optional client-provided story details fallback
          const clientTitle = sanitizeInput(String(body.title || ""));
          const clientContent = sanitizeInput(String(body.content || ""));

          if ((!storyId && !storySlug) || !question) {
            return json({ error: "Story ID or Slug and Question are required" }, { status: 400 });
          }

          let storyTitle = clientTitle;
          let storyContent = clientContent;

          // 1. Try finding story in Prisma database by id or slug
          try {
            const dbStory = await prisma.story.findFirst({
              where: {
                OR: [
                  { id: storyId || undefined },
                  { slug: storySlug || storyId || undefined },
                ],
              },
              select: {
                id: true,
                title: true,
                titleHi: true,
                content: true,
                contentHi: true,
                excerpt: true,
                excerptHi: true,
                region: true,
                authorName: true,
              },
            });

            if (dbStory) {
              storyTitle = isHindi && dbStory.titleHi ? dbStory.titleHi : dbStory.title;
              storyContent =
                (isHindi && dbStory.contentHi ? dbStory.contentHi : dbStory.content) ||
                (isHindi && dbStory.excerptHi ? dbStory.excerptHi : dbStory.excerpt) ||
                "";
            }
          } catch (dbErr) {
            console.warn("[Story Ask API] Database lookup warning:", dbErr);
          }

          // 2. Fallback to local catalogue array if DB did not return content
          if (!storyTitle || !storyContent) {
            const matchedFallback = fallbackStories.find(
              (s) => s.id === storyId || s.slug === storySlug || s.slug === storyId
            );
            if (matchedFallback) {
              storyTitle = storyTitle || matchedFallback.title;
              storyContent = storyContent || matchedFallback.content || matchedFallback.excerpt || "";
            }
          }

          // Default fallback title if still missing
          storyTitle = storyTitle || "India Story Chronicle";
          storyContent = storyContent || "This chronicle documents grassroots impact, heritage, and social change across India.";

          const systemPrompt = `
You are the official AI Editorial Assistant of India Story Project.
The user is asking a question about the story titled: "${storyTitle}".

=== STORY CONTENT ===
"""
${storyContent}
"""

USER QUESTION: "${question}"
LANGUAGE: ${isHindi ? "Hindi (हिन्दी)" : "English"}

RESPONSE INSTRUCTIONS:
1. Answer the question accurately using the story content above as your primary context.
2. Provide a warm, narrative, and authoritative response connecting the question to the story's historical, cultural, or social themes.
3. Keep the response concise, informative, and beautifully formatted with clean Markdown (under 180 words).
4. If replying in Hindi, use natural, inspiring Devanagari.
`;

          const apiKey = process.env.GEMINI_API_KEY || "";
          let replyText = "";

          // 3. Try Gemini API via REST fallback endpoints (same as /api/chat)
          if (apiKey) {
            const modelsToTry = [
              "gemini-flash-latest",
              "gemini-flash-lite-latest",
              "gemini-2.0-flash",
            ];

            for (const model of modelsToTry) {
              try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
                const res = await fetch(url, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    contents: [{ parts: [{ text: systemPrompt }] }],
                  }),
                });

                const data = await res.json();
                if (res.ok) {
                  replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                  if (replyText) break;
                }
              } catch (err) {
                console.warn(`[Story Ask API] Model ${model} failed:`, err);
              }
            }
          }

          // 4. Intelligent Contextual Fallback if API key is not present or API call fails
          if (!replyText) {
            const lowerQ = question.toLowerCase();
            if (isHindi) {
              if (lowerQ.includes("क्या") || lowerQ.includes("कहान")) {
                replyText = `**"${storyTitle}"** के बारे में:\n\nयह कहानी भारत के जमीनी स्तर के परिवर्तन और सांस्कृतिक योगदान को दर्शाती है। मुख्य विवरणों के लिए ऊपर दी गई पूरी कहानी पढ़ें।`;
              } else {
                replyText = `**"${storyTitle}"**:\n\nयह वृत्तांत भारत के सामाजिक और सांस्कृतिक परिदृश्य में सकारात्मक बदलाव लाने वाले प्रयासों को उजागर करता है।`;
              }
            } else {
              if (lowerQ.includes("what") || lowerQ.includes("behind") || fontIncludes(lowerQ, ["story", "who", "why"])) {
                replyText = `**About "${storyTitle}"**:\n\nThis chronicle highlights grassroots changemakers, cultural heritage, and local impact across India. You can explore the full story above for complete details!`;
              } else {
                replyText = `**"${storyTitle}"**:\n\nThis chronicle documents authentic stories of transformation, resilience, and subcontinental wisdom.`;
              }
            }
          }

          return json({ answer: replyText });
        } catch (error: any) {
          console.error("Ask Story API Error:", error);
          return json({ error: error.message || "Failed to process question" }, { status: 500 });
        }
      },
    },
  },
});

function fontIncludes(text: string, words: string[]) {
  return words.some((w) => text.includes(w));
}
