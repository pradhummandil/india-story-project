import { createFileRoute } from "@tanstack/react-router";
import { json, verifyAdmin } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";
import { retryFailedEmails, processEmailQueue } from "@/lib/email-service.server";

const db = prisma as any;

export const Route = createFileRoute("/api/admin/newsletter")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const admin = await verifyAdmin(request);
        if (!admin) return json({ error: "Unauthorized" }, { status: 401 });

        const url = new URL(request.url);
        const query = url.searchParams.get("query") || "";
        const status = url.searchParams.get("status") || "all";
        const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
        const pageSize = Math.max(1, parseInt(url.searchParams.get("pageSize") || "10", 10));
        const exportCsv = url.searchParams.get("export") === "true";

        const where: any = {};

        if (status === "verified") {
          where.verified = true;
          where.status = "active";
        } else if (status === "pending") {
          where.verified = false;
          where.status = "active";
        } else if (status === "unsubscribed") {
          where.status = "unsubscribed";
        }

        if (query) {
          where.email = { contains: query, mode: "insensitive" };
        }

        try {
          if (exportCsv) {
            const subscribers = await db.newsletterSubscriber.findMany({
              where,
              orderBy: { createdAt: "desc" },
            });

            const headers = ["ID", "Email", "Verified", "Status", "Language", "CreatedAt"];
            const rows = subscribers.map((sub: any) => [
              sub.id,
              sub.email,
              sub.verified ? "Yes" : "No",
              sub.status,
              sub.language,
              sub.createdAt.toISOString(),
            ]);

            const csvContent = [
              headers.join(","),
              ...rows.map((r: any) => r.map((val: any) => `"${val}"`).join(",")),
            ].join("\n");

            return new Response(csvContent, {
              status: 200,
              headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": "attachment; filename=newsletter_subscribers.csv",
              },
            });
          }

          const [
            subscribers,
            total,
            totalActive,
            totalUnsubscribed,
            queuePending,
            queueSent,
            queueFailed,
            digests,
          ] = await Promise.all([
            db.newsletterSubscriber.findMany({
              where,
              orderBy: { createdAt: "desc" },
              skip: (page - 1) * pageSize,
              take: pageSize,
              select: {
                id: true,
                email: true,
                verified: true,
                status: true,
                language: true,
                createdAt: true,
              },
            }),
            db.newsletterSubscriber.count({ where }),
            db.newsletterSubscriber.count({ where: { status: "active" } }),
            db.newsletterSubscriber.count({ where: { status: "unsubscribed" } }),
            db.newsletterQueue.count({ where: { status: "pending" } }).catch(() => 0),
            db.newsletterQueue.count({ where: { status: "sent" } }).catch(() => 0),
            db.newsletterQueue.count({ where: { status: "failed" } }).catch(() => 0),
            db.newsletterDigest.findMany({
              take: 10,
              orderBy: { sentAt: "desc" },
            }).catch(() => []),
          ]);

          return json({
            subscribers,
            total,
            totalActive,
            totalUnsubscribed,
            queue: {
              pending: queuePending,
              sent: queueSent,
              failed: queueFailed,
            },
            digests,
            page,
            pageSize,
            pageCount: Math.ceil(total / pageSize),
          });
        } catch (error: any) {
          console.error("[Admin Newsletter API] GET error:", error);
          return json({ error: "Internal Server Error" }, { status: 500 });
        }
      },

      POST: async ({ request }) => {
        const admin = await verifyAdmin(request);
        if (!admin) return json({ error: "Unauthorized" }, { status: 401 });

        let body: any = {};
        try {
          body = await request.json();
        } catch {}

        const { action } = body;
        if (action === "retry") {
          const result = await retryFailedEmails();
          return json({ success: true, message: "Retried failed email dispatches.", result });
        }

        if (action === "process") {
          const result = await processEmailQueue(50);
          return json({ success: true, message: "Processed pending queue.", result });
        }

        return json({ error: "Invalid action" }, { status: 400 });
      },

      DELETE: async ({ request }) => {
        const admin = await verifyAdmin(request);
        if (!admin) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const url = new URL(request.url);
          const id = url.searchParams.get("id");

          if (!id) {
            return json({ error: "Missing subscriber ID" }, { status: 400 });
          }

          await db.newsletterSubscriber.delete({
            where: { id },
          });

          return json({ success: true });
        } catch (error: any) {
          console.error("[Admin Newsletter API] DELETE error:", error);
          return json({ error: "Internal Server Error" }, { status: 500 });
        }
      },
    },
  },
});
