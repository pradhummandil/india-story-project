import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";
import { sendNewsletterEmail } from "@/lib/email-service.server";

export const Route = createFileRoute("/api/newsletter/cron")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const authHeader = request.headers.get("Authorization");
          const expectedSecret = process.env.CRON_SECRET || "india-story-hub-cron-secret-2026";
          
          if (authHeader !== `Bearer ${expectedSecret}`) {
            return json({ error: "Unauthorized cron trigger" }, { status: 401 });
          }

          // Fetch stories published in the last 24 hours
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          const newStories = await prisma.story.findMany({
            where: {
              status: "Published",
              publishedAt: {
                gte: dayAgo,
              },
            },
            select: {
              title: true,
              excerpt: true,
              slug: true,
              images: {
                orderBy: { sortOrder: "asc" },
                take: 1,
                select: { imageUrl: true },
              },
            },
            take: 5,
          });

          if (newStories.length === 0) {
            return json({ success: true, message: "No new stories published in the last 24 hours. Skipping email dispatch." });
          }

          // Fetch all verified active newsletter subscribers
          const subscribers = await prisma.newsletterSubscriber.findMany({
            where: {
              verified: true,
              status: "active",
            },
          });

          if (subscribers.length === 0) {
            return json({ success: true, message: "No active subscribers found." });
          }

          const storiesForEmail = newStories.map(s => ({
            title: s.title,
            excerpt: s.excerpt,
            slug: s.slug,
            image: s.images?.[0]?.imageUrl || undefined,
          }));

          let sendCount = 0;
          for (const sub of subscribers) {
            try {
              const success = await sendNewsletterEmail(sub.email, storiesForEmail, sub.language);
              if (success) sendCount++;
            } catch (err) {
              console.error(`[Newsletter Cron] Failed sending to ${sub.email}:`, err);
            }
          }

          return json({
            success: true,
            message: `Newsletter dispatch complete.`,
            newStoriesCount: newStories.length,
            sentEmailsCount: sendCount,
            totalSubscribersCount: subscribers.length,
          });
        } catch (error: any) {
          console.error("[Newsletter Cron API] POST error:", error);
          return json({ error: "Internal Server Error" }, { status: 500 });
        }
      },
    },
  },
});
