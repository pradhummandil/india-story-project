import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const slugs = [
  "wonder-woman-of-india",
  "showing-the-natural-way",
  "a-journey-of-wanderlust-like-no-other",
  "son-of-walur"
];

for (const s of slugs) {
  const story = await prisma.story.findFirst({
    where: { slug: { contains: s } },
    select: { title: true, slug: true, images: { select: { imageUrl: true } } }
  });
  console.log(`Story: "${story?.title}"`);
  console.log(`  Images:`, story?.images.map(i => i.imageUrl));
}

await prisma.$disconnect();
