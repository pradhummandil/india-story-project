import { useEffect, useState, useCallback } from "react";
import { stories } from "@/lib/stories-data";
import type { Story } from "@/components/site/StoryCard";

const KEY = "isp.journey.v1";

export interface JourneyState {
  viewedIds: string[];
  categoryCounts: Record<string, number>;
  regionCounts: Record<string, number>;
  modePref?: string;
  totalReadMs: number;
  lastViewedId?: string;
}

const initial: JourneyState = {
  viewedIds: [],
  categoryCounts: {},
  regionCounts: {},
  totalReadMs: 0,
};

function read(): JourneyState {
  if (typeof window === "undefined") return initial;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    return { ...initial, ...JSON.parse(raw) };
  } catch {
    return initial;
  }
}

function write(s: JourneyState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
    window.dispatchEvent(new CustomEvent("isp:journey", { detail: s }));
  } catch {
    // Ignore storage quota errors
  }
}

export function useJourney() {
  const [state, setState] = useState<JourneyState>(initial);

  useEffect(() => {
    setState(read());
    const handler = (e: Event) => {
      const d = (e as CustomEvent<JourneyState>).detail;
      if (d) setState(d);
    };
    window.addEventListener("isp:journey", handler);
    const storage = (e: StorageEvent) => {
      if (e.key === KEY) setState(read());
    };
    window.addEventListener("storage", storage);
    return () => {
      window.removeEventListener("isp:journey", handler);
      window.removeEventListener("storage", storage);
    };
  }, []);

  const trackView = useCallback((story: Story, readMs = 4000) => {
    if (!story || !story.id) return;
    const cur = read();
    const viewedIds = cur.viewedIds.includes(story.id)
      ? cur.viewedIds
      : [story.id, ...cur.viewedIds].slice(0, 50);
    const regionKey = story.region || "India";
    const next: JourneyState = {
      ...cur,
      viewedIds,
      lastViewedId: story.id,
      totalReadMs: cur.totalReadMs + readMs,
      categoryCounts: (() => {
        const storyThemes =
          Array.isArray(story.themes) && story.themes.length > 0
            ? story.themes
            : (story as any).category
              ? [(story as any).category]
              : [];
        const updated = { ...cur.categoryCounts };
        storyThemes.forEach((t: string) => {
          if (t) updated[t] = (updated[t] ?? 0) + 1;
        });
        return updated;
      })(),
      regionCounts: {
        ...cur.regionCounts,
        [regionKey]: (cur.regionCounts[regionKey] ?? 0) + 1,
      },
    };
    write(next);
  }, []);

  const setMode = useCallback((mode: string) => {
    const cur = read();
    write({ ...cur, modePref: mode });
  }, []);

  const reset = useCallback(() => write(initial), []);

  return { state, trackView, setMode, reset };
}

export function scoreStory(s: Story, j: JourneyState): number {
  if (!s || !s.id) return -1;
  if (j.viewedIds.includes(s.id)) return -1; // hide already-viewed
  const storyThemes =
    Array.isArray(s.themes) && s.themes.length > 0
      ? s.themes
      : (s as any).category
        ? [(s as any).category]
        : [];
  const cat = storyThemes.reduce((sum: number, t: string) => sum + (j.categoryCounts[t] ?? 0), 0);
  const regKey = s.region || "India";
  const reg = j.regionCounts[regKey] ?? 0;
  return cat * 3 + reg * 2 + Math.random() * 0.5;
}

export function getRecommendations(j: JourneyState, limit = 6, storiesList?: Story[]): Story[] {
  const list = storiesList && storiesList.length ? storiesList : stories;
  const scored = list
    .filter((s) => s && s.id)
    .map((s) => ({ s, score: scoreStory(s, j) }))
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score);
  if (scored.length === 0) return list.filter((s) => s && s.id).slice(0, limit);
  return scored.slice(0, limit).map((x) => x.s);
}

export function getSimilar(storyId: string, limit = 3, storiesList?: Story[]): Story[] {
  const list = storiesList && storiesList.length ? storiesList : stories;
  if (!storyId) return list.filter((s) => s && s.id).slice(0, limit);
  const base = list.find((s) => s && s.id === storyId);
  if (!base) return list.filter((s) => s && s.id).slice(0, limit);
  const baseThemes =
    Array.isArray(base.themes) && base.themes.length > 0
      ? base.themes
      : (base as any).category
        ? [(base as any).category]
        : [];
  return list
    .filter((s) => s && s.id && s.id !== storyId)
    .map((s) => {
      const sThemes =
        Array.isArray(s.themes) && s.themes.length > 0
          ? s.themes
          : (s as any).category
            ? [(s as any).category]
            : [];
      const themeOverlap = sThemes.filter((t: string) => baseThemes.includes(t)).length;
      return { s, score: themeOverlap * 3 + (s.region && base.region && s.region === base.region ? 2 : 0) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.s);
}

export interface Badge {
  id: string;
  label: string;
  desc: string;
  emoji: string;
  earned: boolean;
}

export function getBadges(j: JourneyState): Badge[] {
  const viewed = j.viewedIds.length;
  const cats = Object.keys(j.categoryCounts).length;
  const regs = Object.keys(j.regionCounts).length;
  return [
    {
      id: "explorer",
      emoji: "🧭",
      label: "Explorer",
      desc: "Read your first story",
      earned: viewed >= 1,
    },
    {
      id: "seeker",
      emoji: "✨",
      label: "Changemaker Seeker",
      desc: "Explored 3 categories",
      earned: cats >= 3,
    },
    {
      id: "traveler",
      emoji: "🇮🇳",
      label: "Bharat Traveler",
      desc: "Visited 4 regions",
      earned: regs >= 4,
    },
    {
      id: "enthusiast",
      emoji: "📖",
      label: "Story Enthusiast",
      desc: "Read 8 stories",
      earned: viewed >= 8,
    },
  ];
}
