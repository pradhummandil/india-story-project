import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";

const db = prisma as any;

export const Route = createFileRoute("/api/admin/announcements")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const list = await db.communityAnnouncement.findMany({
            orderBy: { createdAt: "desc" },
            include: {
              group: { select: { name: true } },
            },
          });
          return json({ announcements: list });
        } catch (e: any) {
          return json({ error: e.message || "Failed to load announcements" }, { status: 500 });
        }
      },

      POST: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        let body: any;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON" }, { status: 400 });
        }

        const { title, content, isGlobal, groupId, expiresAt } = body;
        if (!title || !content) {
          return json({ error: "title and content are required" }, { status: 400 });
        }

        try {
          const announcement = await db.communityAnnouncement.create({
            data: {
              title,
              content,
              isGlobal: isGlobal ?? true,
              groupId: groupId || null,
              createdBy: user.id,
              expiresAt: expiresAt ? new Date(expiresAt) : null,
            },
          });
          return json({ success: true, announcement });
        } catch (e: any) {
          return json({ error: e.message || "Failed to create announcement" }, { status: 500 });
        }
      },

      DELETE: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "id parameter is required" }, { status: 400 });

        try {
          await db.communityAnnouncement.delete({ where: { id } });
          return json({ success: true });
        } catch (e: any) {
          return json({ error: e.message || "Failed to delete announcement" }, { status: 500 });
        }
      },
    },
  },
});
