import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { message, lang } = await request.json();

          if (!message?.trim()) {
            return json(
              { error: "Message is required" },
              { status: 400 }
            );
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
                  category: {
                    name: {
                      contains: message,
                      mode: "insensitive",
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
              category: {
                select: {
                  name: true,
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
Category: ${story.category?.name ?? ""}
Excerpt: ${story.excerpt}
Slug: ${story.slug}
`
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

          const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
          });

          return json({
            reply: result.text,

            stories: stories.map((story) => ({
              title: isHindi
                ? story.titleHi || story.title
                : story.title,
              slug: story.slug,
              state: story.state?.name,
            })),

            suggestions: isHindi
              ? [
                  "राजस्थान",
                  "केरल",
                  "स्वतंत्रता सेनानी",
                  "भारत की संस्कृति",
                ]
              : [
                  "Rajasthan",
                  "Kerala",
                  "Freedom Fighters",
                  "Indian Culture",
                ],
          });
        } catch (error: any) {
  console.error("Gemini Error:", error);

  return json(
    {
      error: error.message,
      stack: error.stack,
    },
    { status: 500 }
  );
}
        }
      },
    },
  },
});