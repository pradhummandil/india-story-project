import { createFileRoute } from "@tanstack/react-router";
import { json, authenticate } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";

export const Route = createFileRoute("/api/admin/submissions")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        const profile = await prisma.profile.findUnique({
          where: { id: user.id },
        });

        if (!profile) return json({ error: "Profile not found" }, { status: 403 });

        const role = profile.role.toLowerCase();
        const isAdmin = role === "admin" || role === "superadmin";
        const isEditor = role === "editor";

        if (!isAdmin && !isEditor) {
          return json({ error: "Forbidden" }, { status: 403 });
        }

        try {
          const where: any = {};
          if (isEditor) {
            where.OR = [
              { assignedEditorId: user.id },
              { userId: user.id, status: "Draft" },
            ];
          }

          const submissions = await prisma.submittedStory.findMany({
            where,
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          });

          return json({ submissions });
        } catch (e: any) {
          console.error("[admin/submissions] GET error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
