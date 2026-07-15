import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";
import { randomUUID } from "crypto";

const db = prisma as any;

export const Route = createFileRoute("/api/admin/newsroom/comments")({
  server: {
    handlers: {
      /**
       * GET /api/admin/newsroom/comments?storyId=uuid
       * Retrieve internal collaborator notes and editorial feedback for a story
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
          const logs = await db.auditLog.findMany({
            where: {
              action: "STORY_INTERNAL_COMMENT",
              details: { contains: storyId },
            },
            orderBy: { createdAt: "asc" },
          });

          const comments = logs
            .map((log: any) => {
              try {
                const parsed = JSON.parse(log.details);
                if (parsed.storyId === storyId) {
                  return {
                    id: parsed.commentId || log.id,
                    authorName: parsed.authorName || "Staff Member",
                    text: parsed.text,
                    createdAt: parsed.createdAt || log.createdAt.toISOString(),
                  };
                }
              } catch {
                // Skip malformed log rows
              }
              return null;
            })
            .filter(Boolean);

          return json({ comments });
        } catch (e: any) {
          console.error("[Comments API] GET error:", e);
          return json({ error: e.message || "Failed to load internal comments" }, { status: 500 });
        }
      },

      /**
       * POST /api/admin/newsroom/comments
       * Add a new internal comment to the story's editorial workspace
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

        const { storyId, text } = body;
        if (!storyId || !text) {
          return json({ error: "storyId and text are required" }, { status: 400 });
        }

        try {
          // Fetch current user email/metadata for name fallback
          const authorProfile = await db.userProfile.findUnique({
            where: { id: user.id },
            select: { name: true },
          });
          const authorName = authorProfile?.name || user.email?.split("@")[0] || "Editor";

          const commentPayload = {
            storyId,
            commentId: randomUUID(),
            authorId: user.id,
            authorName,
            text: text.trim(),
            createdAt: new Date().toISOString(),
          };

          await db.auditLog.create({
            data: {
              userId: user.id,
              action: "STORY_INTERNAL_COMMENT",
              details: JSON.stringify(commentPayload),
            },
          });

          return json({
            success: true,
            comment: {
              id: commentPayload.commentId,
              authorName,
              text: commentPayload.text,
              createdAt: commentPayload.createdAt,
            },
          });
        } catch (e: any) {
          console.error("[Comments API] POST error:", e);
          return json({ error: e.message || "Failed to submit comment" }, { status: 500 });
        }
      },
    },
  },
});
