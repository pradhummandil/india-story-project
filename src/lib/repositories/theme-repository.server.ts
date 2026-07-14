import { prisma } from "./prisma.server";

export class ThemeRepository {
  constructor(private readonly db = prisma) {}

  async listAll() {
    return this.db.theme.findMany({
      orderBy: { name: "asc" },
    });
  }

  async findBySlug(slug: string) {
    return this.db.theme.findUnique({
      where: { slug },
    });
  }

  async findById(id: string) {
    return this.db.theme.findUnique({
      where: { id },
    });
  }

  async findByName(name: string) {
    return this.db.theme.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
  }

  async create(data: { name: string; slug: string }) {
    return this.db.theme.create({
      data,
    });
  }

  async update(id: string, data: { name?: string; slug?: string }) {
    return this.db.theme.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.db.theme.delete({
      where: { id },
    });
  }
}

export const themeRepository = new ThemeRepository();
