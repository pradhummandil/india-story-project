import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const settings = await prisma.siteSetting.findMany();
  console.log("SiteSettings in DB:");
  settings.forEach(s => {
    console.log(`- ${s.key}: ${s.value} (${s.label})`);
  });
  await prisma.$disconnect();
}
main();
