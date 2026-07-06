import { categories as categoriesFromJson, stories as storiesFromJson } from "@/lib/stories-data";

// Shared deterministic data helpers for homepage 3D/map/story constellation.

export const stories = storiesFromJson;
export const categories = categoriesFromJson;

export type HomepageStory = (typeof stories)[number];

function seededNumber(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 2 ** 32;
}

// Deterministic SVG-ish coords (used by ExploreIndia / ExploreIndia3D).
// Output matches expected ranges used in the existing components.
export function storyCoords(storySlugOrId: string, region: string) {
  const rx = seededNumber(`${region}|x|${storySlugOrId}`);
  const ry = seededNumber(`${region}|y|${storySlugOrId}`);

  const x = 10 + rx * 80; // 10..90
  const y = 12 + ry * 76; // 12..88

  // Clamp to safety margins (used by the original constellation-map space).
  const cx = Math.max(6, Math.min(94, x));
  const cy = Math.max(6, Math.min(94, y));

  return { x: cx, y: cy };
}

export function firstStoryForRegion(region: string) {
  return stories.find((s) => s.region === region) ?? null;
}

export function regionStoryCount(region: string) {
  return stories.filter((s) => s.region === region).length;
}


