import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";
import { StoryStatus } from "@prisma/client";

const db = prisma as any;

export const WORKFLOW_STAGES = [
  "User",
  "Submission",
  "Admin Review",
  "Assign Editor",
  "Editor Revision",
  "Fact Checker",
  "Copy Editor",
  "SEO Review",
  "Legal Review",
  "Final Admin Approval",
  "Scheduled Publish",
  "Automatic Publish",
  "Distribution",
  "Analytics",
] as const;

export const Route = createFileRoute("/api/admin/newsroom/workflow")({
  server: {
    handlers: {
      /**
       * GET /api/admin/newsroom/workflow?storyId=uuid
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
          const story = await db.story.findUnique({
            where: { id: storyId },
            select: {
              id: true,
              title: true,
              status: true,
              scheduledAt: true,
              publishedAt: true,
              assignedEditorId: true,
            },
          });

          if (!story) return json({ error: "Story not found" }, { status: 404 });

          // Fetch latest workflow state AuditLog
          const latestLog = await db.auditLog.findFirst({
            where: {
              action: "STORY_WORKFLOW_STATE",
              details: { contains: storyId },
            },
            orderBy: { createdAt: "desc" },
          });

          let workflow = {
            storyId,
            currentStage: "Editor Revision",
            reviewerId: null,
            factCheckerId: null,
            copyEditorId: null,
            seoReviewerId: null,
            legalReviewerId: null,
            legalApproved: false,
            lockedBy: null,
            lockedAt: null,
            notes: "",
            scheduledPublishAt: story.scheduledAt ? new Date(story.scheduledAt).toISOString() : null,
            autoUnpublishAt: null,
            stageTimestamps: {} as Record<string, string>,
          };

          if (latestLog) {
            try {
              const parsed = JSON.parse(latestLog.details);
              if (parsed.storyId === storyId) {
                workflow = { ...workflow, ...parsed };
              }
            } catch {}
          }

          // Fetch all stage transition audit logs for ISO timestamps timeline
          const stageLogs = await db.auditLog.findMany({
            where: {
              action: "STORY_WORKFLOW_STAGE_TRANSITION",
              details: { contains: storyId },
            },
            orderBy: { createdAt: "asc" },
          });

          const timelineTimestamps: Record<string, string> = {};
          stageLogs.forEach((log: any) => {
            try {
              const meta = JSON.parse(log.details);
              if (meta.stage) {
                timelineTimestamps[meta.stage] = log.createdAt.toISOString();
              }
            } catch {}
          });

          workflow.stageTimestamps = { ...timelineTimestamps, ...workflow.stageTimestamps };

          // Staff selection options
          const staff = await db.author.findMany({
            select: { id: true, name: true },
            orderBy: { name: "asc" },
          });

          return json({ story, workflow, staff, stages: WORKFLOW_STAGES });
        } catch (e: any) {
          console.error("[Workflow API] GET error:", e);
          return json({ error: e.message || "Failed to load workflow state" }, { status: 500 });
        }
      },

      /**
       * POST /api/admin/newsroom/workflow
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
          stage,
          reviewerId,
          factCheckerId,
          copyEditorId,
          seoReviewerId,
          legalReviewerId,
          legalApproved,
          lockedBy,
          lockedAt,
          notes,
          scheduledPublishAt,
          status,
        } = body;

        if (!storyId) return json({ error: "storyId is required" }, { status: 400 });

        try {
          const story = await db.story.findUnique({ where: { id: storyId } });
          if (!story) return json({ error: "Story not found" }, { status: 404 });

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
          }

          const timestampNow = new Date().toISOString();

          if (stage) {
            await db.auditLog.create({
              data: {
                userId: user.id,
                action: "STORY_WORKFLOW_STAGE_TRANSITION",
                details: JSON.stringify({
                  storyId,
                  stage,
                  timestamp: timestampNow,
                  changedBy: user.email || user.id,
                }),
              },
            });
          }

          const payload = {
            storyId,
            currentStage: stage || "Editor Revision",
            reviewerId: reviewerId || null,
            factCheckerId: factCheckerId || null,
            copyEditorId: copyEditorId || null,
            seoReviewerId: seoReviewerId || null,
            legalReviewerId: legalReviewerId || null,
            legalApproved: !!legalApproved,
            lockedBy: lockedBy || null,
            lockedAt: lockedAt || null,
            notes: notes || "",
            scheduledPublishAt: scheduledPublishAt || null,
          };

          await db.auditLog.create({
            data: {
              userId: user.id,
              action: "STORY_WORKFLOW_STATE",
              details: JSON.stringify(payload),
            },
          });

          return json({ success: true, workflow: payload, timestamp: timestampNow });
        } catch (e: any) {
          console.error("[Workflow API] POST error:", e);
          return json({ error: e.message || "Failed to update workflow state" }, { status: 500 });
        }
      },
    },
  },
});
