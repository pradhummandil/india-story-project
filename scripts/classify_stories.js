import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const THEMES_CONFIG = [
  {
    name: "Heritage",
    slug: "heritage",
    keywords: [
      "heritage",
      "धरोहर",
      "विरासत",
      "किला",
      "fort",
      "palace",
      "monument",
      "historic",
      "monuments",
      "temple",
      "मंदिर",
      "संरक्षण",
    ],
  },
  {
    name: "Science",
    slug: "science",
    keywords: [
      "science",
      "विज्ञान",
      "वैज्ञानिक",
      "space",
      "research",
      "lab",
      "physics",
      "chemistry",
      "biology",
      "scientist",
    ],
  },
  {
    name: "Culture",
    slug: "culture",
    keywords: [
      "culture",
      "संस्कृति",
      "सांस्कृतिक",
      "संगीत",
      "music",
      "dance",
      "nृत्य",
      "folk",
      "tradition",
      "पारंपरिक",
      "heritage",
      "त्योहार",
    ],
  },
  {
    name: "History",
    slug: "history",
    keywords: [
      "history",
      "इतिहास",
      "ऐतिहासिक",
      "प्राचीन",
      "ancient",
      "swatantrata",
      "freedom",
      "क्रांति",
      "colonial",
      "british",
      "आज़ादी",
    ],
  },
  {
    name: "Innovation",
    slug: "innovation",
    keywords: [
      "innovation",
      "नवाचार",
      "आविष्कार",
      "invent",
      "innovator",
      "patent",
      "robotic",
      "device",
      "glove",
      "prototype",
      "स्टार्टअप",
      "startup",
    ],
  },
  {
    name: "Freedom Fighters",
    slug: "freedom-fighters",
    keywords: [
      "freedom fighter",
      "freedom fighters",
      "swatantrata senani",
      "क्रांतिकारी",
      "सेनानी",
      "bose",
      "gandhi",
      "nehru",
      "bhagat",
      "subhas",
      "tilak",
      "patel",
    ],
  },
  {
    name: "Architecture",
    slug: "architecture",
    keywords: [
      "architecture",
      "वास्तुकला",
      "भवन",
      "monument",
      "structure",
      "design",
      "monuments",
      "temple",
      "स्तूप",
    ],
  },
  {
    name: "Wildlife",
    slug: "wildlife",
    keywords: [
      "wildlife",
      "वन्यजीव",
      "जानवर",
      "animal",
      "tiger",
      "शेर",
      "forest",
      "jungle",
      "birds",
      "elephant",
      "leopard",
      "संरक्षण",
    ],
  },
  {
    name: "Spirituality",
    slug: "spirituality",
    keywords: [
      "spirituality",
      "अध्यात्म",
      "आध्यात्मिक",
      "योग",
      "yogi",
      "meditation",
      "swami",
      "guru",
      "temple",
      "साधना",
    ],
  },
  {
    name: "Literature",
    slug: "literature",
    keywords: [
      "literature",
      "साहित्य",
      "लेखक",
      "writer",
      "poem",
      "poetry",
      "novel",
      "पुस्तक",
      "कवि",
      "scripture",
      "book",
    ],
  },
  {
    name: "Art",
    slug: "art",
    keywords: [
      "art",
      "कला",
      "चित्रकला",
      "painting",
      "craft",
      "हस्तशिल्प",
      "handicraft",
      "sculpture",
      "artist",
      "कलाकार",
    ],
  },
  {
    name: "Environment",
    slug: "environment",
    keywords: [
      "environment",
      "पर्यावरण",
      "पेड़",
      "tree",
      "water",
      "जल",
      "conservation",
      "organic",
      "sustainable",
      "संरक्षण",
      "waste",
      "recycle",
      "eco",
    ],
  },
  {
    name: "Technology",
    slug: "technology",
    keywords: [
      "technology",
      "तकनीक",
      "सॉफ्टवेयर",
      "software",
      "computer",
      "digital",
      "app",
      "tech",
      "gadget",
      "robotic",
    ],
  },
  {
    name: "Food",
    slug: "food",
    keywords: [
      "food",
      "भोजन",
      "पकवान",
      "रसोई",
      "organic",
      "recipe",
      "dish",
      "millets",
      "seed",
      "खेती",
      "agriculture",
      "farmer",
      "किसान",
    ],
  },
  {
    name: "Festivals",
    slug: "festivals",
    keywords: [
      "festival",
      "त्योहार",
      "मेला",
      "diwali",
      "holi",
      "celebration",
      "festivals",
      "उत्सव",
      "parv",
    ],
  },
  {
    name: "General",
    slug: "general",
    keywords: [],
  },
];

async function main() {
  console.log("Seeding all 16 themes...");
  const themeMap = {};

  for (const t of THEMES_CONFIG) {
    const record = await prisma.theme.upsert({
      where: { slug: t.slug },
      update: { name: t.name },
      create: { name: t.name, slug: t.slug },
    });
    themeMap[t.name] = record.id;
  }
  console.log("Themes seeded successfully.");

  console.log("Fetching all stories...");
  const stories = await prisma.story.findMany({
    select: {
      id: true,
      title: true,
      excerpt: true,
      content: true,
      titleHi: true,
      excerptHi: true,
      contentHi: true,
    },
  });

  console.log(`Classifying ${stories.length} stories...`);
  let classifiedCount = 0;
  let generalCount = 0;

  // Clear existing mappings to avoid duplicates
  await prisma.storyTheme.deleteMany({});

  for (const s of stories) {
    const textToSearch = [s.title, s.excerpt, s.content, s.titleHi, s.excerptHi, s.contentHi]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchedThemes = [];

    for (const t of THEMES_CONFIG) {
      if (t.name === "General") continue;

      const matches = t.keywords.some((k) => textToSearch.includes(k.toLowerCase()));
      if (matches) {
        matchedThemes.push(t.name);
      }
    }

    if (matchedThemes.length === 0) {
      matchedThemes.push("General");
      generalCount++;
    } else {
      classifiedCount++;
    }

    // Link themes to story
    for (const themeName of matchedThemes) {
      const themeId = themeMap[themeName];
      await prisma.storyTheme.create({
        data: {
          storyId: s.id,
          themeId: themeId,
        },
      });
    }
  }

  console.log(`Classification complete!`);
  console.log(`Stories with specific themes: ${classifiedCount}`);
  console.log(`Stories falling back to General: ${generalCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
