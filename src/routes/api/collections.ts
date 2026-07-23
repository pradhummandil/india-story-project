import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";
import { userInterestService } from "@/lib/services/user-interest.service";

const db = prisma as any;

export const Route = createFileRoute("/api/collections")({
  server: {
    handlers: {
      /**
       * GET /api/collections
       * Fetch all collections for the authenticated user with their associated stories
       */
      GET: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const collections = await db.collection.findMany({
            where: { userId: user.id },
            include: {
              stories: {
                include: {
                  story: {
                    select: {
                      id: true,
                      title: true,
                      titleHi: true,
                      slug: true,
                      excerpt: true,
                      readingTime: true,
                      images: { take: 1, select: { imageUrl: true } },
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          });

          const results = collections.map((col: any) => ({
            id: col.id,
            name: col.name,
            createdAt: col.createdAt.toISOString(),
            stories: col.stories.map((cs: any) => cs.story).filter(Boolean),
          }));

          return json({ collections: results });
        } catch (e: any) {
          console.error("[Collections API] GET error:", e);
          return json({ error: e.message || "Failed to load collections" }, { status: 500 });
        }
      },

      /**
       * POST /api/collections
       * Create collection or add story to collection
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

        const { name, collectionId, storyId } = body;

        try {
          // Path A: Create new collection folder
          if (name && !collectionId) {
            const collection = await db.collection.create({
              data: {
                name: name.trim(),
                userId: user.id,
              },
            });
            return json({ success: true, collection });
          }

          // Path B: Add story to collection
          if (collectionId && storyId) {
            // Verify ownership
            const col = await db.collection.findFirst({
              where: { id: collectionId, userId: user.id },
            });
            if (!col) return json({ error: "Collection not found" }, { status: 404 });

            // Check if story is already in collection
            const exists = await db.collectionStory.findUnique({
              where: {
                collectionId_storyId: {
                  collectionId,
                  storyId,
                },
              },
            });

            if (exists) {
              return json({ success: true, message: "Story already in collection" });
            }

            const item = await db.collectionStory.create({
              data: {
                collectionId,
                storyId,
              },
            });

            // Update user recommendation weights for homepage personalization
            const targetStory = await db.story.findUnique({
              where: { id: storyId },
              select: { state: { select: { name: true } }, themes: { take: 1, select: { themeId: true } } },
            });

            if (targetStory) {
              await userInterestService.trackInteraction(user.id, "BOOKMARK", {
                targetId: storyId,
                themeId: targetStory.themes[0]?.themeId,
                stateName: targetStory.state?.name,
              });
            }

            return json({ success: true, item });
          }

          return json({ error: "Provide 'name' or 'collectionId' + 'storyId'" }, { status: 400 });
        } catch (e: any) {
          console.error("[Collections API] POST error:", e);
          return json({ error: e.message || "Failed to edit collections" }, { status: 500 });
        }
      },

      /**
       * PATCH /api/collections
       * Rename an existing collection
       */
      PATCH: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        let body: any;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const { collectionId, name } = body;
        if (!collectionId || !name || !name.trim()) {
          return json({ error: "collectionId and non-empty name are required" }, { status: 400 });
        }

        try {
          const col = await db.collection.findFirst({
            where: { id: collectionId, userId: user.id },
          });
          if (!col) return json({ error: "Collection not found" }, { status: 404 });

          const updated = await db.collection.update({
            where: { id: collectionId },
            data: { name: name.trim() },
          });

          return json({ success: true, collection: updated });
        } catch (e: any) {
          console.error("[Collections API] PATCH error:", e);
          return json({ error: e.message || "Failed to rename collection" }, { status: 500 });
        }
      },

      /**
       * DELETE /api/collections
       * Delete collection or remove story from collection
       */
      DELETE: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        let body: any;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const { collectionId, storyId } = body;
        if (!collectionId) {
          return json({ error: "collectionId is required" }, { status: 400 });
        }

        try {
          // Verify ownership
          const col = await db.collection.findFirst({
            where: { id: collectionId, userId: user.id },
          });
          if (!col) return json({ error: "Collection not found" }, { status: 404 });

          // Path A: Remove story from collection
          if (storyId) {
            await db.collectionStory.delete({
              where: {
                collectionId_storyId: {
                  collectionId,
                  storyId,
                },
              },
            });
            return json({ success: true, message: "Story removed from collection" });
          }

          // Path B: Delete entire collection
          await db.collection.delete({
            where: { id: collectionId },
          });

          return json({ success: true, message: "Collection deleted successfully" });
        } catch (e: any) {
          console.error("[Collections API] DELETE error:", e);
          return json(
            { error: e.message || "Failed to remove collection assets" },
            { status: 500 },
          );
        }
      },
    },
  },
});
