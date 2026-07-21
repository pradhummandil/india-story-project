import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";
import { StoryStatus } from "@prisma/client";

const db = prisma as any;

export const Route = createFileRoute("/api/admin/web-stories")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const list = await db.webStory.findMany({
            orderBy: { createdAt: "desc" },
            include: {
              pages: { orderBy: { sortOrder: "asc" } },
            },
          });
          return json({ webStories: list });
        } catch (e: any) {
          return json({ error: e.message || "Failed to load web stories" }, { status: 500 });
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

        const { title, titleHi, slug, coverImage, excerpt, authorId, status, pages } = body;
        if (!title || !slug || !coverImage || !authorId || !Array.isArray(pages)) {
          return json({ error: "title, slug, coverImage, authorId, pages are required" }, { status: 400 });
        }

        try {
          const webStory = await db.webStory.create({
            data: {
              title,
              titleHi: titleHi || null,
              slug,
              coverImage,
              excerpt: excerpt || null,
              status: status === "Published" ? StoryStatus.Published : StoryStatus.Draft,
              authorId,
              pages: {
                create: pages.map((page: any, index: number) => ({
                  imageUrl: page.imageUrl,
                  heading: page.heading || null,
                  headingHi: page.headingHi || null,
                  text: page.text || null,
                  textHi: page.textHi || null,
                  sortOrder: index,
                  durationMs: page.durationMs ? parseInt(page.durationMs, 10) : 5000,
                })),
              },
            },
            include: { pages: true },
          });
          return json({ success: true, webStory });
        } catch (e: any) {
          return json({ error: e.message || "Failed to create web story" }, { status: 500 });
        }
      },

      DELETE: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "id parameter is required" }, { status: 400 });

        try {
          await db.webStory.delete({ where: { id } });
          return json({ success: true });
        } catch (e: any) {
          return json({ error: e.message || "Failed to delete web story" }, { status: 500 });
        }
      },
    },
  },
});
