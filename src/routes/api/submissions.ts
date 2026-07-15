import { createFileRoute } from "@tanstack/react-router";
import {
  json,
  authenticate,
  checkRateLimit,
  getClientIp,
  sanitizeInput,
} from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";

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
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

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
          let userProfile = await prisma.userProfile.findUnique({ where: { id: user.id } });
          if (!userProfile) {
            userProfile = await prisma.userProfile.create({
              data: {
                id: user.id,
                email: user.email ?? "",
                name: user.user_metadata?.name || user.email?.split("@")[0] || "Contributor",
                avatarUrl: user.user_metadata?.avatar_url || null,
              },
            });
          }

          let submission;
          const dataPayload = {
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
            status: status || "Pending",
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
            submission = await (prisma.submittedStory as any).update({
              where: { id, userId: user.id },
              data: dataPayload,
            });
          } else {
            submission = await (prisma.submittedStory as any).create({
              data: {
                userId: user.id,
                ...dataPayload,
              },
            });
          }

          // Award +20 XP only for non-draft submissions
          if (status !== "Draft") {
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
