import { stories } from "@/lib/stories-data";

export function getInitialExploreData() {
  const allStories = stories || [];

  // Group stories by region / state
  const stateCountMap: Record<string, number> = {};
  const themeCountMap: Record<string, number> = {};
  const authorMap: Record<string, { name: string; count: number }> = {};

  allStories.forEach((s) => {
    if (s.region) {
      stateCountMap[s.region] = (stateCountMap[s.region] || 0) + 1;
    }
    (s.themes || []).forEach((t) => {
      themeCountMap[t] = (themeCountMap[t] || 0) + 1;
    });
    const auth = s.authorName || "India Story Project";
    authorMap[auth] = authorMap[auth] || { name: auth, count: 0 };
    authorMap[auth].count += 1;
  });

  // Map representative images directly from real stories
  const stateStoryImages: Record<string, string> = {};
  allStories.forEach((s) => {
    if (s.region && s.image && !stateStoryImages[s.region]) {
      stateStoryImages[s.region] = s.image;
    }
  });

  const STATE_IMAGES: Record<string, string> = {
    Rajasthan: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=600&auto=format&fit=crop&q=80",
    "Madhya Pradesh": "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80",
    Delhi: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&auto=format&fit=crop&q=80",
    Bihar: "https://images.unsplash.com/photo-1622308644420-b20142dc993c?w=600&auto=format&fit=crop&q=80",
    Maharashtra: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&auto=format&fit=crop&q=80",
    Karnataka: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80",
    Kerala: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&auto=format&fit=crop&q=80",
    Punjab: "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?w=600&auto=format&fit=crop&q=80",
    "Uttar Pradesh": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600&auto=format&fit=crop&q=80",
    Gujarat: "https://images.unsplash.com/photo-1609946782912-6738b02444b0?w=600&auto=format&fit=crop&q=80",
    "Andhra Pradesh": "https://images.unsplash.com/photo-1627894483216-2138af692e32?w=600&auto=format&fit=crop&q=80",
    Goa: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80",
    Assam: "https://images.unsplash.com/photo-1571536802807-30451e3955d8?w=600&auto=format&fit=crop&q=80",
    Odisha: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&auto=format&fit=crop&q=80",
    "Himachal Pradesh": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&auto=format&fit=crop&q=80",
    Uttarakhand: "https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?w=600&auto=format&fit=crop&q=80",
    "West Bengal": "https://images.unsplash.com/photo-1558431382-27e303142255?w=600&auto=format&fit=crop&q=80",
    "Tamil Nadu": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&auto=format&fit=crop&q=80",
    Telangana: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600&auto=format&fit=crop&q=80",
    Haryana: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80",
    Jharkhand: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80",
    Chhattisgarh: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80",
    Meghalaya: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&auto=format&fit=crop&q=80",
    Manipur: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80",
    Mizoram: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80",
    Nagaland: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80",
    Sikkim: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=600&auto=format&fit=crop&q=80",
    Tripura: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80",
    "Arunachal Pradesh": "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80",
    Ladakh: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=600&auto=format&fit=crop&q=80",
    "Jammu and Kashmir": "https://images.unsplash.com/photo-1566837945700-30057527ade0?w=600&auto=format&fit=crop&q=80",
  };

  const DEFAULT_STATE_IMG = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&auto=format&fit=crop&q=80";

  const ALL_INDIAN_STATES = [
    "Rajasthan", "Maharashtra", "Madhya Pradesh", "Delhi", "Uttar Pradesh", "Karnataka",
    "Kerala", "Gujarat", "Tamil Nadu", "Punjab", "West Bengal", "Bihar",
    "Assam", "Odisha", "Himachal Pradesh", "Uttarakhand", "Goa", "Andhra Pradesh",
    "Telangana", "Haryana", "Jharkhand", "Chhattisgarh", "Meghalaya", "Manipur",
    "Mizoram", "Nagaland", "Sikkim", "Tripura", "Arunachal Pradesh", "Jammu and Kashmir"
  ];

  const statesList = ALL_INDIAN_STATES.map((name) => ({
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    count: stateCountMap[name] || 0,
    region: "India",
    image: stateStoryImages[name] || STATE_IMAGES[name] || DEFAULT_STATE_IMG,
  })).sort((a, b) => b.count - a.count);

  const THEMES_LIST = [
    { id: "th-1", name: "Spirituality", slug: "spirituality", desc: "Sacred traditions, temples, and spiritual journeys", count: themeCountMap["Spirituality"] || 219 },
    { id: "th-2", name: "Environment", slug: "environment", desc: "Forest guardians and eco warriors", count: themeCountMap["Environment"] || 213 },
    { id: "th-3", name: "Art", slug: "art", desc: "Traditional crafts, paintings, and master artisans", count: themeCountMap["Art"] || 202 },
    { id: "th-4", name: "Heritage", slug: "heritage", desc: "Architecture, monuments, and timeless traditions", count: themeCountMap["Heritage"] || 168 },
    { id: "th-5", name: "Technology", slug: "technology", desc: "Grassroots tech and village innovators", count: themeCountMap["Technology"] || 110 },
    { id: "th-6", name: "History", slug: "history", desc: "Chronicles of ancient and modern India", count: themeCountMap["History"] || 105 },
    { id: "th-7", name: "Science", slug: "science", desc: "Innovators, doctors, and grassroots inventors", count: themeCountMap["Science"] || 102 },
    { id: "th-8", name: "Food", slug: "food", desc: "Culinary heritage and traditional recipes", count: themeCountMap["Food"] || 101 },
    { id: "th-9", name: "Culture", slug: "culture", desc: "Folk arts, languages, and rituals", count: themeCountMap["Culture"] || 98 },
    { id: "th-10", name: "Wildlife", slug: "wildlife", desc: "Flora, fauna, and animal conservation", count: themeCountMap["Wildlife"] || 88 },
    { id: "th-11", name: "Literature", slug: "literature", desc: "Folktales, poetry, and regional literature", count: themeCountMap["Literature"] || 54 },
    { id: "th-12", name: "Innovation", slug: "innovation", desc: "Social entrepreneurs and village solutions", count: themeCountMap["Innovation"] || 42 },
    { id: "th-13", name: "Sustainability", slug: "sustainability", desc: "Organic farming, water, and conservation", count: themeCountMap["Sustainability"] || 31 },
    { id: "th-14", name: "Freedom", slug: "freedom", desc: "Historical movements and unsung heroes", count: themeCountMap["Freedom"] || 24 },
    { id: "th-15", name: "Festivals", slug: "festivals", desc: "Regional celebrations and sacred fairs", count: themeCountMap["Festivals"] || 30 },
  ];

  const authorsList = Object.values(authorMap).slice(0, 8).map((a) => ({
    id: a.name.toLowerCase().replace(/\s+/g, "-"),
    name: a.name,
    role: "Grassroots Reporter & Field Fellow",
    count: a.count,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  }));

  return {
    stats: {
      stories: 396,
      states: 28,
      themes: 18,
      authors: 42,
      views: 128500,
    },
    states: statesList,
    themes: THEMES_LIST,
    trending: allStories.slice(0, 6),
    recommended: allStories.slice(1, 7),
    hiddenGems: allStories.slice(2, 6),
    authors: authorsList,
    collections: [
      {
        id: "col-1",
        name: "Unsung Women Changemakers of Rural India",
        title: "Unsung Women Changemakers of Rural India",
        slug: "unsung-women-changemakers-of-rural-india",
        desc: "Documenting courageous women leading silent revolutions.",
        description: "Documenting courageous women leading silent revolutions.",
        storiesCount: 14,
        stories: allStories.slice(0, 3),
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "col-2",
        name: "Traditional Craftsmen & Master Artisans",
        title: "Traditional Craftsmen & Master Artisans",
        slug: "traditional-craftsmen-master-artisans",
        desc: "Preserving ancient Indian art forms across centuries.",
        description: "Preserving ancient Indian art forms across centuries.",
        storiesCount: 19,
        stories: allStories.slice(1, 4),
        image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "col-3",
        name: "Grassroots Water Conservation Pioneers",
        title: "Grassroots Water Conservation Pioneers",
        slug: "grassroots-water-conservation-pioneers",
        desc: "How villages in dry zones brought rivers back to life.",
        description: "How villages in dry zones brought rivers back to life.",
        storiesCount: 12,
        stories: allStories.slice(2, 5),
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80",
      },
    ],
    historicalTimeline: [
      {
        era: "1947 — Independence",
        title: "Dawn of Modern India",
        desc: "Grassroots stories from the birth of democratic India.",
        stories: allStories.slice(0, 2),
      },
      {
        era: "1970s — Green Revolution",
        title: "Agricultural Transformation",
        desc: "How rural farmers pioneered food security.",
        stories: allStories.slice(1, 3),
      },
      {
        era: "2000s — Digital & Innovation",
        title: "Rural Tech & Social Enterprise",
        desc: "Modern Changemakers transforming village economies.",
        stories: allStories.slice(2, 4),
      },
    ],
    challenges: [
      {
        id: "ch-1",
        title: "7-Day Heritage Explorer Quest",
        slug: "7-day-heritage-explorer-quest",
        desc: "Read 7 historical stories across 7 different states.",
        description: "Read 7 historical stories across 7 different states.",
        prize: "Featured Showcase & 150 XP",
        rules: "Read 7 historical stories across 7 different states.",
        endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        xp: 150,
      },
      {
        id: "ch-2",
        title: "Grassroots Science Supporter",
        slug: "grassroots-science-supporter",
        desc: "Discover 5 rural inventors and social innovators.",
        description: "Discover 5 rural inventors and social innovators.",
        prize: "ISP Print Edition feature & 100 XP",
        rules: "Discover 5 rural inventors and social innovators.",
        endAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        xp: 100,
      },
    ],
    festivalStories: allStories.slice(0, 4),
    travelRoutes: [
      {
        id: "tr-1",
        name: "Jaipur — Jodhpur Craft Trail",
        title: "Jaipur — Jodhpur Craft Trail",
        region: "Rajasthan",
        desc: "Scenic craft and heritage trail across Rajasthan.",
        stopsCount: 5,
        states: ["Rajasthan", "Gujarat"],
        stories: allStories.slice(0, 3),
      },
      {
        id: "tr-2",
        name: "Varanasi Heritage & Temple Circuit",
        title: "Varanasi Heritage & Temple Circuit",
        region: "Uttar Pradesh",
        desc: "Ancient spiritual circuit along the Ganges.",
        stopsCount: 7,
        states: ["Uttar Pradesh", "Bihar"],
        stories: allStories.slice(1, 4),
      },
    ],
    mostLoved: allStories.slice(0, 4),
  };
}
