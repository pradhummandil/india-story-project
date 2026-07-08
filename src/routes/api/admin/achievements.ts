import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, verifyAdmin } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/admin/achievements")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const admin = await verifyAdmin(request);
        if (!admin) {
          return json({ error: "Forbidden" }, { status: 403 });
        }

        try {
          const badges = await prisma.badge.findMany({
            include: {
              _count: {
                select: { userBadges: true },
              },
            },
            orderBy: { createdAt: "desc" },
          });

          return json({
            badges: badges.map((b) => ({
              id: b.id,
              name: b.name,
              slug: b.slug,
              description: b.description,
              icon: b.icon,
              color: b.color,
              rarity: b.rarity,
              userCount: b._count.userBadges,
            })),
          });
        } catch (e: any) {
          return json({ error: e.message || "Failed to load admin achievements" }, { status: 500 });
        }
      },

      POST: async ({ request }) => {
        const admin = await verifyAdmin(request);
        if (!admin) {
          return json({ error: "Forbidden" }, { status: 403 });
        }

        try {
          const body = await request.json();
          const { name, description, icon, color, rarity } = body;

          if (!name || !description || !icon) {
            return json({ error: "name, description, and icon are required" }, { status: 400 });
          }

          const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-");

          const badge = await prisma.badge.create({
            data: {
              name,
              slug,
              description,
              icon,
              color: color || "#C8A96A",
              rarity: rarity || "common",
              criteria: {},
            },
          });

          return json({ success: true, badge });
        } catch (e: any) {
          return json({ error: e.message || "Failed to create badge" }, { status: 500 });
        }
      },
    },
  },
});
