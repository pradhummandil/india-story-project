import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, sanitizeInput } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/stories/ask")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const storyId = sanitizeInput(String(body.storyId || ""));
          const question = sanitizeInput(String(body.question || ""));
          const lang = body.lang || "en";
          const isHindi = lang === "hi";

          if (!storyId || !question) {
            return json({ error: "Story ID and Question are required" }, { status: 400 });
          }

          // Fetch the story content
          const story = await prisma.story.findUnique({
            where: { id: storyId },
            select: {
              id: true,
              title: true,
              titleHi: true,
              content: true,
              contentHi: true,
            },
          });

          if (!story) {
            return json({ error: "Story not found" }, { status: 404 });
          }

          const storyTitle = isHindi && story.titleHi ? story.titleHi : story.title;
          const storyContent = isHindi && story.contentHi ? story.contentHi : story.content;

          const prompt = `
You are an expert Indian cultural historian and AI editorial companion.
The user is asking a question about the story titled: "${storyTitle}".

Here is the story content:
"""
${storyContent}
"""

User Question: "${question}"

Instructions:
1. Answer the question accurately using the story content as context.
2. If the answer cannot be found in the story, use your general knowledge of Indian history/culture, but keep it directly related to the story context.
3. Answer in the same language as the user's question (either English or Hindi).
4. Keep the answer concise, informative, and engaging (under 180 words).
5. Format your response with clean Markdown.
`;

          let replyText = "";
          const hasApiKey = !!process.env.GEMINI_API_KEY;

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
            } catch (geminiError) {
              console.error("[Gemini Story Q&A Error]:", geminiError);
            }
          }

          if (!replyText) {
            // Fallback answer based on content matching or a friendly message
            if (isHindi) {
              replyText = `नमस्ते! वर्तमान में हमारी उन्नत एआई सेवा व्यस्त है। आपकी कहानी "${storyTitle}" के बारे में पूछे गए प्रश्न पर विचार करने के लिए धन्यवाद। कृपया बाद में पुनः प्रयास करें!`;
            } else {
              replyText = `Hello! While our advanced AI companion is currently experiencing high demand, thank you for exploring more about "${storyTitle}". Please try asking again in a few moments!`;
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
