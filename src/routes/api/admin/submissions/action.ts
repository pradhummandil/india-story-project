import { createFileRoute } from "@tanstack/react-router";
import { json, verifyAdmin } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";
import {
  sendSubmissionRejectionEmail,
  sendSubmissionApprovedEmail,
  sendSubmissionPublishedEmail
} from "@/lib/email-service.server";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const Route = createFileRoute("/api/admin/submissions/action")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const admin = await verifyAdmin(request);
        if (!admin) return json({ error: "Forbidden" }, { status: 403 });

        try {
          const body = await request.json();
          const {
            submissionId,
            action,
            adminNotes,
            editorId,
            featured = false,
            homepageSlideshow = false,
            slideshowOrder = 0,
          } = body;

          if (!submissionId || !action) {
            return json({ error: "submissionId and action are required" }, { status: 400 });
          }

          let finalAction = action;
          if (action === "Approve" || action === "Approved" || action === "Approve directly") {
            finalAction = "Published";
          } else if (action === "Assign" || action === "AssignToEditor" || action === "Assign to Editor") {
            finalAction = "FactChecking";
          }

          const VALID_ACTIONS = [
            "UnderReview",
            "FactChecking",
            "Published",
            "ChangesRequested",
            "Rejected",
          ];
          if (!VALID_ACTIONS.includes(finalAction)) {
            return json(
              { error: `Action must be one of: ${VALID_ACTIONS.join(", ")}` },
              { status: 400 },
            );
          }

          const submission = await prisma.submittedStory.findUnique({
            where: { id: submissionId },
            include: {
              user: true,
            },
          });

          if (!submission) {
            return json({ error: "Submission not found" }, { status: 404 });
          }

          // Update status in db
          const updatedSubmission = await prisma.submittedStory.update({
            where: { id: submissionId },
            data: {
              status: finalAction as any,
              adminNotes: adminNotes || null,
            },
          });

          // If published, create the published Story record
          if (finalAction === "Published") {
            // 1. Find or create Themes
            const submissionThemes = (submission.themes || "Heritage")
              .split(/[ ,+]+/)
              .map((t: string) => t.trim())
              .filter(Boolean);
            const themeIds: string[] = [];

            for (const themeName of submissionThemes) {
              let theme = await prisma.theme.findFirst({
                where: { name: { equals: themeName, mode: "insensitive" } },
              });
              if (!theme) {
                theme = await prisma.theme.create({
                  data: {
                    name: themeName,
                    slug: slugify(themeName),
                  },
                });
              }
              themeIds.push(theme.id);
            }

            // 2. Find or create State
            const stName = submission.stateName || "Delhi";
            let state = await prisma.state.findFirst({
              where: { name: { equals: stName, mode: "insensitive" } },
            });
            if (!state) {
              state = await prisma.state.create({
                data: {
                  name: stName,
                  slug: slugify(stName),
                },
              });
            }

            // 3. Find or create Author
            const autName = submission.authorName || submission.user?.name || "Contributor";
            let author = await prisma.author.findFirst({
              where: { name: { equals: autName, mode: "insensitive" } },
            });
            if (!author) {
              author = await prisma.author.create({
                data: {
                  name: autName,
                  bio: "ISP Guest Contributor.",
                },
              });
            }

            // 4. Generate unique slug
            const baseSlug = slugify(submission.title);
            let finalSlug = baseSlug;
            let count = 1;
            while (await prisma.story.findUnique({ where: { slug: finalSlug } })) {
              finalSlug = `${baseSlug}-${count}`;
              count++;
            }

            // 5. Create Story
            const story = await prisma.story.create({
              data: {
                title: submission.title,
                excerpt: submission.excerpt,
                content: submission.content,
                titleHi: submission.titleHi,
                excerptHi: submission.excerptHi,
                contentHi: submission.contentHi,
                slug: finalSlug,
                status: "Published",
                stateId: state.id,
                authorId: author.id,
                readingTime: Math.max(1, Math.ceil(submission.content.split(/\s+/).length / 200)),
                publishedAt: new Date(),
                featured,
                homepageSlideshow,
                slideshowOrder,
              },
            });

            // 5.1 Create many-to-many StoryTheme records
            for (const themeId of themeIds) {
              await prisma.storyTheme.create({
                data: {
                  storyId: story.id,
                  themeId: themeId,
                },
              });
            }

            // 7. Create StoryImage if url exists
            if (submission.imageUrl) {
              await prisma.storyImage.create({
                data: {
                  storyId: story.id,
                  imageUrl: submission.imageUrl,
                  caption: submission.imageCaption || null,
                  sortOrder: 0,
                  heroImage: true,
                },
              });
            }

            // 7.2 Create non-hero StoryImages for gallery URLs
            if (submission.galleryUrls) {
              try {
                const galleryUrls: string[] = JSON.parse(submission.galleryUrls);
                if (Array.isArray(galleryUrls)) {
                  for (let i = 0; i < galleryUrls.length; i++) {
                    await prisma.storyImage.create({
                      data: {
                        storyId: story.id,
                        imageUrl: galleryUrls[i],
                        caption: `Gallery Image ${i + 1}`,
                        sortOrder: i + 1,
                        heroImage: false,
                      },
                    });
                  }
                }
              } catch (parseErr) {
                console.error("[action] failed to parse galleryUrls:", parseErr);
              }
            }

            // Award +50 XP for publication to the submitting contributor!
            try {
              await prisma.userStat.upsert({
                where: { userId: submission.userId },
                create: {
                  userId: submission.userId,
                  totalXP: 50,
                  storiesRead: 0,
                },
                update: {
                  totalXP: { increment: 50 },
                },
              });
              await prisma.userProfile.update({
                where: { id: submission.userId },
                data: {
                  totalXP: { increment: 50 },
                },
              });
            } catch (statsErr) {
              console.error("[action] stats update error:", statsErr);
            }
          }

          // Trigger Workflow Emails & Notifications asynchronously
          const submitterEmail = submission.email || submission.user?.email;
          const authorName = submission.authorName || submission.user?.name || "Contributor";

          (async () => {
            try {
              if (finalAction === "Published" && submitterEmail) {
                const createdStory = await prisma.story.findFirst({
                  where: { title: submission.title },
                  orderBy: { createdAt: "desc" },
                });
                const slug = createdStory?.slug || submissionId;
                await sendSubmissionPublishedEmail(submitterEmail, authorName, submission.title, slug);
              } else if (finalAction === "Rejected" && submitterEmail) {
                await sendSubmissionRejectionEmail(submitterEmail, authorName, submission.title);
              } else if (finalAction === "FactChecking") {
                if (editorId) {
                  await prisma.auditLog.create({
                    data: {
                      userId: editorId,
                      action: "SUBMISSION_WORKFLOW_STATE",
                      details: JSON.stringify({
                        submissionId,
                        assignedEditorId: editorId,
                        assignedAt: new Date().toISOString(),
                      }),
                    },
                  });

                  await prisma.auditLog.create({
                    data: {
                      userId: editorId,
                      action: "WORKFLOW_NOTIFICATION",
                      details: JSON.stringify({
                        storyId: submissionId,
                        storyTitle: submission.title,
                        senderName: "Administrator",
                        message: `New story "${submission.title}" has been approved by Admin and assigned to you.`,
                        type: "story_assignment",
                        priority: "High",
                        read: false,
                      }),
                    },
                  });
                }

                if (submitterEmail) {
                  await sendSubmissionApprovedEmail(submitterEmail, authorName, submission.title);
                }
              }
            } catch (err) {
              console.error("[Submissions Action Flow] Error in async triggers:", err);
            }
          })();

          return json({ success: true, submission: updatedSubmission });
        } catch (e: any) {
          console.error("[admin/submissions/action] POST error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
