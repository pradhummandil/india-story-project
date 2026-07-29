import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";
import { invalidateHeroCache } from "@/routes/api/hero-slides";
import { invalidateTrendingCache } from "@/routes/api/trending";
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
  assignedEditor: { select: { id: true, name: true, email: true } },
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
    assignedEditorId: story.assignedEditorId ?? null,
    assignedEditor: story.assignedEditor ?? null,
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
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        const profile = await prisma.profile.findUnique({ where: { id: user.id } });
        if (!profile) return json({ error: "Profile not found" }, { status: 403 });

        const role = profile.role?.toLowerCase() || "";
        const isAdmin = role === "admin" || role === "superadmin";
        const isEditor = role === "editor";

        if (!isAdmin && !isEditor) {
          return json({ error: "Forbidden" }, { status: 403 });
        }

        if (isEditor) {
          const storyObj = await prisma.story.findUnique({
            where: { id: params.id },
            select: { assignedEditorId: true, authorId: true },
          });

          let isAssigned = storyObj?.assignedEditorId === user.id || storyObj?.authorId === user.id;

          if (!isAssigned) {
            const logs = await prisma.auditLog.findMany({
              where: {
                action: { in: ["STORY_WORKFLOW_STATE", "SUBMISSION_WORKFLOW_STATE"] },
              },
              orderBy: { createdAt: "desc" },
              take: 20,
            });

            for (const log of logs) {
              try {
                const details = JSON.parse(log.details);
                if (
                  (details.storyId === params.id || details.submissionId === params.id) &&
                  (details.reviewerId === user.id || details.assignedEditorId === user.id)
                ) {
                  isAssigned = true;
                  break;
                }
              } catch {}
            }
          }

          if (!isAssigned) {
            return json({ error: "Locked. Only the assigned Editor can edit this story." }, { status: 423 });
          }
        }

        let body: any;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON" }, { status: 400 });
        }

        const featured = body.featured ?? false;
        const homepageSlideshow = body.homepageSlideshow ?? false;
        const slideshowOrder = body.slideshowOrder ? parseInt(body.slideshowOrder, 10) : 0;
        const seoPriority = body.seoPriority ? parseFloat(body.seoPriority) : 0.5;
        const readingPriority = body.readingPriority ? parseInt(body.readingPriority, 10) : 0;
        const pinnedStory = body.pinnedStory ?? false;
        const trendingStory = body.trendingStory ?? false;
        const editorsPick = body.editorsPick ?? false;

        if (featured) {
          await prisma.story.updateMany({
            where: { id: { not: params.id } },
            data: { featured: false },
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

        // Log Editor/Admin Edit action
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: isEditor ? "EDITOR_EDITED" : "ADMIN_EDITED",
            details: JSON.stringify({
              storyId: params.id,
              title: story.title,
              role: isEditor ? "Editor" : "Admin",
              timestamp: new Date().toISOString(),
            }),
          },
        });

        // If the Editor submitted it back to Admin (body.status === "Pending")
        if (isEditor && body.status === "Pending") {
          await prisma.auditLog.create({
            data: {
              userId: user.id,
              action: "EDITOR_SUBMITTED",
              details: JSON.stringify({
                storyId: params.id,
                title: story.title,
                role: "Editor",
                timestamp: new Date().toISOString(),
              }),
            },
          });

          // Create database notification for all Admins/SuperAdmins
          const staff = await prisma.profile.findMany({
            where: {
              role: { in: ["admin", "superadmin"] },
            },
            select: { id: true },
          });

          for (const member of staff) {
            await prisma.notification.create({
              data: {
                recipientId: member.id,
                senderId: user.id,
                storyId: story.id,
                type: "EDITOR_SUBMITTED",
                title: "Story Ready for Review",
                message: `Editor ${profile.fullName || "Staff"} has finished editing "${story.title}" and submitted it for review.`,
                priority: "high",
                actionUrl: `/admin/stories?id=${story.id}`,
              },
            });
          }
        }

        return json({ story: toAdminRow(story) });
      },

      PATCH: async ({ params, request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        const profile = await prisma.profile.findUnique({ where: { id: user.id } });
        if (!profile) return json({ error: "Profile not found" }, { status: 403 });

        const role = profile.role?.toLowerCase() || "";
        const isAdmin = role === "admin" || role === "superadmin";
        const isEditor = role === "editor";

        if (!isAdmin && !isEditor) {
          return json({ error: "Forbidden" }, { status: 403 });
        }

        if (isEditor) {
          const storyObj = await prisma.story.findUnique({
            where: { id: params.id },
            select: { assignedEditorId: true, authorId: true },
          });

          let isAssigned = storyObj?.assignedEditorId === user.id || storyObj?.authorId === user.id;

          if (!isAssigned) {
            const logs = await prisma.auditLog.findMany({
              where: {
                action: { in: ["STORY_WORKFLOW_STATE", "SUBMISSION_WORKFLOW_STATE"] },
              },
              orderBy: { createdAt: "desc" },
              take: 20,
            });

            for (const log of logs) {
              try {
                const details = JSON.parse(log.details);
                if (
                  (details.storyId === params.id || details.submissionId === params.id) &&
                  (details.reviewerId === user.id || details.assignedEditorId === user.id)
                ) {
                  isAssigned = true;
                  break;
                }
              } catch {}
            }
          }

          if (!isAssigned) {
            return json({ error: "Locked. Only the assigned Editor can edit this story." }, { status: 423 });
          }
        }

        let body: any;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON" }, { status: 400 });
        }

        const allowed = [
          "featured",
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
        invalidateHeroCache();
        invalidateTrendingCache();
        return json({ story: toAdminRow(story) });
      },

      DELETE: async ({ params, request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        const profile = await prisma.profile.findUnique({ where: { id: user.id } });
        if (!profile) return json({ error: "Profile not found" }, { status: 403 });

        const role = profile.role?.toLowerCase() || "";
        const isAdmin = role === "admin" || role === "superadmin";

        if (!isAdmin) {
          return json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.story.delete({ where: { id: params.id } });
        invalidateHeroCache();
        invalidateTrendingCache();
        return json({ success: true });
      },
    },
  },
});
