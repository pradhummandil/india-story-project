import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";
import { StoryStatus } from "@prisma/client";

const db = prisma as any;

export const Route = createFileRoute("/api/web-stories/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { slug } = params;

        try {
          const webStory = await db.webStory.findUnique({
            where: { slug },
            include: {
              author: { select: { id: true, name: true, avatar: true } },
              pages: {
                orderBy: { sortOrder: "asc" },
              },
            },
          });

          if (!webStory || webStory.status !== StoryStatus.Published) {
            return json({ error: "Web Story not found" }, { status: 404 });
          }

          // Increment view count
          await db.webStory.update({
            where: { id: webStory.id },
            data: { viewCount: { increment: 1 } },
          });

          const results = {
            id: webStory.id,
            title: webStory.title,
            titleHi: webStory.titleHi,
            slug: webStory.slug,
            coverImage: webStory.coverImage,
            excerpt: webStory.excerpt,
            viewCount: webStory.viewCount + 1,
            authorName: webStory.author?.name || "India Story Project Bureau",
            authorAvatar: webStory.author?.avatar,
            createdAt: webStory.createdAt.toISOString(),
            pages: (webStory.pages as any[]).map((p) => ({
              id: p.id,
              imageUrl: p.imageUrl,
              heading: p.heading,
              headingHi: p.headingHi,
              text: p.text,
              textHi: p.textHi,
              sortOrder: p.sortOrder,
              durationMs: p.durationMs,
            })),
          };

          return json(results);
        } catch (e: any) {
          return json({ error: e.message || "Failed to load web story details" }, { status: 500 });
        }
      },
    },
  },
});
