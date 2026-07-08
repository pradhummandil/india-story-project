import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/admin/authors/$id")({
  server: {
    handlers: {
      PUT: async ({ params, request }) => {
        let body: any;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON" }, { status: 400 });
        }
        const author = await prisma.author.update({
          where: { id: params.id },
          data: { name: body.name, bio: body.bio ?? null, avatar: body.avatar ?? null },
        });
        return json({ author });
      },
      DELETE: async ({ params }) => {
        await prisma.author.delete({ where: { id: params.id } });
        return json({ success: true });
      },
    },
  },
});
