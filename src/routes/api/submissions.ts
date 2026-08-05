import { createFileRoute } from "@tanstack/react-router";
import {
  json,
  authenticate,
  checkRateLimit,
  getClientIp,
  sanitizeInput,
} from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";
import { sendSubmissionReceiptEmail } from "@/lib/email-service.server";

export const Route = createFileRoute("/api/submissions")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const submissions = await prisma.submittedStory.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
          });

          return json({ submissions });
        } catch (e: any) {
          console.error("[submissions] GET error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },

      POST: async ({ request }) => {
        const user = await authenticate(request);
        const GUEST_USER_ID = "00000000-0000-0000-0000-000000000000";

        const ip = getClientIp(request);
        const { allowed } = checkRateLimit(ip, 5, 60 * 1000); // 5 submissions per minute limit
        if (!allowed) {
          return json(
            { error: "Too many submissions. Please wait a minute before trying again." },
            { status: 429 },
          );
        }

        try {
          const body = await request.json();
          const {
            id,
            title,
            excerpt,
            content,
            titleHi,
            excerptHi,
            contentHi,
            themes,
            stateName,
            cityName,
            authorName,
            imageUrl,
            imageCaption,
            heroName,
            district,
            language,
            email,
            galleryUrls,
            videoUrl,
            externalLinks,
            phone,
            tags,
            seoTitle,
            seoDescription,
            seoKeywords,
            status,
          } = body;

          if (!title) {
            return json({ error: "Title is required." }, { status: 400 });
          }

          if (status !== "Draft" && (!excerpt || !content || !themes || !stateName)) {
            return json(
              {
                error:
                  "Excerpt, Content, Themes, and State are required for non-draft submissions.",
              },
              { status: 400 },
            );
          }

          // Create UserProfile record if missing
          const targetUserId = user ? user.id : GUEST_USER_ID;
          let userProfile = await prisma.userProfile.findUnique({ where: { id: targetUserId } });
          if (!userProfile) {
            const existingProfile = user ? await prisma.profile.findUnique({
              where: { id: user.id },
            }) : null;
            userProfile = await prisma.userProfile.create({
              data: {
                id: targetUserId,
                email: email?.trim() || user?.email || "guest@indiastoryproject.org",
                name: authorName?.trim() || existingProfile?.fullName || user?.user_metadata?.name || user?.email?.split("@")[0] || "Guest Contributor",
                avatarUrl: existingProfile?.avatarUrl || user?.user_metadata?.avatar_url || null,
              },
            });
          }

          let submission;
          const dataPayload: any = {
            title: sanitizeInput(title),
            excerpt: sanitizeInput(excerpt || ""),
            content: sanitizeInput(content || ""),
            titleHi: titleHi ? sanitizeInput(titleHi) : null,
            excerptHi: excerptHi ? sanitizeInput(excerptHi) : null,
            contentHi: contentHi ? sanitizeInput(contentHi) : null,
            stateName: stateName?.trim() || "Delhi",
            cityName: cityName?.trim() || null,
            themes: themes?.trim() || null,
            authorName: authorName
              ? sanitizeInput(authorName)
              : userProfile.name || "Anonymous Contributor",
            imageUrl: imageUrl?.trim() || null,
            imageCaption: imageCaption ? sanitizeInput(imageCaption) : null,
            status: status === "Draft" ? "Draft" : "SUBMITTED",
            heroName: heroName ? sanitizeInput(heroName) : null,
            district: district?.trim() || null,
            language: language || "en",
            email: email?.trim() || null,
            galleryUrls: galleryUrls?.trim() || null,
            videoUrl: videoUrl?.trim() || null,
            externalLinks: externalLinks?.trim() || null,
            phone: phone?.trim() || null,
            tags: tags?.trim() || null,
            seoTitle: seoTitle ? sanitizeInput(seoTitle) : null,
            seoDescription: seoDescription ? sanitizeInput(seoDescription) : null,
            seoKeywords: seoKeywords?.trim() || null,
          };

          if (id) {
            const existingSub = await prisma.submittedStory.findUnique({
              where: { id },
              select: { status: true, userId: true },
            });
            if (!existingSub) {
              return json({ error: "Submission not found" }, { status: 404 });
            }
            if (existingSub.userId !== targetUserId) {
              return json({ error: "Unauthorized" }, { status: 403 });
            }
            if (existingSub.status !== "Draft") {
              return json({ error: "Only draft submissions can be edited." }, { status: 400 });
            }

            submission = await (prisma.submittedStory as any).update({
              where: { id, userId: targetUserId },
              data: dataPayload,
            });
          } else {
            submission = await (prisma.submittedStory as any).create({
              data: {
                userId: targetUserId,
                ...dataPayload,
              },
            });
          }

          if (status !== "Draft") {
            setTimeout(async () => {
              try {
                const staff = await prisma.profile.findMany({
                  where: {
                    role: { in: ["admin", "superadmin"] },
                  },
                  select: { id: true },
                });

                for (const member of staff) {
                  await prisma.notification.create({
                    data: {
                      recipientId: member.id,
                      senderId: targetUserId,
                      submissionId: submission.id,
                      type: "NEW_SUBMISSION",
                      title: "New Story Submission",
                      message: `New story "${submission.title}" submitted by ${dataPayload.authorName} from ${dataPayload.stateName}.`,
                      priority: "high",
                      actionUrl: `/admin/submissions?id=${submission.id}`,
                    },
                  });
                }

                await prisma.auditLog.create({
                  data: {
                    userId: targetUserId,
                    action: "USER_SUBMITTED",
                    details: JSON.stringify({
                      submissionId: submission.id,
                      title: submission.title,
                      authorName: dataPayload.authorName,
                      role: "Author",
                      timestamp: new Date().toISOString(),
                    }),
                  },
                });

                const emailAddress = dataPayload.email || user?.email;
                if (emailAddress) {
                  await sendSubmissionReceiptEmail(
                    emailAddress,
                    dataPayload.authorName || "Contributor",
                    submission.title,
                  );
                }
              } catch (err) {
                console.error("[Submissions Flow] Error in async notifications:", err);
              }
            }, 0);
          }

          // Award +20 XP only for authenticated non-draft submissions
          if (user && status !== "Draft") {
            try {
              await prisma.userStat.upsert({
                where: { userId: user.id },
                create: {
                  userId: user.id,
                  totalXP: 20,
                },
                update: {
                  totalXP: { increment: 20 },
                },
              });
              await prisma.userProfile.update({
                where: { id: user.id },
                data: {
                  totalXP: { increment: 20 },
                },
              });
            } catch {
              /* ignore stats updates */
            }
          }

          return json({ success: true, submission });
        } catch (e: any) {
          console.error("[submissions] POST error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
