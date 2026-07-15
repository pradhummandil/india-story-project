import { prisma } from "@/lib/repositories/prisma.server";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "India Story Project <onboarding@resend.dev>";
const APP_URL = process.env.APP_URL || "https://india-story-project.vercel.app";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "indiastoryprojectmanager21@gmail.com";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn(
      "[Email Service] RESEND_API_KEY not configured. Skipping email sending. Logged content:",
    );
    console.log(`To: ${to}\nSubject: ${subject}\nContent length: ${html.length} chars`);
    return false;
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
function wrapHtmlTemplate(title: string, bodyContent: string): string {
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
            border-top: 4px solid #8b0000; /* Burgundy accent */
          }
          .header {
            padding: 30px 40px;
            text-align: center;
            border-bottom: 1px solid #1f1f1f;
          }
          .logo {
            font-size: 22px;
            font-weight: bold;
            color: #d4af37; /* Gold accent */
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
              <p>You received this email because you are registered with India Story Project.</p>
              <p>&copy; ${new Date().getFullYear()} India Story Project. All rights reserved.</p>
              <p>For support, contact <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

// ─── Transactional Emails templates ──────────────────────────────────────────

export async function sendWelcomeEmail(toEmail: string, name: string): Promise<boolean> {
  const subject = "Welcome to India Story Project";
  const html = wrapHtmlTemplate(
    subject,
    `
    <h1>Namaste ${name},</h1>
    <p>Welcome to India Story Project, a premium editorial hub celebrating the unsung heroes, cultural heritage, and inspirational stories of India.</p>
    <p>We are thrilled to have you join our community of passionate readers, writers, and explorers.</p>
    <p>Here is what you can do next:</p>
    <ul>
      <li>Discover stories by state and theme on the explore portal.</li>
      <li>Earn XP, complete daily reading streaks, and level up to unlock collector badges.</li>
      <li>Submit your own inspiring story about local heroes or history.</li>
    </ul>
    <div class="button-container">
      <a href="${APP_URL}/explore" class="button">Explore Portal</a>
    </div>
    `,
  );
  return sendEmail({ to: toEmail, subject, html });
}

export async function sendVerificationEmail(
  toEmail: string,
  token: string,
  language = "en",
): Promise<boolean> {
  const isHi = language === "hi";
  const subject = isHi ? "अपना ईमेल सत्यापित करें" : "Verify Your Email";
  const link = `${APP_URL}/api/newsletter/verify?token=${token}`;
  const html = wrapHtmlTemplate(
    subject,
    isHi
      ? `
      <h1>नमस्ते,</h1>
      <p>इंडिया स्टोरी प्रोजेक्ट से जुड़ने के लिए धन्यवाद। कृपया नीचे दिए गए लिंक पर क्लिक करके अपना ईमेल सत्यापित करें:</p>
      <div class="button-container">
        <a href="${link}" class="button">ईमेल सत्यापित करें</a>
      </div>
      <p>यदि बटन काम नहीं करता है, तो आप अपने ब्राउज़र में निम्न URL को कॉपी और पेस्ट कर सकते हैं:</p>
      <p style="word-break: break-all; font-size: 12px; color: #888888;">${link}</p>
      `
      : `
      <h1>Hello,</h1>
      <p>Thank you for signing up with India Story Project. Please verify your email address by clicking the button below:</p>
      <div class="button-container">
        <a href="${link}" class="button">Verify Email Address</a>
      </div>
      <p>If the button doesn't work, copy and paste the following URL into your browser:</p>
      <p style="word-break: break-all; font-size: 12px; color: #888888;">${link}</p>
      `,
  );
  return sendEmail({ to: toEmail, subject, html });
}

export async function sendPasswordResetEmail(toEmail: string, token: string): Promise<boolean> {
  const subject = "Reset Your Password";
  const link = `${APP_URL}/reset-password?token=${token}`;

  const html = wrapHtmlTemplate(
    subject,
    `
    <h1>Hello,</h1>
    <p>We received a request to reset the password for your India Story Project account. Click the button below to set a new password:</p>
    <div class="button-container">
      <a href="${link}" class="button">Reset Password</a>
    </div>
    <p>If you did not request a password reset, you can safely ignore this email.</p>
    <p style="word-break: break-all; font-size: 12px; color: #888888;">${link}</p>
    `,
  );
  return sendEmail({ to: toEmail, subject, html });
}

export async function sendStoryPublishedEmail(
  toEmail: string,
  storyTitle: string,
): Promise<boolean> {
  const subject = "Your Story is Live!";
  const html = wrapHtmlTemplate(
    subject,
    `
    <h1>Congratulations,</h1>
    <p>Your submitted story <strong>"${storyTitle}"</strong> has been approved and published on India Story Project!</p>
    <p>It is now live on our portal for readers worldwide to discover and learn from.</p>
    <div class="button-container">
      <a href="${APP_URL}/explore" class="button">View Portal</a>
    </div>
    `,
  );
  return sendEmail({ to: toEmail, subject, html });
}

export async function sendStoryApprovedEmail(
  toEmail: string,
  storyTitle: string,
): Promise<boolean> {
  const subject = "Your Story Submission Approved";
  const html = wrapHtmlTemplate(
    subject,
    `
    <h1> Namaste,</h1>
    <p>Good news! Your story submission <strong>"${storyTitle}"</strong> has been approved by our editorial panel.</p>
    <p>We will schedule its publication shortly. Thank you for contributing to documenting India's stories.</p>
    `,
  );
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
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #222222; font-weight: bold; width: 120px;">Name:</td>
        <td style="padding: 8px; border-bottom: 1px solid #222222;">${data.name}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #222222; font-weight: bold;">Email:</td>
        <td style="padding: 8px; border-bottom: 1px solid #222222;">${data.email}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #222222; font-weight: bold;">Subject:</td>
        <td style="padding: 8px; border-bottom: 1px solid #222222;">${data.subject}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #222222; font-weight: bold;">IP Address:</td>
        <td style="padding: 8px; border-bottom: 1px solid #222222;">${data.ipAddress ?? "Unknown"}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #222222; font-weight: bold;">Country:</td>
        <td style="padding: 8px; border-bottom: 1px solid #222222;">${data.country ?? "Unknown"}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #222222; font-weight: bold;">Submitted:</td>
        <td style="padding: 8px; border-bottom: 1px solid #222222;">${new Date().toLocaleString()}</td>
      </tr>
    </table>
    <div style="background-color: #1a1a1a; padding: 20px; border-radius: 4px; color: #dddddd; line-height: 1.6;">
      <strong>Message:</strong><br/>
      ${data.message.replace(/\n/g, "<br/>")}
    </div>
    `,
  );
  return sendEmail({ to: SUPPORT_EMAIL, subject: mailSubject, html });
}

export async function sendNewsletterEmail(
  toEmail: string,
  stories: Array<{ title: string; excerpt: string; slug: string; image?: string }>,
  language = "en",
): Promise<boolean> {
  const isHi = language === "hi";
  const subject = isHi ? "आज की मुख्य कहानियाँ" : "Today's Highlights — India Story Project";

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
    <h1>${isHi ? "नमस्ते, यहाँ आज की ताज़ा कहानियाँ हैं:" : "Namaste, here are today's top stories:"}</h1>
    <div style="margin-top: 30px;">
      ${storiesHtml}
    </div>
    <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #555555;">
      <a href="${APP_URL}/newsletter/unsubscribe?email=${encodeURIComponent(toEmail)}" style="color: #666666; text-decoration: underline;">Unsubscribe</a>
    </div>
    `,
  );

  return sendEmail({ to: toEmail, subject, html });
}
