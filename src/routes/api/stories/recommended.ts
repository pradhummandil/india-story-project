import { createFileRoute } from "@tanstack/react-router";
import { storyService } from "@/lib/services/story-service.server";
import { invalidQueryResponse, json, readPositiveInt, authenticate } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";

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

          // Get latest 24 published stories as candidates
          const candidates = await storyService.getLatestStories(24);

          // Try authenticated DB-driven personalization first
          try {
            const user = await authenticate(request);
            if (user) {
              // Read top interest scores from PostgreSQL UserInterest table
              const interests = await (prisma as any).userInterest.findMany({
                where: { userId: user.id },
                orderBy: { score: "desc" },
                take: 20,
                include: {
                  // include theme name if themeId is set
                },
              });

              const dbThemeIds = interests
                .filter((i: any) => i.themeId)
                .map((i: any) => i.themeId as string);

              const dbStateNames = interests
                .filter((i: any) => i.stateName)
                .map((i: any) => i.stateName as string);

              // Get viewed story IDs from UserHistory to exclude them
              const viewedHistory = await (prisma as any).userHistory.findMany({
                where: { userId: user.id, actionType: "VIEW" },
                select: { targetId: true },
                orderBy: { createdAt: "desc" },
                take: 50,
              });
              const viewedIds = new Set(viewedHistory.map((h: any) => h.targetId).filter(Boolean));

              if (dbThemeIds.length > 0 || dbStateNames.length > 0) {
                // Fetch theme slugs for matched IDs
                const themes = dbThemeIds.length > 0
                  ? await (prisma as any).theme.findMany({
                      where: { id: { in: dbThemeIds } },
                      select: { name: true, slug: true },
                    })
                  : [];
                const themeNames = themes.map((t: any) => t.name.toLowerCase());

                // Score candidates based on DB-driven interests
                const scored = candidates
                  .filter((s) => !viewedIds.has(s.id))
                  .map((s) => {
                    let score = 0;
                    const storyThemes = Array.isArray(s.themes) ? s.themes : [];
                    storyThemes.forEach((t) => {
                      if (themeNames.some((p: string) => p === t.toLowerCase())) score += 3;
                    });
                    if (s.region && dbStateNames.some((r: string) => r.toLowerCase() === s.region?.toLowerCase())) {
                      score += 2;
                    }
                    return { story: s, score };
                  })
                  .sort((a, b) => b.score - a.score)
                  .slice(0, limit)
                  .map((x) => x.story);

                const finalResult = scored.length ? scored : candidates.slice(0, limit);
                return json(finalResult);
              }
            }
          } catch (authErr) {
            // Non-critical: fall through to client-side params
            console.warn("[Recommended] DB interest lookup failed, falling back:", authErr);
          }

          // Fallback: anonymous / client-passed journey store params
          const viewedIds = (url.searchParams.get("viewed") || "").split(",").filter(Boolean);
          const preferredThemes = (url.searchParams.get("themes") || "").split(",").filter(Boolean);
          const preferredRegions = (url.searchParams.get("regions") || "").split(",").filter(Boolean);

          if (viewedIds.length === 0 && preferredThemes.length === 0 && preferredRegions.length === 0) {
            return json(candidates.slice(0, limit));
          }

          const scored = candidates
            .filter((s) => !viewedIds.includes(s.id))
            .map((s) => {
              let score = 0;
              const storyThemes = Array.isArray(s.themes) ? s.themes : [];
              storyThemes.forEach((t) => {
                if (preferredThemes.some((p) => p.toLowerCase() === t.toLowerCase())) score += 3;
              });
              if (s.region && preferredRegions.some((r) => r.toLowerCase() === s.region?.toLowerCase())) {
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
