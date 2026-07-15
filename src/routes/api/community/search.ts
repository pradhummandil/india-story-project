import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";

const db = prisma as any;

export const Route = createFileRoute("/api/community/search")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const q = url.searchParams.get("q")?.trim();
          const type = url.searchParams.get("type") ?? "all";

          if (!q || q.length < 2) {
            return json({ error: "Query must be at least 2 characters" }, { status: 400 });
          }

          const searchFilter = { contains: q, mode: "insensitive" } as const;

          const results: { topics: any[]; groups: any[]; challenges: any[]; total: number } = {
            topics: [],
            groups: [],
            challenges: [],
            total: 0,
          };

          const searches: Promise<void>[] = [];

          if (type === "all" || type === "topics") {
            searches.push(
              db.discussionTopic
                .findMany({
                  where: {
                    isSpam: false,
                    title: searchFilter,
                  },
                  take: 10,
                  orderBy: { lastActivityAt: "desc" },
                  include: {
                    user: { select: { name: true, avatarUrl: true } },
                    category: { select: { name: true, slug: true } },
                  },
                })
                .then((r: any[]) => {
                  results.topics = r;
                }),
            );
          }

          if (type === "all" || type === "groups") {
            searches.push(
              db.communityGroup
                .findMany({
                  where: {
                    isActive: true,
                    OR: [{ name: searchFilter }, { description: searchFilter }],
                  },
                  take: 10,
                  orderBy: { memberCount: "desc" },
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    privacy: true,
                    memberCount: true,
                    coverImage: true,
                  },
                })
                .then((r: any[]) => {
                  results.groups = r;
                }),
            );
          }

          if (type === "all" || type === "challenges") {
            searches.push(
              db.storyChallenge
                .findMany({
                  where: {
                    OR: [{ title: searchFilter }, { description: searchFilter }],
                  },
                  take: 10,
                  orderBy: { startAt: "desc" },
                  include: { _count: { select: { entries: true } } },
                })
                .then((r: any[]) => {
                  results.challenges = r;
                }),
            );
          }

          await Promise.all(searches);

          results.total = results.topics.length + results.groups.length + results.challenges.length;

          return json(results);
        } catch (e: any) {
          console.error("[community/search] GET error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
