import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";

const db = prisma as any;

const getValue = <T>(res: PromiseSettledResult<T>, fallback: T): T =>
  res.status === "fulfilled" ? res.value : fallback;

function buildDateRange(period: string): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  let start: Date;
  if (period === "daily") {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  } else if (period === "weekly") {
    start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === "monthly") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    // yearly
    start = new Date(now.getFullYear(), 0, 1);
  }
  return { start, end };
}

function buildPeriodBuckets(period: string): { name: string; start: Date; end: Date }[] {
  const now = new Date();
  const buckets: { name: string; start: Date; end: Date }[] = [];

  if (period === "daily") {
    // Last 24 hours by hour
    for (let i = 23; i >= 0; i--) {
      const d = new Date(Date.now() - i * 60 * 60 * 1000);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), 0, 0);
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), 59, 59);
      buckets.push({ name: `${d.getHours()}:00`, start, end });
    }
  } else if (period === "weekly") {
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
      buckets.push({ name: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }), start, end });
    }
  } else if (period === "monthly") {
    // Last 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
      buckets.push({ name: `${d.getDate()} ${d.toLocaleString("en-IN", { month: "short" })}`, start, end });
    }
  } else {
    // Yearly: last 12 months
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      buckets.push({ name: d.toLocaleString("en-IN", { month: "short", year: "2-digit" }), start, end });
    }
  }
  return buckets;
}

export const Route = createFileRoute("/api/admin/analytics")({
  head: () => ({ meta: [{ title: "Admin Analytics" }] }),
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const period = url.searchParams.get("period") || "monthly";
          const { start, end } = buildDateRange(period);
          const buckets = buildPeriodBuckets(period);

          // ─── Parallel base metrics ─────────────────────────────────────────
          const results = await Promise.allSettled([
            // 0: total stories
            prisma.story.count(),
            // 1: published
            prisma.story.count({ where: { status: "Published" } }),
            // 2: draft
            prisma.story.count({ where: { status: "Draft" } }),
            // 3: hidden
            prisma.story.count({ where: { status: "Hidden" } }),
            // 4: archived
            prisma.story.count({ where: { status: "Archived" } }),
            // 5: pending submissions
            prisma.submittedStory.count({ where: { status: "Pending" } }).catch(() => 0),
            // 6: total registered users
            prisma.userProfile.count(),
            // 7: active today
            prisma.userProfile.count({ where: { lastActiveAt: { gte: new Date(Date.now() - 86400000) } } }),
            // 8: total likes
            prisma.storyLike.count(),
            // 9: total comments
            prisma.comment.count(),
            // 10: total bookmarks
            prisma.bookmark.count(),
            // 11: total authors
            prisma.author.count(),
            // 12: total themes
            prisma.theme.count(),
            // 13: total states
            prisma.state.count(),
            // 14: top stories by viewCount
            prisma.story.findMany({
              take: 10,
              orderBy: { viewCount: "desc" },
              select: { id: true, title: true, viewCount: true, slug: true, readingTime: true },
            }),
            // 15: top authors
            prisma.author.findMany({
              take: 10,
              select: { id: true, name: true, avatar: true, stories: { select: { viewCount: true } } },
            }),
            // 16: trending states
            prisma.state.findMany({
              take: 15,
              select: { name: true, stories: { select: { viewCount: true } } },
            }),
            // 17: recent stories
            prisma.story.findMany({
              take: 5,
              orderBy: { createdAt: "desc" },
              select: { title: true, createdAt: true, status: true },
            }),
            // 18: recent comments
            prisma.comment.findMany({
              take: 5,
              orderBy: { createdAt: "desc" },
              select: {
                content: true, createdAt: true,
                user: { select: { name: true } },
                story: { select: { title: true } },
              },
            }),
            // 19: recent likes
            prisma.storyLike.findMany({
              take: 5,
              orderBy: { createdAt: "desc" },
              select: {
                createdAt: true,
                user: { select: { name: true } },
                story: { select: { title: true } },
              },
            }),
            // 20: recent submissions
            prisma.submittedStory.findMany({
              take: 5,
              orderBy: { createdAt: "desc" },
              select: { title: true, createdAt: true, user: { select: { name: true } } },
            }).catch(() => []),
            // 21: flagged comments count
            prisma.commentReport.count().catch(() => 0),
            // 22: aggregate story views
            prisma.story.aggregate({ _sum: { viewCount: true } }).catch(() => ({ _sum: { viewCount: 0 } })),
            // 23: aggregate reading time
            prisma.userProfile.aggregate({ _sum: { totalReadingTime: true } }).catch(() => ({ _sum: { totalReadingTime: 0 } })),
            // 24: top videos
            prisma.video.findMany({
              take: 5,
              orderBy: { viewCount: "desc" },
              select: { id: true, title: true, slug: true, viewCount: true },
            }).catch(() => []),
            // 25: theme analytics
            db.theme.findMany({
              take: 10,
              select: {
                id: true, name: true, slug: true,
                stories: { select: { viewCount: true } },
              },
            }).catch(() => []),
          ]);

          // ─── PageView analytics (gracefully degrade if table not migrated) ──
          let pvMetrics: any = null;
          try {
            const pvRange = { createdAt: { gte: start, lte: end } };

            const [
              totalPageViews,
              uniqueVisitors,
              returningReaders,
              trafficSources,
              countries,
              statesGeo,
              devices,
              browsers,
              avgScrollDepth,
              avgReadingTime,
              completionCount,
              liveVisitors,
              topStoryViews,
            ] = await Promise.all([
              // Total page views in period
              db.pageView.count({ where: pvRange }),
              // Unique visitors (distinct sessionIds)
              db.pageView.findMany({
                where: pvRange,
                select: { sessionId: true },
                distinct: ["sessionId"],
              }).then((r: any[]) => r.length),
              // Returning readers
              db.pageView.count({ where: { ...pvRange, isReturn: true } }),
              // Traffic source breakdown
              db.pageView.groupBy({
                by: ["trafficSource"],
                where: pvRange,
                _count: { trafficSource: true },
                orderBy: { _count: { trafficSource: "desc" } },
              }),
              // Geographic countries
              db.pageView.groupBy({
                by: ["country"],
                where: { ...pvRange, country: { not: null } },
                _count: { country: true },
                orderBy: { _count: { country: "desc" } },
                take: 10,
              }),
              // Geographic states
              db.pageView.groupBy({
                by: ["state"],
                where: { ...pvRange, state: { not: null } },
                _count: { state: true },
                orderBy: { _count: { state: "desc" } },
                take: 15,
              }),
              // Device breakdown
              db.pageView.groupBy({
                by: ["deviceType"],
                where: pvRange,
                _count: { deviceType: true },
              }),
              // Browser breakdown
              db.pageView.groupBy({
                by: ["browser"],
                where: pvRange,
                _count: { browser: true },
                orderBy: { _count: { browser: "desc" } },
              }),
              // Average scroll depth
              db.pageView.aggregate({
                where: pvRange,
                _avg: { scrollDepth: true },
              }),
              // Average reading time (seconds)
              db.pageView.aggregate({
                where: pvRange,
                _avg: { readingTime: true },
              }),
              // Completion count
              db.pageView.count({ where: { ...pvRange, completed: true } }),
              // Live visitors in last 5 minutes
              db.pageView.count({
                where: { createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) } },
              }),
              // Top story page views in period
              db.pageView.groupBy({
                by: ["storyId"],
                where: { ...pvRange, storyId: { not: null } },
                _count: { storyId: true },
                orderBy: { _count: { storyId: "desc" } },
                take: 10,
              }),
            ]);

            const completionRate = totalPageViews > 0
              ? Math.round((completionCount / totalPageViews) * 100)
              : 0;

            const avgSession = Math.round(avgReadingTime._avg?.readingTime ?? 0);
            const avgScroll = Math.round(avgScrollDepth._avg?.scrollDepth ?? 0);

            pvMetrics = {
              totalPageViews,
              uniqueVisitors,
              returningReaders,
              newVisitors: uniqueVisitors - returningReaders,
              completionRate,
              avgSession,
              avgScrollDepth: avgScroll,
              liveVisitors,
              trafficSources: (trafficSources as any[]).map((t) => ({
                source: t.trafficSource || "direct",
                count: t._count.trafficSource,
              })),
              countries: (countries as any[]).map((c) => ({
                name: c.country,
                count: c._count.country,
              })),
              states: (statesGeo as any[]).map((s) => ({
                name: s.state,
                count: s._count.state,
              })),
              devices: (devices as any[]).map((d) => ({
                type: d.deviceType || "unknown",
                count: d._count.deviceType,
              })),
              browsers: (browsers as any[]).map((b) => ({
                name: b.browser || "unknown",
                count: b._count.browser,
              })),
              topStoryIds: (topStoryViews as any[]).map((t) => ({
                storyId: t.storyId,
                pvCount: t._count.storyId,
              })),
            };
          } catch (pvErr: any) {
            // PageView table not yet migrated — return null metrics
            pvMetrics = null;
          }

          // ─── Time-series bucket queries ────────────────────────────────────
          let timeSeries: any[] = [];
          try {
            const bucketResults = await Promise.allSettled(
              buckets.map((b) =>
                Promise.all([
                  db.pageView.count({ where: { createdAt: { gte: b.start, lte: b.end } } }),
                  db.pageView.findMany({
                    where: { createdAt: { gte: b.start, lte: b.end } },
                    select: { sessionId: true },
                    distinct: ["sessionId"],
                  }).then((r: any[]) => r.length),
                  prisma.story.count({ where: { createdAt: { gte: b.start, lte: b.end }, status: "Published" } }),
                ])
              )
            );

            timeSeries = buckets.map((b, i) => {
              const r = bucketResults[i];
              const [views, uniq, stories] = r.status === "fulfilled" ? r.value : [0, 0, 0];
              return { name: b.name, views, visitors: uniq, stories };
            });
          } catch {
            timeSeries = buckets.map((b) => ({ name: b.name, views: 0, visitors: 0, stories: 0 }));
          }

          // ─── Map results ──────────────────────────────────────────────────
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
          const totalThemes = getValue(results[12], 0);
          const totalStates = getValue(results[13], 0);
          const topStoriesRaw = getValue(results[14], []);
          const topAuthorsRaw = getValue(results[15], []);
          const trendingStatesRaw = getValue(results[16], []);
          const recentStories = getValue(results[17], []);
          const recentComments = getValue(results[18], []);
          const recentLikes = getValue(results[19], []);
          const recentSubmissions = getValue(results[20], []);
          const flaggedCommentsCount = getValue(results[21], 0);
          const viewsResult: any = getValue(results[22], { _sum: { viewCount: 0 } });
          const totalViews = viewsResult._sum?.viewCount ?? 0;
          const timeResult: any = getValue(results[23], { _sum: { totalReadingTime: 0 } });
          const totalReadingTime = timeResult._sum?.totalReadingTime ?? 0;
          const topVideos = getValue(results[24], []);
          const themesRaw = getValue(results[25], []);

          // Process top authors
          const topAuthors = (topAuthorsRaw as any[])
            .map((a) => ({
              id: a.id,
              name: a.name,
              avatar: a.avatar,
              viewCount: a.stories.reduce((acc: number, s: any) => acc + (s.viewCount || 0), 0),
              storiesCount: a.stories.length,
            }))
            .sort((a, b) => b.viewCount - a.viewCount);

          // Process themes analytics
          const topThemes = (themesRaw as any[])
            .map((t) => ({
              id: t.id,
              name: t.name,
              slug: t.slug,
              viewCount: t.stories.reduce((acc: number, s: any) => acc + (s.viewCount || 0), 0),
              storiesCount: t.stories.length,
            }))
            .sort((a, b) => b.viewCount - a.viewCount);

          // Process trending states
          const trendingStates = (trendingStatesRaw as any[])
            .map((s) => ({
              name: s.name,
              viewCount: s.stories.reduce((acc: number, st: any) => acc + (st.viewCount || 0), 0),
              storiesCount: s.stories.length,
            }))
            .sort((a, b) => b.viewCount - a.viewCount);

          // Build activity stream
          const activities = [
            ...(recentStories as any[]).map((s) => ({
              type: "story",
              title: `New story: "${s.title}"`,
              time: s.createdAt.toISOString(),
              meta: s.status,
            })),
            ...(recentComments as any[]).map((c) => ({
              type: "comment",
              title: `${c.user?.name || "Reader"} commented on "${c.story?.title}"`,
              time: c.createdAt.toISOString(),
              meta: "Comment",
            })),
            ...(recentLikes as any[]).map((l) => ({
              type: "like",
              title: `${l.user?.name || "Reader"} liked "${l.story?.title}"`,
              time: l.createdAt.toISOString(),
              meta: "Like",
            })),
            ...(recentSubmissions as any[]).map((sb) => ({
              type: "submission",
              title: `${sb.user?.name || "Contributor"} submitted "${sb.title}"`,
              time: sb.createdAt.toISOString(),
              meta: "Submission",
            })),
          ]
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
            .slice(0, 12);

          return json({
            // Content metrics
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
            totalAuthors,
            totalThemes,
            totalStates,
            flaggedCommentsCount,
            // Top content
            topStories: topStoriesRaw,
            topAuthors,
            topThemes,
            topVideos,
            trendingStates,
            // Activity
            activities,
            // Time series charts
            timeSeries,
            period,
            // PageView analytics (null if table not migrated yet)
            pageViewMetrics: pvMetrics,
            notifications: { pendingSubmissions, flaggedCommentsCount },
          });
        } catch (e: any) {
          console.error("[Analytics API] Error:", e?.message);
          return json({ error: e.message || "Failed to load analytics" }, { status: 500 });
        }
      },
    },
  },
});
