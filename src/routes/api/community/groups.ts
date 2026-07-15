import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";

const db = prisma as any;

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export const Route = createFileRoute("/api/community/groups")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const sort = url.searchParams.get("sort") ?? "popular";
          const privacy = url.searchParams.get("privacy") ?? undefined;
          const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
          const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") ?? "20", 10)));

          const where: any = { isActive: true };
          if (privacy) where.privacy = privacy;

          const orderBy = sort === "new" ? { createdAt: "desc" } : { memberCount: "desc" };

          const [groups, total] = await Promise.all([
            db.communityGroup.findMany({
              where,
              orderBy,
              skip: (page - 1) * limit,
              take: limit,
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                privacy: true,
                memberCount: true,
                createdAt: true,
                coverImage: true,
              },
            }),
            db.communityGroup.count({ where }),
          ]);

          // Check membership for authenticated user
          const user = await authenticate(request);
          let groupsWithMembership = groups;
          if (user) {
            const memberRecords = await db.groupMember.findMany({
              where: {
                userId: user.id,
                groupId: { in: groups.map((g: any) => g.id) },
              },
              select: { groupId: true },
            });
            const memberSet = new Set(memberRecords.map((m: any) => m.groupId));
            groupsWithMembership = groups.map((g: any) => ({
              ...g,
              isMember: memberSet.has(g.id),
            }));
          }

          return json({ groups: groupsWithMembership, total });
        } catch (e: any) {
          console.error("[community/groups] GET error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },

      POST: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const body = await request.json();
          const { name, description, privacy } = body ?? {};

          if (!name || typeof name !== "string" || name.trim().length < 3 || name.trim().length > 100) {
            return json({ error: "Name must be between 3 and 100 characters" }, { status: 400 });
          }

          const slug = generateSlug(name.trim());

          const group = await db.communityGroup.create({
            data: {
              name: name.trim(),
              slug,
              description: description?.trim() ?? null,
              privacy: privacy ?? "public",
              createdBy: user.id,
              memberCount: 1,
            },
          });

          // Add creator as owner
          await db.groupMember.create({
            data: {
              groupId: group.id,
              userId: user.id,
              role: "owner",
            },
          });

          return json({ group }, { status: 201 });
        } catch (e: any) {
          console.error("[community/groups] POST error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
