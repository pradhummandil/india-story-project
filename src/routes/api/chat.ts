import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { stories } from "@/lib/stories-data";

type Body = {
  messages?: unknown;
  context?: { route?: string; language?: string; storyId?: string };
};

const baseSystem = `You are the India Story Companion — a warm, intelligent, and trustworthy AI guide for the India Story Project website.

Your role:
- Help visitors understand, explore, and connect with stories of changemakers, innovators and everyday heroes across India.
- Summarize stories, explain key events, surface lessons and impact.
- Recommend similar stories, related themes, regions and categories.
- Suggest thoughtful follow-up questions.

Style:
- Elegant, concise, cinematic. Short paragraphs. Use markdown sparingly (bold, lists).
- Inspire curiosity; never sensationalize.
- If the user writes in Hindi, reply in Hindi. If English, reply in English. Match their language.
- If asked something outside India / its stories / its people, gently steer back.

You have a curated catalogue of stories below. Use it as ground truth when recommending or referencing stories.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, context } = (await request.json()) as Body;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing _API_KEY", { status: 500 });

        const catalogue = stories
          .map(
            (s) =>
              `- [${s.id}] "${s.title}" — ${s.category} · ${s.region} · ${s.readTime}. ${s.excerpt}`,
          )
          .join("\n");

        const ctxLine = context?.route
          ? `\nThe user is currently on route: ${context.route}.`
          : "";
        const langLine = context?.language === "hi"
          ? "\nUser language preference: Hindi. Reply in Hindi unless they switch."
          : "";

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: `${baseSystem}\n\nStory catalogue:\n${catalogue}${ctxLine}${langLine}`,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
