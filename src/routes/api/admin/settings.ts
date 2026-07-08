import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/admin/settings")({
  server: {
    handlers: {
      GET: async () => {
        const settings = await prisma.siteSetting.findMany({ orderBy: [{ key: "asc" }] });
        return json({
          settings: settings.map((s) => ({ key: s.key, value: s.value, label: s.label })),
        });
      },

      PUT: async ({ request }) => {
        let body: any;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON" }, { status: 400 });
        }

        const settings: Array<{ key: string; value: string; label?: string }> = body.settings ?? [];
        await Promise.all(
          settings.map((s) =>
            prisma.siteSetting.upsert({
              where: { key: s.key },
              update: { value: s.value, label: s.label },
              create: { key: s.key, value: s.value, label: s.label },
            }),
          ),
        );

        return json({ success: true, count: settings.length });
      },
    },
  },
});
