import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";
import { supabase } from "@/lib/supabase-client";

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

export const Route = createFileRoute("/api/likes")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const storyId = url.searchParams.get("storyId");

        if (!storyId) {
          return json({ error: "storyId is required" }, { status: 400 });
        }

        try {
          const count = await prisma.storyLike.count({ where: { storyId } });

          // Optionally check if current user liked it
          const user = await authenticate(request);
          let liked = false;

          if (user) {
            const existing = await prisma.storyLike.findFirst({
              where: { userId: user.id, storyId },
            });
            liked = !!existing;
          }

          return json({ liked, count });
        } catch (error: any) {
          console.error("[likes] GET error:", error);
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

          // Toggle: delete if exists, create if not
          const existing = await prisma.storyLike.findFirst({
            where: { userId: user.id, storyId },
          });

          if (existing) {
            await prisma.storyLike.delete({ where: { id: existing.id } });
          } else {
            await prisma.storyLike.create({
              data: { userId: user.id, storyId },
            });
          }

          const count = await prisma.storyLike.count({ where: { storyId } });
          const liked = !existing;

          return json({ liked, count });
        } catch (error: any) {
          console.error("[likes] POST error:", error);
          if (error?.code === "P2021" || error?.message?.includes("does not exist")) {
            return json({ error: "Profile system not yet migrated" }, { status: 503 });
          }
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
