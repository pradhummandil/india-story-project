import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";

export const Route = createFileRoute("/api/newsletter/unsubscribe")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const token = url.searchParams.get("token");
          const email = url.searchParams.get("email");

          if (!token && !email) {
            return json({ error: "Missing email or unsubscribe token" }, { status: 400 });
          }

          const subscriber = await prisma.newsletterSubscriber.findFirst({
            where: {
              OR: [
                ...(token ? [{ unsubscribeToken: token }] : []),
                ...(email ? [{ email }] : []),
              ],
            },
          });

          if (!subscriber) {
            return json({ error: "Subscriber not found" }, { status: 404 });
          }

          await prisma.newsletterSubscriber.update({
            where: { id: subscriber.id },
            data: {
              status: "unsubscribed",
            },
          });

          return new Response(
            `<!DOCTYPE html>
            <html>
              <head>
                <title>Unsubscribed — India Story Project</title>
                <style>
                  body { font-family: system-ui, sans-serif; background: #0c0c0c; color: #fff; display: flex; items: center; justify-content: center; min-height: 100vh; margin: 0; text-align: center; }
                  .card { background: #18181b; border: 1px solid #27272a; padding: 40px; border-radius: 12px; max-width: 440px; }
                  h1 { color: #d4af37; font-size: 24px; margin-bottom: 12px; }
                  p { color: #a1a1aa; font-size: 14px; line-height: 1.6; }
                  a { color: #d4af37; text-decoration: none; font-weight: bold; }
                </style>
              </head>
              <body>
                <div class="card">
                  <h1>Unsubscribed Successfully</h1>
                  <p>You will no longer receive daily or weekly newsletter digests from India Story Project for <strong>${subscriber.email}</strong>.</p>
                  <p><a href="/">Return to Home Page</a></p>
                </div>
              </body>
            </html>`,
            {
              headers: { "Content-Type": "text/html; charset=utf-8" },
            }
          );
        } catch (error: any) {
          console.error("[Newsletter Unsubscribe API] GET error:", error);
          return json({ error: "Internal Server Error" }, { status: 500 });
        }
      },
    },
  },
});
