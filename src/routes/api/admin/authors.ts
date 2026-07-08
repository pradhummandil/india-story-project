import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/admin/authors")({
  server: {
    handlers: {
      GET: async () => {
        const authors = await prisma.author.findMany({
          orderBy: [{ name: "asc" }],
          include: { _count: { select: { stories: true } } },
        });
        return json({ authors });
      },

      POST: async ({ request }) => {
        let body: any;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON" }, { status: 400 });
        }
        if (!body.name) return json({ error: "name is required" }, { status: 400 });

        const author = await prisma.author.create({
          data: { name: body.name, bio: body.bio ?? null, avatar: body.avatar ?? null },
        });
        return json({ author }, { status: 201 });
      },
    },
  },
});
