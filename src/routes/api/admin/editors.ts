import { createFileRoute } from "@tanstack/react-router";
import { json, authenticate } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";

/**
 * GET /api/admin/editors
 * Returns all users with role=Editor (for assignment dropdown).
 */
export const Route = createFileRoute("/api/admin/editors")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        const editors = await (prisma as any).userProfile.findMany({
          where: { role: "Editor", active: true },
          select: { id: true, name: true, email: true, avatarUrl: true },
          orderBy: { name: "asc" },
        });

        return json({ editors });
      },
    },
  },
});
