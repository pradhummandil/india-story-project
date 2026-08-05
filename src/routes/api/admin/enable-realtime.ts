import { createFileRoute } from "@tanstack/react-router";
import { json, authenticate, verifyAdmin } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";

/**
 * POST /api/admin/enable-realtime
 *
 * Enables Supabase Realtime on the "Notification" table by adding it to the
 * supabase_realtime publication. Call this ONCE after deployment.
 *
 * Supabase Realtime listens to postgres logical replication publications.
 * The default publication is "supabase_realtime". Adding the Notification
 * table to this publication allows the client SDK to listen for INSERT/UPDATE/DELETE
 * events in real time without polling.
 *
 * This is idempotent — safe to call multiple times.
 */
export const Route = createFileRoute("/api/admin/enable-realtime")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const adminUser = await verifyAdmin(request);
        if (!adminUser) return json({ error: "Unauthorized" }, { status: 401 });

        const results: string[] = [];

        // Add tables to realtime publication
        const tables = ["Notification", "UserProfile", "UserStat", "Bookmark", "StoryLike", "ReadingProgress"];
        for (const table of tables) {
          try {
            await (prisma as any).$executeRawUnsafe(
              `ALTER PUBLICATION supabase_realtime ADD TABLE "${table}";`
            );
            results.push(`✅ ${table} added to supabase_realtime publication`);
          } catch (err: any) {
            // "relation already member of publication" is fine — idempotent
            if (err.message?.includes("already member")) {
              results.push(`ℹ️ ${table} already in publication`);
            } else {
              results.push(`⚠️ ${table}: ${err.message}`);
            }
          }
        }

        // Also set REPLICA IDENTITY FULL so DELETE events include old row data
        for (const table of tables) {
          try {
            await (prisma as any).$executeRawUnsafe(
              `ALTER TABLE "${table}" REPLICA IDENTITY FULL;`
            );
            results.push(`✅ ${table} REPLICA IDENTITY set to FULL`);
          } catch (err: any) {
            results.push(`⚠️ ${table} REPLICA IDENTITY: ${err.message}`);
          }
        }

        return json({ success: true, results });
      },
    },
  },
});
