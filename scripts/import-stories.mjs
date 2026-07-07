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
const { PrismaClient, StoryStatus } = await jiti.import("../src/generated/prisma/client.ts");

const prisma = new PrismaClient();

const report = {
  totalStoriesProcessed: 0,
  storiesCreated: 0,
  storiesUpdated: 0,
  authorsCreated: 0,
  categoriesCreated: 0,
  themesCreated: 0,
  statesCreated: 0,
  citiesCreated: 0,
  tagsCreated: 0,
  imagesCreated: 0,
  failedStories: [],
};

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

async function findOrCreateAuthor(tx, name) {
  const existing = await tx.author.findFirst({ where: { name } });
  if (existing) return existing;

  const created = await tx.author.create({ data: { name } });
  report.authorsCreated += 1;
  return created;
}

async function upsertBySlug(tx, model, label, fallback, createExtra = {}) {
  const name = cleanString(label) || fallback;
  const slug = slugify(name, fallback.toLowerCase());
  const existing = await tx[model].findUnique({ where: { slug } });

  if (!existing) {
    const created = await tx[model].create({
      data: {
        name,
        slug,
        ...createExtra,
      },
    });

    return { record: created, created: true };
  }

  const updated = await tx[model].update({
    where: { slug },
    data: {
      name,
      ...createExtra,
    },
  });

  return { record: updated, created: false };
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
  const categoryName = cleanString(raw.category) || "All";
  const themeName = cleanString(raw.theme) || categoryName || "General";
  const stateName = cleanString(raw.region) || "India";
  const cityName = cleanString(raw.city);
  const imageUrl = cleanString(raw.image);
  const imageAlt = cleanString(raw.imageAlt);
  const sourceId = cleanString(raw.url) || slug;
  const publishedAt = parseDate(raw.publishDate);
  const tagNames = [...new Set([categoryName, themeName, stateName].filter(Boolean))];

  return await prisma.$transaction(async (tx) => {
    const existingStory = await tx.story.findUnique({ where: { slug } });

    const author = await findOrCreateAuthor(tx, authorName);

    const categoryResult = await upsertBySlug(tx, "category", categoryName, "Category");
    if (categoryResult.created) report.categoriesCreated += 1;

    const themeResult = await upsertBySlug(tx, "theme", themeName, "Theme");
    if (themeResult.created) report.themesCreated += 1;

    const stateResult = await upsertBySlug(tx, "state", stateName, "State");
    if (stateResult.created) report.statesCreated += 1;

    let city = null;
    if (cityName) {
      const citySlug = slugify(`${cityName}-${stateResult.record.slug}`, "city");
      const existingCity = await tx.city.findUnique({ where: { slug: citySlug } });

      if (existingCity) {
        city = await tx.city.update({
          where: { slug: citySlug },
          data: {
            name: cityName,
            stateId: stateResult.record.id,
          },
        });
      } else {
        city = await tx.city.create({
          data: {
            name: cityName,
            slug: citySlug,
            stateId: stateResult.record.id,
          },
        });
        report.citiesCreated += 1;
      }
    }

    const tags = [];
    for (const tagName of tagNames) {
      const tagResult = await upsertBySlug(tx, "tag", tagName, "Tag");
      if (tagResult.created) report.tagsCreated += 1;
      tags.push(tagResult.record);
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
      categoryId: categoryResult.record.id,
      themeId: themeResult.record.id,
      stateId: stateResult.record.id,
      cityId: city?.id ?? null,
    };

    const story = existingStory
      ? await tx.story.update({
          where: { slug },
          data: storyData,
        })
      : await tx.story.create({
          data: storyData,
        });

    if (existingStory) {
      report.storiesUpdated += 1;
    } else {
      report.storiesCreated += 1;
    }

    await tx.storyTag.deleteMany({ where: { storyId: story.id } });
    for (const tag of tags) {
      await tx.storyTag.create({
        data: {
          storyId: story.id,
          tagId: tag.id,
        },
      });
    }

    if (imageUrl) {
      const existingImage = await tx.storyImage.findUnique({
        where: {
          storyId_sortOrder: {
            storyId: story.id,
            sortOrder: 0,
          },
        },
      });

      await tx.storyImage.upsert({
        where: {
          storyId_sortOrder: {
            storyId: story.id,
            sortOrder: 0,
          },
        },
        create: {
          storyId: story.id,
          imageUrl,
          caption: imageAlt || null,
          sortOrder: 0,
          heroImage: true,
        },
        update: {
          imageUrl,
          caption: imageAlt || null,
          heroImage: true,
        },
      });

      if (!existingImage) report.imagesCreated += 1;
    }

    return story;
  });
}

async function main() {
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
  console.log(`Categories created: ${report.categoriesCreated}`);
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
