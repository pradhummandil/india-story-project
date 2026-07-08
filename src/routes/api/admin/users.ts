import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, verifyAdmin } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/admin/users")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const admin = await verifyAdmin(request);
        if (!admin) {
          return json({ error: "Forbidden" }, { status: 403 });
        }

        const users = await prisma.profile.findMany({
          orderBy: [{ createdAt: "desc" }],
        });
        return json({
          users: users.map((u) => ({
            id: u.id,
            email: u.email,
            name: u.fullName || "",
            role: u.role,
            active: u.active,
            createdAt: u.createdAt.toISOString(),
          })),
        });
      },
    },
  },
});
