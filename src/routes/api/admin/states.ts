import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/admin/states")({
  server: {
    handlers: {
      GET: async () => {
        const states = await prisma.state.findMany({
          orderBy: [{ name: "asc" }],
          include: { _count: { select: { stories: true } } },
        });
        return json({ states });
      },

      POST: async ({ request }) => {
        let body: any;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON" }, { status: 400 });
        }
        if (!body.name || !body.slug)
          return json({ error: "name and slug are required" }, { status: 400 });

        const state = await prisma.state.create({
          data: {
            name: body.name,
            slug: body.slug,
            latitude: body.latitude ?? null,
            longitude: body.longitude ?? null,
          },
        });
        return json({ state }, { status: 201 });
      },
    },
  },
});
