import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";

const db = prisma as any;

export const Route = createFileRoute("/api/community/groups/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { id } = params as { id: string };
        try {
          const group = await db.communityGroup.findUnique({
            where: { id },
            include: {
              members: {
                take: 20,
                orderBy: { joinedAt: "asc" },
                include: {
                  user: { select: { name: true, avatarUrl: true } },
                },
              },
              announcements: {
                where: { isActive: true },
                orderBy: { createdAt: "desc" },
                take: 10,
              },
            },
          });

          if (!group) return json({ error: "Group not found" }, { status: 404 });

          let isMember = false;
          let userRole: string | null = null;

          const user = await authenticate(request);
          if (user) {
            const membership = await db.groupMember.findFirst({
              where: { groupId: id, userId: user.id },
              select: { role: true },
            });
            isMember = !!membership;
            userRole = membership?.role ?? null;
          }

          return json({ group, isMember, userRole });
        } catch (e: any) {
          console.error("[community/groups/$id] GET error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },

      POST: async ({ request, params }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        const { id } = params as { id: string };
        try {
          const body = await request.json();
          const { action } = body ?? {};

          if (!["join", "leave"].includes(action)) {
            return json({ error: "action must be 'join' or 'leave'" }, { status: 400 });
          }

          const group = await db.communityGroup.findUnique({ where: { id } });
          if (!group) return json({ error: "Group not found" }, { status: 404 });

          const existing = await db.groupMember.findFirst({
            where: { groupId: id, userId: user.id },
          });

          if (action === "join") {
            if (existing) return json({ joined: true, message: "Already a member" });

            await db.groupMember.create({
              data: { groupId: id, userId: user.id, role: "member" },
            });
            await db.communityGroup.update({
              where: { id },
              data: { memberCount: { increment: 1 } },
            });
            return json({ joined: true });
          } else {
            // leave
            if (!existing) return json({ joined: false, message: "Not a member" });
            if (existing.role === "owner") {
              return json({ error: "Owner cannot leave the group" }, { status: 403 });
            }

            await db.groupMember.delete({ where: { id: existing.id } });
            await db.communityGroup.update({
              where: { id },
              data: { memberCount: { decrement: 1 } },
            });
            return json({ joined: false });
          }
        } catch (e: any) {
          console.error("[community/groups/$id] POST error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
