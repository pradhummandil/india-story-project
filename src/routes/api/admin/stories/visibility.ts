import { createFileRoute } from "@tanstack/react-router";
import { json, verifyAdmin } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";
import { StoryStatus } from "@prisma/client";

export const Route = createFileRoute("/api/admin/stories/visibility")({
  server: {
    handlers: {
      PATCH: async ({ request }) => {
        const admin = await verifyAdmin(request);
        if (!admin) return json({ error: "Forbidden" }, { status: 403 });

        try {
          const body = await request.json();
          const { storyId, status } = body;

          if (!storyId || !status) {
            return json({ error: "storyId and status are required" }, { status: 400 });
          }

          // Validate status
          const validStatuses = Object.keys(StoryStatus);
          if (!validStatuses.includes(status)) {
            return json(
              { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
              { status: 400 },
            );
          }

          const story = await prisma.story.update({
            where: { id: storyId },
            data: {
              status: status as StoryStatus,
            },
          });

          return json({ success: true, storyId: story.id, status: story.status });
        } catch (e: any) {
          console.error("[admin/stories/visibility] PATCH error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
