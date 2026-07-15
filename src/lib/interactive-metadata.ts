import type { Story } from "@/components/site/StoryCard";
import { stories } from "@/lib/stories-data";

export interface ConnectedEntity {
  id: string;
  name: string;
  type: "person" | "place" | "event" | "organization" | "story" | "video";
  description: string;
  connectionReason: string;
}

export interface TimelineEvent {
  year: number;
  title: string;
  description: string;
}

export interface EmotionDataPoint {
  segment: string;
  Hope: number;
  Pride: number;
  Resolve: number;
  Empathy: number;
}

export interface ImpactDataPoint {
  metric: string;
  value: number;
  targetValue: number;
  label: string;
}

export interface StoryInteractiveData {
  entities: ConnectedEntity[];
  timeline: TimelineEvent[];
  emotionData: EmotionDataPoint[];
  impactData: ImpactDataPoint[];
  summary: string;
}

// Simple hash helper to generate deterministic mock data per story slug
function getHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const PEOPLE_NAMES = [
  "Dr. Anil Kumar",
  "Sunita Sharma",
  "Major Vikram Singh",
  "Aarav Patel",
  "Rajesh Mishra",
  "Meera Deshmukh",
  "Karan Johar",
  "Priya Nair",
  "Suresh Rao",
];

const ORG_NAMES = [
  "National Biodiversity Council",
  "Vande Bharat Trust",
  "IIT Bombay Research Lab",
  "Khadi & Village Industries Board",
  "Spiritual Yoga Foundation",
  "Kashmir Handicrafts Board",
  "Ganga Protection Task Force",
  "Green India Mission",
];

export function getStoryInteractiveData(story: Story): StoryInteractiveData {
  const hash = getHash(story.slug || story.title);
  const region = story.region || "India";
  const city = (story as any).city || "Local Community";

  // 1. Generate Connected Entities
  const entities: ConnectedEntity[] = [];

  // Person
  const personName = PEOPLE_NAMES[hash % PEOPLE_NAMES.length];
  entities.push({
    id: "person-1",
    name: personName,
    type: "person",
    description:
      "Key facilitator and field researcher who coordinated the local documentation of this project.",
    connectionReason: "Project coordinator",
  });

  // Place
  entities.push({
    id: "place-1",
    name: city,
    type: "place",
    description: `The primary geographical hub where the community initiatives and local impacts took place in ${region}.`,
    connectionReason: "Primary location",
  });

  // Organization
  const orgName = ORG_NAMES[hash % ORG_NAMES.length];
  entities.push({
    id: "org-1",
    name: orgName,
    type: "organization",
    description:
      "National organization that provided official research recognition and development grants.",
    connectionReason: "Institutional partner",
  });

  // Event
  const startYear = 1990 + (hash % 25);
  entities.push({
    id: "event-1",
    name: `National Innovation Summit ${startYear + 4}`,
    type: "event",
    description:
      "The national gathering where the primary findings of this project were presented and celebrated.",
    connectionReason: "Presentation forum",
  });

  // Related Stories (from dataset)
  const related = stories.filter((s) => s.slug !== story.slug).slice(0, 2);

  related.forEach((r, idx) => {
    entities.push({
      id: `story-${idx}`,
      name: r.title,
      type: "story",
      description: r.excerpt,
      connectionReason: "Shared mission thread",
    });
  });

  // 2. Generate Timeline
  const timeline: TimelineEvent[] = [
    {
      year: startYear,
      title: "First Inception & Research",
      description: `Initial exploration of local methodologies and challenges began in ${city}.`,
    },
    {
      year: startYear + 2,
      title: "Community Expansion",
      description:
        "First group of local contributors and volunteers assembled to test the feasibility.",
    },
    {
      year: startYear + 4,
      title: "National Milestone Recognition",
      description: `Officially highlighted and supported by the ${orgName} at the Innovation Summit.`,
    },
    {
      year: startYear + 6,
      title: "Sustainable System Handover",
      description: "Local ownership completed, scaling the impact footprint across other states.",
    },
  ];

  // 3. Generate Emotion Graph Points
  const emotionData: EmotionDataPoint[] = [
    {
      segment: "Inception",
      Hope: 50 + (hash % 20),
      Pride: 30 + (hash % 10),
      Resolve: 60 + (hash % 15),
      Empathy: 70 + (hash % 10),
    },
    {
      segment: "Challenges",
      Hope: 40 + (hash % 10),
      Pride: 35 + (hash % 15),
      Resolve: 85 + (hash % 10),
      Empathy: 80 + (hash % 15),
    },
    {
      segment: "Recognition",
      Hope: 80 + (hash % 15),
      Pride: 85 + (hash % 10),
      Resolve: 70 + (hash % 15),
      Empathy: 75 + (hash % 10),
    },
    {
      segment: "Legacy",
      Hope: 95,
      Pride: 90,
      Resolve: 75,
      Empathy: 90,
    },
  ];

  // 4. Generate Impact Footprint Points
  const impactData: ImpactDataPoint[] = [
    {
      metric: "Local Reach",
      value: 60 + (hash % 30),
      targetValue: 100,
      label: "Beneficiary reach target",
    },
    {
      metric: "Eco Renewal",
      value: 40 + (hash % 50),
      targetValue: 100,
      label: "Ecological restoration index",
    },
    {
      metric: "Resource Index",
      value: 70 + (hash % 25),
      targetValue: 100,
      label: "Sustainable self-sufficiency index",
    },
  ];

  const summary = `This dynamic map outlines the structural nodes and relationships linking ${story.title} to broader national movements, key individuals, organizations, and historical events. Powered by the India Story Project DNA engine.`;

  return {
    entities,
    timeline,
    emotionData,
    impactData,
    summary,
  };
}
