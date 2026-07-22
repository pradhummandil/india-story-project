import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const profiles = await prisma.profile.findMany();
  const userProfiles = await prisma.userProfile.findMany();
  
  console.log("=== PROFILES TABLE ===");
  console.log(profiles.map(p => ({ id: p.id, email: p.email, role: p.role })));
  
  console.log("=== USER_PROFILE TABLE ===");
  console.log(userProfiles.map(u => ({ id: u.id, email: u.email, role: u.role })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
