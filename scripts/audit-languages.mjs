import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function isHindi(text) {
  if (!text) return false;
  const matches = (text.match(/[\u0900-\u097F]/g) || []).length;
  return matches / text.length > 0.1;
}

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
    status: true,
  }
});

let titleHindiInEn = 0, titleHiEmpty = 0, titleHiInEn = 0;
let excerptHindiInEn = 0, excerptHiEmpty = 0;
let contentHindiInEn = 0, contentHiEmpty = 0;
let seoTitleHindi = 0, seoTitleMismatch = 0, seoTitleEmpty = 0;

for (const s of stories) {
  if (isHindi(s.title)) titleHindiInEn++;
  if (!s.titleHi) titleHiEmpty++;
  if (s.titleHi && !isHindi(s.titleHi)) titleHiInEn++;
  
  if (isHindi(s.excerpt)) excerptHindiInEn++;
  if (!s.excerptHi) excerptHiEmpty++;
  
  if (isHindi(s.content)) contentHindiInEn++;
  if (!s.contentHi) contentHiEmpty++;
  
  if (!s.seoTitle) seoTitleEmpty++;
  else if (isHindi(s.seoTitle)) seoTitleHindi++;
  else if (s.seoTitle !== s.title) seoTitleMismatch++;
}

console.log("=== LANGUAGE AUDIT (" + stories.length + " total stories) ===");
console.log("\n-- TITLE (English field) --");
console.log("  Hindi text in English title field:", titleHindiInEn);
console.log("  titleHi (Hindi) is empty/null:   ", titleHiEmpty);
console.log("  titleHi has English text:         ", titleHiInEn);
console.log("\n-- EXCERPT --");
console.log("  Hindi text in English excerpt:    ", excerptHindiInEn);
console.log("  excerptHi is empty/null:          ", excerptHiEmpty);
console.log("\n-- CONTENT --");
console.log("  Hindi text in English content:    ", contentHindiInEn);
console.log("  contentHi is empty/null:          ", contentHiEmpty);
console.log("\n-- SEO TITLE --");
console.log("  seoTitle is empty/null:           ", seoTitleEmpty);
console.log("  seoTitle has Hindi text:          ", seoTitleHindi);
console.log("  seoTitle != title (mismatch):     ", seoTitleMismatch);

await prisma.$disconnect();
