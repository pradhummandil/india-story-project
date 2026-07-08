import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking tables...");
  try {
    const tables = await prisma.$queryRawUnsafe(`
      SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
    `);
    console.log("Tables list:", tables);
  } catch (e) {
    console.error("Error checking tables:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
