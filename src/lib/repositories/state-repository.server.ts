import { prisma } from "./prisma.server";

export class StateRepository {
  constructor(private readonly db = prisma) {}

  async findBySlug(slug: string) {
    return this.db.state.findUnique({
      where: { slug },
    });
  }

  async listAll() {
    return this.db.state.findMany({
      orderBy: { name: "asc" },
    });
  }
}

export const stateRepository = new StateRepository();
