import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";

const db = prisma as any;

export const Route = createFileRoute("/api/admin/notifications/push")({
  server: {
    handlers: {
      /**
       * POST /api/admin/notifications/push
       * Push Notification & Email Digest Dispatch Engine
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
          type = "digest", // 'email' | 'browser_push' | 'digest' | 'breaking_news' | 'weekly' | 'monthly' | 'assignment_reminder'
          recipientId,
          storyId,
          title,
          message,
          actionUrl,
        } = body;

        if (!title || !message) {
          return json({ error: "Title and message are required" }, { status: 400 });
        }

        try {
          // If recipientId specified, dispatch to user
          if (recipientId) {
            const notif = await db.notification.create({
              data: {
                recipientId,
                senderId: user.id,
                storyId: storyId || null,
                type,
                title,
                message,
                actionUrl: actionUrl || null,
                priority: type === "breaking_news" ? "urgent" : "normal",
              },
            });

            return json({ success: true, dispatched: 1, notification: notif });
          }

          // Broadcast notification (e.g. Breaking news or digest)
          const allReaders = await db.userProfile.findMany({
            take: 100,
            select: { id: true },
          });

          const createPayloads = allReaders.map((r: any) => ({
            recipientId: r.id,
            senderId: user.id,
            storyId: storyId || null,
            type,
            title,
            message,
            actionUrl: actionUrl || null,
            priority: type === "breaking_news" ? "urgent" : "normal",
          }));

          await db.notification.createMany({
            data: createPayloads,
          });

          return json({
            success: true,
            dispatched: allReaders.length,
            broadcastType: type,
          });
        } catch (err: any) {
          console.error("[Push Notification API] Error:", err);
          return json({ error: err.message || "Failed to dispatch notification" }, { status: 500 });
        }
      },
    },
  },
});
