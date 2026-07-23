import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { json } from "@/routes/api/-_utils";

const db = prisma as any;

export const Route = createFileRoute("/api/public/v1/themes")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const themes = await db.theme.findMany({
            select: {
              id: true,
              name: true,
              slug: true,
              _count: { select: { stories: true } },
            },
            orderBy: { name: "asc" },
          });

          return new Response(
            JSON.stringify({
              apiVersion: "1.0",
              total: themes.length,
              data: themes,
            }),
            {
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "public, max-age=3600, s-maxage=86400",
              },
            }
          );
        } catch (err: any) {
          return json({ error: err.message || "Public themes API error" }, { status: 500 });
        }
      },
    },
  },
});
