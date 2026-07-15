import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json, authenticate } from "@/routes/api/-_utils";

const db = prisma as any;

export const Route = createFileRoute("/api/community/topics")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const categoryId = url.searchParams.get("categoryId") ?? undefined;
          const sort = url.searchParams.get("sort") ?? "latest";
          const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
          const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") ?? "20", 10)));
          const q = url.searchParams.get("q")?.trim();

          const where: any = { isSpam: false };
          if (categoryId) where.categoryId = categoryId;
          if (q) where.title = { contains: q, mode: "insensitive" };
          if (sort === "unanswered") where.replyCount = 0;

          let orderBy: any;
          switch (sort) {
            case "hot":
              orderBy = { viewCount: "desc" };
              break;
            case "top":
              orderBy = { viewCount: "desc" };
              break;
            case "unanswered":
              orderBy = { createdAt: "desc" };
              break;
            default: // latest
              orderBy = { lastActivityAt: "desc" };
          }

          const [topics, total] = await Promise.all([
            db.discussionTopic.findMany({
              where,
              orderBy,
              skip: (page - 1) * limit,
              take: limit,
              include: {
                user: { select: { name: true, avatarUrl: true } },
                category: { select: { name: true, slug: true, icon: true, color: true } },
              },
            }),
            db.discussionTopic.count({ where }),
          ]);

          return json({
            topics,
            total,
            page,
            totalPages: Math.ceil(total / limit),
          });
        } catch (e: any) {
          console.error("[community/topics] GET error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },

      POST: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const body = await request.json();
          const { title, content, categoryId } = body ?? {};

          if (!title || typeof title !== "string" || title.trim().length < 3 || title.trim().length > 200) {
            return json({ error: "Title must be between 3 and 200 characters" }, { status: 400 });
          }
          if (!content || typeof content !== "string" || content.trim().length < 10 || content.trim().length > 10000) {
            return json({ error: "Content must be between 10 and 10000 characters" }, { status: 400 });
          }

          const topic = await db.discussionTopic.create({
            data: {
              title: title.trim(),
              content: content.trim(),
              userId: user.id,
              categoryId: categoryId ?? null,
              lastActivityAt: new Date(),
            },
            include: {
              user: { select: { name: true, avatarUrl: true } },
              category: { select: { name: true, slug: true, icon: true, color: true } },
            },
          });

          return json({ topic }, { status: 201 });
        } catch (e: any) {
          console.error("[community/topics] POST error:", e);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
