import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, verifyAdmin } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/admin/infrastructure/audit-logs")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // Authenticate admin access
        const adminUser = await verifyAdmin(request);
        if (!adminUser) {
          return json({ error: "Unauthorized access" }, { status: 401 });
        }

        try {
          const logs = await prisma.auditLog.findMany({
            orderBy: { createdAt: "desc" },
            take: 20,
          });
          return json(logs);
        } catch (err: any) {
          return json({ error: err.message }, { status: 500 });
        }
      },
    },
  },
});
