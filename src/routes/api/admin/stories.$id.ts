import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";
import { StoryStatus } from "@prisma/client";
import { supabase } from "@/lib/supabase-client";
import { extractCloudinaryPublicId, deleteFromCloudinary } from "@/lib/cloudinary.server";

const storyIncludes: any = {
  state: { select: { id: true, name: true, slug: true } },
  author: { select: { id: true, name: true } },
  themes: {
    select: {
      themeId: true,
      theme: { select: { id: true, name: true, slug: true } },
    },
  },
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
    themes: story.themes?.map((t: any) => t.theme?.name).filter(Boolean) ?? [],
    region: story.state?.name ?? "",
    themeIds: story.themes?.map((t: any) => t.themeId) ?? [],
    stateId: story.stateId,
    authorId: story.authorId,
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
            where: { id: { not: params.id } },
            data: { featured: false },
          });
        }
        if (heroOfTheDay) {
          await prisma.story.updateMany({
            where: { id: { not: params.id } },
            data: { heroOfTheDay: false },
          });
        }

        const deleteOldImage = async (url: string) => {
          if (!url) return;
          const publicId = extractCloudinaryPublicId(url);
          if (publicId) {
            await deleteFromCloudinary(publicId).catch(console.error);
            return;
          }
          if (url.includes("/storage/v1/object/public/media/")) {
            const parts = url.split("/");
            const oldFile = parts[parts.length - 1];
            if (oldFile) {
              await supabase.storage.from("media").remove([oldFile]).catch(console.error);
            }
          }
        };

        // Normalize cover image input: treat empty string as null (delete)
        const coverImageUrl: string | null =
          typeof body.coverImage === "string"
            ? body.coverImage.trim() || null
            : body.coverImage === undefined
              ? undefined
              : body.coverImage === null
                ? null
                : null;

        // Cover image updates (only when coverImage is explicitly provided)
        if (coverImageUrl !== undefined) {
          if (coverImageUrl) {
            const existing = await prisma.storyImage.findFirst({
              where: { storyId: params.id, heroImage: true },
            });
            if (existing) {
              if (existing.imageUrl !== coverImageUrl) {
                await deleteOldImage(existing.imageUrl);
              }
              await prisma.storyImage.update({
                where: { id: existing.id },
                data: { imageUrl: coverImageUrl },
              });
            } else {
              await prisma.storyImage.create({
                data: {
                  storyId: params.id,
                  imageUrl: coverImageUrl,
                  heroImage: true,
                  sortOrder: 0,
                },
              });
            }
          } else {
            const existing = await prisma.storyImage.findFirst({
              where: { storyId: params.id, heroImage: true },
            });
            if (existing) {
              await deleteOldImage(existing.imageUrl);
              await prisma.storyImage.delete({ where: { id: existing.id } });
            }
          }
        }

        // Additional images updates
        // Only replace gallery images when client explicitly includes the field.
        if (
          Object.prototype.hasOwnProperty.call(body, "additionalImages") &&
          Array.isArray(body.additionalImages)
        ) {
          const nextAdditional = body.additionalImages as string[];

          const oldAdditional = await prisma.storyImage.findMany({

            where: { storyId: params.id, heroImage: false },
          });

          // Delete files from storage that were removed from gallery
          const newUrlsSet = new Set(nextAdditional);
          for (const img of oldAdditional) {
            if (!newUrlsSet.has(img.imageUrl)) {
              await deleteOldImage(img.imageUrl);
            }
          }

          // Delete old database records
          await prisma.storyImage.deleteMany({
            where: { storyId: params.id, heroImage: false },
          });

          // Create new database records
          if (nextAdditional.length > 0) {
            await prisma.storyImage.createMany({
              data: nextAdditional.map((url: string, index: number) => ({
                storyId: params.id,
                imageUrl: url,
                heroImage: false,
                sortOrder: index + 1,
              })),
            });
          }
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
            seoKeywords: body.seoKeywords ?? null,
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
            version: { increment: 1 },
            status: body.status as StoryStatus,
            publishedAt:
              body.status === "Published" && !body.publishedAt
                ? new Date()
                : body.publishedAt
                  ? new Date(body.publishedAt)
                  : null,
            scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
            stateId: body.stateId,
            authorId: body.authorId,
            themes: {
              deleteMany: {},
              create: (body.themeIds || []).map((tId: string) => ({
                themeId: tId,
              })),
            },
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

        const featured = body.featured;
        const heroOfTheDay = body.heroOfTheDay;

        // Mutual exclusivity enforcement on patch updates
        if (featured === true) {
          await prisma.story.updateMany({
            where: { id: { not: params.id } },
            data: { featured: false },
          });
        }
        if (heroOfTheDay === true) {
          await prisma.story.updateMany({
            where: { id: { not: params.id } },
            data: { heroOfTheDay: false },
          });
        }

        const allowed = [
          "featured",
          "heroOfTheDay",
          "homepageSlideshow",
          "slideshowOrder",
          "status",
          "viewCount",
          "seoKeywords",
        ];
        const data: Record<string, unknown> = {};
        for (const key of allowed) {
          if (key in body) data[key] = body[key];
        }
        data.version = { increment: 1 };

        // Adjust publishedAt if status is updated to Published
        if (body.status === "Published") {
          data.publishedAt = new Date();
        }

        const story = await prisma.story.update({
          where: { id: params.id },
          data,
          include: storyIncludes,
        });
        return json({ story: toAdminRow(story) });
      },

      DELETE: async ({ params }) => {
        await prisma.story.delete({ where: { id: params.id } });
        return json({ success: true });
      },
    },
  },
});
