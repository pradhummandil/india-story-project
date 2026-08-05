import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const imgs = await prisma.storyImage.findMany({ take: 10, select: { imageUrl: true } });
console.log("Sample Image URLs in DB:");
for (const i of imgs) {
  console.log("  ", i.imageUrl);
}
await prisma.$disconnect();
