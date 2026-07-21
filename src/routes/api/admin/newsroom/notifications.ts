import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";

const db = prisma as any;

export const Route = createFileRoute("/api/admin/newsroom/notifications")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const logs = await db.auditLog.findMany({
            where: {
              userId: user.id,
              action: "WORKFLOW_NOTIFICATION",
            },
            orderBy: { createdAt: "desc" },
            take: 50,
          });

          const notifications = logs.map((log: any) => {
            let details = {};
            try {
              details = JSON.parse(log.details);
            } catch {}
            return {
              id: log.id,
              createdAt: log.createdAt.toISOString(),
              ...details,
            };
          });

          return json({ notifications });
        } catch (e: any) {
          return json({ error: e.message || "Failed to load notifications" }, { status: 500 });
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

        const { action, notificationId, storyId, storyTitle, message, type, recipientId, priority } = body;

        try {
          if (action === "create") {
            if (!recipientId || !message || !type) {
              return json({ error: "recipientId, message, type are required" }, { status: 400 });
            }

            const profile = await db.userProfile.findUnique({
              where: { id: user.id },
              select: { name: true },
            });
            const senderName = profile?.name || user.email?.split("@")[0] || "Staff";

            await db.auditLog.create({
              data: {
                userId: recipientId,
                action: "WORKFLOW_NOTIFICATION",
                details: JSON.stringify({
                  storyId: storyId || null,
                  storyTitle: storyTitle || "",
                  senderName,
                  message,
                  type,
                  priority: priority || "Medium",
                  read: false,
                }),
              },
            });

            return json({ success: true });
          }

          if (action === "mark_read") {
            if (!notificationId) {
              return json({ error: "notificationId is required" }, { status: 400 });
            }

            const log = await db.auditLog.findUnique({ where: { id: notificationId } });
            if (!log || log.userId !== user.id) {
              return json({ error: "Notification not found or unauthorized" }, { status: 404 });
            }

            let details = {};
            try {
              details = JSON.parse(log.details);
            } catch {}

            await db.auditLog.update({
              where: { id: notificationId },
              data: {
                details: JSON.stringify({ ...details, read: true }),
              },
            });

            return json({ success: true });
          }

          return json({ error: "Invalid action" }, { status: 400 });
        } catch (e: any) {
          return json({ error: e.message || "Operation failed" }, { status: 500 });
        }
      },
    },
  },
});
