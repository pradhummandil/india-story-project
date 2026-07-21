-- ============================================================
-- India Story Project — Production Full-Text Search Migration
-- ============================================================
-- Adds pg_trgm extension, tsvector column, GIN indexes, and
-- auto-update trigger for production-grade PostgreSQL search.
-- Apply via: npx prisma db execute --file prisma/migrations/search_gin_index/migration.sql
-- ============================================================

-- 1. Enable pg_trgm for fuzzy/trigram similarity search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Add tsvector search_vector column to Story table
ALTER TABLE "Story" ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 3. Populate search_vector for all existing published stories
--    Weight A = title (most important)
--    Weight B = excerpt, seoKeywords, seoTitle, seoDescription (important)
--    Weight C = slug (less important)
--    'english' dictionary for English; 'simple' for Hindi / transliterated names
UPDATE "Story" SET search_vector =
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('simple',  coalesce("titleHi", '')), 'A') ||
  setweight(to_tsvector('english', coalesce(excerpt, '')), 'B') ||
  setweight(to_tsvector('simple',  coalesce("excerptHi", '')), 'B') ||
  setweight(to_tsvector('english', coalesce("seoTitle", '')), 'B') ||
  setweight(to_tsvector('english', coalesce("seoDescription", '')), 'B') ||
  setweight(to_tsvector('english', coalesce("seoKeywords", '')), 'B') ||
  setweight(to_tsvector('simple',  coalesce(slug, '')), 'C');

-- 4. GIN index on tsvector column for O(log N) FTS queries
CREATE INDEX IF NOT EXISTS idx_story_search_vector
  ON "Story" USING GIN(search_vector);

-- 5. GIN trigram indexes for fast ILIKE prefix/partial matching on title
CREATE INDEX IF NOT EXISTS idx_story_title_trgm
  ON "Story" USING GIN(title gin_trgm_ops);

-- 6. GIN trigram index on Hindi title
CREATE INDEX IF NOT EXISTS idx_story_title_hi_trgm
  ON "Story" USING GIN("titleHi" gin_trgm_ops);

-- 7. Composite index for published + publishedAt (common filter+sort combo)
CREATE INDEX IF NOT EXISTS idx_story_status_published_at
  ON "Story"(status, "publishedAt" DESC NULLS LAST)
  WHERE status = 'Published';

-- 8. Auto-update trigger: keep search_vector fresh on INSERT/UPDATE
CREATE OR REPLACE FUNCTION update_story_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple',  coalesce(NEW."titleHi", '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('simple',  coalesce(NEW."excerptHi", '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW."seoTitle", '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW."seoDescription", '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW."seoKeywords", '')), 'B') ||
    setweight(to_tsvector('simple',  coalesce(NEW.slug, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS story_search_vector_update ON "Story";
CREATE TRIGGER story_search_vector_update
  BEFORE INSERT OR UPDATE ON "Story"
  FOR EACH ROW EXECUTE FUNCTION update_story_search_vector();

-- ============================================================
-- Verification queries (run these manually to confirm):
-- ============================================================
-- SELECT COUNT(*) FROM "Story" WHERE search_vector IS NOT NULL;
-- SELECT title FROM "Story" WHERE search_vector @@ to_tsquery('english', 'temple') LIMIT 5;
-- SELECT similarity(title, 'maharashtra') FROM "Story" ORDER BY 1 DESC LIMIT 5;
-- ============================================================
