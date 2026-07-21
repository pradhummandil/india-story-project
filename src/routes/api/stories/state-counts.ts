import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/stories/state-counts")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const states = await prisma.state.findMany({
            select: {
              name: true,
              _count: {
                select: {
                  stories: {
                    where: {
                      status: "Published",
                      deleted: false,
                    },
                  },
                },
              },
            },
          });

          const result: Record<string, number> = {};
          states.forEach((s) => {
            if (s._count.stories > 0) {
              result[s.name] = s._count.stories;
            }
          });

          return json(result);
        } catch (error) {
          console.error("Failed to fetch state counts:", error);
          return json({ error: "Failed to fetch state counts" }, { status: 500 });
        }
      },
    },
  },
});
