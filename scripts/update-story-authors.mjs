import xlsx from "xlsx";
import { PrismaClient } from "@prisma/client";

const isDryRun = process.argv.includes("--dry-run");
const prisma = new PrismaClient();
const EXCEL_PATH = "C:/Users/pradh/Downloads/ISP_Stories_With_Authors_FINAL.xlsx";

async function main() {
  console.log("=================================================");
  console.log(`  STORY AUTHORS MIGRATION ${isDryRun ? "(DRY RUN)" : "(LIVE UPDATE)"}`);
  console.log("=================================================");

  const wb = xlsx.readFile(EXCEL_PATH);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);
  console.log(`📄 Loaded ${rows.length} rows from spreadsheet.`);

  // Load existing authors
  const existingAuthors = await prisma.author.findMany();
  const authorMap = new Map();
  for (const a of existingAuthors) {
    authorMap.set(a.name.toLowerCase().trim(), a);
  }

  let defaultAuthor = authorMap.get("india story project");
  if (!defaultAuthor) {
    if (!isDryRun) {
      defaultAuthor = await prisma.author.create({ data: { name: "India Story Project" } });
      authorMap.set("india story project", defaultAuthor);
    } else {
      defaultAuthor = { id: "mock-default-id", name: "India Story Project" };
    }
  }
  console.log(`✅ Default author 'India Story Project' ID: ${defaultAuthor.id}`);

  // Load DB stories
  const dbStories = await prisma.story.findMany({ select: { id: true } });
  const dbStoryIdSet = new Set(dbStories.map(s => s.id));
  console.log(`🗄️ Database contains ${dbStories.length} stories.`);

  // Phase 1: Collect unique real author names to create
  const realNamesToCreate = new Set();
  const storyUpdates = []; // { storyId, authorName }

  let realAuthorCount = 0;
  let defaultAuthorCount = 0;
  let skippedCount = 0;
  let notFoundInDbCount = 0;

  for (const row of rows) {
    const storyId = String(row["Story ID"] || "").trim();
    const matchedAuthorName = String(row["Matched Author Name"] || "").trim();
    const matchConfidence = String(row["Match Confidence"] || "").trim();

    if (matchConfidence === "No match found - needs manual research") {
      skippedCount++;
      continue;
    }

    if (!dbStoryIdSet.has(storyId)) {
      notFoundInDbCount++;
      console.log(`❌ Story ID ${storyId} not found in DB!`);
      continue;
    }

    const isRealName = matchedAuthorName && 
                       matchedAuthorName.toLowerCase() !== "not identifiable" && 
                       matchedAuthorName.toLowerCase() !== "india story project";

    if (isRealName) {
      realAuthorCount++;
      const key = matchedAuthorName.toLowerCase().trim();
      if (!authorMap.has(key)) {
        realNamesToCreate.add(matchedAuthorName);
      }
      storyUpdates.push({ storyId, authorName: matchedAuthorName });
    } else {
      defaultAuthorCount++;
      storyUpdates.push({ storyId, authorName: "India Story Project" });
    }
  }

  console.log(`\n📌 Found ${realNamesToCreate.size} missing Author records to create.`);

  // Phase 2: Create new authors in DB using createMany
  if (!isDryRun && realNamesToCreate.size > 0) {
    console.log("Creating author records in bulk...");
    await prisma.author.createMany({
      data: Array.from(realNamesToCreate).map(name => ({ name })),
      skipDuplicates: true
    });
    // Re-fetch all authors to populate authorMap with IDs
    const updatedAuthors = await prisma.author.findMany();
    for (const a of updatedAuthors) {
      authorMap.set(a.name.toLowerCase().trim(), a);
    }
    console.log(`✅ Bulk author creation complete. Total authors in DB: ${updatedAuthors.length}`);
  }

  // Phase 3: Update stories in DB using fast concurrency
  if (!isDryRun) {
    console.log(`Updating ${storyUpdates.length} stories in database...`);
    const chunkSize = 20;
    for (let i = 0; i < storyUpdates.length; i += chunkSize) {
      const chunk = storyUpdates.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(u => {
          const author = authorMap.get(u.authorName.toLowerCase().trim());
          return prisma.story.update({
            where: { id: u.storyId },
            data: { authorId: author.id }
          });
        })
      );
    }
    console.log("✅ All story author links updated successfully!");
  }

  console.log("\n=================================================");
  console.log(`  MIGRATION SUMMARY ${isDryRun ? "(DRY RUN)" : "(EXECUTED SUCCESS)"}`);
  console.log("=================================================");
  console.log(`  Total rows evaluated                : ${rows.length}`);
  console.log(`  Stories updated to REAL authors    : ${realAuthorCount}`);
  console.log(`  Stories set to "India Story Project": ${defaultAuthorCount}`);
  console.log(`  Stories SKIPPED (Needs research)   : ${skippedCount}`);
  console.log(`  Stories not found in DB             : ${notFoundInDbCount}`);
  console.log(`  New Author records created          : ${realNamesToCreate.size}`);
  console.log("=================================================\n");
}

main()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
