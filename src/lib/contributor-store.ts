import { useEffect, useState, useCallback } from "react";

const KEY = "isp.contrib.v1";

export interface Submission {
  id: string;
  category: string;
  region: string;
  title: string;
  body: string;
  media: number; // count
  createdAt: number;
  impact: number; // synthetic
}

export interface ContributorState {
  name: string;
  handle: string;
  bio: string;
  submissions: Submission[];
}

const initial: ContributorState = {
  name: "",
  handle: "",
  bio: "",
  submissions: [],
};

function read(): ContributorState {
  if (typeof window === "undefined") return initial;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    return { ...initial, ...JSON.parse(raw) };
  } catch {
    return initial;
  }
}

function write(s: ContributorState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
    window.dispatchEvent(new CustomEvent("isp:contrib", { detail: s }));
  } catch {}
}

export function useContributor() {
  const [state, setState] = useState<ContributorState>(initial);

  useEffect(() => {
    setState(read());
    const h = (e: Event) => {
      const d = (e as CustomEvent<ContributorState>).detail;
      if (d) setState(d);
    };
    window.addEventListener("isp:contrib", h);
    return () => window.removeEventListener("isp:contrib", h);
  }, []);

  const updateProfile = useCallback(
    (patch: Partial<Pick<ContributorState, "name" | "handle" | "bio">>) => {
      const cur = read();
      write({ ...cur, ...patch });
    },
    [],
  );

  const submit = useCallback((s: Omit<Submission, "id" | "createdAt" | "impact">) => {
    const cur = read();
    const sub: Submission = {
      ...s,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      impact: Math.floor(80 + Math.random() * 220),
    };
    write({ ...cur, submissions: [sub, ...cur.submissions] });
    return sub;
  }, []);

  const reset = useCallback(() => write(initial), []);

  return { state, updateProfile, submit, reset };
}

export interface ContribBadge {
  id: string;
  emoji: string;
  label: string;
  desc: string;
  earned: boolean;
}

export function getContribBadges(s: ContributorState): ContribBadge[] {
  const n = s.submissions.length;
  const regions = new Set(s.submissions.map((x) => x.region)).size;
  const impact = s.submissions.reduce((a, b) => a + b.impact, 0);
  return [
    {
      id: "scout",
      emoji: "🏆",
      label: "Story Scout",
      desc: "First story submitted",
      earned: n >= 1,
    },
    {
      id: "reporter",
      emoji: "🌱",
      label: "Impact Reporter",
      desc: "3 stories with impact",
      earned: n >= 3,
    },
    {
      id: "community",
      emoji: "❤️",
      label: "Community Builder",
      desc: "500+ impact points",
      earned: impact >= 500,
    },
    {
      id: "catalyst",
      emoji: "🚀",
      label: "Change Catalyst",
      desc: "5 stories submitted",
      earned: n >= 5,
    },
    {
      id: "bharat",
      emoji: "🇮🇳",
      label: "Bharat Storyteller",
      desc: "Covered 4 regions",
      earned: regions >= 4,
    },
  ];
}

// Seeded community data for leaderboard / map
export interface SeedContributor {
  name: string;
  handle: string;
  region: string;
  stories: number;
  impact: number;
  emerging?: boolean;
}

export const seedContributors: SeedContributor[] = [
  { name: "Aarti Menon", handle: "aarti.m", region: "Kerala", stories: 14, impact: 3120 },
  { name: "Devansh Rao", handle: "devansh", region: "Karnataka", stories: 12, impact: 2870 },
  { name: "Ishaan Bhatt", handle: "ishaan.b", region: "Gujarat", stories: 11, impact: 2540 },
  {
    name: "Priya Sharma",
    handle: "priya.s",
    region: "Uttarakhand",
    stories: 9,
    impact: 2210,
    emerging: true,
  },
  { name: "Rohit Das", handle: "rohit.d", region: "Assam", stories: 8, impact: 1980 },
  {
    name: "Meera Iyer",
    handle: "meera.i",
    region: "Tamil Nadu",
    stories: 7,
    impact: 1740,
    emerging: true,
  },
  { name: "Kabir Singh", handle: "kabir.s", region: "Punjab", stories: 6, impact: 1520 },
  {
    name: "Neha Gupta",
    handle: "neha.g",
    region: "Madhya Pradesh",
    stories: 5,
    impact: 1320,
    emerging: true,
  },
];

export const regionDots: { region: string; x: number; y: number; count: number }[] = [
  { region: "Kashmir", x: 32, y: 12, count: 4 },
  { region: "Punjab", x: 30, y: 22, count: 6 },
  { region: "Delhi", x: 38, y: 28, count: 9 },
  { region: "Rajasthan", x: 26, y: 34, count: 7 },
  { region: "Gujarat", x: 20, y: 44, count: 11 },
  { region: "Maharashtra", x: 30, y: 56, count: 13 },
  { region: "Karnataka", x: 36, y: 70, count: 12 },
  { region: "Kerala", x: 38, y: 84, count: 14 },
  { region: "Tamil Nadu", x: 46, y: 82, count: 7 },
  { region: "Telangana", x: 42, y: 64, count: 8 },
  { region: "Madhya Pradesh", x: 42, y: 46, count: 5 },
  { region: "Uttar Pradesh", x: 50, y: 32, count: 10 },
  { region: "Uttarakhand", x: 46, y: 22, count: 9 },
  { region: "Bihar", x: 58, y: 34, count: 6 },
  { region: "West Bengal", x: 66, y: 42, count: 8 },
  { region: "Assam", x: 76, y: 30, count: 8 },
  { region: "Odisha", x: 56, y: 52, count: 5 },
];

export const challenges = [
  {
    id: "unsung",
    emoji: "🌟",
    title: "Unsung Heroes Month",
    desc: "Profile a changemaker no one is talking about.",
    period: "This month",
    accent: "from-gold to-saffron",
  },
  {
    id: "green",
    emoji: "🌿",
    title: "Green Bharat Stories",
    desc: "Stories of regeneration, conservation and climate action.",
    period: "Next month",
    accent: "from-emerald-400 to-teal-500",
  },
  {
    id: "women",
    emoji: "👩",
    title: "Women of Change",
    desc: "Spotlight women rewriting their communities' futures.",
    period: "Upcoming",
    accent: "from-rose-400 to-pink-500",
  },
  {
    id: "rural",
    emoji: "🚜",
    title: "Rural Innovation Challenge",
    desc: "Frugal innovations from India's villages.",
    period: "Upcoming",
    accent: "from-sky-400 to-indigo-500",
  },
];
