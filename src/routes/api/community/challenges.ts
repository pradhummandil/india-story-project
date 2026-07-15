import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";

const db = prisma as any;

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export const Route = createFileRoute("/api/community/challenges")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const status = url.searchParams.get("status") ?? "active";
          const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
          const limit = Math.min(
            50,
            Math.max(1, parseInt(url.searchParams.get("limit") ?? "20", 10)),
          );

          const now = new Date();
          let where: any;

          switch (status) {
            case "upcoming":
              where = { startAt: { gt: now } };
              break;
            case "past":
              where = { OR: [{ endAt: { lte: now } }, { isActive: false }] };
              break;
            default: // active
              where = { startAt: { lte: now }, endAt: { gt: now }, isActive: true };
          }

          const [challenges, total] = await Promise.all([
            db.storyChallenge.findMany({
              where,
              orderBy: { startAt: "desc" },
              skip: (page - 1) * limit,
              take: limit,
              include: { _count: { select: { entries: true } } },
            }),
            db.storyChallenge.count({ where }),
          ]);

          return json({ challenges, total, page, totalPages: Math.ceil(total / limit) });
        } catch (e: any) {
          console.error("[community/challenges] GET error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },

      POST: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          // Admin/Editor check
          const profile = await db.userProfile.findUnique({
            where: { id: user.id },
            select: { role: true },
          });
          if (!profile || !["SuperAdmin", "Admin", "Editor"].includes(profile.role)) {
            return json({ error: "Forbidden" }, { status: 403 });
          }

          const body = await request.json();
          const { title, description, rules, theme, prize, startAt, endAt } = body ?? {};

          if (!title?.trim()) return json({ error: "title is required" }, { status: 400 });
          if (!description?.trim())
            return json({ error: "description is required" }, { status: 400 });
          if (!rules?.trim()) return json({ error: "rules is required" }, { status: 400 });
          if (!startAt || !endAt)
            return json({ error: "startAt and endAt are required" }, { status: 400 });

          const slug = generateSlug(title.trim());

          const challenge = await db.storyChallenge.create({
            data: {
              title: title.trim(),
              slug,
              description: description.trim(),
              rules: rules.trim(),
              theme: theme?.trim() ?? null,
              prize: prize?.trim() ?? null,
              startAt: new Date(startAt),
              endAt: new Date(endAt),
              createdBy: user.id,
            },
          });

          return json({ challenge }, { status: 201 });
        } catch (e: any) {
          console.error("[community/challenges] POST error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
