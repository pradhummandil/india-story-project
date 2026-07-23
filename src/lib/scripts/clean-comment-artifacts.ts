import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function sanitize(text: string | null | undefined): string | null {
  if (!text) return text ?? null;

  let clean = text
    .replace(/(?:Comment|Leave a Reply|Post Comment|Cancel reply)\s*[\r\n]+Name\s*\*\s*[\r\n]+Email\s*\*\s*[\r\n]+Save my name, email, and website in this browser for the next time I comment\.?/gi, "")
    .replace(/(?:Comment|Leave a Reply|Post Comment|Cancel reply)\s*[\r\n]+Name\s*\*\s*[\r\n]+Email\s*\*/gi, "")
    .replace(/Save my name, email, and website in this browser for the next time I comment\.?/gi, "")
    .replace(/Your email address will not be published\.\s*Required fields are marked\s*\*/gi, "");

  const lines = clean.split("\n");
  const filteredLines = lines.filter((line) => {
    const trimmed = line.trim();
    if (/^Comment$/i.test(trimmed)) return false;
    if (/^Name\s*\*?$/i.test(trimmed)) return false;
    if (/^Email\s*\*?$/i.test(trimmed)) return false;
    if (/^Website$/i.test(trimmed)) return false;
    if (/^Save my name, email, and website in this browser/i.test(trimmed)) return false;
    if (/^Leave a Reply$/i.test(trimmed)) return false;
    if (/^Post Comment$/i.test(trimmed)) return false;
    if (/^Cancel reply$/i.test(trimmed)) return false;
    if (/^Required fields are marked/i.test(trimmed)) return false;
    return true;
  });

  return filteredLines.join("\n").trim();
}

async function main() {
  console.log("Cleaning database story content...");
  const stories = await prisma.story.findMany();
  let updatedCount = 0;

  for (const story of stories) {
    const newContent = sanitize(story.content);
    const newContentHi = sanitize(story.contentHi);

    if (newContent !== story.content || newContentHi !== story.contentHi) {
      await prisma.story.update({
        where: { id: story.id },
        data: {
          content: newContent ?? "",
          contentHi: newContentHi,
        },
      });
      updatedCount++;
      console.log(`Cleaned story: ${story.slug}`);
    }
  }

  console.log(`Successfully cleaned ${updatedCount} / ${stories.length} stories in the database.`);
}

main()
  .catch((e) => {
    console.error("Cleanup error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
