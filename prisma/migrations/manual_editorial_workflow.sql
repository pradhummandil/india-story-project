-- Migration: Add editorial workflow fields to StoryRevision
-- This is safe to run against existing data - all new columns are nullable or have defaults

ALTER TABLE "StoryRevision" 
  ADD COLUMN IF NOT EXISTS "titleHi" TEXT,
  ADD COLUMN IF NOT EXISTS "excerptHi" TEXT,
  ADD COLUMN IF NOT EXISTS "contentHi" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS "editorNote" TEXT,
  ADD COLUMN IF NOT EXISTS "adminNote" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add indexes
CREATE INDEX IF NOT EXISTS "StoryRevision_storyId_idx" ON "StoryRevision"("storyId");
CREATE INDEX IF NOT EXISTS "StoryRevision_changedBy_idx" ON "StoryRevision"("changedBy");
CREATE INDEX IF NOT EXISTS "StoryRevision_status_idx" ON "StoryRevision"("status");

-- The foreign key to UserProfile for changedBy already references the same UUID
-- If the constraint doesn't exist yet, add it (skip if already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'StoryRevision_changedBy_fkey'
    AND table_name = 'StoryRevision'
  ) THEN
    ALTER TABLE "StoryRevision" 
      ADD CONSTRAINT "StoryRevision_changedBy_fkey" 
      FOREIGN KEY ("changedBy") REFERENCES "UserProfile"("id") ON DELETE CASCADE;
  END IF;
END $$;
