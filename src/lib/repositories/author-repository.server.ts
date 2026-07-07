import { prisma } from "./prisma.server";

export class AuthorRepository {
  constructor(private readonly db = prisma) {}

  async findById(id: string) {
    return this.db.author.findUnique({
      where: { id },
    });
  }

  async listAll() {
    return this.db.author.findMany({
      orderBy: { name: "asc" },
    });
  }
}

export const authorRepository = new AuthorRepository();

