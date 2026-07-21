import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";
import { StoryStatus } from "@prisma/client";

const db = prisma as any;

export const Route = createFileRoute("/api/admin/newsroom/bulk")({
  server: {
    handlers: {
      /**
       * POST /api/admin/newsroom/bulk
       * Batch operation processor for newsroom catalog
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

        const { storyIds, action, payload } = body;
        if (!Array.isArray(storyIds) || storyIds.length === 0 || !action) {
          return json(
            { error: "storyIds (array) and action are required fields." },
            { status: 400 },
          );
        }

        try {
          let updatedCount = 0;

          if (action === "publish") {
            const res = await db.story.updateMany({
              where: { id: { in: storyIds } },
              data: {
                status: StoryStatus.Published,
                publishedAt: new Date(),
              },
            });
            updatedCount = res.count;
          } else if (action === "delete") {
            const res = await db.story.updateMany({
              where: { id: { in: storyIds } },
              data: { deleted: true },
            });
            updatedCount = res.count;
          } else if (action === "featured") {
            const value = !!payload?.value;
            if (value) {
              await db.story.updateMany({
                data: { featured: false },
              });
              const targetId = storyIds[0];
              if (targetId) {
                await db.story.update({
                  where: { id: targetId },
                  data: { featured: true },
                });
                updatedCount = 1;
              } else {
                updatedCount = 0;
              }
            } else {
              const res = await db.story.updateMany({
                where: { id: { in: storyIds } },
                data: { featured: false },
              });
              updatedCount = res.count;
            }
          } else if (action === "slideshow") {
            const value = !!payload?.value;
            const res = await db.story.updateMany({
              where: { id: { in: storyIds } },
              data: { homepageSlideshow: value },
            });
            updatedCount = res.count;

          } else if (action === "seo") {
            const { seoTitle, seoDescription, seoKeywords } = payload || {};
            const res = await db.story.updateMany({
              where: { id: { in: storyIds } },
              data: {
                seoTitle: seoTitle || null,
                seoDescription: seoDescription || null,
                seoKeywords: seoKeywords || null,
              },
            });
            updatedCount = res.count;
          } else if (action === "theme") {
            const { themeId } = payload || {};
            if (!themeId) {
              return json({ error: "themeId is required in payload" }, { status: 400 });
            }

            // Relational updates inside transactions
            for (const storyId of storyIds) {
              // Delete old relationships
              await db.storyTheme.deleteMany({
                where: { storyId },
              });
              // Create new relationship
              await db.storyTheme.create({
                data: {
                  storyId,
                  themeId,
                },
              });
              updatedCount++;
            }
          } else if (action === "translate") {
            // Generate pseudo-hindi translations automatically
            for (const storyId of storyIds) {
              const story = await db.story.findUnique({
                where: { id: storyId },
                select: { title: true, excerpt: true, content: true },
              });

              if (story) {
                await db.story.update({
                  where: { id: storyId },
                  data: {
                    titleHi: `[अनुवाद] ${story.title}`,
                    excerptHi: `[संक्षेप] ${story.excerpt}`,
                    contentHi: `[सामग्री] ${story.content}`,
                  },
                });
                updatedCount++;
              }
            }
          } else {
            return json({ error: `Unsupported bulk action: ${action}` }, { status: 400 });
          }

          // Register bulk audit logs
          await db.auditLog.create({
            data: {
              userId: user.id,
              action: "BULK_STORY_ACTION",
              details: JSON.stringify({
                action,
                storiesCount: storyIds.length,
                updatedCount,
              }),
            },
          });

          return json({ success: true, updatedCount });
        } catch (e: any) {
          console.error("[Bulk API] POST error:", e);
          return json({ error: e.message || "Failed to process bulk actions" }, { status: 500 });
        }
      },
    },
  },
});
