import { createFileRoute } from "@tanstack/react-router";
import { json, verifyAdmin } from "@/routes/api/-_utils";
import { queueService } from "@/lib/infrastructure/queue";

export const Route = createFileRoute("/api/admin/infrastructure/queue")({
  server: {
    handlers: {
      // Get background job queue list
      GET: async ({ request }) => {
        const adminUser = await verifyAdmin(request);
        if (!adminUser) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const list = queueService.listQueue();
          return json(list);
        } catch (err: any) {
          return json({ error: err.message }, { status: 500 });
        }
      },

      // Dispatch a background job
      POST: async ({ request }) => {
        const adminUser = await verifyAdmin(request);
        if (!adminUser) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const body: any = await request.json();
          const { name } = body;
          if (!name || typeof name !== "string") {
            return json({ error: "Invalid job name" }, { status: 400 });
          }

          const jobId = queueService.dispatch(name, { triggeredBy: "SuperAdmin" });
          return json({ success: true, jobId });
        } catch (err: any) {
          return json({ error: err.message }, { status: 500 });
        }
      },
    },
  },
});
