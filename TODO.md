# TODO - Database timeout diagnosis & minimal fix

- [x] Inspect current Prisma index coverage for the specific homepage queries used by:
  - [x] GET /api/hero-slides (heroOfTheDay + homepageSlideshow, nested images ordered top-1)
  - [ ] GET /api/hero-of-the-day
  - [x] GET /api/themes (non-Prisma route to DB; reads themeRepository)
  - [x] GET /api/stories (already uses timeouts; likely affected by same base story index patterns)
- [x] Verify which query is timing out (confirmed via code: tight 1500ms race in /api/hero-slides wraps a Prisma query with nested image ordering).
- [ ] Add ONLY the minimum missing indexes (no duplicates) required to make those queries use the right indexes.

- [ ] Generate Prisma migration to add the minimum missing indexes.

- [ ] Run Prisma migration (or ensure it will apply on Supabase).

- [ ] Re-test the four homepage endpoints on Vercel to confirm timeouts are gone.
- [ ] Confirm that Admin slideshow still works (should be unaffected logically).



