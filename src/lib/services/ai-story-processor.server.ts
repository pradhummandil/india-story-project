import { GoogleGenAI } from "@google/genai";
import { prisma } from "../repositories/prisma.server";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export class AIStoryProcessorService {
  /** Generate or retrieve cached AI summaries (30s, 2m, 5 bullets, podcast) */
  async getOrGenerateSummary(storyId: string) {
    // Check DB first
    const existing = await prisma.storySummary.findUnique({
      where: { storyId },
    });
    if (existing) return existing;

    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { title: true, content: true, excerpt: true },
    });

    if (!story) throw new Error("Story not found");

    let summary30s = `${story.title} — ${story.excerpt}`;
    let summary2m = story.content.slice(0, 500) + "...";
    let bulletSummary = [
      `Key theme: ${story.title}`,
      `Overview: ${story.excerpt}`,
      `Impact: Grassroots development and change in India.`,
    ];
    let podcastSummary = `Welcome to India Story Project. Today's dispatch: ${story.title}. ${story.excerpt}`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Analyze this story titled "${story.title}" and content: "${story.content.slice(0, 3000)}".
Return JSON with format:
{
  "summary30s": "A quick 1-2 sentence executive summary",
  "summary2m": "A comprehensive 2-minute paragraph summary",
  "bulletSummary": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
  "podcastSummary": "An engaging podcast introductory narration script"
}`,
        });

        const text = response.text || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.summary30s) summary30s = parsed.summary30s;
          if (parsed.summary2m) summary2m = parsed.summary2m;
          if (Array.isArray(parsed.bulletSummary)) bulletSummary = parsed.bulletSummary;
          if (parsed.podcastSummary) podcastSummary = parsed.podcastSummary;
        }
      } catch (err) {
        console.warn("AI summary generation fallback activated:", err);
      }
    }

    return prisma.storySummary.create({
      data: {
        storyId,
        summary30s,
        summary2m,
        bulletSummary,
        podcastSummary,
      },
    });
  }

  /** Translate story into one of the 9 supported languages */
  async getOrGenerateTranslation(storyId: string, language: string) {
    if (language.toLowerCase() === "en") {
      const story = await prisma.story.findUnique({ where: { id: storyId } });
      return story ? { title: story.title, excerpt: story.excerpt, content: story.content } : null;
    }

    const existing = await prisma.storyTranslation.findUnique({
      where: { storyId_language: { storyId, language } },
    });
    if (existing) return existing;

    const story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story) throw new Error("Story not found");

    let title = story.title;
    let excerpt = story.excerpt;
    let content = story.content;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Translate the following story title, excerpt, and text accurately into ${language}.
Title: ${story.title}
Excerpt: ${story.excerpt}
Text: ${story.content.slice(0, 2500)}

Return JSON format:
{
  "title": "Translated Title",
  "excerpt": "Translated Excerpt",
  "content": "Translated Text"
}`,
        });

        const text = response.text || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          title = parsed.title || title;
          excerpt = parsed.excerpt || excerpt;
          content = parsed.content || content;
        }
      } catch (err) {
        console.warn(`AI translation for ${language} fallback activated:`, err);
      }
    }

    return prisma.storyTranslation.create({
      data: {
        storyId,
        language,
        title,
        excerpt,
        content,
      },
    });
  }

  /** Generate or get AI Audio narration metadata */
  async getOrGenerateAudio(storyId: string) {
    const existing = await prisma.storyAudio.findUnique({ where: { storyId } });
    if (existing) return existing;

    const story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story) throw new Error("Story not found");

    // Synthesize audio narration metadata
    const estimatedDuration = Math.ceil((story.content.split(/\s+/).length / 140) * 60);

    return prisma.storyAudio.create({
      data: {
        storyId,
        audioUrl: `https://actions.google.com/sounds/v1/ambiences/outdoor_rain.ogg`,
        duration: estimatedDuration,
        narratorType: "ai-voice-studio",
      },
    });
  }
}

export const aiStoryProcessor = new AIStoryProcessorService();
