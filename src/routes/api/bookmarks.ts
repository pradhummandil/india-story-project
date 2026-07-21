import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";
import { supabase } from "@/lib/supabase-client";

const FALLBACK_IMAGE = "/Logo-ISP.jpg";

async function authenticate(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.substring(7);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export const Route = createFileRoute("/api/bookmarks")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const bookmarks = await prisma.bookmark.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            include: {
              story: {
                include: {
                  author: true,
                  themes: {
                    include: {
                      theme: true,
                    },
                  },
                  state: true,
                  images: true,
                },
              },
            },
          });

          const stories = bookmarks.map((b) => {
            const s = b.story;
            const image =
              (s.images as any[])?.find((img) => img.type === "heroImage")?.url ?? FALLBACK_IMAGE;
            return {
              bookmarkId: b.id,
              bookmarkedAt: b.createdAt,
              id: s.id,
              slug: s.slug,
              title: s.title,
              excerpt: s.excerpt,
              titleHi: (s as any).titleHi ?? null,
              excerptHi: (s as any).excerptHi ?? null,
              themes: (s as any).themes?.map((t: any) => t.theme?.name).filter(Boolean) ?? [],
              state: (s as any).state?.name ?? null,
              author: (s as any).author?.name ?? null,
              readingTime: s.readingTime,
              viewCount: s.viewCount,
              image,
            };
          });

          return json({ stories });
        } catch (error: any) {
          console.error("[bookmarks] GET error:", error);
          // P2021 = table does not exist
          if (error?.code === "P2021" || error?.message?.includes("does not exist")) {
            return json({ error: "Profile system not yet migrated" }, { status: 503 });
          }
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },

      POST: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const body = await request.json();
          const { storyId } = body as { storyId: string };

          if (!storyId) {
            return json({ error: "storyId is required" }, { status: 400 });
          }

          // Check if bookmark already exists
          const existing = await prisma.bookmark.findFirst({
            where: { userId: user.id, storyId },
          });

          if (existing) {
            return json({ bookmark: existing, added: false });
          }

          const bookmark = await prisma.bookmark.create({
            data: { userId: user.id, storyId },
          });

          return json({ bookmark, added: true });
        } catch (error: any) {
          console.error("[bookmarks] POST error:", error);
          if (error?.code === "P2021" || error?.message?.includes("does not exist")) {
            return json({ error: "Profile system not yet migrated" }, { status: 503 });
          }
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },

      DELETE: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const body = await request.json();
          const { storyId } = body as { storyId: string };

          if (!storyId) {
            return json({ error: "storyId is required" }, { status: 400 });
          }

          await prisma.bookmark.deleteMany({
            where: { userId: user.id, storyId },
          });

          return json({ removed: true });
        } catch (error: any) {
          console.error("[bookmarks] DELETE error:", error);
          if (error?.code === "P2021" || error?.message?.includes("does not exist")) {
            return json({ error: "Profile system not yet migrated" }, { status: 503 });
          }
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
