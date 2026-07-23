import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";

const db = prisma as any;

export const Route = createFileRoute("/api/admin/newsroom/translate-sync")({
  server: {
    handlers: {
      /**
       * POST /api/admin/newsroom/translate-sync
       * AI Translation Pipeline & English ↔ Hindi Sync Controller
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

        const { storyId, action, sourceLang = "en", targetLang = "hi", text = "" } = body;

        try {
          // Action 1: Flag opposing language as outdated
          if (action === "flag-outdated") {
            if (!storyId) return json({ error: "storyId required" }, { status: 400 });
            
            // Record audit log for translation sync flag
            await db.auditLog.create({
              data: {
                userId: user.id,
                action: "TRANSLATION_OUTDATED_FLAG",
                details: JSON.stringify({
                  storyId,
                  modifiedLang: sourceLang,
                  outdatedLang: targetLang,
                  timestamp: new Date().toISOString(),
                }),
              },
            });

            // Create notification for assigned editor if present
            const story = await db.story.findUnique({
              where: { id: storyId },
              select: { assignedEditorId: true, title: true },
            });

            if (story?.assignedEditorId) {
              await db.notification.create({
                data: {
                  recipientId: story.assignedEditorId,
                  senderId: user.id,
                  storyId,
                  type: "TRANSLATION_OUTDATED",
                  title: "Translation Sync Alert",
                  message: `The ${sourceLang === "en" ? "English" : "Hindi"} text for "${story.title}" was updated. Please re-sync the ${targetLang === "hi" ? "Hindi" : "English"} translation.`,
                  priority: "high",
                  actionUrl: `/admin/newsroom/story/${storyId}`,
                },
              });
            }

            return json({ success: true, flaggedOutdated: targetLang });
          }

          // Action 2: Perform AI Translation
          if (action === "translate") {
            if (!text) return json({ error: "text is required to translate" }, { status: 400 });

            const hasApiKey = !!process.env.GEMINI_API_KEY;
            let translatedText = "";

            if (hasApiKey) {
              const { GoogleGenAI } = await import("@google/genai");
              const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
              const prompt = sourceLang === "en"
                ? `Translate the following English journalism text into elegant, culturally rich Hindi (Devanagari script). Maintain paragraph breaks and tone:\n\n${text}`
                : `Translate the following Hindi text into clear, publication-ready English narrative non-fiction:\n\n${text}`;

              const response = await ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: prompt,
              });

              translatedText = response.text || "";
            } else {
              translatedText = `[AI Translation Pipeline — Local Sync]\n${text}\n\n(Note: Connect GEMINI_API_KEY for automatic dual-language neural translation)`;
            }

            if (storyId) {
              const updateData: any = {};
              if (targetLang === "hi") {
                updateData.contentHi = translatedText;
              } else {
                updateData.content = translatedText;
              }
              await db.story.update({
                where: { id: storyId },
                data: updateData,
              });
            }

            return json({
              success: true,
              sourceLang,
              targetLang,
              translatedText,
            });
          }

          return json({ error: "Invalid action" }, { status: 400 });
        } catch (err: any) {
          console.error("[Translation Sync API] Error:", err);
          return json({ error: err.message || "Failed to process translation sync" }, { status: 500 });
        }
      },
    },
  },
});
