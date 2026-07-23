import { prisma } from "./prisma.server";

export class ThemeRepository {
  constructor(private readonly db = prisma) {}

  async listAll() {
    const themes = await this.db.theme.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            stories: {
              where: { story: { status: "Published", deleted: false } },
            },
          },
        },
        stories: {
          where: { story: { status: "Published", deleted: false } },
          orderBy: { story: { publishedAt: "desc" } },
          take: 1,
          select: {
            story: {
              select: {
                id: true,
                title: true,
                slug: true,
                author: { select: { name: true } },
                images: {
                  take: 1,
                  orderBy: [{ heroImage: "desc" }, { sortOrder: "asc" }],
                  select: { imageUrl: true },
                },
              },
            },
          },
        },
      },
    });

    return themes.map((t) => {
      const latestStory = t.stories[0]?.story ?? null;
      const themeImage = latestStory?.images[0]?.imageUrl ?? "/Logo-ISP.jpg";
      return {
        id: t.id,
        name: t.name,
        slug: t.slug,
        storyCount: t._count.stories,
        themeImage,
        latestStory: latestStory ? { title: latestStory.title, slug: latestStory.slug } : null,
        topAuthor: latestStory?.author?.name ?? null,
      };
    });
  }

  async findBySlug(slug: string) {
    return this.db.theme.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            stories: {
              where: { story: { status: "Published", deleted: false } },
            },
          },
        },
      },
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
