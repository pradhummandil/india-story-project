import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";

const db = prisma as any;

export const Route = createFileRoute("/api/community/challenges/$id")({
  server: {
    handlers: {
      GET: async ({ request: _request, params }) => {
        const { id } = params as { id: string };
        try {
          const challenge = await db.storyChallenge.findUnique({
            where: { id },
            include: {
              entries: {
                orderBy: { votes: "desc" },
                include: {
                  user: { select: { name: true, avatarUrl: true } },
                },
              },
            },
          });

          if (!challenge) return json({ error: "Challenge not found" }, { status: 404 });

          const now = new Date();
          const timeRemaining = Math.max(0, challenge.endAt.getTime() - now.getTime());

          return json({
            challenge,
            entries: challenge.entries,
            timeRemaining,
          });
        } catch (e: any) {
          console.error("[community/challenges/$id] GET error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },

      POST: async ({ request, params }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        const { id } = params as { id: string };
        try {
          const challenge = await db.storyChallenge.findUnique({ where: { id } });
          if (!challenge) return json({ error: "Challenge not found" }, { status: 404 });

          const now = new Date();
          if (!challenge.isActive || now > challenge.endAt) {
            return json({ error: "Challenge is not active or has ended" }, { status: 400 });
          }
          if (now < challenge.startAt) {
            return json({ error: "Challenge has not started yet" }, { status: 400 });
          }

          const body = await request.json();
          const { storyId, storyTitle, storyUrl } = body ?? {};

          // Create entry (unique per user per challenge)
          const entry = await db.challengeEntry.create({
            data: {
              challengeId: id,
              userId: user.id,
              storyId: storyId ?? null,
              storyTitle: storyTitle?.trim() ?? null,
              storyUrl: storyUrl?.trim() ?? null,
            },
          });

          return json({ entry }, { status: 201 });
        } catch (e: any) {
          // Handle unique constraint violation
          if (e?.code === "P2002") {
            return json(
              { error: "You have already submitted an entry for this challenge" },
              { status: 409 },
            );
          }
          console.error("[community/challenges/$id] POST error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
