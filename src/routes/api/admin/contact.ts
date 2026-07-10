import { createFileRoute } from "@tanstack/react-router";
import { json, verifyAdmin } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";
import { sendEmail } from "@/lib/email-service.server";

export const Route = createFileRoute("/api/admin/contact")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const admin = await verifyAdmin(request);
        if (!admin) return json({ error: "Unauthorized" }, { status: 401 });

        const url = new URL(request.url);
        const query = url.searchParams.get("query") || "";
        const status = url.searchParams.get("status") || "all";
        const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
        const pageSize = Math.max(1, parseInt(url.searchParams.get("pageSize") || "10", 10));

        const where: any = {};
        if (status !== "all") {
          where.status = status;
        }

        if (query) {
          where.OR = [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { subject: { contains: query, mode: "insensitive" } },
            { message: { contains: query, mode: "insensitive" } },
          ];
        }

        try {
          const [messages, total] = await Promise.all([
            prisma.contactMessage.findMany({
              where,
              orderBy: { createdAt: "desc" },
              skip: (page - 1) * pageSize,
              take: pageSize,
            }),
            prisma.contactMessage.count({ where }),
          ]);

          return json({
            messages,
            total,
            page,
            pageSize,
            pageCount: Math.ceil(total / pageSize),
          });
        } catch (error: any) {
          console.error("[Admin Contact API] GET error:", error);
          return json({ error: "Internal Server Error" }, { status: 500 });
        }
      },

      PUT: async ({ request }) => {
        const admin = await verifyAdmin(request);
        if (!admin) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const body = await request.json();
          const { id, status, replyContent } = body;

          if (!id) {
            return json({ error: "Missing message ID" }, { status: 400 });
          }

          const existingMessage = await prisma.contactMessage.findUnique({
            where: { id },
          });

          if (!existingMessage) {
            return json({ error: "Message not found" }, { status: 444 });
          }

          const updateData: any = {};
          if (status) {
            updateData.status = status;
          }

          if (replyContent) {
            updateData.replyContent = replyContent;
            updateData.repliedAt = new Date();
            updateData.status = "read"; // Mark as read when replied

            // Send actual email reply to the user
            const emailSubject = `Re: ${existingMessage.subject}`;
            const emailHtml = `
              <div style="background-color: #0c0c0c; color: #e5e5e5; font-family: sans-serif; padding: 40px; line-height: 1.6;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #121212; border: 1px solid #222222; border-radius: 8px; overflow: hidden; border-top: 4px solid #8b0000; padding: 40px;">
                  <h1 style="color: #ffffff; font-size: 20px; margin-top: 0; margin-bottom: 20px;">Namaste ${existingMessage.name},</h1>
                  <p>Thank you for reaching out to India Story Project. Here is our response to your inquiry regarding <strong>"${existingMessage.subject}"</strong>:</p>
                  
                  <div style="background-color: #1a1a1a; padding: 20px; border-radius: 4px; border-left: 3px solid #d4af37; margin: 20px 0; color: #ffffff;">
                    ${replyContent.replace(/\n/g, "<br/>")}
                  </div>

                  <hr style="border: 0; border-top: 1px solid #1f1f1f; margin: 30px 0;" />
                  
                  <p style="font-size: 13px; color: #666666;">Your original message:</p>
                  <blockquote style="margin: 0; padding-left: 15px; border-left: 2px solid #333; font-style: italic; color: #888888;">
                    ${existingMessage.message.replace(/\n/g, "<br/>")}
                  </blockquote>
                  
                  <p style="margin-top: 30px; font-size: 14px; color: #d4af37;">India Story Project Team</p>
                </div>
              </div>
            `;

            await sendEmail({
              to: existingMessage.email,
              subject: emailSubject,
              html: emailHtml,
            });
          }

          const updated = await prisma.contactMessage.update({
            where: { id },
            data: updateData,
          });

          return json({ success: true, message: updated });
        } catch (error: any) {
          console.error("[Admin Contact API] PUT error:", error);
          return json({ error: "Internal Server Error" }, { status: 500 });
        }
      },

      DELETE: async ({ request }) => {
        const admin = await verifyAdmin(request);
        if (!admin) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const url = new URL(request.url);
          const id = url.searchParams.get("id");

          if (!id) {
            return json({ error: "Missing message ID" }, { status: 400 });
          }

          await prisma.contactMessage.delete({
            where: { id },
          });

          return json({ success: true });
        } catch (error: any) {
          console.error("[Admin Contact API] DELETE error:", error);
          return json({ error: "Internal Server Error" }, { status: 500 });
        }
      },
    },
  },
});
