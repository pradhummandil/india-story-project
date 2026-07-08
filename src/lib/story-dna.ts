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

const ALL_SDGS = [
  { id: 1, label: "No Poverty" },
  { id: 2, label: "Zero Hunger" },
  { id: 3, label: "Good Health & Well-being" },
  { id: 4, label: "Quality Education" },
  { id: 5, label: "Gender Equality" },
  { id: 6, label: "Clean Water & Sanitation" },
  { id: 7, label: "Affordable & Clean Energy" },
  { id: 8, label: "Decent Work & Economic Growth" },
  { id: 9, label: "Industry, Innovation & Infrastructure" },
  { id: 10, label: "Reduced Inequalities" },
  { id: 11, label: "Sustainable Cities & Communities" },
  { id: 12, label: "Responsible Consumption & Production" },
  { id: 13, label: "Climate Action" },
  { id: 14, label: "Life Below Water" },
  { id: 15, label: "Life on Land" },
  { id: 16, label: "Peace, Justice & Strong Institutions" },
  { id: 17, label: "Partnerships for the Goals" },
];

const IMPACT_OPTIONS = [
  "Cultural Revival",
  "Technology Access",
  "Ecological Renewal",
  "Scientific Advancement",
  "Cultural Renaissance",
  "Environmental Restoration",
  "Social Integration",
  "Economic Empowerment",
  "Community Resilience",
];

const BENEFICIARY_OPTIONS = [
  "Artisans & Craft Communities",
  "Rural Youth",
  "Smallholder Farmers",
  "Next-Gen Engineers",
  "Cultural Practitioners",
  "River & Coastal Communities",
  "Marginalized Groups",
  "Urban Inhabitants",
  "Local Educators",
];

const EMOTION_OPTIONS = [
  "Reverence",
  "Wonder",
  "Hope",
  "Awe",
  "Pride",
  "Resolve",
  "Empathy",
  "Inspiration",
  "Joy",
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function deriveDNA(story: Story): StoryDNA {
  const category = story.category || "All";
  const hashVal = hashCode(category);

  const impactType = IMPACT_OPTIONS[hashVal % IMPACT_OPTIONS.length];
  const beneficiary = BENEFICIARY_OPTIONS[(hashVal + 2) % BENEFICIARY_OPTIONS.length];
  const emotion = EMOTION_OPTIONS[(hashVal + 4) % EMOTION_OPTIONS.length];

  // Deterministically select 1 to 3 unique SDGs
  const numSdgs = (hashVal % 3) + 1; // 1, 2, or 3 SDGs
  const sdgs: { id: number; label: string }[] = [];
  const usedIndices = new Set<number>();

  for (let i = 0; i < numSdgs; i++) {
    let index = (hashVal + i * 5) % ALL_SDGS.length;
    // Handle collisions to ensure uniqueness
    while (usedIndices.has(index)) {
      index = (index + 1) % ALL_SDGS.length;
    }
    usedIndices.add(index);
    sdgs.push(ALL_SDGS[index]);
  }

  return {
    theme: category,
    region: story.region || "India",
    impactType,
    beneficiary,
    emotion,
    sdgs,
    category,
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
      if (s.category === base.category) {
        score += 3;
        reasons.push("Similar mission");
      }
      if (s.region === base.region) {
        score += 2;
        reasons.push("Same state");
      }
      const baseDna = deriveDNA(base);
      const dna = deriveDNA(s);
      if (dna.impactType === baseDna.impactType) {
        score += 2;
        reasons.push("Same impact area");
      }
      if (dna.beneficiary === baseDna.beneficiary) {
        score += 1.5;
        reasons.push("Same beneficiary");
      }
      if (dna.emotion === baseDna.emotion) {
        score += 0.5;
        reasons.push("Similar tone");
      }
      if (score === 0) {
        score = 0.1;
        reasons.push("Adjacent story");
      }
      return { story: s, score, reasons };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
