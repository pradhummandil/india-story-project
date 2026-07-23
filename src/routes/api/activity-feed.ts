import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";

export const Route = createFileRoute("/api/activity-feed")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const activitiesRaw = await prisma.activityLog.findMany({
            take: 15,
            orderBy: { createdAt: "desc" },
            include: {
              user: {
                select: { name: true, avatarUrl: true },
              },
            },
          });

          if (activitiesRaw.length === 0) {
            const defaultActivities = [
              { id: "act-1", action: "BOOKMARK", entityTitle: "The Living Root Bridges of Meghalaya", user: { name: "Ananya Sharma" }, createdAt: new Date() },
              { id: "act-2", action: "LIKE", entityTitle: "Solar Pioneers of Rajasthan", user: { name: "Rajesh Kumar" }, createdAt: new Date(Date.now() - 5 * 60 * 1000) },
              { id: "act-3", action: "COMMENT", entityTitle: "Flavors of Old Delhi Heritage Trail", user: { name: "Priya Nair" }, createdAt: new Date(Date.now() - 12 * 60 * 1000) },
              { id: "act-4", action: "READING", entityTitle: "Preserving Kanchipuram Weavers", user: { name: "Vikram Sengupta" }, createdAt: new Date(Date.now() - 25 * 60 * 1000) },
            ];
            return json({ success: true, activities: defaultActivities });
          }

          return json({ success: true, activities: activitiesRaw });
        } catch (err: any) {
          console.error("Activity feed API error:", err);
          return json({ error: "Failed to load activity feed" }, { status: 500 });
        }
      },
    },
  },
});
