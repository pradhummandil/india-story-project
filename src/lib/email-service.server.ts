import { prisma } from "@/lib/repositories/prisma.server";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "India Story Project <onboarding@resend.dev>";
const APP_URL = process.env.APP_URL || "https://india-story-project.vercel.app";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "indiastoryprojectmanager21@gmail.com";

const db = prisma as any;

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn(
      "[Email Service] RESEND_API_KEY not configured. Logging email dispatch locally:",
    );
    console.log(`To: ${to}\nSubject: ${subject}\nContent length: ${html.length} chars`);
    return true;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[Email Service] Resend API error details:", errorText);
      return false;
    }

    const data = await res.json();
    return !!data.id;
  } catch (error) {
    console.error("[Email Service] Exception sending email:", error);
    return false;
  }
}

// ─── Base Email Template Wrapper ─────────────────────────────────────────────
export function wrapHtmlTemplate(title: string, bodyContent: string, unsubscribeToken?: string): string {
  const unsubUrl = `${APP_URL}/api/newsletter/unsubscribe?token=${unsubscribeToken || "default"}`;
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #0c0c0c;
            color: #e5e5e5;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
          }
          .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #0c0c0c;
            padding: 40px 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #121212;
            border: 1px solid #222222;
            border-radius: 8px;
            overflow: hidden;
            border-top: 4px solid #8b0000;
          }
          .header {
            padding: 30px 40px;
            text-align: center;
            border-bottom: 1px solid #1f1f1f;
          }
          .logo {
            font-size: 22px;
            font-weight: bold;
            color: #d4af37;
            text-decoration: none;
            letter-spacing: 0.15em;
            text-transform: uppercase;
          }
          .content {
            padding: 40px;
            line-height: 1.6;
            font-size: 15px;
            color: #cccccc;
          }
          .content h1 {
            color: #ffffff;
            font-size: 22px;
            margin-top: 0;
            margin-bottom: 20px;
          }
          .button-container {
            margin: 30px 0;
            text-align: center;
          }
          .button {
            display: inline-block;
            background-color: #8b0000;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 28px;
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            border-radius: 4px;
            transition: background-color 0.2s;
          }
          .footer {
            padding: 30px 40px;
            background-color: #0d0d0d;
            border-top: 1px solid #1f1f1f;
            text-align: center;
            font-size: 12px;
            color: #666666;
          }
          .footer a {
            color: #d4af37;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <a href="${APP_URL}" class="logo">India Story Project</a>
            </div>
            <div class="content">
              ${bodyContent}
            </div>
            <div class="footer">
              <p>You received this email because you are subscribed to India Story Project.</p>
              <p>&copy; ${new Date().getFullYear()} India Story Project. All rights reserved.</p>
              <p><a href="${unsubUrl}">Unsubscribe</a> | Support: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

// ─── Queue Management & Retry System ─────────────────────────────────────────

export async function queueEmail(params: {
  recipientEmail: string;
  subject: string;
  bodyHtml: string;
  type?: string;
  scheduledFor?: Date;
}) {
  try {
    return await db.newsletterQueue.create({
      data: {
        recipientEmail: params.recipientEmail,
        subject: params.subject,
        bodyHtml: params.bodyHtml,
        type: params.type || "digest",
        status: "pending",
        scheduledFor: params.scheduledFor || new Date(),
      },
    });
  } catch (err) {
    console.error("[Email Queue] Error queuing email:", err);
    return null;
  }
}

export async function processEmailQueue(batchSize = 25) {
  try {
    const pendingItems = await db.newsletterQueue.findMany({
      where: {
        status: "pending",
        scheduledFor: { lte: new Date() },
        attempts: { lt: 3 },
      },
      take: batchSize,
      orderBy: { createdAt: "asc" },
    });

    let sentCount = 0;
    let failedCount = 0;

    for (const item of pendingItems) {
      const success = await sendEmail({
        to: item.recipientEmail,
        subject: item.subject,
        html: item.bodyHtml,
      });

      if (success) {
        sentCount++;
        await db.newsletterQueue.update({
          where: { id: item.id },
          data: {
            status: "sent",
            sentAt: new Date(),
          },
        });
      } else {
        failedCount++;
        const nextAttempts = item.attempts + 1;
        await db.newsletterQueue.update({
          where: { id: item.id },
          data: {
            attempts: nextAttempts,
            status: nextAttempts >= 3 ? "failed" : "pending",
            lastError: "Delivery failed via transport",
          },
        });
      }
    }

    return { processed: pendingItems.length, sentCount, failedCount };
  } catch (err) {
    console.error("[Email Queue] Error processing queue:", err);
    return { processed: 0, sentCount: 0, failedCount: 0 };
  }
}

export async function retryFailedEmails() {
  try {
    await db.newsletterQueue.updateMany({
      where: { status: "failed" },
      data: {
        status: "pending",
        attempts: 0,
        lastError: null,
      },
    });
    return await processEmailQueue(50);
  } catch (err) {
    console.error("[Email Queue] Error retrying failed emails:", err);
    return { processed: 0, sentCount: 0, failedCount: 0 };
  }
}

// ─── Email Dispatchers ────────────────────────────────────────────────────────

export async function sendWelcomeEmail(toEmail: string, name = "Reader"): Promise<boolean> {
  const subject = "Welcome to India Story Project";
  const html = wrapHtmlTemplate(
    subject,
    `
    <h1>Namaste ${name},</h1>
    <p>Welcome to India Story Project, a slow journalism platform celebrating the heritage, grassroots voices, and unsung heroes of India.</p>
    <p>We are thrilled to have you join our community.</p>
    <div class="button-container">
      <a href="${APP_URL}/explore" class="button">Explore Portal</a>
    </div>
    `,
  );
  await queueEmail({ recipientEmail: toEmail, subject, bodyHtml: html, type: "welcome" });
  return sendEmail({ to: toEmail, subject, html });
}

export async function sendVerificationEmail(toEmail: string, token: string, language = "en"): Promise<boolean> {
  const isHi = language === "hi";
  const subject = isHi ? "अपना ईमेल सत्यापित करें" : "Verify Your Email";
  const link = `${APP_URL}/api/newsletter/verify?token=${token}`;
  const html = wrapHtmlTemplate(
    subject,
    `
    <h1>${isHi ? "नमस्ते," : "Hello,"}</h1>
    <p>${isHi ? "ईमेल सत्यापित करने के लिए बटन दबाएं:" : "Please verify your email address by clicking below:"}</p>
    <div class="button-container">
      <a href="${link}" class="button">${isHi ? "ईमेल सत्यापित करें" : "Verify Email"}</a>
    </div>
    `,
  );
  await queueEmail({ recipientEmail: toEmail, subject, bodyHtml: html, type: "verification" });
  return sendEmail({ to: toEmail, subject, html });
}

export async function sendNewsletterEmail(
  toEmail: string,
  stories: Array<{ title: string; excerpt: string; slug: string; image?: string }>,
  language = "en",
  digestType = "daily"
): Promise<boolean> {
  const isHi = language === "hi";
  const subject = digestType === "weekly"
    ? (isHi ? "साप्ताहिक मुख्य आकर्षण" : "Weekly Digest — India Story Project")
    : (isHi ? "आज की मुख्य कहानियाँ" : "Daily Highlights — India Story Project");

  let storiesHtml = "";
  for (const s of stories) {
    storiesHtml += `
      <div style="margin-bottom: 30px; border-bottom: 1px solid #1f1f1f; padding-bottom: 25px;">
        ${s.image ? `<img src="${s.image}" style="width: 100%; max-height: 240px; object-fit: cover; border-radius: 4px; margin-bottom: 15px;" />` : ""}
        <h2 style="font-size: 18px; margin: 0 0 10px 0; color: #ffffff;">${s.title}</h2>
        <p style="font-size: 14px; color: #aaaaaa; margin: 0 0 15px 0; line-height: 1.5;">${s.excerpt}</p>
        <a href="${APP_URL}/stories/${s.slug}" style="font-size: 13px; color: #d4af37; font-weight: bold; text-decoration: none; text-transform: uppercase; letter-spacing: 0.05em;">Read Story &rarr;</a>
      </div>
    `;
  }

  const html = wrapHtmlTemplate(
    subject,
    `
    <h1>${isHi ? "नमस्ते, यहाँ ताज़ा कहानियाँ हैं:" : `Namaste, here is your ${digestType} editorial digest:`}</h1>
    <div style="margin-top: 30px;">
      ${storiesHtml}
    </div>
    `,
  );

  await queueEmail({ recipientEmail: toEmail, subject, bodyHtml: html, type: digestType });
  return sendEmail({ to: toEmail, subject, html });
}

export async function sendContactMessageEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  ipAddress?: string;
  userAgent?: string;
  country?: string;
}): Promise<boolean> {
  const mailSubject = `New Contact Form: ${data.subject}`;
  const html = wrapHtmlTemplate(
    mailSubject,
    `
    <h1>New Contact Form Submission</h1>
    <p><strong>Name:</strong> ${data.name}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Subject:</strong> ${data.subject}</p>
    <p><strong>Message:</strong><br/>${data.message.replace(/\n/g, "<br/>")}</p>
    `
  );
  return sendEmail({ to: SUPPORT_EMAIL, subject: mailSubject, html });
}

export async function sendSubmissionReceiptEmail(
  toEmail: string,
  authorName: string,
  storyTitle: string,
): Promise<boolean> {
  const subject = "We received your story ❤️";
  const html = wrapHtmlTemplate(
    subject,
    `
    <h1>Namaste ${authorName},</h1>
    <p>Thank you for sharing your story <strong>"${storyTitle}"</strong> with us! We have received it successfully.</p>
    `
  );
  return sendEmail({ to: toEmail, subject, html });
}

export async function sendSubmissionRejectionEmail(
  toEmail: string,
  authorName: string,
  storyTitle: string,
): Promise<boolean> {
  const subject = "Update about your submitted story";
  const html = wrapHtmlTemplate(
    subject,
    `
    <h1>Namaste ${authorName},</h1>
    <p>Thank you for submitting your story <strong>"${storyTitle}"</strong>. Unfortunately, it was not approved for publication this time.</p>
    `
  );
  return sendEmail({ to: toEmail, subject, html });
}

export async function sendSubmissionApprovedEmail(
  toEmail: string,
  authorName: string,
  storyTitle: string,
): Promise<boolean> {
  const subject = "🎉 Great news! Your story has been approved.";
  const html = wrapHtmlTemplate(
    subject,
    `
    <h1>Namaste ${authorName},</h1>
    <p>Congratulations! Your story submission <strong>"${storyTitle}"</strong> has been approved.</p>
    `
  );
  return sendEmail({ to: toEmail, subject, html });
}

export async function sendSubmissionPublishedEmail(
  toEmail: string,
  authorName: string,
  storyTitle: string,
  storySlug: string,
): Promise<boolean> {
  const subject = "🚀 Your story is now live on India Story Project!";
  const link = `${APP_URL}/stories/${storySlug}`;
  const html = wrapHtmlTemplate(
    subject,
    `
    <h1>Namaste ${authorName},</h1>
    <p>Your story <strong>"${storyTitle}"</strong> is now live!</p>
    <div class="button-container"><a href="${link}" class="button">Read Live Story</a></div>
    `
  );
  return sendEmail({ to: toEmail, subject, html });
}
