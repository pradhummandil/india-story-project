# TODO.md — India Story Hub (Phase 0.5)

## Phase 0.5 — Remove placeholders & hardcoded datasets (no PostgreSQL)

- [x] Inspect relevant files for placeholders/hardcoded datasets.
- [ ] Edit `src/components/site/StoryMap.tsx`: remove `STATE_COORDS` hardcoded placement; derive deterministic coords from `stories.json` regions; keep UI identical.
- [ ] Edit `src/components/site/StoryConstellation.tsx`: remove hardcoded `categoryColors` and category whitelist/switch; derive categories dynamically from `stories.json`; keep UI identical with deterministic colors.
- [ ] Edit `src/components/site/ExploreIndia3D.tsx`: remove hardcoded `FILTERS`; generate filter buttons from `stories.json` categories; remove hardcoded `hero: "Featured"` label (derive from real story data).
- [ ] Edit `src/routes/index.tsx`: remove hardcoded homepage category cards data; generate from `stories.json` categories; keep UI identical using deterministic icon selection.
- [ ] Verify `src/components/site/StoryDetail.tsx` has no placeholders (likely no change).
- [ ] Run `bun run typecheck` and `bun run build` (or repo equivalents) and fix any TS/React issues.
- [ ] Run repo placeholder search using available tooling (avoid synthetic dataset sources).
- [ ] Update this checklist to mark completion.

