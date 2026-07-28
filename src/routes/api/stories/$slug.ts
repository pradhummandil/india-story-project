import { createFileRoute } from "@tanstack/react-router";

import { storyService } from "@/lib/services/story-service.server";
import { invalidQueryResponse, json, authenticate } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";

export const Route = createFileRoute("/api/stories/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const slug = params.slug?.trim();
        if (!slug) {
          return invalidQueryResponse("A story slug is required");
        }

        const story = await storyService.getStoryBySlug(slug);

        if (!story) {
          return json({ error: "Story not found" }, { status: 404 });
        }

        return json(story);
      },

      POST: async ({ params, request }) => {
        const slug = params.slug?.trim();
        if (!slug) {
          return invalidQueryResponse("A story slug is required");
        }

        try {
          const dbStory = await prisma.story.findFirst({
            where: { slug, status: "Published" },
            select: {
              id: true,
              themes: { select: { theme: { select: { id: true, name: true } } } },
              state: { select: { name: true } },
            },
          });

          if (dbStory) {
            // Increment view count atomically
            const updated = await prisma.story.update({
              where: { id: dbStory.id },
              data: { viewCount: { increment: 1 } },
              select: { viewCount: true },
            });

            await prisma.storyView.create({
              data: { storyId: dbStory.id },
            });

            // If user is authenticated, update their UserInterest + UserHistory
            try {
              const user = await authenticate(request);
              if (user) {
                const themeIds = (dbStory.themes ?? []).map((t: any) => t.theme?.id).filter(Boolean);
                const stateName = dbStory.state?.name ?? null;

                // Upsert interest score per theme
                for (const themeId of themeIds) {
                  await (prisma as any).userInterest.upsert({
                    where: { userId_themeId_stateName: { userId: user.id, themeId, stateName: null } },
                    create: { userId: user.id, themeId, stateName: null, score: 1.0 },
                    update: { score: { increment: 0.5 } },
                  });
                }

                // Upsert interest score per state
                if (stateName) {
                  await (prisma as any).userInterest.upsert({
                    where: { userId_themeId_stateName: { userId: user.id, themeId: null, stateName } },
                    create: { userId: user.id, themeId: null, stateName, score: 1.0 },
                    update: { score: { increment: 0.3 } },
                  });
                }

                // Log to UserHistory
                await (prisma as any).userHistory.create({
                  data: {
                    userId: user.id,
                    actionType: "VIEW",
                    targetId: dbStory.id,
                    metadata: slug,
                  },
                });
              }
            } catch (interestErr) {
              // Non-critical: don't fail the view count on interest update errors
              console.warn("[StoryView] Interest update failed:", interestErr);
            }

            return json({ success: true, viewCount: updated.viewCount });
          }
          return json({ success: false, message: "Story not in database" });
        } catch (e) {
          console.error("Failed to increment story view count:", e);
          return json({ success: false, error: String(e) }, { status: 500 });
        }
      },
    },
  },
});
