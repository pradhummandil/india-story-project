import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/admin/themes")({
  server: {
    handlers: {
      GET: async () => {
        const themes = await prisma.theme.findMany({
          orderBy: [{ name: "asc" }],
          include: { _count: { select: { stories: true } } },
        });
        return json({ themes });
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

        const theme = await prisma.theme.create({
          data: {
            name: body.name,
            slug: body.slug,
          },
        });
        return json({ theme }, { status: 201 });
      },
    },
  },
});
