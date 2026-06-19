import type { Story } from "@/components/site/StoryCard";
import { stories } from "@/lib/stories-data";

export interface StoryDNA {
  theme: string;
  region: string;
  impactType: string;
  beneficiary: string;
  emotion: string;
  sdgs: { id: number; label: string }[];
  category: string;
}

const SDG_BY_CATEGORY: Record<string, { id: number; label: string }[]> = {
  Heritage: [{ id: 11, label: "Sustainable Cities" }, { id: 8, label: "Decent Work" }],
  Innovation: [{ id: 9, label: "Industry & Innovation" }, { id: 4, label: "Quality Education" }],
  Sustainability: [{ id: 12, label: "Responsible Consumption" }, { id: 2, label: "Zero Hunger" }, { id: 15, label: "Life on Land" }],
  Science: [{ id: 9, label: "Industry & Innovation" }, { id: 4, label: "Quality Education" }],
  Culture: [{ id: 11, label: "Sustainable Cities" }, { id: 8, label: "Decent Work" }],
  Environment: [{ id: 13, label: "Climate Action" }, { id: 6, label: "Clean Water" }, { id: 14, label: "Life Below Water" }],
};

const IMPACT_BY_CATEGORY: Record<string, string> = {
  Heritage: "Cultural Revival",
  Innovation: "Technology Access",
  Sustainability: "Ecological Renewal",
  Science: "Scientific Advancement",
  Culture: "Cultural Renaissance",
  Environment: "Environmental Restoration",
};

const BENEFICIARY_BY_CATEGORY: Record<string, string> = {
  Heritage: "Artisans & Craft Communities",
  Innovation: "Rural Youth",
  Sustainability: "Smallholder Farmers",
  Science: "Next-Gen Engineers",
  Culture: "Cultural Practitioners",
  Environment: "River & Coastal Communities",
};

const EMOTION_BY_CATEGORY: Record<string, string> = {
  Heritage: "Reverence",
  Innovation: "Wonder",
  Sustainability: "Hope",
  Science: "Awe",
  Culture: "Pride",
  Environment: "Resolve",
};

export function deriveDNA(story: Story): StoryDNA {
  return {
    theme: story.category,
    region: story.region,
    impactType: IMPACT_BY_CATEGORY[story.category] ?? "Positive Change",
    beneficiary: BENEFICIARY_BY_CATEGORY[story.category] ?? "Local Communities",
    emotion: EMOTION_BY_CATEGORY[story.category] ?? "Inspiration",
    sdgs: SDG_BY_CATEGORY[story.category] ?? [{ id: 17, label: "Partnerships" }],
    category: story.category,
  };
}

export interface Connection {
  story: Story;
  score: number;
  reasons: string[];
}

export function getConnections(storyId: string, limit = 6): Connection[] {
  const base = stories.find((s) => s.id === storyId);
  if (!base) return [];
  return stories
    .filter((s) => s.id !== storyId)
    .map((s) => {
      const reasons: string[] = [];
      let score = 0;
      if (s.category === base.category) { score += 3; reasons.push("Similar mission"); }
      if (s.region === base.region) { score += 2; reasons.push("Same state"); }
      const baseDna = deriveDNA(base);
      const dna = deriveDNA(s);
      if (dna.impactType === baseDna.impactType) { score += 2; reasons.push("Same impact area"); }
      if (dna.beneficiary === baseDna.beneficiary) { score += 1.5; reasons.push("Same beneficiary"); }
      if (dna.emotion === baseDna.emotion) { score += 0.5; reasons.push("Similar tone"); }
      if (score === 0) { score = 0.1; reasons.push("Adjacent story"); }
      return { story: s, score, reasons };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
