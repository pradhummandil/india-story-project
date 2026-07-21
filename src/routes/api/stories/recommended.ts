import { createFileRoute } from "@tanstack/react-router";
import { storyService } from "@/lib/services/story-service.server";
import { invalidQueryResponse, json, readPositiveInt } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/stories/recommended")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const slug = url.searchParams.get("slug") || undefined;
          const limit = readPositiveInt(url.searchParams.get("limit"), 8, "limit");

          if (slug) {
            const stories = await storyService.getRecommendedStories(slug, limit);
            return json(stories);
          }

          // Homepage recommendations using client-passed history parameters
          const viewedIds = (url.searchParams.get("viewed") || "").split(",").filter(Boolean);
          const preferredThemes = (url.searchParams.get("themes") || "").split(",").filter(Boolean);
          const preferredRegions = (url.searchParams.get("regions") || "").split(",").filter(Boolean);

          // Get latest 24 published stories as candidates
          const candidates = await storyService.getLatestStories(24);

          if (viewedIds.length === 0 && preferredThemes.length === 0 && preferredRegions.length === 0) {
            // Anonymous fallback: return latest stories
            return json(candidates.slice(0, limit));
          }

          // Score candidates based on user preferences
          const scored = candidates
            .filter((s) => !viewedIds.includes(s.id))
            .map((s) => {
              let score = 0;
              const storyThemes = Array.isArray(s.themes) ? s.themes : [];
              
              // Score based on theme overlap
              storyThemes.forEach((t) => {
                if (preferredThemes.some((p) => p.toLowerCase() === t.toLowerCase())) {
                  score += 3;
                }
              });

              // Score based on region match
              if (s.region && preferredRegions.some((r) => r.toLowerCase() === s.region.toLowerCase())) {
                score += 2;
              }

              return { story: s, score };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map((x) => x.story);

          const finalResult = scored.length ? scored : candidates.slice(0, limit);
          return json(finalResult);
        } catch (error) {
          return invalidQueryResponse(
            error instanceof Error ? error.message : "Invalid query parameters",
          );
        }
      },
    },
  },
});
