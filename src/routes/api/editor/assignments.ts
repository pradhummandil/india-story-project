import { createFileRoute } from "@tanstack/react-router";
import { json, authenticate } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";

/**
 * GET /api/editor/assignments
 * Returns all stories assigned to the authenticated editor.
 */
export const Route = createFileRoute("/api/editor/assignments")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        const stories = await prisma.story.findMany({
          where: { assignedEditorId: user.id, deleted: false },
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            version: true,
            updatedAt: true,
            assignedEditorId: true,
            revisions: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { id: true, status: true, version: true, createdAt: true, adminNote: true },
            },
          },
          orderBy: { updatedAt: "desc" },
        });

        return json({
          assignments: stories.map((s) => ({
            id: s.id,
            title: s.title,
            slug: s.slug,
            status: s.status,
            version: s.version,
            updatedAt: s.updatedAt.toISOString(),
            latestRevision: s.revisions[0] ?? null,
          })),
        });
      },
    },
  },
});
