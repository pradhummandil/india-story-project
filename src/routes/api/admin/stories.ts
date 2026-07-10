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
    homepageSlideshow: story.homepageSlideshow,
    slideshowOrder: story.slideshowOrder,
    seoPriority: story.seoPriority,
    readingPriority: story.readingPriority,
    pinnedStory: story.pinnedStory,
    trendingStory: story.trendingStory,
    editorsPick: story.editorsPick,
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
        const region = url.searchParams.get("region") ?? undefined;
        const category = url.searchParams.get("category") ?? undefined;
        const sortBy = url.searchParams.get("sortBy") ?? "date";
        const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
        const pageSize = Math.min(
          60,
          Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "20", 10)),
        );

        const where: any = {};
        if (status && status !== "all") where.status = status as StoryStatus;
        if (region && region !== "all") {
          where.state = { slug: region };
        }
        if (category && category !== "all") {
          where.category = { slug: category };
        }
        if (query) {
          where.OR = [
            { title: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
          ];
        }

        let orderBy: any = [{ createdAt: "desc" }];
        if (sortBy === "views") {
          orderBy = [{ viewCount: "desc" }, { createdAt: "desc" }];
        } else if (sortBy === "title") {
          orderBy = [{ title: "asc" }];
        }

        const [stories, total] = await Promise.all([
          prisma.story.findMany({
            where,
            orderBy,
            skip: (page - 1) * pageSize,
            take: pageSize,
            select: {
              id: true,
              slug: true,
              title: true,
              excerpt: true,
              readingTime: true,
              featured: true,
              heroOfTheDay: true,
              status: true,
              viewCount: true,
              publishedAt: true,
              scheduledAt: true,
              createdAt: true,
              updatedAt: true,
              categoryId: true,
              stateId: true,
              authorId: true,
              themeId: true,
              category: { select: { id: true, name: true, slug: true } },
              state: { select: { id: true, name: true, slug: true } },
              author: { select: { id: true, name: true } },
              theme: { select: { id: true, name: true, slug: true } },
              images: {
                orderBy: { sortOrder: "asc" },
                select: { id: true, imageUrl: true, caption: true, heroImage: true },
                take: 1,
              },
            },
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

        const featured = body.featured ?? false;
        const heroOfTheDay = body.heroOfTheDay ?? false;
        const homepageSlideshow = body.homepageSlideshow ?? false;
        const slideshowOrder = body.slideshowOrder ? parseInt(body.slideshowOrder, 10) : 0;
        const seoPriority = body.seoPriority ? parseFloat(body.seoPriority) : 0.5;
        const readingPriority = body.readingPriority ? parseInt(body.readingPriority, 10) : 0;
        const pinnedStory = body.pinnedStory ?? false;
        const trendingStory = body.trendingStory ?? false;
        const editorsPick = body.editorsPick ?? false;
        const seoKeywords = body.seoKeywords ?? null;

        // Mutual exclusivity enforcement
        if (featured) {
          await prisma.story.updateMany({
            data: { featured: false },
          });
        }
        if (heroOfTheDay) {
          await prisma.story.updateMany({
            data: { heroOfTheDay: false },
          });
        }

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
            seoKeywords,
            readingTime: body.readingTime ? parseInt(body.readingTime, 10) : null,
            featured,
            heroOfTheDay,
            homepageSlideshow,
            slideshowOrder,
            seoPriority,
            readingPriority,
            pinnedStory,
            trendingStory,
            editorsPick,
            status: body.status === "Published" ? StoryStatus.Published : StoryStatus.Draft,
            publishedAt: body.status === "Published" ? new Date() : null,
            categoryId,
            stateId,
            authorId,
            themeId,
            images: {
              create: [
                ...(body.imageUrl
                  ? [
                      {
                        imageUrl: body.imageUrl,
                        caption: body.imageCaption ?? null,
                        heroImage: true,
                        sortOrder: 0,
                      },
                    ]
                  : []),
                ...(Array.isArray(body.additionalImages)
                  ? body.additionalImages.map((url: string, index: number) => ({
                      imageUrl: url,
                      caption: null,
                      heroImage: false,
                      sortOrder: index + 1,
                    }))
                  : []),
              ],
            },
          },
          include: storyIncludes,
        });

        return json({ story: toAdminRow(story) }, { status: 201 });
      },
    },
  },
});
