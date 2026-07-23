import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";

const db = prisma as any;

function jaccardSimilarity(str1: string, str2: string): number {
  const set1 = new Set(str1.toLowerCase().split(/\s+/).filter(Boolean));
  const set2 = new Set(str2.toLowerCase().split(/\s+/).filter(Boolean));
  if (set1.size === 0 || set2.size === 0) return 0;
  
  let intersection = 0;
  for (const item of set1) {
    if (set2.has(item)) intersection++;
  }
  const union = set1.size + set2.size - intersection;
  return Math.round((intersection / union) * 100);
}

export const Route = createFileRoute("/api/admin/newsroom/duplicate-check")({
  server: {
    handlers: {
      /**
       * POST /api/admin/newsroom/duplicate-check
       * Evaluates story title, content, tags, state, district & images against existing database stories
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

        const {
          storyId = "",
          title = "",
          content = "",
          stateId = "",
          cityId = "",
          tags = [],
          imageUrl = "",
        } = body;

        try {
          const existingStories = await db.story.findMany({
            where: {
              deleted: false,
              id: storyId ? { not: storyId } : undefined,
            },
            select: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              content: true,
              stateId: true,
              cityId: true,
              images: { select: { imageUrl: true } },
            },
            take: 100,
          });

          const comparisons: any[] = [];

          for (const s of existingStories) {
            const titleSim = jaccardSimilarity(title, s.title);
            const contentSim = jaccardSimilarity(content.slice(0, 1000), s.content.slice(0, 1000));
            const sameState = stateId && s.stateId === stateId;
            const sameDistrict = cityId && s.cityId === cityId;
            const imageMatch = imageUrl && s.images?.some((img: any) => img.imageUrl === imageUrl);

            let totalScore = Math.round(titleSim * 0.4 + contentSim * 0.4);
            if (sameState) totalScore += 10;
            if (sameDistrict) totalScore += 5;
            if (imageMatch) totalScore += 20;

            const finalScore = Math.min(100, totalScore);

            if (finalScore >= 30) {
              comparisons.push({
                storyId: s.id,
                title: s.title,
                slug: s.slug,
                similarityPercent: finalScore,
                breakdown: {
                  titleSimilarity: titleSim,
                  contentSimilarity: contentSim,
                  sameState,
                  sameDistrict,
                  imageMatch: !!imageMatch,
                },
                warningMessage: `This story is ${finalScore}% similar to "${s.title}"`,
              });
            }
          }

          comparisons.sort((a, b) => b.similarityPercent - a.similarityPercent);

          const highestMatch = comparisons[0] || null;

          return json({
            isDuplicate: highestMatch ? highestMatch.similarityPercent >= 75 : false,
            highestMatch,
            matches: comparisons.slice(0, 5),
            totalScanned: existingStories.length,
          });
        } catch (err: any) {
          console.error("[Duplicate Check API] Error:", err);
          return json({ error: err.message || "Failed to check duplicates" }, { status: 500 });
        }
      },
    },
  },
});
