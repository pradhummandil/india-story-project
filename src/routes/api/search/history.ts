import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";
import { supabase } from "@/lib/supabase-client";

async function authenticate(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.substring(7);
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/search/history")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const history = await prisma.searchHistory.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            take: 12,
            select: { id: true, query: true, createdAt: true }
          });
          return json({ history });
        } catch (error) {
          console.error("Failed to load search history:", error);
          return json({ error: "Failed to load search history" }, { status: 500 });
        }
      },

      POST: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const { query } = (await request.json()) as { query?: string };
          if (!query || !query.trim()) {
            return json({ error: "Query is required" }, { status: 400 });
          }

          const trimmedQuery = query.trim();

          // 1. Avoid duplicate query strings in user's recent history
          await prisma.searchHistory.deleteMany({
            where: { userId: user.id, query: trimmedQuery }
          });

          // 2. Create new history entry
          const newEntry = await prisma.searchHistory.create({
            data: {
              userId: user.id,
              query: trimmedQuery
            }
          });

          // 3. Keep history to max 12 items (delete anything older than the 12th item)
          const historyItems = await prisma.searchHistory.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            select: { id: true }
          });

          if (historyItems.length > 12) {
            const idsToDelete = historyItems.slice(12).map(item => item.id);
            await prisma.searchHistory.deleteMany({
              where: { id: { in: idsToDelete } }
            });
          }

          return json({ success: true, item: newEntry });
        } catch (error) {
          console.error("Failed to append search history:", error);
          return json({ error: "Failed to append search history" }, { status: 500 });
        }
      },

      DELETE: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          await prisma.searchHistory.deleteMany({
            where: { userId: user.id }
          });
          return json({ success: true });
        } catch (error) {
          console.error("Failed to clear search history:", error);
          return json({ error: "Failed to clear search history" }, { status: 500 });
        }
      }
    }
  }
});
