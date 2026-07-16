import { PrismaClient } from "@prisma/client";

type PrismaClientInstance = InstanceType<typeof PrismaClient>;

const globalForPrisma = globalThis as typeof globalThis & {
  indiaStoryPrisma?: PrismaClientInstance;
};

const prismaClient =
  globalForPrisma.indiaStoryPrisma ??
  new PrismaClient({
    log: [
      { emit: "event", level: "query" },
      { emit: "event", level: "info" },
      { emit: "event", level: "warn" },
      { emit: "event", level: "error" },
    ],
  });

prismaClient.$on("query", (e) => {
  console.log("[PRISMA][query]", {
    durationMs: e.duration,
    target: e.target,
    sql: e.query,
    params: e.params,
  });
});

export const prisma = prismaClient;

globalForPrisma.indiaStoryPrisma = prismaClient;
