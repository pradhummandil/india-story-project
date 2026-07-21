import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";
import { StoryStatus } from "@prisma/client";

const db = prisma as any;

export const Route = createFileRoute("/api/admin/videos")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const list = await db.video.findMany({
            orderBy: { createdAt: "desc" },
            include: {
              state: { select: { name: true } },
            },
          });
          return json({ videos: list });
        } catch (e: any) {
          return json({ error: e.message || "Failed to load videos" }, { status: 500 });
        }
      },

      POST: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        let body: any;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON" }, { status: 400 });
        }

        const { title, titleHi, excerpt, excerptHi, slug, videoUrl, authorId, stateId, thumbnail, status, featured, duration } = body;
        if (!title || !slug || !videoUrl || !authorId || !stateId) {
          return json({ error: "title, slug, videoUrl, authorId, stateId are required" }, { status: 400 });
        }

        try {
          const video = await db.video.create({
            data: {
              title,
              titleHi: titleHi || null,
              excerpt: excerpt || null,
              excerptHi: excerptHi || null,
              slug,
              videoUrl,
              duration: duration ? parseInt(duration, 10) : 0,
              thumbnail: thumbnail || null,
              status: status === "Published" ? StoryStatus.Published : StoryStatus.Draft,
              featured: featured ?? false,
              authorId,
              stateId,
            },
          });
          return json({ success: true, video });
        } catch (e: any) {
          return json({ error: e.message || "Failed to create video" }, { status: 500 });
        }
      },

      DELETE: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "id parameter is required" }, { status: 400 });

        try {
          await db.video.delete({ where: { id } });
          return json({ success: true });
        } catch (e: any) {
          return json({ error: e.message || "Failed to delete video" }, { status: 500 });
        }
      },
    },
  },
});
