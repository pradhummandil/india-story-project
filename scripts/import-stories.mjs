import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import "dotenv/config";
import { createJiti } from "jiti";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const storiesPath = path.join(rootDir, "stories.json");

const jiti = createJiti(import.meta.url);
const { PrismaClient, StoryStatus } = await jiti.import("@prisma/client");

const prisma = new PrismaClient();

const report = {
  totalStoriesProcessed: 0,
  storiesCreated: 0,
  storiesUpdated: 0,
  authorsCreated: 0,
  themesCreated: 0,
  statesCreated: 0,
  citiesCreated: 0,
  tagsCreated: 0,
  imagesCreated: 0,
  failedStories: [],
};

// Cache Maps
const authorCache = new Map();
const themeCache = new Map();
const stateCache = new Map();
const cityCache = new Map();
const tagCache = new Map();

// Helper to pre-populate caches
async function hydrateCaches() {
  const [authors, themes, states, cities, tags] = await Promise.all([
    prisma.author.findMany(),
    prisma.theme.findMany(),
    prisma.state.findMany(),
    prisma.city.findMany(),
    prisma.tag.findMany(),
  ]);

  for (const a of authors) {
    authorCache.set(a.name, a);
  }
  for (const t of themes) {
    themeCache.set(t.slug, t);
  }
  for (const s of states) {
    stateCache.set(s.slug, s);
  }
  for (const c of cities) {
    cityCache.set(c.slug, c);
  }
  for (const t of tags) {
    tagCache.set(t.slug, t);
  }
}

function asObject(value) {
  return value != null && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function requiredString(story, key) {
  const value = cleanString(story[key]);
  if (!value) {
    throw new Error(`Missing required field: ${key}`);
  }
  return value;
}

function hashString(input) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function slugify(value, fallback) {
  const cleaned = cleanString(value)
    .normalize("NFKD")
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return cleaned || `${fallback}-${hashString(String(value || fallback))}`;
}

function parseDate(value) {
  const raw = cleanString(value);
  if (!raw) return null;

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function readingTimeFor(content) {
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

async function findOrCreateAuthor(name) {
  if (authorCache.has(name)) {
    return authorCache.get(name);
  }

  // Author name isn't unique in schema, but we query to prevent duplicate records in this run
  let existing = await prisma.author.findFirst({ where: { name } });
  if (!existing) {
    existing = await prisma.author.create({ data: { name } });
    report.authorsCreated += 1;
  }
  authorCache.set(name, existing);
  return existing;
}

async function getOrCreateTheme(name) {
  const slug = slugify(name, "theme");
  if (themeCache.has(slug)) {
    return themeCache.get(slug);
  }

  const existing = themeCache.has(slug);
  const theme = await prisma.theme.upsert({
    where: { slug },
    update: { name },
    create: { name, slug },
  });

  if (!existing) {
    report.themesCreated += 1;
  }
  themeCache.set(slug, theme);
  return theme;
}

async function getOrCreateState(name) {
  const slug = slugify(name, "state");
  if (stateCache.has(slug)) {
    return stateCache.get(slug);
  }

  const existing = stateCache.has(slug);
  const state = await prisma.state.upsert({
    where: { slug },
    update: { name },
    create: { name, slug },
  });

  if (!existing) {
    report.statesCreated += 1;
  }
  stateCache.set(slug, state);
  return state;
}

async function getOrCreateCity(name, stateId, stateSlug) {
  const slug = slugify(`${name}-${stateSlug}`, "city");
  if (cityCache.has(slug)) {
    return cityCache.get(slug);
  }

  const existing = cityCache.has(slug);
  const city = await prisma.city.upsert({
    where: { slug },
    update: { name, stateId },
    create: { name, slug, stateId },
  });

  if (!existing) {
    report.citiesCreated += 1;
  }
  cityCache.set(slug, city);
  return city;
}

async function getOrCreateTag(name) {
  const slug = slugify(name, "tag");
  if (tagCache.has(slug)) {
    return tagCache.get(slug);
  }

  const existing = tagCache.has(slug);
  const tag = await prisma.tag.upsert({
    where: { slug },
    update: { name },
    create: { name, slug },
  });

  if (!existing) {
    report.tagsCreated += 1;
  }
  tagCache.set(slug, tag);
  return tag;
}

async function importStory(rawStory) {
  const raw = asObject(rawStory);
  if (!raw) {
    throw new Error("Story record is not an object");
  }

  const slug = slugify(requiredString(raw, "slug"), "story");
  const title = requiredString(raw, "title");
  const excerpt = requiredString(raw, "excerpt");
  const content = requiredString(raw, "content");

  const authorName = cleanString(raw.author) || "India Story Project";
  const themeName = cleanString(raw.theme) || cleanString(raw.category) || "General";
  const stateName = cleanString(raw.region) || "India";
  const cityName = cleanString(raw.city);
  const imageUrl = cleanString(raw.image);
  const imageAlt = cleanString(raw.imageAlt);
  const sourceId = cleanString(raw.url) || slug;
  const publishedAt = parseDate(raw.publishDate);
  const tagNames = [...new Set([themeName, stateName].filter(Boolean))];

  const author = await findOrCreateAuthor(authorName);
  const theme = await getOrCreateTheme(themeName);
  const state = await getOrCreateState(stateName);

  let city = null;
  if (cityName) {
    city = await getOrCreateCity(cityName, state.id, state.slug);
  }

  const tags = [];
  for (const tagName of tagNames) {
    const tag = await getOrCreateTag(tagName);
    tags.push(tag);
  }

  const storyData = {
    sourceId,
    slug,
    title,
    excerpt,
    content,
    publishedAt,
    readingTime: readingTimeFor(content),
    seoTitle: title,
    seoDescription: excerpt,
    featured: false,
    heroOfTheDay: false,
    status: StoryStatus.Published,
    authorId: author.id,
    stateId: state.id,
    cityId: city?.id ?? null,
  };

  const existingStory = await prisma.story.findUnique({ where: { slug }, select: { id: true } });

  const story = await prisma.story.upsert({
    where: { slug },
    update: storyData,
    create: storyData,
  });

  if (existingStory) {
    report.storiesUpdated += 1;
  } else {
    report.storiesCreated += 1;
  }

  // Link Theme to Story
  await prisma.storyTheme.upsert({
    where: {
      storyId_themeId: {
        storyId: story.id,
        themeId: theme.id,
      },
    },
    update: {},
    create: {
      storyId: story.id,
      themeId: theme.id,
    },
  });

  // Link Tags to Story
  for (const tag of tags) {
    await prisma.storyTag.upsert({
      where: {
        storyId_tagId: {
          storyId: story.id,
          tagId: tag.id,
        },
      },
      update: {},
      create: {
        storyId: story.id,
        tagId: tag.id,
      },
    });
  }

  // Link Image to Story
  if (imageUrl) {
    const image = await prisma.storyImage.upsert({
      where: {
        storyId_sortOrder: {
          storyId: story.id,
          sortOrder: 0,
        },
      },
      update: {
        imageUrl,
        caption: imageAlt || null,
        heroImage: true,
      },
      create: {
        storyId: story.id,
        imageUrl,
        caption: imageAlt || null,
        sortOrder: 0,
        heroImage: true,
      },
    });

    const isNewImage = !existingStory;
    if (isNewImage) {
      report.imagesCreated += 1;
    }
  }

  return story;
}

async function main() {
  await hydrateCaches();

  const parsed = JSON.parse(fs.readFileSync(storiesPath, "utf8"));
  const stories = Array.isArray(parsed?.stories) ? parsed.stories : [];

  for (const rawStory of stories) {
    const slug = cleanString(asObject(rawStory)?.slug) || "(missing slug)";
    report.totalStoriesProcessed += 1;

    try {
      await importStory(rawStory);
    } catch (error) {
      report.failedStories.push({
        slug,
        error: error instanceof Error ? error.message : String(error),
      });
      console.error(`Skipped story ${slug}: ${report.failedStories.at(-1).error}`);
    }
  }

  console.log("");
  console.log("Import report");
  console.log(`Total stories processed: ${report.totalStoriesProcessed}`);
  console.log(`Stories created: ${report.storiesCreated}`);
  console.log(`Stories updated: ${report.storiesUpdated}`);
  console.log(`Authors created: ${report.authorsCreated}`);
  console.log(`Themes created: ${report.themesCreated}`);
  console.log(`States created: ${report.statesCreated}`);
  console.log(`Cities created: ${report.citiesCreated}`);
  console.log(`Tags created: ${report.tagsCreated}`);
  console.log(`Images created: ${report.imagesCreated}`);
  console.log(`Failed stories: ${report.failedStories.length}`);

  if (report.failedStories.length > 0) {
    console.log("");
    console.log("Failed story details");
    for (const failure of report.failedStories) {
      console.log(`- ${failure.slug}: ${failure.error}`);
    }
  }
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
