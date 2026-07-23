import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/routes/api/-_utils";
import { aiStoryProcessor } from "@/lib/services/ai-story-processor.server";

export const Route = createFileRoute("/api/ai/story-ai")({
  server: {
    handlers: {
      GET: async (ctx: any) => {
        try {
          const req = ctx.request || ctx.req;
          const url = new URL(req.url, "http://localhost");
          const storyId = url.searchParams.get("storyId");
          const action = url.searchParams.get("action") || "summary";
          const language = url.searchParams.get("language") || "hi";

          if (!storyId) {
            return json({ error: "storyId is required" }, { status: 400 });
          }

          if (action === "summary") {
            const summary = await aiStoryProcessor.getOrGenerateSummary(storyId);
            return json({ success: true, summary });
          }

          if (action === "translate") {
            const translation = await aiStoryProcessor.getOrGenerateTranslation(storyId, language);
            return json({ success: true, translation });
          }

          if (action === "audio") {
            const audio = await aiStoryProcessor.getOrGenerateAudio(storyId);
            return json({ success: true, audio });
          }

          return json({ error: "Invalid action" }, { status: 400 });
        } catch (err: any) {
          console.error("Story AI API Error:", err);
          return json({ error: err.message || "Failed to process AI request" }, { status: 500 });
        }
      },
    },
  },
});
