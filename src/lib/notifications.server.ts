/**
 * Server-side notification helper.
 * Centralised so every event consistently creates notifications in PostgreSQL.
 * Import this in any API route that needs to fire notifications.
 */
import { prisma } from "@/lib/repositories/prisma.server";

export type NotificationType =
  | "ASSIGNMENT"
  | "REVISION_SUBMITTED"
  | "REVISION_APPROVED"
  | "REVISION_REJECTED"
  | "REVISION_CHANGES_REQUESTED"
  | "COMMENT"
  | "REPLY"
  | "MENTION"
  | "FOLLOW"
  | "NEWSLETTER_SUBSCRIBE"
  | "COLLECTION_SHARE"
  | "SYSTEM_ALERT"
  | "ADMIN_MESSAGE"
  | "STORY_PUBLISHED"
  | "SUBMISSION_STATUS";

interface CreateNotificationOpts {
  recipientId: string;
  senderId?: string;
  type: NotificationType;
  title: string;
  message: string;
  storyId?: string;
  submissionId?: string;
  actionUrl?: string;
  priority?: "normal" | "high" | "urgent";
}

/**
 * Creates a single notification in PostgreSQL.
 * Supabase Realtime will broadcast the INSERT to all subscribed clients — no polling needed.
 */
export async function createNotification(opts: CreateNotificationOpts): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        recipientId: opts.recipientId,
        senderId: opts.senderId ?? null,
        type: opts.type,
        title: opts.title,
        message: opts.message,
        storyId: opts.storyId ?? null,
        submissionId: opts.submissionId ?? null,
        actionUrl: opts.actionUrl ?? null,
        priority: opts.priority ?? "normal",
        isRead: false,
      },
    });
  } catch (err) {
    // Never throw — a notification failure must not break the primary action
    console.error("[createNotification] Failed:", err);
  }
}

/**
 * Creates notifications for multiple recipients at once.
 */
export async function createNotificationForMany(
  recipientIds: string[],
  opts: Omit<CreateNotificationOpts, "recipientId">
): Promise<void> {
  if (recipientIds.length === 0) return;
  try {
    await prisma.notification.createMany({
      data: recipientIds.map((recipientId) => ({
        recipientId,
        senderId: opts.senderId ?? null,
        type: opts.type,
        title: opts.title,
        message: opts.message,
        storyId: opts.storyId ?? null,
        submissionId: opts.submissionId ?? null,
        actionUrl: opts.actionUrl ?? null,
        priority: opts.priority ?? "normal",
        isRead: false,
      })),
      skipDuplicates: true,
    });
  } catch (err) {
    console.error("[createNotificationForMany] Failed:", err);
  }
}

/**
 * Extracts @mentions from text, looks up UserProfile by name, returns their IDs.
 * Mention format: @username (case-insensitive, spaces converted to underscore)
 */
export async function extractMentionRecipients(text: string, authorId: string): Promise<string[]> {
  const mentionRegex = /@([a-zA-Z0-9_]{2,30})/g;
  const handles: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = mentionRegex.exec(text)) !== null) {
    handles.push(match[1].toLowerCase());
  }
  if (handles.length === 0) return [];

  const profiles = await prisma.userProfile.findMany({
    where: {
      name: { in: handles.map((h) => h.replace(/_/g, " ")), mode: "insensitive" },
      NOT: { id: authorId }, // don't notify yourself
    },
    select: { id: true },
  });
  return profiles.map((p) => p.id);
}

/**
 * Get all admins and superadmins for system-wide notifications.
 */
export async function getAdminIds(): Promise<string[]> {
  const admins = await prisma.userProfile.findMany({
    where: { role: { in: ["Admin", "SuperAdmin"] }, active: true },
    select: { id: true },
  });
  return admins.map((a) => a.id);
}
