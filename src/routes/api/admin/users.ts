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

        const url = new URL(request.url);
        const query = url.searchParams.get("query") ?? undefined;
        const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
        const pageSize = Math.min(
          60,
          Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "20", 10)),
        );

        const where: any = {};
        if (query) {
          where.OR = [
            { email: { contains: query, mode: "insensitive" } },
            { fullName: { contains: query, mode: "insensitive" } },
          ];
        }

        const [users, total] = await Promise.all([
          prisma.profile.findMany({
            where,
            orderBy: [{ createdAt: "desc" }],
            skip: (page - 1) * pageSize,
            take: pageSize,
            select: {
              id: true,
              email: true,
              fullName: true,
              role: true,
              active: true,
              createdAt: true,
            },
          }),
          prisma.profile.count({ where }),
        ]);

        return json({
          users: users.map((u) => ({
            id: u.id,
            email: u.email,
            name: u.fullName || "",
            role: u.role,
            active: u.active,
            createdAt: u.createdAt.toISOString(),
          })),
          total,
          page,
          pageSize,
          pageCount: Math.ceil(total / pageSize),
        });
      },

      PATCH: async ({ request }) => {
        const admin = await verifyAdmin(request);
        if (!admin) return json({ error: "Forbidden" }, { status: 403 });

        let body: any;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON" }, { status: 400 });
        }

        const { userId, role, active } = body;
        if (!userId) return json({ error: "userId is required" }, { status: 400 });

        const data: any = {};
        if (role) data.role = role.toLowerCase();
        if (typeof active === "boolean") data.active = active;

        const updatedProfile = await prisma.profile.update({
          where: { id: userId },
          data,
        });

        try {
          await prisma.userProfile.update({
            where: { id: userId },
            data: { role: role === "admin" || role === "superadmin" ? "Admin" : role === "editor" ? "Editor" : "Reader" },
          });
        } catch {}

        return json({ success: true, profile: updatedProfile });
      },
    },
  },
});
