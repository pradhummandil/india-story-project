import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/admin/themes/$id")({
  server: {
    handlers: {
      PUT: async ({ params, request }) => {
        let body: any;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON" }, { status: 400 });
        }
        const theme = await prisma.theme.update({
          where: { id: params.id },
          data: {
            name: body.name,
            slug: body.slug,
          },
        });
        return json({ theme });
      },
      DELETE: async ({ params }) => {
        await prisma.theme.delete({ where: { id: params.id } });
        return json({ success: true });
      },
    },
  },
});
