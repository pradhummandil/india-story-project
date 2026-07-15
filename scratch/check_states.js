import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const states = await prisma.state.findMany({
      select: {
        id: true,
        name: true,
        slug: true
      }
    });
    console.log("States in DB:", states.map(s => `${s.name} (${s.slug})`));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
