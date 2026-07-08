import {
  CategoryRepository,
  categoryRepository,
} from "@/lib/repositories/category-repository.server";

export class CategoryService {
  constructor(private readonly categories = categoryRepository) {}

  async getCategoryBySlug(slug: string) {
    return this.categories.findBySlug(slug);
  }

  async getCategories() {
    return this.categories.listAll();
  }

  async getPublishedCategoryNames() {
    return this.categories.listPublishedNames();
  }
}

export const categoryService = new CategoryService();
