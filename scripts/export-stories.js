const fs = require("fs");
const path = require("path");

// Prisma exporter for stories-backup.json
// IMPORTANT: no scraping, no fetch(), no cheerio.

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const OUTPUT_PATH = path.join(process.cwd(), "public/data/stories-backup.json");

function formatReadTime(readingTime) {
  if (readingTime == null) return "";
  const n = Number(readingTime);
  if (!Number.isFinite(n) || n <= 0) return "";
  return `${n} min read`;
}

function pickImage(storyImages) {
  // storyImages is already ordered via include
  // rule: first hero image; otherwise first image; otherwise empty string
  if (!Array.isArray(storyImages) || storyImages.length === 0) {
    return { image: "", imageAlt: "" };
  }

  const hero = storyImages.find((img) => img && img.heroImage);
  const first = storyImages[0];
  const chosen = hero || first;

  return {
    image: chosen?.imageUrl || "",
    imageAlt: chosen?.caption || "",
  };
}

(async () => {
  try {
    const stories = await prisma.story.findMany({
      where: {
        status: "Published",
        deleted: false,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        titleHi: true,
        excerpt: true,
        excerptHi: true,
        content: true,
        contentHi: true,
        publishedAt: true,
        readingTime: true,
        featured: true,
        homepageSlideshow: true,
        slideshowOrder: true,
        author: {
          select: { name: true },
        },
        state: {
          select: { name: true },
        },
        themes: {
          select: {
            theme: {
              select: { name: true },
            },
          },
        },
        images: {
          // order so we can easily pick hero image first
          orderBy: [{ heroImage: "desc" }, { sortOrder: "asc" }],
          select: { imageUrl: true, caption: true, heroImage: true },
          take: 5,
        },
      },
    });

    const themesAll = new Set();

    const exportedStories = stories.map((s) => {
      const themes = Array.isArray(s.themes)
        ? s.themes.map((t) => t?.theme?.name).filter(Boolean)
        : [];

      for (const t of themes) themesAll.add(t);

      const category = themes.length > 0 ? themes[0] : "कहानी";
      const region = s.state?.name || "";
      const author = s.author?.name || "";
      const authorName = s.author?.name ?? "India Story Project";

      const { image, imageAlt } = pickImage(s.images);

      return {
        id: s.id,
        slug: s.slug,

        title: s.title,
        titleHi: s.titleHi,
        excerpt: s.excerpt,
        excerptHi: s.excerptHi,
        content: s.content,
        contentHi: s.contentHi,

        image,
        imageAlt,

        category,
        themes,

        region,
        author,
        authorName,

        publishDate: s.publishedAt?.toISOString() ?? "",
        readTime: formatReadTime(s.readingTime),

        featured: s.featured,
        homepageSlideshow: s.homepageSlideshow,
        slideshowOrder: s.slideshowOrder,

        url: s.slug,
      };
    });

    // Sort to stable output
    exportedStories.sort((a, b) => (a.slug || "").localeCompare(b.slug || ""));

    const categories = ["All", ...Array.from(themesAll).sort((a, b) => a.localeCompare(b))];

    const root = {
      fetchedAt: new Date().toISOString().slice(0, 10) /* ISO_DATE */, // matches “ISO_DATE” requirement
      categories,
      stories: exportedStories,
    };

    // NOTE: front-end expects categories and stories; fallback code reads story fields.
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(root, null, 2), "utf8");
    console.log(`Exported ${exportedStories.length} stories to ${OUTPUT_PATH}`);
  } finally {
    await prisma.$disconnect();
  }
})();

