import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";
import { GoogleGenAI } from "@google/genai";

const db = prisma as any;

export const Route = createFileRoute("/api/admin/newsroom/ai-helper")({
  server: {
    handlers: {
      /**
       * POST /api/admin/newsroom/ai-helper
       * AI editorial assistant pipeline using Gemini
       */
      POST: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        let body: any;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const { task, title = "", excerpt = "", content = "" } = body;
        if (!task) {
          return json({ error: "task is a required field" }, { status: 400 });
        }

        const hasApiKey = !!process.env.GEMINI_API_KEY;

        try {
          // ─── Gemini API Active Path ─────────────────────────────────────────
          if (hasApiKey) {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
            let prompt = "";

            if (task === "rewrite") {
              prompt = `Rewrite the following editorial text to improve grammar, flow, and sentence variety while maintaining its original historical and cultural context exactly:\n\n${content}`;
            } else if (task === "grammar") {
              prompt = `Proofread the following article for punctuation, grammar errors, and typos. Provide ONLY the corrected text without any introductory remarks:\n\n${content}`;
            } else if (task === "readability") {
              prompt = `Simplify the sentence structures in the following text to make it easy to read and accessible to a general audience. Maintain a respectful tone:\n\n${content}`;
            } else if (task === "seo-title") {
              prompt = `Based on this story title "${title}" and content preview "${excerpt}", generate 3 compelling, SEO-optimized page titles (under 60 characters) and suggest the best one.`;
            } else if (task === "meta") {
              prompt = `Generate an optimized SEO Meta Description (between 120 and 155 characters) for a story titled "${title}" with this excerpt: "${excerpt}".`;
            } else if (task === "keywords") {
              prompt = `Suggest 8-10 search keywords or tags for a story about: "${title}". Output only a comma-separated list.`;
            } else if (task === "slug") {
              prompt = `Generate a clean, lowercase url-friendly URL slug for the story title: "${title}". Output ONLY the slug text, e.g. local-hero-story.`;
            } else if (task === "summary") {
              prompt = `Write a concise 2-sentence editorial summary of the following story content:\n\n${content}`;
            } else if (task === "social") {
              prompt = `Generate 3 variations of social media captions (Instagram, Twitter, LinkedIn) with relevant hashtags for a story titled "${title}".`;
            } else if (task === "newsletter") {
              prompt = `Draft a premium newsletter email paragraph inviting subscribers to read our new story titled "${title}" (excerpt: "${excerpt}"). Make it engaging, starting with a Namaste.`;
            } else if (task === "suggest-themes") {
              prompt = `Recommend 2-3 standard themes (e.g. History, Culture, Heritage, Science, Innovation, Sustainability, Food, Travel, Startups) for a story with this content:\n\n${content}`;
            } else if (task === "cover-prompt") {
              prompt = `Create a highly detailed image generation prompt (for Midjourney or Imagen) to serve as a cover graphic for a story titled "${title}". The image style should be editorial photography or fine-art painting.`;
            } else if (task === "fact-check") {
              prompt = `Analyze this article and list any specific historical dates, names of figures, places, or mathematical statistics that need validation before publishing. Present as a list:\n\n${content}`;
            } else if (task === "scores") {
              prompt = `Evaluate the title "${title}" and content preview "${content.slice(0, 1000)}" and return a JSON block with scores from 0 to 100 and suggestions. Return ONLY valid JSON format:
{
  "headlineScore": 85,
  "headlineFeedback": "Good action verb but could be shorter.",
  "seoScore": 90,
  "seoFeedback": "Title is optimized. Excerpt needs keywords.",
  "readabilityScore": 80,
  "readabilityFeedback": "Flesch-Kincaid grade is high school level. Sentences are clear."
}`;
            } else if (task === "linguistics") {
              prompt = `Analyze the tone and quality of this text:\n\n${content.slice(0, 1500)}\n\nReturn ONLY a valid JSON block:
{
  "biasRating": "Neutral / Slightly Positive",
  "profanityFlag": false,
  "toneSummary": "Inspirational, historical, and celebratory.",
  "feedback": "No offensive terms detected. Tone matches editorial goals."
}`;
            } else {
              return json({ error: `Unsupported task: ${task}` }, { status: 400 });
            }

            const response = await ai.models.generateContent({
              model: "gemini-2.0-flash",
              contents: prompt,
            });

            const rawText = response.text || "";

            if (task === "scores" || task === "linguistics") {
              // Extract JSON from response if wrapped in markdown code blocks
              const cleanJsonStr = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
              try {
                const parsed = JSON.parse(cleanJsonStr);
                return json(parsed);
              } catch {
                return json({ resultText: rawText });
              }
            }

            return json({ resultText: rawText });
          }

          // ─── Local Fallback Path (No API Key) ────────────────────────────────
          // 1. Duplicate story detection lookup
          if (task === "duplicate-check" || task === "duplicate") {
            const matches = await db.story.findMany({
              where: {
                title: { contains: title, mode: "insensitive" },
                deleted: false,
              },
              select: { title: true, slug: true },
            });
            if (matches.length > 0) {
              return json({
                resultText: `⚠️ Duplicate warning: Found ${matches.length} matching story titles in the database:\n` +
                  matches.map((m: any) => `* [${m.title}](/stories/${m.slug})`).join("\n"),
              });
            }
            return json({ resultText: "✅ No duplicate story titles found in the catalog database." });
          }

          // 2. Readability, SEO and Headline Scoring algorithm
          if (task === "scores") {
            // Count words and sentences
            const words = content.trim().split(/\s+/).filter(Boolean).length;
            const sentences = content.split(/[.!?]+/).filter(Boolean).length || 1;
            const wordsPerSentence = words / sentences;

            let readabilityScore = 100 - Math.min(50, Math.max(0, (wordsPerSentence - 12) * 2));
            if (words === 0) readabilityScore = 0;

            const titleLen = title.length;
            let headlineScore = 100;
            let headlineFeedback = "Great title length.";
            if (titleLen < 20) {
              headlineScore = 65;
              headlineFeedback = "Title is too short. Try to add more descriptive details.";
            } else if (titleLen > 70) {
              headlineScore = 70;
              headlineFeedback = "Title is too long. Keep under 60-70 characters for optimal display.";
            }

            const excerptLen = excerpt.length;
            let seoScore = 95;
            let seoFeedback = "SEO structure checks out correctly.";
            if (excerptLen < 100 || excerptLen > 160) {
              seoScore = 70;
              seoFeedback = "Verify excerpt. Ideal length is 120-160 characters for snippets.";
            }

            return json({
              headlineScore,
              headlineFeedback,
              seoScore,
              seoFeedback,
              readabilityScore: Math.round(readabilityScore),
              readabilityFeedback: `Average sentence length is ${Math.round(wordsPerSentence)} words.`,
            });
          }

          // 3. Linguistics fallback
          if (task === "linguistics") {
            const lowerContent = content.toLowerCase();
            const profanityWords = ["abuse", "hate", "fake", "spam", "vulgar"];
            const containsProfanity = profanityWords.some((w) => lowerContent.includes(w));

            return json({
              biasRating: "Neutral (Local Scan)",
              profanityFlag: containsProfanity,
              toneSummary: "Neutral Scan",
              feedback: containsProfanity
                ? "⚠️ Warning: Found potentially sensitive terms in content scan."
                : "✅ Content scan completed. No vulgarity flags triggered.",
            });
          }

          // 4. Default string operations fallbacks
          let fallbackText = "";
          if (task === "seo-title") {
            fallbackText = `${title} — Editorial Stories | India Story Project`;
          } else if (task === "meta") {
            fallbackText = excerpt || "Discover inspiring chronicles of heritage, science, and heroes on India Story Project.";
          } else if (task === "keywords") {
            fallbackText = "india, history, heritage, culture, custom, chronicler";
          } else if (task === "slug") {
            fallbackText = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          } else if (task === "summary") {
            fallbackText = excerpt || "Editorial summary of the dispatch.";
          } else {
            fallbackText = "Gemini API offline. Please configure process.env.GEMINI_API_KEY to enable smart AI revisions.";
          }

          return json({ resultText: fallbackText });
        } catch (error: any) {
          console.error("[AI Editorial Assistant API] Error:", error);
          return json({ error: error.message || "Failed to process AI assistant task" }, { status: 500 });
        }
      },
    },
  },
});
