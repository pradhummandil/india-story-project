import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";

const db = prisma as any;

export const Route = createFileRoute("/api/admin/calendar")({
  server: {
    handlers: {
      /**
       * GET /api/admin/calendar
       * Calendar data endpoint: Scheduled stories, editor assignments, state coverage metrics & missing states
       */
      GET: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          // 1. Fetch scheduled & upcoming stories
          const stories = await db.story.findMany({
            where: { deleted: false },
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              scheduledAt: true,
              publishedAt: true,
              createdAt: true,
              assignedEditorId: true,
              assignedEditor: { select: { id: true, name: true, email: true } },
              state: { select: { id: true, name: true, slug: true } },
            },
            orderBy: { scheduledAt: "asc" },
          });

          // 2. Fetch all 28 states & UTs to compute coverage heatmap
          const allStates = await db.state.findMany({
            select: { id: true, name: true, slug: true },
            orderBy: { name: "asc" },
          });

          const coveredStateIds = new Set(stories.map((s: any) => s.state?.id).filter(Boolean));
          const coveredStates = allStates.filter((st: any) => coveredStateIds.has(st.id));
          const missingStates = allStates.filter((st: any) => !coveredStateIds.has(st.id));

          // State story count heatmap object
          const stateCoverageHeatmap: Record<string, number> = {};
          stories.forEach((s: any) => {
            if (s.state?.name) {
              stateCoverageHeatmap[s.state.name] = (stateCoverageHeatmap[s.state.name] || 0) + 1;
            }
          });

          return json({
            stories,
            allStates,
            coveredStatesCount: coveredStates.length,
            missingStatesCount: missingStates.length,
            missingStates: missingStates.map((st: any) => st.name),
            stateCoverageHeatmap,
          });
        } catch (err: any) {
          console.error("[Calendar API] GET error:", err);
          return json({ error: err.message || "Failed to load calendar data" }, { status: 500 });
        }
      },

      /**
       * POST /api/admin/calendar
       * Reschedule story date (Drag-and-Drop)
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

        const { storyId, scheduledAt, assignedEditorId } = body;
        if (!storyId) return json({ error: "storyId is required" }, { status: 400 });

        try {
          const updateData: any = {};
          if (scheduledAt !== undefined) {
            updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
          }
          if (assignedEditorId !== undefined) {
            updateData.assignedEditorId = assignedEditorId || null;
          }

          const updatedStory = await db.story.update({
            where: { id: storyId },
            data: updateData,
          });

          await db.auditLog.create({
            data: {
              userId: user.id,
              action: "CALENDAR_STORY_RESCHEDULED",
              details: JSON.stringify({ storyId, scheduledAt, assignedEditorId }),
            },
          });

          return json({ success: true, story: updatedStory });
        } catch (err: any) {
          console.error("[Calendar API] POST error:", err);
          return json({ error: err.message || "Failed to reschedule story" }, { status: 500 });
        }
      },
    },
  },
});
