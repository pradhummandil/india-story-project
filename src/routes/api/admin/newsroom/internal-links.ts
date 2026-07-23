import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";

const db = prisma as any;

export const Route = createFileRoute("/api/admin/newsroom/internal-links")({
  server: {
    handlers: {
      /**
       * POST /api/admin/newsroom/internal-links
       * Analyzes story text and returns recommended internal link suggestions
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

        const { content = "", title = "", stateId = "", themeId = "" } = body;

        try {
          // 1. Fetch States, Themes, and top stories for match lookup
          const states = await db.state.findMany({ select: { name: true, slug: true } });
          const themes = await db.theme.findMany({ select: { name: true, slug: true } });
          const relatedStories = await db.story.findMany({
            where: {
              status: "Published",
              deleted: false,
              ...(stateId ? { stateId } : {}),
            },
            select: { id: true, title: true, slug: true },
            take: 10,
          });

          const suggestions: any[] = [];
          const lowerContent = content.toLowerCase();

          // Check state mentions
          for (const st of states) {
            if (lowerContent.includes(st.name.toLowerCase())) {
              suggestions.push({
                type: "state",
                anchorText: st.name,
                targetUrl: `/explore?state=${st.slug}`,
                reason: `State match: "${st.name}" mentioned in article text.`,
              });
            }
          }

          // Check theme mentions
          for (const th of themes) {
            if (lowerContent.includes(th.name.toLowerCase())) {
              suggestions.push({
                type: "theme",
                anchorText: th.name,
                targetUrl: `/theme/${th.slug}`,
                reason: `Theme match: "${th.name}" mentioned in article text.`,
              });
            }
          }

          // Related stories suggestions
          const storyRecommendations = relatedStories.map((rs: any) => ({
            id: rs.id,
            title: rs.title,
            url: `/stories/${rs.slug}`,
            reason: `Matches state/geographic region`,
          }));

          return json({
            linkSuggestions: suggestions.slice(0, 10),
            relatedStories: storyRecommendations,
          });
        } catch (err: any) {
          console.error("[Internal Links API] Error:", err);
          return json({ error: err.message || "Failed to generate internal links" }, { status: 500 });
        }
      },
    },
  },
});
