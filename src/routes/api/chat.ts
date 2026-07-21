import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, sanitizeInput, checkRateLimit, getClientIp } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ip = getClientIp(request);
        const { allowed } = checkRateLimit(ip, 15, 60 * 1000); // 15 requests per minute limit
        if (!allowed) {
          return json({ error: "Too many requests. Please try again later." }, { status: 429 });
        }

        try {
          const body = await request.json();
          const message = sanitizeInput(String(body.message || ""));
          const lang = body.lang;
          const { GoogleGenAI } = await import("@google/genai");

          if (!message.trim()) {
            return json({ error: "Message is required" }, { status: 400 });
          }

          const isHindi = lang === "hi";

          const stories = await prisma.story.findMany({
            where: {
              status: "Published",
              OR: [
                {
                  title: {
                    contains: message,
                    mode: "insensitive",
                  },
                },
                {
                  excerpt: {
                    contains: message,
                    mode: "insensitive",
                  },
                },
                {
                  content: {
                    contains: message,
                    mode: "insensitive",
                  },
                },
                {
                  themes: {
                    some: {
                      theme: {
                        name: {
                          contains: message,
                          mode: "insensitive",
                        },
                      },
                    },
                  },
                },
                {
                  state: {
                    name: {
                      contains: message,
                      mode: "insensitive",
                    },
                  },
                },
              ],
            },
            take: 5,
            select: {
              title: true,
              titleHi: true,
              excerpt: true,
              excerptHi: true,
              slug: true,
              state: {
                select: {
                  name: true,
                },
              },
              themes: {
                select: {
                  theme: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          });

          const databaseContext = stories
            .map(
              (story) => `
Title: ${story.title}
Hindi Title: ${story.titleHi ?? ""}
State: ${story.state?.name ?? ""}
Themes: ${
                story.themes
                  ?.map((t: any) => t.theme?.name)
                  .filter(Boolean)
                  .join(", ") ?? ""
              }
Excerpt: ${story.excerpt}
Slug: ${story.slug}
`,
            )
            .join("\n---------------------\n");

          const prompt = `
You are Bharat AI, the official AI Guide of India Story Project.

The user asked:

"${message}"

Language:
${isHindi ? "Hindi" : "English"}

Below are stories from the India Story Project database.

${databaseContext}

Instructions:

1. Answer naturally.

2. If database stories are relevant,
mention them.

3. Recommend the stories.

4. If database has no matching story,
use Gemini knowledge.

5. Talk only about

- India
- History
- Heritage
- Culture
- Tourism
- Freedom Fighters
- Local Heroes
- Traditions
- Innovation
- Festivals
- States
- Languages

6. Never answer unrelated topics.

7. Maximum 300 words.

8. End with a recommendation.

9. Use Markdown.

`;

          let replyText = "";
          const hasApiKey = !!process.env.GEMINI_API_KEY;

          if (hasApiKey) {
            const ai = new GoogleGenAI({
              apiKey: process.env.GEMINI_API_KEY!,
            });
            const result = await ai.models.generateContent({
              model: "gemini-2.0-flash",
              contents: prompt,
            });
            replyText = result.text || "";
          } else {
            // Fallback response using database search
            if (stories.length > 0) {
              const storyList = stories
                .map(
                  (s) =>
                    `* [${isHindi && s.titleHi ? s.titleHi : s.title}](/stories/${s.slug}) (${s.state?.name ?? "India"})`,
                )
                .join("\n");
              replyText = isHindi
                ? `नमस्ते! वर्तमान में मेरी मुख्य एआई सेवा (Gemini API) ऑफ़लाइन है, लेकिन मैंने आपकी खोज से संबंधित ये कहानियाँ डेटाबेस में खोजी हैं:\n\n${storyList}\n\nकृपया इन्हें पढ़ें और प्रेरणा लें!`
                : `Hello! While my advanced AI generation services are currently offline, I found the following relevant stories in our database matching your inquiry:\n\n${storyList}\n\nFeel free to explore these stories to learn more!`;
            } else {
              replyText = isHindi
                ? `नमस्ते! मेरी मुख्य एआई सेवा (Gemini API Key) वर्तमान में कॉन्फ़िगर नहीं है, और मुझे डेटाबेस में कोई कहानी नहीं मिली। कृपया राजस्थान, केरल, या स्वतंत्रता सेनानियों के बारे में अन्य प्रश्नों के साथ प्रयास करें!`
                : `Hello! My advanced AI services are currently not configured. I couldn't find matching stories directly, but you can try asking about specific states like Kerala, Rajasthan, or search themes like sustainable farming!`;
            }
          }

          return json({
            reply: replyText,

            stories: stories.map((story) => ({
              title: isHindi ? story.titleHi || story.title : story.title,
              slug: story.slug,
              state: story.state?.name,
            })),

            suggestions: isHindi
              ? ["राजस्थान", "केरल", "स्वतंत्रता सेनानी", "भारत की संस्कृति"]
              : ["Rajasthan", "Kerala", "Freedom Fighters", "Indian Culture"],
          });
        } catch (error: any) {
          console.error("Gemini Error:", error);

          if (error?.response) {
            try {
              console.error("Gemini Response:", await error.response.text());
            } catch (_) {}
          }

          console.error("Status:", error?.status);
          console.error("Message:", error?.message);

          return json(
            {
              error: error?.message,
              status: error?.status,
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
