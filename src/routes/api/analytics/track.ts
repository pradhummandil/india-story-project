import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";

const db = prisma as any;

/**
 * Detect traffic source from referrer URL string
 */
function detectTrafficSource(referrer: string | null | undefined): string {
  if (!referrer) return "direct";
  const r = referrer.toLowerCase();
  if (r.includes("google")) return "google";
  if (r.includes("facebook") || r.includes("fb.com")) return "facebook";
  if (r.includes("instagram")) return "instagram";
  if (r.includes("twitter") || r.includes("t.co") || r.includes("x.com")) return "twitter";
  if (r.includes("youtube")) return "youtube";
  if (r.includes("linkedin")) return "linkedin";
  if (r.includes("whatsapp")) return "whatsapp";
  if (r.includes("bing") || r.includes("duckduckgo") || r.includes("yahoo")) return "search";
  return "referral";
}

/**
 * Detect device type from user-agent string
 */
function detectDevice(ua: string | null | undefined): string {
  if (!ua) return "unknown";
  const u = ua.toLowerCase();
  if (/mobile|android|iphone|ipod/i.test(u)) return "mobile";
  if (/ipad|tablet/i.test(u)) return "tablet";
  return "desktop";
}

/**
 * Detect browser from user-agent string
 */
function detectBrowser(ua: string | null | undefined): string {
  if (!ua) return "unknown";
  if (/edg/i.test(ua)) return "edge";
  if (/chrome/i.test(ua) && !/chromium/i.test(ua)) return "chrome";
  if (/firefox/i.test(ua)) return "firefox";
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return "safari";
  if (/opr\//i.test(ua)) return "opera";
  return "other";
}

export const Route = createFileRoute("/api/analytics/track")({
  server: {
    handlers: {
      /**
       * POST /api/analytics/track
       * Ingest a single analytics event from the client-side beacon
       * Designed to be called fire-and-forget — always returns 204
       */
      POST: async ({ request }) => {
        try {
          let body: any = {};
          try {
            body = await request.json();
          } catch {
            return new Response(null, { status: 204 });
          }

          const {
            sessionId,
            userId,
            path,
            storyId,
            themeSlug,
            authorId,
            scrollDepth = 0,
            readingTime = 0,
            completed = false,
          } = body;

          if (!sessionId || !path) {
            return new Response(null, { status: 204 });
          }

          const userAgent = request.headers.get("user-agent");
          const referrer = body.referrer || request.headers.get("referer") || null;

          const trafficSource = detectTrafficSource(referrer);
          const deviceType = detectDevice(userAgent);
          const browser = detectBrowser(userAgent);

          // Check if this session has previously visited to determine returning status
          let isReturn = false;
          try {
            const prior = await db.pageView.count({
              where: { sessionId, createdAt: { lt: new Date(Date.now() - 30 * 60 * 1000) } },
            });
            isReturn = prior > 0;
          } catch {}

          // Upsert: if exact sessionId+path exists within last 30 mins, update scroll/time
          // Otherwise create a fresh row
          const recentCutoff = new Date(Date.now() - 30 * 60 * 1000);
          try {
            const existing = await db.pageView.findFirst({
              where: { sessionId, path, createdAt: { gte: recentCutoff } },
            });

            if (existing) {
              await db.pageView.update({
                where: { id: existing.id },
                data: {
                  scrollDepth: Math.max(existing.scrollDepth, scrollDepth),
                  readingTime: Math.max(existing.readingTime, readingTime),
                  completed: existing.completed || completed,
                },
              });
            } else {
              await db.pageView.create({
                data: {
                  sessionId,
                  userId: userId || null,
                  path,
                  storyId: storyId || null,
                  themeSlug: themeSlug || null,
                  authorId: authorId || null,
                  referrer,
                  trafficSource,
                  deviceType,
                  browser,
                  scrollDepth,
                  readingTime,
                  completed,
                  isReturn,
                  // Country/state/city would come from geo-IP in production
                  // For now capture from body if client sends it
                  country: body.country || null,
                  state: body.state || null,
                  city: body.city || null,
                },
              });
            }
          } catch (dbErr: any) {
            // If PageView table not yet migrated, fail silently
            if (dbErr?.code === "P2021" || dbErr?.message?.includes("does not exist")) {
              return new Response(null, { status: 204 });
            }
            console.error("[Analytics Track] DB error:", dbErr?.message);
          }

          return new Response(null, { status: 204 });
        } catch (e: any) {
          // Analytics tracking must never throw errors to the client
          console.error("[Analytics Track] Unexpected error:", e?.message);
          return new Response(null, { status: 204 });
        }
      },
    },
  },
});
