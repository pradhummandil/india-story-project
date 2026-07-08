import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";
import { StoryStatus } from "@prisma/client";

const storyIncludes: any = {
  category: { select: { id: true, name: true, slug: true } },
  state: { select: { id: true, name: true, slug: true } },
  author: { select: { id: true, name: true } },
  theme: { select: { id: true, name: true, slug: true } },
  images: {
    orderBy: [{ heroImage: "desc" }, { sortOrder: "asc" }],
    take: 3,
  },
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

export const Route = createFileRoute("/api/admin/stories")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const query = url.searchParams.get("query") ?? undefined;
        const status = url.searchParams.get("status") ?? undefined;
        const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
        const pageSize = Math.min(
          60,
          Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "20", 10)),
        );

        const where: any = {};
        if (status && status !== "all") where.status = status as StoryStatus;
        if (query) {
          where.OR = [
            { title: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
          ];
        }

        const [stories, total] = await Promise.all([
          prisma.story.findMany({
            where,
            orderBy: [{ createdAt: "desc" }],
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: storyIncludes,
          }),
          prisma.story.count({ where }),
        ]);

        return json({
          stories: stories.map(toAdminRow),
          total,
          page,
          pageSize,
          pageCount: Math.ceil(total / pageSize),
        });
      },

      POST: async ({ request }) => {
        let body: any;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON" }, { status: 400 });
        }

        const { title, excerpt, content, slug, categoryId, stateId, authorId, themeId } = body;
        if (
          !title ||
          !excerpt ||
          !content ||
          !slug ||
          !categoryId ||
          !stateId ||
          !authorId ||
          !themeId
        ) {
          return json(
            {
              error:
                "title, excerpt, content, slug, categoryId, stateId, authorId, themeId are required",
            },
            { status: 400 },
          );
        }

        // Check slug uniqueness
        const existing = await prisma.story.findUnique({ where: { slug } });
        if (existing)
          return json({ error: "A story with this slug already exists." }, { status: 400 });

        const story = await prisma.story.create({
          data: {
            title,
            excerpt,
            content,
            slug,
            titleHi: body.titleHi ?? null,
            excerptHi: body.excerptHi ?? null,
            contentHi: body.contentHi ?? null,
            seoTitle: body.seoTitle ?? null,
            seoDescription: body.seoDescription ?? null,
            readingTime: body.readingTime ? parseInt(body.readingTime, 10) : null,
            featured: body.featured ?? false,
            heroOfTheDay: body.heroOfTheDay ?? false,
            status: body.status === "Published" ? StoryStatus.Published : StoryStatus.Draft,
            publishedAt: body.status === "Published" ? new Date() : null,
            categoryId,
            stateId,
            authorId,
            themeId,
            ...(body.imageUrl
              ? {
                  images: {
                    create: [
                      {
                        imageUrl: body.imageUrl,
                        caption: body.imageCaption ?? null,
                        heroImage: true,
                        sortOrder: 0,
                      },
                    ],
                  },
                }
              : {}),
          },
          include: storyIncludes,
        });

        return json({ story: toAdminRow(story) }, { status: 201 });
      },
    },
  },
});
