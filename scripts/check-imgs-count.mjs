import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const imgs = await prisma.storyImage.findMany({ select: { imageUrl: true } });

let cloudinaryCount = 0;
let wpCount = 0;
let supabaseCount = 0;
let otherCount = 0;

for (const i of imgs) {
  const url = i.imageUrl || "";
  if (url.includes("cloudinary")) cloudinaryCount++;
  else if (url.includes("indiastoryproject.com") || url.includes("wp-content")) wpCount++;
  else if (url.includes("supabase")) supabaseCount++;
  else otherCount++;
}

console.log(`Total images in DB : ${imgs.length}`);
console.log(`Cloudinary images  : ${cloudinaryCount}`);
console.log(`WordPress images   : ${wpCount}`);
console.log(`Supabase images    : ${supabaseCount}`);
console.log(`Other images       : ${otherCount}`);

await prisma.$disconnect();
