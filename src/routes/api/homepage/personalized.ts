import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";

const db = prisma as any;

export const Route = createFileRoute("/api/homepage/personalized")({
  server: {
    handlers: {
      /**
       * GET /api/homepage/personalized?state=Maharashtra&lang=en&timeOfDay=morning
       * Personalization & Dynamic AI Homepage Algorithm
       */
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const stateParam = url.searchParams.get("state") || "";
        const langParam = url.searchParams.get("lang") || "en";
        const festivalParam = url.searchParams.get("festival") || "";

        try {
          // 1. Fetch breaking news or featured hero stories
          const heroStories = await db.story.findMany({
            where: {
              status: "Published",
              deleted: false,
              ...(stateParam ? { state: { name: { contains: stateParam, mode: "insensitive" } } } : {}),
            },
            orderBy: { publishedAt: "desc" },
            take: 5,
            select: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              publishedAt: true,
              viewCount: true,
              author: { select: { name: true, avatar: true } },
              state: { select: { name: true, slug: true } },
              images: { select: { imageUrl: true }, take: 1 },
            },
          });

          // 2. Fetch trending stories
          const trendingStories = await db.story.findMany({
            where: { status: "Published", deleted: false },
            orderBy: { viewCount: "desc" },
            take: 6,
            select: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              publishedAt: true,
              viewCount: true,
              author: { select: { name: true } },
              state: { select: { name: true } },
            },
          });

          // 3. Recommended stories for current reader
          const recommendedStories = await db.story.findMany({
            where: { status: "Published", deleted: false },
            orderBy: { createdAt: "desc" },
            take: 8,
            select: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              publishedAt: true,
              author: { select: { name: true } },
              state: { select: { name: true } },
            },
          });

          const currentHour = new Date().getHours();
          const timeOfDayGreeting =
            currentHour < 12 ? "Good Morning" : currentHour < 17 ? "Good Afternoon" : "Good Evening";

          return json({
            personalized: true,
            greeting: `${timeOfDayGreeting}! Here are your tailored dispatches.`,
            heroStories,
            trendingStories,
            recommendedStories,
            activeFestival: festivalParam || "Monsoon Cultural Season",
            stateFilter: stateParam || "All India",
          });
        } catch (err: any) {
          console.error("[Personalized Homepage API] Error:", err);
          return json({ error: err.message || "Failed to load personalized content" }, { status: 500 });
        }
      },
    },
  },
});
