import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { supabase } from "@/lib/supabase-client";
import { json } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/audio-progress")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return json({ error: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.substring(7);
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser(token);
        if (error || !user) {
          return json({ error: "Unauthorized" }, { status: 401 });
        }

        const urlObj = new URL(request.url);
        const storyId = urlObj.searchParams.get("storyId");

        try {
          if (storyId) {
            const progress = await prisma.audioProgress.findFirst({
              where: { userId: user.id, storyId },
              orderBy: { updatedAt: "desc" },
            });
            return json({ progress });
          }

          // Return list of in-progress episodes (completed = false)
          const items = await prisma.audioProgress.findMany({
            where: { userId: user.id, completed: false },
            orderBy: { updatedAt: "desc" },
            take: 10,
            include: {
              story: {
                select: {
                  id: true,
                  slug: true,
                  title: true,
                  titleHi: true,
                  excerpt: true,
                  excerptHi: true,
                  readingTime: true,
                  author: { select: { name: true } },
                  images: {
                    where: { sortOrder: 0 },
                    take: 1,
                    select: { imageUrl: true },
                  },
                },
              },
            },
          });

          const formatted = items.map((item) => ({
            id: item.id,
            currentTime: item.currentTime,
            duration: item.duration,
            language: item.language,
            voiceId: item.voiceId,
            updatedAt: item.updatedAt,
            story: {
              id: item.story.id,
              slug: item.story.slug,
              title: item.story.title,
              titleHi: item.story.titleHi,
              excerpt: item.story.excerpt,
              excerptHi: item.story.excerptHi,
              authorName: item.story.author?.name || "India Story Project",
              imageUrl: item.story.images[0]?.imageUrl || "/Logo-ISP.jpg",
              duration: (item.story.readingTime || 5) * 60,
            },
          }));

          return json({ items: formatted });
        } catch (err) {
          console.error("Fetch audio progress error:", err);
          return json({ error: "Internal Server Error" }, { status: 500 });
        }
      },

      POST: async ({ request }) => {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return json({ error: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.substring(7);
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser(token);
        if (error || !user) {
          return json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
          const body = await request.json();
          const { storyId, currentTime, duration, language, voiceId } = body;

          if (!storyId) {
            return json({ error: "storyId is required" }, { status: 400 });
          }

          // Ensure story exists
          const storyExists = await prisma.story.findUnique({ where: { id: storyId } });
          if (!storyExists) {
            return json({ error: "Story not found" }, { status: 404 });
          }

          // Create UserProfile record if missing in local DB (to satisfy foreign key)
          const profile = await prisma.userProfile.findUnique({ where: { id: user.id } });
          if (!profile) {
            await prisma.userProfile.create({
              data: {
                id: user.id,
                email: user.email || "",
                name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Reader",
              },
            });
          }

          const completed = currentTime >= duration * 0.95;

          const progress = await prisma.audioProgress.upsert({
            where: {
              userId_storyId_language_voiceId: {
                userId: user.id,
                storyId,
                language: language || "en",
                voiceId: voiceId || "female",
              },
            },
            update: {
              currentTime: parseFloat(currentTime || 0),
              duration: parseFloat(duration || 0),
              completed,
            },
            create: {
              userId: user.id,
              storyId,
              language: language || "en",
              voiceId: voiceId || "female",
              currentTime: parseFloat(currentTime || 0),
              duration: parseFloat(duration || 0),
              completed,
            },
          });

          return json({ success: true, progress });
        } catch (err) {
          console.error("Save audio progress error:", err);
          return json({ error: "Internal Server Error" }, { status: 500 });
        }
      },
    },
  },
});
