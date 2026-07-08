import { createFileRoute } from "@tanstack/react-router";
import { json, verifyAdmin } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";

export const Route = createFileRoute("/api/admin/submissions")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const admin = await verifyAdmin(request);
        if (!admin) return json({ error: "Forbidden" }, { status: 403 });

        try {
          const submissions = await prisma.submittedStory.findMany({
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
