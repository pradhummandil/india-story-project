# TODO

## Next
- [ ] Replace the hardcoded in-memory stories dataset (`src/lib/stories-data.ts`) with the new generated `stories.json`.
- [ ] Update `/stories` list page to load stories from the local `stories.json` instead of `stories-data.ts`.
- [ ] Update `/stories/$slug` page to resolve story by slug from the same source.
- [ ] Remove any client-side limits/pagination caps (if present) so all 422 stories can be displayed.
- [ ] Verify UI behavior: pagination (if any), search, category filter, and individual story pages.
- [ ] Rebuild the project and ensure no runtime/type errors.

