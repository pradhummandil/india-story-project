import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, verifyAdmin } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/admin/users/$id")({
  server: {
    handlers: {
      PATCH: async ({ params, request }) => {
        const admin = await verifyAdmin(request);
        if (!admin) {
          return json({ error: "Forbidden" }, { status: 403 });
        }

        let body: any;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON" }, { status: 400 });
        }

        const data: any = {};
        if (
          "role" in body &&
          ["admin", "editor", "author", "user"].includes(body.role.toLowerCase())
        ) {
          data.role = body.role.toLowerCase();
        }
        if ("active" in body) {
          data.active = Boolean(body.active);
        }
        if ("name" in body) {
          data.fullName = body.name;
        }

        const user = await prisma.profile.update({
          where: { id: params.id },
          data,
        });

        return json({ id: user.id, role: user.role, active: user.active });
      },
    },
  },
});
