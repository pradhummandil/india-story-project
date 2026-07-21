import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/admin/stories/duplicate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { id } = body;
          if (!id) return json({ error: "Story ID is required" }, { status: 400 });

          const story = await prisma.story.findUnique({
            where: { id },
            include: { images: true, tags: true, themes: true },
          });

          if (!story) return json({ error: "Story not found" }, { status: 404 });

          const timestamp = Date.now();
          const newSlug = `${story.slug}-copy-${timestamp}`;
          const duplicated = await prisma.story.create({
            data: {
              title: `${story.title} (Copy)`,
              slug: newSlug,
              excerpt: story.excerpt,
              content: story.content,
              titleHi: story.titleHi ? `${story.titleHi} (प्रतिलिपि)` : null,
              excerptHi: story.excerptHi,
              contentHi: story.contentHi,
              seoTitle: story.seoTitle,
              seoDescription: story.seoDescription,
              readingTime: story.readingTime,
              featured: false, // Avoid duplicate featured/hero on duplication
              status: "Draft",
              stateId: story.stateId,
              authorId: story.authorId,
              themes: {
                create: story.themes.map((t) => ({
                  themeId: t.themeId,
                })),
              },
              images: {
                create: story.images.map((img) => ({
                  imageUrl: img.imageUrl,
                  caption: img.caption,
                  sortOrder: img.sortOrder,
                  heroImage: img.heroImage,
                })),
              },
            },
          });

          return json({ success: true, story: duplicated });
        } catch (e: any) {
          return json({ error: e.message || "Failed to duplicate story" }, { status: 500 });
        }
      },
    },
  },
});
