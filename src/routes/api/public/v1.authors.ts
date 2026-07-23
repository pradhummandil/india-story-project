import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";

const db = prisma as any;

export const Route = createFileRoute("/api/public/v1/authors")({
  server: {
    handlers: {
      /**
       * GET /api/public/v1.authors
       * Public REST API for authors directory
       */
      GET: async ({ request }) => {
        try {
          const authors = await db.author.findMany({
            select: {
              id: true,
              name: true,
              bio: true,
              avatar: true,
              _count: { select: { stories: true } },
            },
            orderBy: { name: "asc" },
            take: 100,
          });

          return new Response(
            JSON.stringify({
              apiVersion: "1.0",
              total: authors.length,
              data: authors,
            }),
            {
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "public, max-age=600, s-maxage=86400",
              },
            }
          );
        } catch (err: any) {
          return json({ error: err.message || "Public authors API error" }, { status: 500 });
        }
      },
    },
  },
});
