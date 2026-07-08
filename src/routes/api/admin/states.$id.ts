import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/admin/states/$id")({
  server: {
    handlers: {
      PUT: async ({ params, request }) => {
        let body: any;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON" }, { status: 400 });
        }
        const state = await prisma.state.update({
          where: { id: params.id },
          data: {
            name: body.name,
            slug: body.slug,
            latitude: body.latitude ?? null,
            longitude: body.longitude ?? null,
          },
        });
        return json({ state });
      },
      DELETE: async ({ params }) => {
        await prisma.state.delete({ where: { id: params.id } });
        return json({ success: true });
      },
    },
  },
});
