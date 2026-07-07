import { StoryStatus } from "@/generated/prisma/client.ts";

import { prisma } from "./prisma.server";

export class CategoryRepository {
  constructor(private readonly db = prisma) {}

  async findBySlug(slug: string) {
    return this.db.category.findUnique({
      where: { slug },
    });
  }

  async listAll() {
    return this.db.category.findMany({
      orderBy: { name: "asc" },
    });
  }

  async listPublishedNames(): Promise<readonly string[]> {
    const categories = await this.db.category.findMany({
      where: {
        stories: {
          some: {
            status: StoryStatus.Published,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return ["All", ...categories.map((category) => category.name)];
  }
}

export const categoryRepository = new CategoryRepository();
