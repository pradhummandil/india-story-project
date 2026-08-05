import xlsx from "xlsx";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const wb = xlsx.readFile("C:/Users/pradh/Downloads/ISP_Stories_With_Authors_FINAL.xlsx");
const sheetName = wb.SheetNames[0];
const rows = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);

console.log("=== SPREADSHEET ANALYSIS ===");
console.log("Total rows in sheet:", rows.length);

const dbStories = await prisma.story.findMany({ select: { id: true } });
const dbStoryIdSet = new Set(dbStories.map(s => s.id));
console.log("Total stories in DB:", dbStories.length);

let realAuthorCount = 0;
let defaultPlaceholderCount = 0;
let skipCount = 0;
let notFoundInDb = 0;
let foundInDb = 0;

const confidenceCounts = {};
const authorNameMap = new Map();

for (const row of rows) {
  const storyId = String(row["Story ID"] || "").trim();
  const matchedAuthor = String(row["Matched Author Name"] || "").trim();
  const matchConfidence = String(row["Match Confidence"] || "").trim();

  confidenceCounts[matchConfidence] = (confidenceCounts[matchConfidence] || 0) + 1;

  if (matchConfidence === "No match found - needs manual research") {
    skipCount++;
    continue;
  }

  const isRealName = matchedAuthor && 
                     matchedAuthor.toLowerCase() !== "not identifiable" && 
                     matchedAuthor.toLowerCase() !== "india story project";

  if (isRealName) {
    realAuthorCount++;
    authorNameMap.set(matchedAuthor, (authorNameMap.get(matchedAuthor) || 0) + 1);
  } else {
    defaultPlaceholderCount++;
  }

  if (dbStoryIdSet.has(storyId)) {
    foundInDb++;
  } else {
    notFoundInDb++;
    console.log(`⚠️  Story ID in spreadsheet not found in DB: ${storyId} ("${row["Story Title"]}")`);
  }
}

console.log("\n=== MATCH CONFIDENCE BREAKDOWN ===");
console.table(confidenceCounts);

console.log("\n=== PLANNED ACTION SUMMARY ===");
console.log("Stories to update with REAL Author Name:", realAuthorCount);
console.log("Stories to set/keep as 'India Story Project':", defaultPlaceholderCount);
console.log("Stories to SKIP (No match found - manual research):", skipCount);
console.log("Total rows to process:", realAuthorCount + defaultPlaceholderCount);
console.log("Found in DB:", foundInDb);
console.log("Not found in DB:", notFoundInDb);

console.log("\n=== TOP REAL AUTHORS TO BE CREATED/LINKED ===");
const sortedAuthors = [...authorNameMap.entries()].sort((a, b) => b[1] - a[1]);
console.table(sortedAuthors.slice(0, 15).map(([name, count]) => ({ AuthorName: name, Count: count })));
console.log("Total unique real author names:", sortedAuthors.length);

await prisma.$disconnect();
