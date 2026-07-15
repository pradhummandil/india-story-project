import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";
import { StoryStatus } from "@prisma/client";

const db = prisma as any;

export const Route = createFileRoute("/api/admin/newsroom/dashboard")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const now = new Date();
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);

          // 1. Fetch all active stories (non-deleted)
          const stories = await db.story.findMany({
            where: { deleted: false },
            include: {
              author: { select: { name: true } },
              state: { select: { name: true } },
            },
            orderBy: { updatedAt: "desc" },
          });

          // 2. Fetch all workflow AuditLogs to extract assignments
          const workflowLogs = await db.auditLog.findMany({
            where: { action: "STORY_WORKFLOW_STATE" },
            orderBy: { createdAt: "desc" },
          });

          // Build a map of latest workflow status by storyId
          const storyWorkflows: Record<string, any> = {};
          for (const log of workflowLogs) {
            try {
              const details = JSON.parse(log.details);
              if (details.storyId && !storyWorkflows[details.storyId]) {
                storyWorkflows[details.storyId] = details;
              }
            } catch {
              // Ignore malformed logs
            }
          }

          // Map helper to format story records
          const mapStory = (s: any) => ({
            id: s.id,
            title: s.title,
            slug: s.slug,
            status: s.status,
            authorName: s.author?.name || "Unknown",
            region: s.state?.name || "India",
            viewCount: s.viewCount,
            publishedAt: s.publishedAt?.toISOString() || null,
            scheduledAt: s.scheduledAt?.toISOString() || null,
            updatedAt: s.updatedAt.toISOString(),
            workflow: storyWorkflows[s.id] || {
              reviewerId: null,
              factCheckerId: null,
              legalReviewerId: null,
              lockedBy: null,
              notes: "",
            },
          });

          // 3. Bucket stories based on status and metadata
          const pendingReview = stories.filter((s: any) => s.status === StoryStatus.Pending).map(mapStory);

          const scheduled = stories.filter(
            (s: any) => s.scheduledAt && new Date(s.scheduledAt) > now
          ).map(mapStory);

          const publishedToday = stories.filter(
            (s: any) => s.status === StoryStatus.Published && s.publishedAt && new Date(s.publishedAt) >= startOfToday
          ).map(mapStory);

          const drafts = stories.filter(
            (s: any) => s.status === StoryStatus.Draft && (!s.scheduledAt || new Date(s.scheduledAt) <= now)
          ).map(mapStory);

          const archived = stories.filter((s: any) => s.status === StoryStatus.Archived).map(mapStory);

          const topPerforming = [...stories]
            .sort((a: any, b: any) => b.viewCount - a.viewCount)
            .slice(0, 10)
            .map(mapStory);

          // Needs Fact Check: has factCheckerId assigned in workflow but status is not Published
          const needsFactCheck = stories.filter((s: any) => {
            const wf = storyWorkflows[s.id];
            return wf && wf.factCheckerId && s.status !== StoryStatus.Published;
          }).map(mapStory);

          // Needs SEO: missing seoTitle or seoDescription, or empty keyword settings
          const needsSEO = stories.filter(
            (s: any) => s.status !== StoryStatus.Archived && (!s.seoTitle || !s.seoDescription)
          ).map(mapStory);

          return json({
            pendingReview,
            needsFactCheck,
            needsSEO,
            scheduled,
            publishedToday: publishedToday.length,
            topPerforming,
            drafts,
            archived,
          });
        } catch (e: any) {
          console.error("[Newsroom Dashboard] GET error:", e);
          return json({ error: e.message || "Failed to load dashboard statistics" }, { status: 500 });
        }
      },
    },
  },
});
