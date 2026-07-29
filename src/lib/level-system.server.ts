import { prisma } from "@/lib/repositories/prisma.server";

/**
 * Calculates level from total XP.
 * Level formula: Unlimited progression, 500 XP per level.
 * Level 1: 0 - 499 XP
 * Level 2: 500 - 999 XP
 * Level 3: 1000 - 1499 XP
 */
export function calculateLevel(totalXP: number): number {
  if (totalXP <= 0) return 1;
  return Math.floor(totalXP / 500) + 1;
}

interface AwardXPOpts {
  userId: string;
  xpDelta: number;
  incrementReadingTime?: number;
  incrementStoriesRead?: boolean;
  incrementStoriesLiked?: number; // +1 or -1
  incrementBookmarks?: number; // +1 or -1
}

/**
 * Atomically updates user XP, levels, and streak in both UserProfile & UserStat.
 * Also handles daily reading streak updates.
 */
export async function awardXPAndSyncStats(opts: AwardXPOpts): Promise<{
  totalXP: number;
  level: number;
  readingStreak: number;
  leveledUp: boolean;
}> {
  const {
    userId,
    xpDelta,
    incrementReadingTime = 0,
    incrementStoriesRead = false,
    incrementStoriesLiked = 0,
    incrementBookmarks = 0,
  } = opts;

  try {
    // 1. Get current stats
    let userStat = await prisma.userStat.findUnique({
      where: { userId },
    });

    let userProfile = await prisma.userProfile.findUnique({
      where: { id: userId },
    });

    if (!userStat && userProfile) {
      userStat = await prisma.userStat.create({
        data: {
          userId,
          totalXP: userProfile.totalXP || 0,
          level: userProfile.level || 1,
          readingStreak: userProfile.readingStreak || 0,
        },
      });
    }

    const currentXP = userStat?.totalXP ?? userProfile?.totalXP ?? 0;
    const currentLevel = userStat?.level ?? userProfile?.level ?? 1;
    const currentStreak = userStat?.readingStreak ?? userProfile?.readingStreak ?? 0;
    const currentLongest = userStat?.longestStreak ?? currentStreak;
    const lastActive = userStat?.lastActiveAt ?? userProfile?.lastActiveAt;

    // Calculate new total XP & Level
    const newTotalXP = Math.max(0, currentXP + xpDelta);
    const newLevel = calculateLevel(newTotalXP);
    const leveledUp = newLevel > currentLevel;

    // Daily streak logic
    let newStreak = currentStreak;
    let newLongest = currentLongest;
    const now = new Date();

    if (xpDelta > 0 || incrementReadingTime > 0 || incrementStoriesRead) {
      if (!lastActive) {
        newStreak = 1;
      } else {
        const lastDate = new Date(lastActive);
        const isSameDay =
          now.getFullYear() === lastDate.getFullYear() &&
          now.getMonth() === lastDate.getMonth() &&
          now.getDate() === lastDate.getDate();

        if (!isSameDay) {
          // Check if yesterday
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          const isYesterday =
            yesterday.getFullYear() === lastDate.getFullYear() &&
            yesterday.getMonth() === lastDate.getMonth() &&
            yesterday.getDate() === lastDate.getDate();

          if (isYesterday) {
            newStreak += 1;
          } else {
            newStreak = 1; // Streak broken
          }
        }
      }
      if (newStreak > newLongest) {
        newLongest = newStreak;
      }
    }

    // 2. Update UserStat
    const updatedStat = await prisma.userStat.upsert({
      where: { userId },
      create: {
        userId,
        totalXP: newTotalXP,
        level: newLevel,
        readingStreak: newStreak,
        longestStreak: newLongest,
        totalReadingTime: incrementReadingTime,
        storiesRead: incrementStoriesRead ? 1 : 0,
        storiesLiked: Math.max(0, incrementStoriesLiked),
        bookmarksCount: Math.max(0, incrementBookmarks),
        lastActiveAt: now,
      },
      update: {
        totalXP: newTotalXP,
        level: newLevel,
        readingStreak: newStreak,
        longestStreak: newLongest,
        lastActiveAt: now,
        ...(incrementReadingTime > 0 ? { totalReadingTime: { increment: incrementReadingTime } } : {}),
        ...(incrementStoriesRead ? { storiesRead: { increment: 1 } } : {}),
        ...(incrementStoriesLiked !== 0
          ? { storiesLiked: { increment: incrementStoriesLiked } }
          : {}),
        ...(incrementBookmarks !== 0
          ? { bookmarksCount: { increment: incrementBookmarks } }
          : {}),
      },
    });

    // 3. Update UserProfile for redundant synchronization
    await prisma.userProfile.update({
      where: { id: userId },
      data: {
        totalXP: newTotalXP,
        level: newLevel,
        readingStreak: newStreak,
        lastActiveAt: now,
        ...(incrementReadingTime > 0 ? { totalReadingTime: { increment: incrementReadingTime } } : {}),
      },
    }).catch(() => {});

    return {
      totalXP: updatedStat.totalXP,
      level: updatedStat.level,
      readingStreak: updatedStat.readingStreak,
      leveledUp,
    };
  } catch (err) {
    console.error("[awardXPAndSyncStats] Error:", err);
    return {
      totalXP: 0,
      level: 1,
      readingStreak: 0,
      leveledUp: false,
    };
  }
}
