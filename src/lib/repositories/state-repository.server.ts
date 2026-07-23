import { prisma } from "./prisma.server";

export class StateRepository {
  constructor(private readonly db = prisma) {}

  async findBySlug(slug: string) {
    return this.db.state.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            stories: {
              where: { status: "Published", deleted: false },
            },
          },
        },
      },
    });
  }

  async listAll() {
    const states = await this.db.state.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            stories: {
              where: { status: "Published", deleted: false },
            },
          },
        },
        stories: {
          where: { status: "Published", deleted: false },
          orderBy: { publishedAt: "desc" },
          take: 1,
          select: {
            id: true,
            title: true,
            slug: true,
            images: {
              take: 1,
              orderBy: [{ heroImage: "desc" }, { sortOrder: "asc" }],
              select: { imageUrl: true },
            },
          },
        },
      },
    });

    return states.map((s) => {
      const latestStory = s.stories[0] ?? null;
      const heroImage = latestStory?.images[0]?.imageUrl ?? "/Logo-ISP.jpg";
      return {
        id: s.id,
        name: s.name,
        slug: s.slug,
        code: (s as any).code ?? null,
        storyCount: s._count.stories,
        latestStory: latestStory ? { title: latestStory.title, slug: latestStory.slug } : null,
        heroImage,
      };
    });
  }
}

export const stateRepository = new StateRepository();
