import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";
import { sendVerificationEmail } from "@/lib/email-service.server";
import { randomUUID } from "crypto";

export const Route = createFileRoute("/api/newsletter/subscribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { email, language = "en" } = body;

          if (!email || !email.includes("@")) {
            return json({ error: "Invalid email address" }, { status: 400 });
          }

          const existing = await prisma.newsletterSubscriber.findUnique({
            where: { email },
          });

          if (existing) {
            if (existing.verified) {
              return json({ success: true, message: "Already subscribed!" });
            }

            // Resend verification email
            const token = existing.verificationToken || randomUUID();
            await prisma.newsletterSubscriber.update({
              where: { email },
              data: { verificationToken: token, language },
            });

            void sendVerificationEmail(email, token, language).catch(err =>
              console.error("[Newsletter Subscribe API] Failed to resend verification email:", err)
            );

            return json({ success: true, message: "Verification link resent." });
          }

          const verificationToken = randomUUID();
          await prisma.newsletterSubscriber.create({
            data: {
              email,
              verified: false,
              language,
              status: "active",
              verificationToken,
            },
          });

          void sendVerificationEmail(email, verificationToken, language).catch(err =>
            console.error("[Newsletter Subscribe API] Failed to send verification email:", err)
          );

          return json({
            success: true,
            message: "Verification email sent. Please check your inbox.",
          });
        } catch (error: any) {
          console.error("[Newsletter Subscribe API] POST error:", error);
          return json({ error: "Internal Server Error" }, { status: 500 });
        }
      },
    },
  },
});
