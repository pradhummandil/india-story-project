import { createFileRoute } from "@tanstack/react-router";
import { json, authenticate } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";

/**
 * GET /api/admin/editors
 * Returns all users with role = Editor or Admin (for assignment dropdown).
 */
export const Route = createFileRoute("/api/admin/editors")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        const editorRoles = [
          "editor",
          "Editor",
          "EDITOR",
          "admin",
          "Admin",
          "ADMIN",
          "superadmin",
          "SuperAdmin",
        ];

        // 1. Fetch from Profile table (primary user registry)
        const profiles = await prisma.profile.findMany({
          where: {
            role: { in: editorRoles },
            active: true,
          },
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
            role: true,
          },
          orderBy: { fullName: "asc" },
        });

        // 2. Fetch from UserProfile table (secondary user profile store)
        let userProfiles: any[] = [];
        try {
          userProfiles = await (prisma as any).userProfile.findMany({
            where: {
              role: { in: editorRoles },
            },
            select: { id: true, name: true, email: true, avatarUrl: true, role: true },
          });
        } catch {
          // ignore if model/schema differs
        }

        // Combine & deduplicate by ID / Email
        const map = new Map<
          string,
          { id: string; name: string; email: string; avatarUrl: string | null }
        >();

        profiles.forEach((p) => {
          map.set(p.id, {
            id: p.id,
            name: p.fullName || p.email.split("@")[0],
            email: p.email,
            avatarUrl: p.avatarUrl || null,
          });
        });

        userProfiles.forEach((up) => {
          if (!map.has(up.id)) {
            map.set(up.id, {
              id: up.id,
              name: up.name || up.email?.split("@")[0] || "Editor",
              email: up.email || "",
              avatarUrl: up.avatarUrl || null,
            });
          }
        });

        const editors = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));

        return json({ editors });
      },
    },
  },
});
