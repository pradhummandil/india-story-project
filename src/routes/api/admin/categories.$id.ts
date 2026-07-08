import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/admin/categories/$id")({
  server: {
    handlers: {
      PUT: async ({ params, request }) => {
        let body: any;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON" }, { status: 400 });
        }
        if (!body.name || !body.slug)
          return json({ error: "name and slug are required" }, { status: 400 });

        const category = await prisma.category.update({
          where: { id: params.id },
          data: { name: body.name, slug: body.slug },
        });
        return json({ category });
      },

      DELETE: async ({ params }) => {
        await prisma.category.delete({ where: { id: params.id } });
        return json({ success: true });
      },
    },
  },
});
