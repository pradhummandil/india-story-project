import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";
import { sendNewsletterEmail, processEmailQueue, queueEmail, wrapHtmlTemplate } from "@/lib/email-service.server";

const db = prisma as any;

export const Route = createFileRoute("/api/newsletter/cron")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const digestType = url.searchParams.get("type") || "daily";

        // Validate cron secret (supports Vercel Cron ?secret= param OR Authorization header)
        const secretParam = url.searchParams.get("secret");
        const authHeader = request.headers.get("Authorization");
        const expectedSecret = process.env.CRON_SECRET || "isp-cron-2025";
        const isVercelCron = request.headers.get("x-vercel-cron") === "1";

        if (!isVercelCron && secretParam !== expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
          return json({ error: "Unauthorized cron trigger" }, { status: 401 });
        }

        return triggerNewsletterDigest(digestType);
      },

      POST: async ({ request }) => {
        let body: any = {};
        try {
          body = await request.json();
        } catch {}

        const authHeader = request.headers.get("Authorization");
        const expectedSecret = process.env.CRON_SECRET || "india-story-hub-cron-secret-2026";

        if (authHeader && authHeader !== `Bearer ${expectedSecret}`) {
          return json({ error: "Unauthorized cron trigger" }, { status: 401 });
        }

        const digestType = body.type || "daily";
        const storyId = body.storyId;

        if (digestType === "breaking" && storyId) {
          return triggerBreakingNewsEmail(storyId);
        }

        return triggerNewsletterDigest(digestType);
      },
    },
  },
});

async function triggerNewsletterDigest(digestType: string) {
  try {
    const isWeekly = digestType === "weekly";
    const timeWindow = isWeekly ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const sinceDate = new Date(Date.now() - timeWindow);

    let stories = await db.story.findMany({
      where: {
        status: "Published",
        deleted: false,
        publishedAt: { gte: sinceDate },
      },
      orderBy: isWeekly ? { viewCount: "desc" } : { publishedAt: "desc" },
      take: 6,
      select: {
        id: true,
        title: true,
        excerpt: true,
        slug: true,
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
          select: { imageUrl: true },
        },
      },
    });

    if (stories.length === 0) {
      stories = await db.story.findMany({
        where: { status: "Published", deleted: false },
        orderBy: { publishedAt: "desc" },
        take: 4,
        select: {
          id: true,
          title: true,
          excerpt: true,
          slug: true,
          images: {
            take: 1,
            select: { imageUrl: true },
          },
        },
      });
    }

    const subscribers = await db.newsletterSubscriber.findMany({
      where: {
        status: "active",
      },
    });

    if (subscribers.length === 0) {
      return json({ success: true, message: "No active subscribers found." });
    }

    const storiesForEmail = stories.map((s: any) => ({
      title: s.title,
      excerpt: s.excerpt,
      slug: s.slug,
      image: s.images?.[0]?.imageUrl || undefined,
    }));

    let queuedCount = 0;
    for (const sub of subscribers) {
      try {
        await sendNewsletterEmail(sub.email, storiesForEmail, sub.language || "en", digestType);
        queuedCount++;
      } catch (err) {
        console.error(`[Newsletter Cron] Error queuing for ${sub.email}:`, err);
      }
    }

    const queueResult = await processEmailQueue(50);

    // Record sent digest into NewsletterDigest table
    const title = isWeekly ? "Weekly Digest" : "Daily Digest";
    await db.newsletterDigest.create({
      data: {
        type: digestType,
        title: `${title} — ${new Date().toLocaleDateString("en-IN")}`,
        contentHtml: `<p>Digest containing ${stories.length} stories dispatched to ${subscribers.length} subscribers.</p>`,
        subscriberCount: subscribers.length,
      },
    }).catch(() => {});

    return json({
      success: true,
      type: digestType,
      message: `${title} dispatch complete.`,
      storiesCount: stories.length,
      queuedCount,
      queueProcessed: queueResult,
      subscribersCount: subscribers.length,
    });
  } catch (error: any) {
    console.error("[Newsletter Cron] Error:", error);
    return json({ error: error.message || "Failed to trigger newsletter digest" }, { status: 500 });
  }
}

async function triggerBreakingNewsEmail(storyId: string) {
  try {
    const story = await db.story.findUnique({
      where: { id: storyId },
      select: {
        title: true,
        excerpt: true,
        slug: true,
        images: { take: 1, select: { imageUrl: true } },
      },
    });

    if (!story) {
      return json({ error: "Story not found" }, { status: 404 });
    }

    const subscribers = await db.newsletterSubscriber.findMany({
      where: { status: "active" },
    });

    const subject = `🚨 Breaking News: ${story.title}`;
    const html = wrapHtmlTemplate(
      subject,
      `
      <div style="border-left: 4px solid #d4af37; padding-left: 15px; margin-bottom: 20px;">
        <span style="color: #d4af37; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em;">Breaking Story</span>
        <h1 style="margin-top: 5px;">${story.title}</h1>
      </div>
      ${story.images?.[0]?.imageUrl ? `<img src="${story.images[0].imageUrl}" style="width: 100%; max-height: 280px; object-fit: cover; border-radius: 6px; margin-bottom: 20px;" />` : ""}
      <p style="font-size: 15px; line-height: 1.6; color: #dddddd;">${story.excerpt}</p>
      <div style="margin-top: 30px; text-align: center;">
        <a href="https://india-story-project.vercel.app/stories/${story.slug}" style="display: inline-block; background-color: #8b0000; color: #ffffff; text-decoration: none; padding: 12px 28px; font-weight: bold; text-transform: uppercase; border-radius: 4px;">Read Full Coverage &rarr;</a>
      </div>
      `
    );

    let queuedCount = 0;
    for (const sub of subscribers) {
      await queueEmail({
        recipientEmail: sub.email,
        subject,
        bodyHtml: html,
        type: "breaking",
      });
      queuedCount++;
    }

    const queueResult = await processEmailQueue(50);

    await db.newsletterDigest.create({
      data: {
        type: "breaking",
        title: subject,
        contentHtml: html,
        subscriberCount: subscribers.length,
      },
    }).catch(() => {});

    return json({
      success: true,
      message: "Breaking news dispatch complete.",
      queuedCount,
      queueProcessed: queueResult,
    });
  } catch (err: any) {
    console.error("Breaking news email error:", err);
    return json({ error: err.message || "Failed to dispatch breaking news" }, { status: 500 });
  }
}
