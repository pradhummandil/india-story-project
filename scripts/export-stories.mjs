/**
 * READ-ONLY export script
 * Exports every Story from the database with:
 *   - Story Title, Author Name, Published Date, State, Theme(s), Story ID, Status
 *
 * Outputs:
 *   stories_with_authors.csv
 *   stories_with_authors.json
 *
 * Usage:  node scripts/export-stories.mjs
 */

import { PrismaClient } from "@prisma/client";
import { writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, "..");          // project root

const CSV_PATH  = path.join(OUTPUT_DIR, "stories_with_authors.csv");
const JSON_PATH = path.join(OUTPUT_DIR, "stories_with_authors.json");

// helpers

function escapeCsvField(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatDate(date) {
  if (!date) return "";
  return new Date(date).toISOString().replace("T", " ").split(".")[0];
}

// main

const prisma = new PrismaClient();

async function main() {
  console.log("Connecting to database ...");

  const stories = await prisma.story.findMany({
    select: {
      id:          true,
      title:       true,
      publishedAt: true,
      status:      true,
      deleted:     true,
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
    },
    orderBy: [
      { publishedAt: "desc" },
      { title:       "asc"  },
    ],
  });

  console.log("Fetched " + stories.length + " stories from the database.");

  const rows = stories.map((s) => ({
    storyId:       s.id,
    title:         s.title                           ?? "Untitled",
    author:        s.author?.name                   ?? "Unknown",
    publishedDate: formatDate(s.publishedAt),
    state:         s.state?.name                    ?? "",
    theme:         s.themes.map((t) => t.theme.name).join(" | ") || "",
    status:        s.status                          ?? "",
    deleted:       s.deleted ? "Yes" : "No",
  }));

  const CSV_HEADER = [
    "Story Title",
    "Author Name",
    "Published Date",
    "State",
    "Theme",
    "Story ID",
    "Status",
    "Deleted",
  ].join(",");

  const csvLines = [
    CSV_HEADER,
    ...rows.map((r) =>
      [
        r.title,
        r.author,
        r.publishedDate,
        r.state,
        r.theme,
        r.storyId,
        r.status,
        r.deleted,
      ]
        .map(escapeCsvField)
        .join(",")
    ),
  ];

  await writeFile(CSV_PATH, csvLines.join("\n"), "utf-8");
  console.log("CSV written -> " + CSV_PATH);

  const jsonData = rows.map((r) => ({
    title:         r.title,
    author:        r.author,
    publishedDate: r.publishedDate,
    state:         r.state,
    theme:         r.theme,
    storyId:       r.storyId,
    status:        r.status,
    deleted:       r.deleted,
  }));

  await writeFile(JSON_PATH, JSON.stringify(jsonData, null, 2), "utf-8");
  console.log("JSON written -> " + JSON_PATH);

  const uniqueAuthors = new Set(rows.map((r) => r.author)).size;

  console.log("\n===================================================");
  console.log("  EXPORT SUMMARY");
  console.log("===================================================");
  console.log("  Total stories exported : " + rows.length);
  console.log("  Total unique authors   : " + uniqueAuthors);
  console.log("  CSV  -> " + CSV_PATH);
  console.log("  JSON -> " + JSON_PATH);
  console.log("===================================================\n");
}

main()
  .catch((err) => {
    console.error("Export failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
