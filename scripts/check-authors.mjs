import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const authors = await prisma.author.findMany();
console.log("Total authors in DB:", authors.length);
for (const a of authors) {
  console.log(`  ID: ${a.id} | Name: "${a.name}"`);
}

await prisma.$disconnect();
