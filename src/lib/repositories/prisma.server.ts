import { PrismaClient } from "@/generated/prisma/client.ts";

type PrismaClientInstance = InstanceType<typeof PrismaClient>;

const globalForPrisma = globalThis as typeof globalThis & {
  indiaStoryPrisma?: PrismaClientInstance;
};

export const prisma = globalForPrisma.indiaStoryPrisma ?? new PrismaClient();

globalForPrisma.indiaStoryPrisma = prisma;
