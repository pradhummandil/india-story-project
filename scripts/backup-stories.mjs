import { PrismaClient } from "@prisma/client";
import { writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

console.log("Creating backup of all stories before language fix...");

const stories = await prisma.story.findMany({
  select: {
    id: true,
    title: true,
    titleHi: true,
    excerpt: true,
    excerptHi: true,
    content: true,
    contentHi: true,
    seoTitle: true,
    seoDescription: true,
    status: true,
    slug: true,
  }
});

const backupPath = path.join(__dirname, "backup-before-fix.json");
await writeFile(backupPath, JSON.stringify(stories, null, 2), "utf-8");
console.log("Backup saved to: " + backupPath);
console.log("Total stories backed up: " + stories.length);

await prisma.$disconnect();
