import { prisma } from "../repositories/prisma.server";

export type PersonalizedFeedOptions = {
  userId?: string;
  limit?: number;
  state?: string;
  theme?: string;
};

export class UserInterestService {
  /** Record a user interaction and update interest scores */
  async trackInteraction(userId: string, actionType: "READ" | "BOOKMARK" | "LIKE" | "SEARCH", metadata?: { themeId?: string; stateName?: string; targetId?: string; query?: string }) {
    if (!userId) return;

    try {
      // 1. Record history log
      await prisma.userHistory.create({
        data: {
          userId,
          actionType,
          targetId: metadata?.targetId,
          metadata: metadata?.query || (metadata?.themeId ? `theme:${metadata.themeId}` : undefined),
        },
      });

      // 2. Increment user interest weights if theme or state is present
      const weight = actionType === "LIKE" ? 2.5 : actionType === "BOOKMARK" ? 2.0 : actionType === "READ" ? 1.0 : 0.5;

      const themeId: string | null = metadata?.themeId || null;
      const stateName: string | null = metadata?.stateName || null;

      if (themeId || stateName) {
        const existingInterest = await prisma.userInterest.findFirst({
          where: {
            userId,
            ...(themeId ? { themeId } : {}),
            ...(stateName ? { stateName } : {}),
          },
        });

        if (existingInterest) {
          await prisma.userInterest.update({
            where: { id: existingInterest.id },
            data: { score: { increment: weight } },
          });
        } else {
          await prisma.userInterest.create({
            data: {
              userId,
              themeId: themeId || undefined,
              stateName: stateName || undefined,
              score: weight,
            },
          });
        }
      }
    } catch (err) {
      console.error("Error tracking user interaction:", err);
    }
  }

  /** Retrieve personalized story recommendations for a user based on interest weights */
  async getPersonalizedFeed(options: PersonalizedFeedOptions) {
    const limit = options.limit || 6;
    if (!options.userId) {
      // Return top featured stories for anonymous users
      return prisma.story.findMany({
        where: { status: "Published", deleted: false },
        orderBy: [{ featured: "desc" }, { viewCount: "desc" }],
        take: limit,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          readingTime: true,
          viewCount: true,
          publishedAt: true,
          state: { select: { name: true } },
          author: { select: { name: true } },
          images: { take: 1, select: { imageUrl: true } },
          themes: { select: { theme: { select: { name: true } } } },
        },
      });
    }

    // Get user top interests
    const interests = await prisma.userInterest.findMany({
      where: { userId: options.userId },
      orderBy: { score: "desc" },
      take: 5,
    });

    const themeIds = interests.map((i) => i.themeId).filter(Boolean) as string[];
    const stateNames = interests.map((i) => i.stateName).filter(Boolean) as string[];

    return prisma.story.findMany({
      where: {
        status: "Published",
        deleted: false,
        OR: [
          ...(themeIds.length > 0 ? [{ themes: { some: { themeId: { in: themeIds } } } }] : []),
          ...(stateNames.length > 0 ? [{ state: { name: { in: stateNames } } }] : []),
        ],
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        readingTime: true,
        viewCount: true,
        publishedAt: true,
        state: { select: { name: true } },
        author: { select: { name: true } },
        images: { take: 1, select: { imageUrl: true } },
        themes: { select: { theme: { select: { name: true } } } },
      },
    });
  }
}

export const userInterestService = new UserInterestService();
