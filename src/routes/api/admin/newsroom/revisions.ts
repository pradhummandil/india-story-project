import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";

const db = prisma as any;

export const Route = createFileRoute("/api/admin/newsroom/revisions")({
  server: {
    handlers: {
      /**
       * GET /api/admin/newsroom/revisions?storyId=uuid
       * List all historical revisions of a story
       */
      GET: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        const url = new URL(request.url);
        const storyId = url.searchParams.get("storyId");
        if (!storyId) {
          return json({ error: "storyId parameter is required" }, { status: 400 });
        }

        try {
          const revisions = await db.storyRevision.findMany({
            where: { storyId },
            orderBy: { version: "desc" },
          });

          return json({ revisions });
        } catch (e: any) {
          console.error("[Revisions API] GET error:", e);
          return json({ error: e.message || "Failed to load revisions" }, { status: 500 });
        }
      },

      /**
       * POST /api/admin/newsroom/revisions/restore
       * Rollback a story to a previous revision
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

        const { storyId, revisionId } = body;
        if (!storyId || !revisionId) {
          return json({ error: "storyId and revisionId are required" }, { status: 400 });
        }

        try {
          // 1. Fetch the selected revision
          const revision = await db.storyRevision.findUnique({
            where: { id: revisionId },
          });

          if (!revision || revision.storyId !== storyId) {
            return json({ error: "Revision not found for this story" }, { status: 404 });
          }

          // 2. Fetch current story content
          const story = await db.story.findUnique({
            where: { id: storyId },
          });

          if (!story) {
            return json({ error: "Story not found" }, { status: 404 });
          }

          // 3. Create a revision record of the *current* state before rollback
          const currentVersion = story.version || 1;
          await db.storyRevision.create({
            data: {
              storyId,
              title: story.title,
              excerpt: story.excerpt,
              content: story.content,
              changedBy: user.id,
              version: currentVersion,
            },
          });

          // 4. Restore the selected revision as a NEW version bump on the Story
          const nextVersion = currentVersion + 1;
          const updatedStory = await db.story.update({
            where: { id: storyId },
            data: {
              title: revision.title,
              excerpt: revision.excerpt,
              content: revision.content,
              version: nextVersion,
            },
          });

          // 5. Write an audit log for the rollback
          await db.auditLog.create({
            data: {
              userId: user.id,
              action: "ROLLBACK_STORY",
              details: JSON.stringify({
                storyId,
                fromVersion: currentVersion,
                toVersion: revision.version,
                restoredVersion: nextVersion,
              }),
            },
          });

          return json({ success: true, story: updatedStory });
        } catch (e: any) {
          console.error("[Revisions Restore API] POST error:", e);
          return json({ error: e.message || "Failed to restore revision" }, { status: 500 });
        }
      },
    },
  },
});
