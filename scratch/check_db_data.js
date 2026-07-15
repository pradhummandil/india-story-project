import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const storiesCount = await prisma.story.count();
    console.log("Stories Count:", storiesCount);

    const statesCount = await prisma.state.count();
    console.log("States Count:", statesCount);

    const themesCount = await prisma.theme.count();
    console.log("Themes Count:", themesCount);

    const sampleStories = await prisma.story.findMany({
      take: 5,
      include: {
        state: true,
        themes: {
          include: {
            theme: true
          }
        }
      }
    });
    console.log("Sample Stories in DB:");
    sampleStories.forEach(s => {
      console.log(`- Slug: ${s.slug}, Title: ${s.title}, State: ${s.state?.name}, Themes: ${s.themes.map(t => t.theme?.name).join(", ")}`);
    });
  } catch (e) {
    console.error("Error checking database:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
