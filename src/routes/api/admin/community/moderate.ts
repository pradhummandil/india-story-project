import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";

const db = prisma as any;

const ALLOWED_ACTIONS = ["pin", "unpin", "lock", "unlock", "mark_spam", "restore", "delete"] as const;
const ALLOWED_TARGET_TYPES = ["topic", "post", "group", "challenge"] as const;

type ModerationAction = typeof ALLOWED_ACTIONS[number];
type TargetType = typeof ALLOWED_TARGET_TYPES[number];

export const Route = createFileRoute("/api/admin/community/moderate")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const profile = await db.userProfile.findUnique({
            where: { id: user.id },
            select: { role: true },
          });
          if (!profile || !["SuperAdmin", "Admin", "Editor"].includes(profile.role)) {
            return json({ error: "Forbidden" }, { status: 403 });
          }

          const url = new URL(request.url);
          const type = url.searchParams.get("type") || "reports";

          if (type === "reports") {
            const reports = await db.postReport.findMany({
              where: { resolved: false },
              include: {
                user: { select: { name: true, email: true } },
                post: {
                  include: {
                    user: { select: { name: true, email: true } },
                    topic: { select: { title: true } }
                  }
                }
              },
              orderBy: { createdAt: "desc" }
            });
            return json({ reports });
          } else if (type === "spam") {
            const spamTopics = await db.discussionTopic.findMany({
              where: { isSpam: true },
              include: { user: { select: { name: true, email: true } } },
              orderBy: { updatedAt: "desc" }
            });
            const spamPosts = await db.discussionPost.findMany({
              where: { isSpam: true },
              include: { user: { select: { name: true, email: true } }, topic: { select: { title: true } } },
              orderBy: { updatedAt: "desc" }
            });
            return json({ spamTopics, spamPosts });
          } else if (type === "pinned") {
            const pinnedTopics = await db.discussionTopic.findMany({
              where: { isPinned: true },
              include: { user: { select: { name: true, email: true } }, category: true },
              orderBy: { updatedAt: "desc" }
            });
            return json({ pinnedTopics });
          } else if (type === "challenges") {
            const challenges = await db.storyChallenge.findMany({
              include: { _count: { select: { entries: true } } },
              orderBy: { startAt: "desc" }
            });
            return json({ challenges });
          }

          return json({ error: "Invalid type parameter" }, { status: 400 });
        } catch (e: any) {
          console.error("[admin/community/moderate] GET error:", e);
          return json({ error: e.message || "Internal server error" }, { status: 500 });
        }
      },
      POST: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          // Admin check
          const profile = await db.userProfile.findUnique({
            where: { id: user.id },
            select: { role: true },
          });
          if (!profile || !["SuperAdmin", "Admin", "Editor"].includes(profile.role)) {
            return json({ error: "Forbidden" }, { status: 403 });
          }

          const body = await request.json();
          const { action, targetType, targetId, reason } = body ?? {};

          if (!action || !ALLOWED_ACTIONS.includes(action as ModerationAction)) {
            return json({ error: `Invalid action. Allowed: ${ALLOWED_ACTIONS.join(", ")}` }, { status: 400 });
          }
          if (!targetType || !ALLOWED_TARGET_TYPES.includes(targetType as TargetType)) {
            return json({ error: `Invalid targetType. Allowed: ${ALLOWED_TARGET_TYPES.join(", ")}` }, { status: 400 });
          }
          if (!targetId) {
            return json({ error: "targetId is required" }, { status: 400 });
          }

          const act = action as ModerationAction;
          const ttype = targetType as TargetType;

          if (act === "delete") {
            // Hard delete
            switch (ttype) {
              case "topic":
                await db.discussionTopic.delete({ where: { id: targetId } });
                break;
              case "post":
                await db.discussionPost.delete({ where: { id: targetId } });
                break;
              case "group":
                await db.communityGroup.delete({ where: { id: targetId } });
                break;
              case "challenge":
                await db.storyChallenge.delete({ where: { id: targetId } });
                break;
            }
          } else {
            // Build update data based on action + targetType
            let updateData: any = {};

            switch (act) {
              case "pin":
                updateData = { isPinned: true };
                break;
              case "unpin":
                updateData = { isPinned: false };
                break;
              case "lock":
                updateData = { isLocked: true };
                break;
              case "unlock":
                updateData = { isLocked: false };
                break;
              case "mark_spam":
                updateData = { isSpam: true };
                break;
              case "restore":
                updateData = ttype === "topic" || ttype === "post"
                  ? { isSpam: false }
                  : { isActive: true };
                break;
            }

            switch (ttype) {
              case "topic":
                await db.discussionTopic.update({ where: { id: targetId }, data: updateData });
                break;
              case "post":
                // Only applicable fields for posts
                if ("isLocked" in updateData) delete updateData.isLocked;
                await db.discussionPost.update({ where: { id: targetId }, data: updateData });
                break;
              case "group":
                // For group: only isActive makes sense
                if (act === "restore") updateData = { isActive: true };
                else if (act === "mark_spam") updateData = { isActive: false };
                else if (act === "lock") updateData = { isActive: false };
                else if (act === "unlock") updateData = { isActive: true };
                await db.communityGroup.update({ where: { id: targetId }, data: updateData });
                break;
              case "challenge":
                if (act === "restore") updateData = { isActive: true };
                else if (act === "mark_spam") updateData = { isActive: false };
                else if (act === "lock") updateData = { isActive: false };
                else if (act === "unlock") updateData = { isActive: true };
                await db.storyChallenge.update({ where: { id: targetId }, data: updateData });
                break;
            }
          }

          // Log to AuditLog
          try {
            await db.auditLog.create({
              data: {
                userId: user.id,
                action: `community_moderate:${act}`,
                targetType: ttype,
                targetId,
                reason: reason ?? null,
                metadata: JSON.stringify({ action: act, targetType: ttype, targetId }),
              },
            });
          } catch {
            // Non-critical: don't fail the request if audit log fails
          }

          return json({ success: true, action: act, targetId });
        } catch (e: any) {
          console.error("[admin/community/moderate] POST error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
