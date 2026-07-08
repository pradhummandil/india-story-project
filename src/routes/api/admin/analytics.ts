import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/admin/analytics")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const getValue = <T>(res: PromiseSettledResult<T>, fallback: T): T => {
            return res.status === "fulfilled" ? res.value : fallback;
          };

          const results = await Promise.allSettled([
            prisma.story.count(),
            prisma.story.count({ where: { status: "Published" } }),
            prisma.story.count({ where: { status: "Draft" } }),
            prisma.story.count({ where: { status: "Hidden" } }),
            prisma.story.count({ where: { status: "Archived" } }),
            prisma.submittedStory.count({ where: { status: "Pending" } }).catch(() => 0),
            prisma.userProfile.count(),
            prisma.userProfile.count({
              where: {
                lastActiveAt: {
                  gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                },
              },
            }),
            prisma.storyLike.count(),
            prisma.comment.count(),
            prisma.bookmark.count(),
            prisma.author.count(),
            prisma.category.count(),
            prisma.state.count(),
            // Top stories by views
            prisma.story.findMany({
              take: 5,
              orderBy: { viewCount: "desc" },
              select: { title: true, viewCount: true, slug: true },
            }),
            // Top authors aggregate
            prisma.author.findMany({
              take: 5,
              select: {
                name: true,
                stories: {
                  select: { viewCount: true },
                },
              },
            }),
            // Trending states aggregate
            prisma.state.findMany({
              take: 5,
              select: {
                name: true,
                stories: {
                  select: { viewCount: true },
                },
              },
            }),
            // Activity log lists
            prisma.story.findMany({
              take: 5,
              orderBy: { createdAt: "desc" },
              select: { title: true, createdAt: true, status: true },
            }),
            prisma.comment.findMany({
              take: 5,
              orderBy: { createdAt: "desc" },
              select: {
                content: true,
                createdAt: true,
                user: { select: { name: true } },
                story: { select: { title: true } },
              },
            }),
            prisma.storyLike.findMany({
              take: 5,
              orderBy: { createdAt: "desc" },
              select: {
                createdAt: true,
                user: { select: { name: true } },
                story: { select: { title: true } },
              },
            }),
            prisma.submittedStory.findMany({
              take: 5,
              orderBy: { createdAt: "desc" },
              select: {
                title: true,
                createdAt: true,
                user: { select: { name: true } },
              },
            }).catch(() => []),
            // Flagged comments count
            prisma.commentReport.count().catch(() => 0),
          ]);

          const totalStories = getValue(results[0], 0);
          const published = getValue(results[1], 0);
          const draft = getValue(results[2], 0);
          const hidden = getValue(results[3], 0);
          const archived = getValue(results[4], 0);
          const pendingSubmissions = getValue(results[5], 0);
          const totalUsers = getValue(results[6], 0);
          const dailyReaders = getValue(results[7], 0);
          const totalLikes = getValue(results[8], 0);
          const totalComments = getValue(results[9], 0);
          const totalBookmarks = getValue(results[10], 0);
          const totalAuthors = getValue(results[11], 0);
          const totalCategories = getValue(results[12], 0);
          const totalStates = getValue(results[13], 0);
          const topStories = getValue(results[14], []);
          const topAuthorsList = getValue(results[15], []);
          const trendingStatesList = getValue(results[16], []);
          const recentStories = getValue(results[17], []);
          const recentComments = getValue(results[18], []);
          const recentLikes = getValue(results[19], []);
          const recentSubmissions = getValue(results[20], []);
          const flaggedCommentsCount = getValue(results[21], 0);

          const viewsResult = await prisma.story.aggregate({ _sum: { viewCount: true } }).catch(() => ({ _sum: { viewCount: 0 } }));
          const totalViews = viewsResult._sum.viewCount ?? 0;

          const timeResult = await prisma.userProfile.aggregate({ _sum: { totalReadingTime: true } }).catch(() => ({ _sum: { totalReadingTime: 0 } }));
          const totalReadingTime = timeResult._sum.totalReadingTime ?? 0;

          // Process top authors views
          const topAuthors = topAuthorsList
            .map((a) => ({
              name: a.name,
              viewCount: a.stories.reduce((acc, s) => acc + (s.viewCount || 0), 0),
              storiesCount: a.stories.length,
            }))
            .sort((a, b) => b.viewCount - a.viewCount);

          // Process trending states views
          const trendingStates = trendingStatesList
            .map((s) => ({
              name: s.name,
              viewCount: s.stories.reduce((acc, st) => acc + (st.viewCount || 0), 0),
              storiesCount: s.stories.length,
            }))
            .sort((a, b) => b.viewCount - a.viewCount);

          // Generate growth charts for last 6 months
          const growthCharts = [];
          const now = new Date();
          for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const start = new Date(d.getFullYear(), d.getMonth(), 1);
            const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
            let count = 0;
            try {
              count = await prisma.story.count({
                where: {
                  createdAt: {
                    gte: start,
                    lte: end,
                  },
                },
              });
            } catch {
              // fallback
            }
            const monthName = d.toLocaleString("en-US", { month: "short" });
            growthCharts.push({ month: monthName, count });
          }

          // Build dynamic timeline activity log
          const activities = [
            ...recentStories.map((s) => ({
              type: "story",
              title: `New story added: "${s.title}"`,
              time: s.createdAt.toISOString(),
              meta: s.status,
            })),
            ...recentComments.map((c) => ({
              type: "comment",
              title: `${c.user?.name || "Reader"} commented on "${c.story?.title}": "${c.content.slice(0, 45)}..."`,
              time: c.createdAt.toISOString(),
              meta: "Comment",
            })),
            ...recentLikes.map((l) => ({
              type: "like",
              title: `${l.user?.name || "Reader"} liked "${l.story?.title}"`,
              time: l.createdAt.toISOString(),
              meta: "Like",
            })),
            ...recentSubmissions.map((sb) => ({
              type: "submission",
              title: `${sb.user?.name || "Contributor"} submitted draft "${sb.title}"`,
              time: sb.createdAt.toISOString(),
              meta: "Submission",
            })),
          ]
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
            .slice(0, 10);

          return json({
            totalStories,
            published,
            draft,
            hidden,
            archived,
            pendingSubmissions,
            totalUsers,
            dailyReaders,
            totalViews,
            totalLikes,
            totalComments,
            totalBookmarks,
            totalReadingTime,
            topStories,
            topAuthors,
            trendingStates,
            growthCharts,
            activities,
            notifications: {
              pendingSubmissions,
              flaggedCommentsCount,
            },
          });
        } catch (e: any) {
          return json({ error: e.message || "Failed to load admin analytics" }, { status: 500 });
        }
      },
    },
  },
});
