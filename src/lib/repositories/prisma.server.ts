import { PrismaClient } from "@prisma/client";

type PrismaClientInstance = InstanceType<typeof PrismaClient>;

const globalForPrisma = globalThis as typeof globalThis & {
  indiaStoryPrisma?: PrismaClientInstance;
};

console.time("Prisma Client Init");
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
console.timeEnd("Prisma Client Init");

prismaClient.$on("query", (e: any) => {
  const isSlow = e.duration > 200;
  
  // Record in-memory metrics
  try {
    const { recordDbMetric } = require("../metrics");
    recordDbMetric(e.query, e.duration);
  } catch (err) {
    // Prevent metrics capture from disrupting query database flow
  }

  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: isSlow ? "warn" : "info",
      service: "prisma",
      message: isSlow ? `Slow query detected (>200ms): ${e.duration}ms` : "Query executed",
      duration: e.duration,
      sql: e.query,
      params: e.params,
    })
  );
});

prismaClient.$on("info", (e: any) => {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "info",
      service: "prisma",
      message: e.message,
    })
  );
});

prismaClient.$on("warn", (e: any) => {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "warn",
      service: "prisma",
      message: e.message,
    })
  );
});

prismaClient.$on("error", (e: any) => {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "error",
      service: "prisma",
      message: e.message,
    })
  );
});

export const prisma = prismaClient;

globalForPrisma.indiaStoryPrisma = prismaClient;
