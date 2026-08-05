import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

console.log("=== FINAL MIGRATION VERIFICATION ===");

const totalStories = await prisma.story.count();
const notIdentifiableCount = await prisma.author.count({
  where: { name: { contains: "Not Identifiable", mode: "insensitive" } }
});

const totalAuthors = await prisma.author.count();
const ispAuthorCount = await prisma.story.count({
  where: { author: { name: "India Story Project" } }
});
const realAuthorStoryCount = totalStories - ispAuthorCount;

console.log(`Total stories in DB            : ${totalStories}`);
console.log(`Total unique authors in DB     : ${totalAuthors}`);
console.log(`Stories by REAL Authors        : ${realAuthorStoryCount}`);
console.log(`Stories by "India Story Project": ${ispAuthorCount}`);
console.log(`Authors named "Not Identifiable": ${notIdentifiableCount}`);

console.log("\n=== SPOT CHECK (10 Sample Stories) ===");
const sample = await prisma.story.findMany({
  take: 10,
  orderBy: { title: "asc" },
  select: {
    id: true,
    title: true,
    author: { select: { id: true, name: true } }
  }
});

for (const s of sample) {
  console.log(`  • "${s.title.substring(0, 45)}..." → By ${s.author?.name} (ID: ${s.author?.id})`);
}

await prisma.$disconnect();
