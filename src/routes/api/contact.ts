import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";
import { sendContactMessageEmail } from "@/lib/email-service.server";

export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { name, email, subject, message } = body;

          if (!name || !email || !subject || !message) {
            return json({ error: "Missing required fields" }, { status: 400 });
          }

          // Extract request metadata
          const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("cf-connecting-ip") || null;
          const userAgent = request.headers.get("user-agent") || null;
          const country = request.headers.get("cf-ipcountry") || null;

          // Save to database
          const contact = await prisma.contactMessage.create({
            data: {
              name,
              email,
              subject,
              message,
              ipAddress,
              userAgent,
              country,
              status: "unread",
            },
          });

          // Trigger email notification to admin inbox asynchronously
          void sendContactMessageEmail({
            name,
            email,
            subject,
            message,
            ipAddress: ipAddress ?? undefined,
            userAgent: userAgent ?? undefined,
            country: country ?? undefined,
          }).catch(err => console.error("[Contact API] Failed to send email alert:", err));

          return json({ success: true, messageId: contact.id });
        } catch (error: any) {
          console.error("[Contact API] POST error:", error);
          return json({ error: "Internal Server Error" }, { status: 500 });
        }
      },
    },
  },
});
