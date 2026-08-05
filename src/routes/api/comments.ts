import { createFileRoute } from "@tanstack/react-router";
import { json, authenticate, checkRateLimit, getClientIp } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";
import { createNotification, extractMentionRecipients } from "@/lib/notifications.server";
import { awardXPAndSyncStats } from "@/lib/level-system.server";


function sanitizeHtml(str: string): string {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

export const Route = createFileRoute("/api/comments")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const storyId = url.searchParams.get("storyId");

        if (!storyId) {
          // If no storyId is passed, check authentication and return user's comments
          const user = await authenticate(request);
          if (!user) {
            return json(
              { error: "storyId is required or User must be authenticated" },
              { status: 400 },
            );
          }

          try {
            const comments = await prisma.comment.findMany({
              where: {
                userId: user.id,
              },
              include: {
                story: {
                  select: {
                    title: true,
                    slug: true,
                  },
                },
              },
              orderBy: {
                createdAt: "desc",
              },
            });

            return json({
              comments: comments.map((c) => ({
                id: c.id,
                content: c.content,
                createdAt: c.createdAt.toISOString(),
                storySlug: c.story.slug,
                storyTitle: c.story.title,
                status: c.status,
              })),
            });
          } catch (e: any) {
            console.error("[comments] GET user comments error:", e);
            return json({ error: "Internal server error" }, { status: 500 });
          }
        }

        try {
          // Fetch all comments for the story that are not rejected/flagged
          const comments = await prisma.comment.findMany({
            where: {
              storyId,
              status: "approved",
            },
            include: {
              user: {
                select: {
                  name: true,
                  avatarUrl: true,
                },
              },
              likes: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          });

          // Build comment tree
          const commentMap = new Map<string, any>();
          const roots: any[] = [];

          comments.forEach((c) => {
            const formatted = {
              id: c.id,
              storyId: c.storyId,
              userId: c.userId,
              content: c.content,
              parentId: c.parentId,
              status: c.status,
              edited: c.edited,
              createdAt: c.createdAt.toISOString(),
              authorName: c.user?.name ?? "Anonymous",
              authorAvatar: c.user?.avatarUrl ?? null,
              likeCount: c.likes.length,
              replies: [],
            };
            commentMap.set(c.id, formatted);
          });

          commentMap.forEach((c) => {
            if (c.parentId && commentMap.has(c.parentId)) {
              commentMap.get(c.parentId).replies.push(c);
            } else {
              roots.push(c);
            }
          });

          return json({ comments: roots });
        } catch (e: any) {
          console.error("[comments] GET error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },

      POST: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        const ip = getClientIp(request);
        const { allowed } = checkRateLimit(ip, 10, 60 * 1000); // 10 comments per minute limit
        if (!allowed) {
          return json(
            { error: "Too many comments. Please wait a minute before posting again." },
            { status: 429 },
          );
        }

        try {
          const body = await request.json();
          const { storyId, content, parentId } = body;

          if (!storyId || !content?.trim()) {
            return json({ error: "storyId and content are required" }, { status: 400 });
          }

          // Create UserProfile record if missing for this authenticated user
          let userProfile = await prisma.userProfile.findUnique({ where: { id: user.id } });
          if (!userProfile) {
            const existingProfile = await prisma.profile.findUnique({
              where: { id: user.id },
            });
            userProfile = await prisma.userProfile.create({
              data: {
                id: user.id,
                email: user.email ?? "",
                name: existingProfile?.fullName || user.user_metadata?.name || user.email?.split("@")[0] || "Contributor",
                avatarUrl: existingProfile?.avatarUrl || user.user_metadata?.avatar_url || null,
              },
            });
          }

          const comment = await prisma.comment.create({
            data: {
              storyId,
              userId: user.id,
              content: sanitizeHtml(content.trim()),
              parentId: parentId || null,
              status: "approved", // default to auto-approved in ISP
            },
            include: {
              user: {
                select: {
                  name: true,
                  avatarUrl: true,
                },
              },
            },
          });

          // Increment XP for commenting (+5 XP)
          try {
            await awardXPAndSyncStats({
              userId: user.id,
              xpDelta: 5,
            });
          } catch {
            /* ignore stats upsert errors */
          }

          // ── Notifications ──────────────────────────────────────────────────
          try {
            const commenterProfile = await prisma.userProfile.findUnique({
              where: { id: user.id },
              select: { name: true },
            });
            const commenterName = commenterProfile?.name || "Someone";

            if (parentId) {
              // REPLY — notify the parent comment's author
              const parentComment = await prisma.comment.findUnique({
                where: { id: parentId },
                include: { story: { select: { id: true, title: true, slug: true } } },
              });
              if (parentComment && parentComment.userId !== user.id) {
                await createNotification({
                  recipientId: parentComment.userId,
                  senderId: user.id,
                  type: "REPLY",
                  title: "New Reply to Your Comment",
                  message: `${commenterName} replied to your comment on "${parentComment.story.title}".`,
                  storyId: storyId,
                  actionUrl: `/stories/${parentComment.story.slug}#comment-${comment.id}`,
                  priority: "normal",
                });
              }
            } else {
              // TOP-LEVEL COMMENT — notify the story author
              const story = await prisma.story.findUnique({
                where: { id: storyId },
                include: { author: { select: { id: true, name: true } } },
              });
              // Story author may map to a UserProfile — look up by name
              if (story) {
                // Try to find a UserProfile whose name matches the story author
                const authorProfile = await prisma.userProfile.findFirst({
                  where: { name: story.author.name, NOT: { id: user.id } },
                  select: { id: true },
                });
                if (authorProfile) {
                  await createNotification({
                    recipientId: authorProfile.id,
                    senderId: user.id,
                    type: "COMMENT",
                    title: "New Comment on Your Story",
                    message: `${commenterName} commented on "${story.title}": "${content.trim().substring(0, 80)}${content.length > 80 ? "…" : ""}"`,
                    storyId: storyId,
                    actionUrl: `/stories/${story.slug}#comment-${comment.id}`,
                    priority: "normal",
                  });
                }
              }
            }

            // @MENTIONS — notify each mentioned user
            const mentionIds = await extractMentionRecipients(content, user.id);
            const story2 = await prisma.story.findUnique({ where: { id: storyId }, select: { slug: true, title: true } });
            for (const mentionId of mentionIds) {
              await createNotification({
                recipientId: mentionId,
                senderId: user.id,
                type: "MENTION",
                title: "You Were Mentioned",
                message: `${commenterName} mentioned you in a comment on "${story2?.title ?? "a story"}".`,
                storyId: storyId,
                actionUrl: story2 ? `/stories/${story2.slug}#comment-${comment.id}` : undefined,
                priority: "normal",
              });
            }
          } catch (notifErr) {
            console.error("[comments] Notification error (non-fatal):", notifErr);
          }
          // ── End Notifications ─────────────────────────────────────────────

          return json({
            comment: {
              id: comment.id,
              storyId: comment.storyId,
              userId: comment.userId,
              content: comment.content,
              parentId: comment.parentId,
              status: comment.status,
              edited: comment.edited,
              createdAt: comment.createdAt.toISOString(),
              authorName: comment.user?.name ?? "Anonymous",
              authorAvatar: comment.user?.avatarUrl ?? null,
              likeCount: 0,
              replies: [],
            },
          });

        } catch (e: any) {
          console.error("[comments] POST error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },

      PATCH: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const body = await request.json();
          const { commentId, content } = body;

          if (!commentId || !content?.trim()) {
            return json({ error: "commentId and content are required" }, { status: 400 });
          }

          const existing = await prisma.comment.findUnique({
            where: { id: commentId },
          });

          if (!existing) {
            return json({ error: "Comment not found" }, { status: 404 });
          }

          if (existing.userId !== user.id) {
            return json({ error: "Forbidden" }, { status: 403 });
          }

          const updated = await prisma.comment.update({
            where: { id: commentId },
            data: {
              content: sanitizeHtml(content.trim()),
              edited: true,
            },
          });

          return json({ success: true, content: updated.content });
        } catch (e: any) {
          console.error("[comments] PATCH error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },

      DELETE: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const body = await request.json();
          const { commentId } = body;

          if (!commentId) {
            return json({ error: "commentId is required" }, { status: 400 });
          }

          const existing = await prisma.comment.findUnique({
            where: { id: commentId },
          });

          if (!existing) {
            return json({ error: "Comment not found" }, { status: 404 });
          }

          // Verify ownership or Admin role
          let canDelete = existing.userId === user.id;
          if (!canDelete) {
            const profile = await prisma.profile.findUnique({ where: { id: user.id } });
            if (profile && profile.role === "admin") {
              canDelete = true;
            }
          }

          if (!canDelete) {
            return json({ error: "Forbidden" }, { status: 403 });
          }

          // Soft delete to preserve reply hierarchy
          await prisma.comment.update({
            where: { id: commentId },
            data: {
              content: "[This comment was deleted]",
              status: "approved", // keep visible so tree remains intact
            },
          });

          return json({ success: true });
        } catch (e: any) {
          console.error("[comments] DELETE error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
