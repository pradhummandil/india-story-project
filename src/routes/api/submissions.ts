import { createFileRoute } from "@tanstack/react-router";
import { json, authenticate } from "@/routes/api/-_utils";
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

        try {
          const body = await request.json();
          const {
            title,
            excerpt,
            content,
            titleHi,
            excerptHi,
            contentHi,
            categoryName,
            stateName,
            cityName,
            themeName,
            authorName,
            imageUrl,
            imageCaption,
          } = body;

          if (!title || !excerpt || !content || !categoryName || !stateName) {
            return json({ error: "Title, Excerpt, Content, Category, and State are required." }, { status: 400 });
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

          const submission = await prisma.submittedStory.create({
            data: {
              userId: user.id,
              title: title.trim(),
              excerpt: excerpt.trim(),
              content: content.trim(),
              titleHi: titleHi?.trim() || null,
              excerptHi: excerptHi?.trim() || null,
              contentHi: contentHi?.trim() || null,
              categoryName: categoryName.trim(),
              stateName: stateName.trim(),
              cityName: cityName?.trim() || null,
              themeName: themeName?.trim() || null,
              authorName: authorName?.trim() || userProfile.name || "Anonymous Contributor",
              imageUrl: imageUrl?.trim() || null,
              imageCaption: imageCaption?.trim() || null,
              status: "Pending",
            },
          });

          // Award +20 XP for story submission
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
          } catch {/* ignore stats updates */}

          return json({ success: true, submission });
        } catch (e: any) {
          console.error("[submissions] POST error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
