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

export const Route = createFileRoute("/api/reading-progress")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        const url = new URL(request.url);
        const storyId = url.searchParams.get("storyId");

        if (!storyId) {
          return json({ error: "storyId is required" }, { status: 400 });
        }

        try {
          const progress = await prisma.readingProgress.findFirst({
            where: { userId: user.id, storyId },
            select: {
              progressPercent: true,
              completed: true,
              lastReadAt: true,
            },
          });

          return json({ progress: progress ?? null });
        } catch (error: any) {
          console.error("[reading-progress] GET error:", error);
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
          const { storyId, progressPercent } = body as {
            storyId: string;
            progressPercent: number;
          };

          if (!storyId || progressPercent === undefined) {
            return json(
              { error: "storyId and progressPercent are required" },
              { status: 400 }
            );
          }

          const completed = progressPercent >= 95;

          const progress = await prisma.readingProgress.upsert({
            where: {
              // Use a compound unique key if defined, otherwise findFirst+update
              id: (
                await prisma.readingProgress.findFirst({
                  where: { userId: user.id, storyId },
                  select: { id: true },
                })
              )?.id ?? "new",
            },
            update: {
              progressPercent,
              completed,
              lastReadAt: new Date(),
            },
            create: {
              userId: user.id,
              storyId,
              progressPercent,
              completed,
              lastReadAt: new Date(),
            },
          });

          return json({ progress });
        } catch (error: any) {
          console.error("[reading-progress] POST error:", error);
          if (error?.code === "P2021" || error?.message?.includes("does not exist")) {
            return json({ error: "Profile system not yet migrated" }, { status: 503 });
          }
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
