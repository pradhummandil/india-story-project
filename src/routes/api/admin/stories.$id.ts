import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";
import { StoryStatus } from "@/generated/prisma/client";

const storyIncludes: any = {
  category: { select: { id: true, name: true, slug: true } },
  state: { select: { id: true, name: true, slug: true } },
  author: { select: { id: true, name: true } },
  theme: { select: { id: true, name: true, slug: true } },
  images: { orderBy: [{ heroImage: "desc" }, { sortOrder: "asc" }] },
};

function toAdminRow(story: any) {
  return {
    id: story.id,
    slug: story.slug,
    title: story.title,
    excerpt: story.excerpt,
    content: story.content,
    titleHi: story.titleHi,
    excerptHi: story.excerptHi,
    contentHi: story.contentHi,
    seoTitle: story.seoTitle,
    seoDescription: story.seoDescription,
    readingTime: story.readingTime,
    featured: story.featured,
    heroOfTheDay: story.heroOfTheDay,
    status: story.status,
    viewCount: story.viewCount,
    publishedAt: story.publishedAt?.toISOString() ?? null,
    scheduledAt: story.scheduledAt?.toISOString() ?? null,
    createdAt: story.createdAt.toISOString(),
    updatedAt: story.updatedAt.toISOString(),
    category: story.category?.name ?? "",
    region: story.state?.name ?? "",
    categoryId: story.categoryId,
    stateId: story.stateId,
    authorId: story.authorId,
    themeId: story.themeId,
    images:
      story.images?.map((img: any) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        caption: img.caption,
        heroImage: img.heroImage,
      })) ?? [],
  };
}

export const Route = createFileRoute("/api/admin/stories/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const story = await prisma.story.findUnique({
          where: { id: params.id },
          include: storyIncludes,
        });
        if (!story) return json({ error: "Story not found." }, { status: 404 });
        return json(toAdminRow(story));
      },

      PUT: async ({ params, request }) => {
        let body: any;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON" }, { status: 400 });
        }

        const story = await prisma.story.update({
          where: { id: params.id },
          data: {
            title: body.title,
            slug: body.slug,
            excerpt: body.excerpt,
            content: body.content,
            titleHi: body.titleHi ?? null,
            excerptHi: body.excerptHi ?? null,
            contentHi: body.contentHi ?? null,
            seoTitle: body.seoTitle ?? null,
            seoDescription: body.seoDescription ?? null,
            readingTime: body.readingTime ? parseInt(body.readingTime, 10) : null,
            featured: body.featured ?? false,
            heroOfTheDay: body.heroOfTheDay ?? false,
            status: body.status as StoryStatus,
            publishedAt:
              body.status === "Published" && !body.publishedAt
                ? new Date()
                : body.publishedAt
                  ? new Date(body.publishedAt)
                  : null,
            scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
            categoryId: body.categoryId,
            stateId: body.stateId,
            authorId: body.authorId,
            themeId: body.themeId,
          },
          include: storyIncludes,
        });

        return json({ story: toAdminRow(story) });
      },

      PATCH: async ({ params, request }) => {
        let body: any;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON" }, { status: 400 });
        }

        const allowed = ["featured", "heroOfTheDay", "status", "viewCount"];
        const data: Record<string, unknown> = {};
        for (const key of allowed) {
          if (key in body) data[key] = body[key];
        }

        const story = await prisma.story.update({ where: { id: params.id }, data });
        return json({ id: story.id, ...data });
      },

      DELETE: async ({ params }) => {
        await prisma.story.delete({ where: { id: params.id } });
        return json({ success: true });
      },
    },
  },
});
