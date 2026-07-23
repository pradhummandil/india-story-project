import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";
import { StoryStatus } from "@prisma/client";
import { supabase } from "@/lib/supabase-client";

export const Route = createFileRoute("/api/authors")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const authHeader = request.headers.get("Authorization");
        let currentUserId: string | null = null;
        if (authHeader && authHeader.startsWith("Bearer ")) {
          const token = authHeader.substring(7);
          try {
            const {
              data: { user },
            } = await supabase.auth.getUser(token);
            if (user) currentUserId = user.id;
          } catch {}
        }

        try {
          const db = prisma as any;
          const [authors, follows] = await Promise.all([
            db.author.findMany({
              include: {
                stories: {
                  where: { status: StoryStatus.Published },
                  select: { id: true, viewCount: true },
                },
                videos: {
                  where: { status: StoryStatus.Published },
                  select: { id: true, viewCount: true },
                },
              },
              orderBy: { name: "asc" },
            }),
            currentUserId
              ? db.follow.findMany({
                  where: { followerId: currentUserId },
                })
              : Promise.resolve([]),
          ]);

          const userFollowedAuthorIds = (follows as any[]).map((f: any) => f.authorId).filter(Boolean);
          const followedThemes = (follows as any[]).map((f: any) => f.themeId).filter(Boolean);
          const followedStates = (follows as any[]).map((f: any) => f.stateName).filter(Boolean);

          const results = (authors as any[]).map((a: any) => {
            const storyCount = a.stories.length;
            const videoCount = a.videos.length;
            const totalViews =
              a.stories.reduce((acc: number, s: any) => acc + s.viewCount, 0) +
              a.videos.reduce((acc: number, v: any) => acc + v.viewCount, 0);

            return {
              id: a.id,
              name: a.name,
              bio: a.bio,
              avatar: a.avatar,
              storyCount,
              videoCount,
              totalViews,
              location: "India",
              joinedAt: a.createdAt.toISOString(),
              followed: userFollowedAuthorIds.includes(a.id),
            };
          });

          // Maintain backwards compatibility if client expects array directly
          if (request.headers.get("x-raw-array") === "true") {
            return json(results);
          }

          return json({
            authors: results,
            totalFollows: (follows as any[]).length,
            followedThemes,
            followedStates,
          });
        } catch (e: any) {
          return json({ error: e.message || "Failed to fetch authors list" }, { status: 500 });
        }
      },
    },
  },
});
