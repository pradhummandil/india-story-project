import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";
import { sendWelcomeEmail } from "@/lib/email-service.server";

export const Route = createFileRoute("/api/newsletter/verify")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const token = url.searchParams.get("token");

          if (!token) {
            return json({ error: "Missing verification token" }, { status: 400 });
          }

          const subscriber = await prisma.newsletterSubscriber.findFirst({
            where: { verificationToken: token },
          });

          if (!subscriber) {
            return json({ error: "Invalid verification token" }, { status: 400 });
          }

          await prisma.newsletterSubscriber.update({
            where: { id: subscriber.id },
            data: {
              verified: true,
              verificationToken: null,
            },
          });

          // Send welcome email asynchronously
          void sendWelcomeEmail(subscriber.email, subscriber.email.split("@")[0]).catch(err =>
            console.error("[Newsletter Verify API] Welcome email send error:", err)
          );

          // Redirect to community page or verified success parameter page
          return new Response("", {
            status: 302,
            headers: {
              Location: "/share-story?verified=true",
            },
          });
        } catch (error: any) {
          console.error("[Newsletter Verify API] GET error:", error);
          return json({ error: "Internal Server Error" }, { status: 500 });
        }
      },
    },
  },
});
