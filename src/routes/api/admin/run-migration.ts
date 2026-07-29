import { createFileRoute } from "@tanstack/react-router";
import { json, verifyAdmin } from "@/routes/api/-_utils";
import { prisma } from "@/lib/repositories/prisma.server";

/**
 * POST /api/admin/run-migration
 * Runs the editorial workflow SQL migration once.
 * Protected: Admin only.
 */
export const Route = createFileRoute("/api/admin/run-migration")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const admin = await verifyAdmin(request);
        if (!admin) return json({ error: "Forbidden" }, { status: 403 });

        try {
          // Add missing columns to StoryRevision if they don't exist
          await prisma.$executeRawUnsafe(`
            ALTER TABLE "StoryRevision" 
              ADD COLUMN IF NOT EXISTS "titleHi" TEXT,
              ADD COLUMN IF NOT EXISTS "excerptHi" TEXT,
              ADD COLUMN IF NOT EXISTS "contentHi" TEXT,
              ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'pending',
              ADD COLUMN IF NOT EXISTS "editorNote" TEXT,
              ADD COLUMN IF NOT EXISTS "adminNote" TEXT,
              ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
          `);

          await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS "StoryRevision_changedBy_idx" ON "StoryRevision"("changedBy")
          `);
          await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS "StoryRevision_status_idx" ON "StoryRevision"("status")
          `);

          return json({ success: true, message: "Editorial workflow migration applied." });
        } catch (err: any) {
          console.error("[run-migration]", err);
          return json({ success: false, error: err.message }, { status: 500 });
        }
      },
    },
  },
});
