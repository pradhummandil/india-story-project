import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";
import { StoryStatus } from "@prisma/client";

const db = prisma as any;

export const Route = createFileRoute("/api/admin/newsroom/workflow")({
  server: {
    handlers: {
      /**
       * GET /api/admin/newsroom/workflow?storyId=uuid
       * Retrieve current workflow parameters, timeline, and locks for a story
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
          // 1. Fetch story info
          const story = await db.story.findUnique({
            where: { id: storyId },
            select: { id: true, status: true, scheduledAt: true, publishedAt: true },
          });

          if (!story) return json({ error: "Story not found" }, { status: 404 });

          // 2. Fetch latest workflow state AuditLog
          const latestLog = await db.auditLog.findFirst({
            where: {
              action: "STORY_WORKFLOW_STATE",
              details: { contains: storyId },
            },
            orderBy: { createdAt: "desc" },
          });

          let workflow = {
            storyId,
            reviewerId: null,
            factCheckerId: null,
            legalReviewerId: null,
            lockedBy: null,
            lockedAt: null,
            notes: "",
            autoUnpublishAt: null,
          };

          if (latestLog) {
            try {
              const parsed = JSON.parse(latestLog.details);
              if (parsed.storyId === storyId) {
                workflow = { ...workflow, ...parsed };
              }
            } catch {
              // Ignore malformed logs
            }
          }

          // Check if lock has expired (10 minutes lease time)
          if (workflow.lockedAt && workflow.lockedBy) {
            const lockTime = new Date(workflow.lockedAt).getTime();
            const lockAgeMinutes = (Date.now() - lockTime) / (60 * 1000);
            if (lockAgeMinutes > 10) {
              workflow.lockedBy = null;
              workflow.lockedAt = null;
            }
          }

          // 3. Fetch all system reviewers / fact-checkers / authors for options selection
          // Map profiles to option list
          const staff = await db.author.findMany({
            select: { id: true, name: true },
            orderBy: { name: "asc" },
          });

          // 4. Fetch the timeline of events for this story
          const timelineLogs = await db.auditLog.findMany({
            where: {
              details: { contains: storyId },
            },
            orderBy: { createdAt: "desc" },
            take: 30,
          });

          const timeline = timelineLogs.map((log: any) => {
            let meta = {};
            try {
              meta = JSON.parse(log.details);
            } catch {}

            return {
              id: log.id,
              action: log.action,
              userId: log.userId,
              createdAt: log.createdAt.toISOString(),
              meta,
            };
          });

          return json({
            story,
            workflow,
            staff,
            timeline,
          });
        } catch (e: any) {
          console.error("[Workflow API] GET error:", e);
          return json({ error: e.message || "Failed to load workflow state" }, { status: 500 });
        }
      },

      /**
       * POST /api/admin/newsroom/workflow
       * Set assignments, locks, schedule dates, or workflow notes
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
          storyId,
          reviewerId,
          factCheckerId,
          legalReviewerId,
          lockedBy,
          lockedAt,
          notes,
          scheduledPublishAt,
          autoUnpublishAt,
          status,
        } = body;

        if (!storyId) {
          return json({ error: "storyId is required" }, { status: 400 });
        }

        try {
          const story = await db.story.findUnique({ where: { id: storyId } });
          if (!story) return json({ error: "Story not found" }, { status: 404 });

          // 1. If status or scheduledAt changes, update the Story record
          const updateData: any = {};
          if (status) {
            updateData.status = status as StoryStatus;
            if (status === StoryStatus.Published && !story.publishedAt) {
              updateData.publishedAt = new Date();
            }
          }
          if (scheduledPublishAt !== undefined) {
            updateData.scheduledAt = scheduledPublishAt ? new Date(scheduledPublishAt) : null;
          }

          if (Object.keys(updateData).length > 0) {
            await db.story.update({
              where: { id: storyId },
              data: updateData,
            });

            // Write status update to timeline
            if (status) {
              await db.auditLog.create({
                data: {
                  userId: user.id,
                  action: "STORY_STATUS_CHANGE",
                  details: JSON.stringify({
                    storyId,
                    from: story.status,
                    to: status,
                  }),
                },
              });
            }
          }

          // 2. Save the new workflow parameters into AuditLog
          const payload = {
            storyId,
            reviewerId: reviewerId || null,
            factCheckerId: factCheckerId || null,
            legalReviewerId: legalReviewerId || null,
            lockedBy: lockedBy || null,
            lockedAt: lockedAt || null,
            notes: notes || "",
            scheduledPublishAt: scheduledPublishAt || null,
            autoUnpublishAt: autoUnpublishAt || null,
          };

          const workflowLog = await db.auditLog.create({
            data: {
              userId: user.id,
              action: "STORY_WORKFLOW_STATE",
              details: JSON.stringify(payload),
            },
          });

          // Log lock adjustments separately for timeline context
          if (lockedBy && lockedAt) {
            await db.auditLog.create({
              data: {
                userId: user.id,
                action: "STORY_ACQUIRE_LOCK",
                details: JSON.stringify({ storyId, lockedBy }),
              },
            });
          } else if (lockedBy === null && lockedAt === null) {
            await db.auditLog.create({
              data: {
                userId: user.id,
                action: "STORY_RELEASE_LOCK",
                details: JSON.stringify({ storyId }),
              },
            });
          }

          return json({ success: true, workflow: payload });
        } catch (e: any) {
          console.error("[Workflow API] POST error:", e);
          return json({ error: e.message || "Failed to update workflow state" }, { status: 500 });
        }
      },
    },
  },
});
