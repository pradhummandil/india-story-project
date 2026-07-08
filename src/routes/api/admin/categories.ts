import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/admin/categories")({
  server: {
    handlers: {
      GET: async () => {
        const categories = await prisma.category.findMany({
          orderBy: [{ name: "asc" }],
          include: { _count: { select: { stories: true } } },
        });
        return json({ categories });
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

        const existing = await prisma.category.findUnique({ where: { slug: body.slug } });
        if (existing)
          return json({ error: "A category with this slug already exists." }, { status: 400 });

        const category = await prisma.category.create({
          data: { name: body.name, slug: body.slug },
        });
        return json({ category }, { status: 201 });
      },
    },
  },
});
