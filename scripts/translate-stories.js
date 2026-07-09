import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function translateText(text, from = "en", to = "hi") {
  if (!text || !text.trim()) return "";
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Translation API failed");
    const json = await res.json();
    return json[0].map(item => item[0]).join("");
  } catch (e) {
    console.error(`Translation error for text: "${text.slice(0, 30)}..."`, e);
    return "";
  }
}

async function main() {
  console.log("Starting story translation migration...");
  const stories = await prisma.story.findMany();
  console.log(`Found ${stories.length} stories to process.`);

  let updatedCount = 0;

  for (const story of stories) {
    let needsUpdate = false;
    const updateData = {};

    if (!story.titleHi || !story.titleHi.trim()) {
      console.log(`Translating title for story: "${story.title}"`);
      const trans = await translateText(story.title);
      if (trans) {
        updateData.titleHi = trans;
        needsUpdate = true;
      }
    }

    if (!story.excerptHi || !story.excerptHi.trim()) {
      console.log(`Translating excerpt for story: "${story.title}"`);
      const trans = await translateText(story.excerpt);
      if (trans) {
        updateData.excerptHi = trans;
        needsUpdate = true;
      }
    }

    if (!story.contentHi || !story.contentHi.trim()) {
      console.log(`Translating content for story: "${story.title}"`);
      // Since content might be very long, split by paragraph to not hit translate limits
      const paragraphs = story.content.split("\n");
      const translatedParas = [];
      for (const para of paragraphs) {
        if (para.trim()) {
          const trans = await translateText(para);
          translatedParas.push(trans || para);
        } else {
          translatedParas.push("");
        }
      }
      updateData.contentHi = translatedParas.join("\n");
      needsUpdate = true;
    }

    if (needsUpdate) {
      await prisma.story.update({
        where: { id: story.id },
        data: updateData,
      });
      console.log(`✅ Updated story: "${story.title}" with Hindi translations.`);
      updatedCount++;
    }
  }

  console.log(`Migration completed. Translated and updated ${updatedCount} stories.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
