import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/admin/newsroom/notifications")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const notifications = await prisma.notification.findMany({
            where: { recipientId: user.id },
            orderBy: { createdAt: "desc" },
            take: 50,
          });

          const mappedNotifications = notifications.map((n: any) => ({
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
          }));

          return json({ notifications: mappedNotifications });
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

        const { action, notificationId, storyId, storyTitle, message, type, recipientId, priority, title } = body;

        try {
          if (action === "create") {
            if (!recipientId || !message || !type) {
              return json({ error: "recipientId, message, type are required" }, { status: 400 });
            }

            const profile = await prisma.profile.findUnique({
              where: { id: user.id },
              select: { fullName: true },
            });
            const senderName = profile?.fullName || user.email?.split("@")[0] || "Staff";

            await prisma.notification.create({
              data: {
                recipientId,
                senderId: user.id,
                storyId: storyId || null,
                type,
                title: title || "New Notification",
                message,
                priority: priority || "normal",
              },
            });

            return json({ success: true });
          }

          if (action === "mark_read") {
            if (!notificationId) {
              return json({ error: "notificationId is required" }, { status: 400 });
            }

            const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
            if (!notification || notification.recipientId !== user.id) {
              return json({ error: "Notification not found or unauthorized" }, { status: 404 });
            }

            await prisma.notification.update({
              where: { id: notificationId },
              data: {
                isRead: true,
              },
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
            if (!notificationId) {
              return json({ error: "notificationId is required" }, { status: 400 });
            }
            await prisma.notification.deleteMany({
              where: { id: notificationId, recipientId: user.id },
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
