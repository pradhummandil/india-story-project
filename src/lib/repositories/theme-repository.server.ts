import { prisma } from "./prisma.server";

export class ThemeRepository {
  constructor(private readonly db = prisma) {}

  async findBySlug(slug: string) {
    return this.db.theme.findUnique({
      where: { slug },
    });
  }

  async listAll() {
    return this.db.theme.findMany({
      orderBy: { name: "asc" },
    });
  }
}

export const themeRepository = new ThemeRepository();
