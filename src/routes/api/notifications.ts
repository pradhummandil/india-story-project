import { createFileRoute } from "@tanstack/react-router";
import { json, authenticate } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";

/**
 * Universal notification endpoint for ALL authenticated users (not just admin/editor).
 *
 * GET  /api/notifications         — fetch my notifications (last 50)
 * POST /api/notifications         — mark_read | mark_all_read | delete
 */
export const Route = createFileRoute("/api/notifications")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        const url = new URL(request.url);
        const unreadOnly = url.searchParams.get("unread") === "true";

        try {
          const notifications = await prisma.notification.findMany({
            where: {
              recipientId: user.id,
              ...(unreadOnly ? { isRead: false } : {}),
            },
            orderBy: { createdAt: "desc" },
            take: 50,
          });

          return json({
            notifications: notifications.map((n) => ({
              id: n.id,
              createdAt: n.createdAt.toISOString(),
              message: n.message,
              read: n.isRead,
              type: n.type,
              title: n.title,
              storyId: n.storyId,
              submissionId: n.submissionId,
              priority: n.priority,
              actionUrl: n.actionUrl,
            })),
            unreadCount: unreadOnly
              ? notifications.length
              : notifications.filter((n) => !n.isRead).length,
          });
        } catch (e: any) {
          return json({ error: e.message }, { status: 500 });
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

        const { action, notificationId } = body;

        try {
          if (action === "mark_read") {
            if (!notificationId) return json({ error: "notificationId required" }, { status: 400 });
            await prisma.notification.updateMany({
              where: { id: notificationId, recipientId: user.id },
              data: { isRead: true },
            });
            return json({ success: true });
          }

          if (action === "mark_all_read") {
            await prisma.notification.updateMany({
              where: { recipientId: user.id, isRead: false },
              data: { isRead: true },
            });
            return json({ success: true });
          }

          if (action === "delete") {
            if (!notificationId) return json({ error: "notificationId required" }, { status: 400 });
            await prisma.notification.deleteMany({
              where: { id: notificationId, recipientId: user.id },
            });
            return json({ success: true });
          }

          if (action === "delete_all_read") {
            await prisma.notification.deleteMany({
              where: { recipientId: user.id, isRead: true },
            });
            return json({ success: true });
          }

          return json({ error: "Invalid action" }, { status: 400 });
        } catch (e: any) {
          return json({ error: e.message }, { status: 500 });
        }
      },
    },
  },
});
