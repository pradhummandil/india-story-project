import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";
import { StoryStatus } from "@prisma/client";

export const Route = createFileRoute("/api/admin/stories/bulk")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { ids, action } = body;
          if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return json({ error: "Story IDs array is required" }, { status: 400 });
          }

          if (action === "delete") {
            await prisma.story.deleteMany({
              where: { id: { in: ids } },
            });
          } else if (action === "publish") {
            await prisma.story.updateMany({
              where: { id: { in: ids } },
              data: { status: StoryStatus.Published, publishedAt: new Date() },
            });
          } else if (action === "draft") {
            await prisma.story.updateMany({
              where: { id: { in: ids } },
              data: { status: StoryStatus.Draft },
            });
          } else if (action === "archive") {
            await prisma.story.updateMany({
              where: { id: { in: ids } },
              data: { status: StoryStatus.Archived },
            });
          } else {
            return json({ error: "Invalid bulk action" }, { status: 400 });
          }

          return json({ success: true });
        } catch (e: any) {
          return json({ error: e.message || "Bulk action failed" }, { status: 500 });
        }
      },
    },
  },
});
