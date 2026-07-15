import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";

const db = prisma as any;

export const Route = createFileRoute("/api/auth/export-history")({
  server: {
    handlers: {
      /**
       * GET /api/auth/export-history
       * Export reading logs, streaks, and bookmarks as a JSON attachment download
       */
      GET: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const userProfile = await db.userProfile.findUnique({
            where: { id: user.id },
            include: {
              bookmarks: { include: { story: { select: { title: true, slug: true } } } },
              likes: { include: { story: { select: { title: true, slug: true } } } },
              readingProgress: { include: { story: { select: { title: true, slug: true } } } },
              submissions: true,
              collections: {
                include: { stories: { include: { story: { select: { title: true } } } } },
              },
            },
          });

          if (!userProfile) return json({ error: "Profile not found" }, { status: 404 });

          const payload = {
            exportDate: new Date().toISOString(),
            profile: {
              email: userProfile.email,
              name: userProfile.name,
              bio: userProfile.bio,
              totalXP: userProfile.totalXP,
              level: userProfile.level,
              readingStreak: userProfile.readingStreak,
              totalReadingTime: userProfile.totalReadingTime,
              favoriteTheme: userProfile.favoriteTheme,
              favoriteState: userProfile.favoriteState,
              website: userProfile.website,
            },
            bookmarks: userProfile.bookmarks.map((b: any) => ({
              storyTitle: b.story?.title,
              storySlug: b.story?.slug,
              bookmarkedAt: b.createdAt.toISOString(),
            })),
            likes: userProfile.likes.map((l: any) => ({
              storyTitle: l.story?.title,
              storySlug: l.story?.slug,
              likedAt: l.createdAt.toISOString(),
            })),
            readingHistory: userProfile.readingProgress.map((rp: any) => ({
              storyTitle: rp.story?.title,
              storySlug: rp.story?.slug,
              progressPercent: rp.progressPercent,
              completed: rp.completed,
              lastReadAt: rp.lastReadAt.toISOString(),
            })),
            collections: userProfile.collections.map((c: any) => ({
              name: c.name,
              createdAt: c.createdAt.toISOString(),
              stories: c.stories.map((cs: any) => cs.story?.title).filter(Boolean),
            })),
            submissions: userProfile.submissions.map((s: any) => ({
              title: s.title,
              status: s.status,
              createdAt: s.createdAt.toISOString(),
            })),
          };

          // Return JSON content directly as a browser download attachment stream
          return new Response(JSON.stringify(payload, null, 2), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Content-Disposition": 'attachment; filename="india-story-reading-history.json"',
            },
          });
        } catch (e: any) {
          console.error("[Export History API] Error:", e);
          return json({ error: e.message || "Failed to generate history export" }, { status: 500 });
        }
      },
    },
  },
});
