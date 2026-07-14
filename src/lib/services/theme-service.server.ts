import { ThemeRepository, themeRepository } from "@/lib/repositories/theme-repository.server";

export class ThemeService {
  constructor(private readonly themes = themeRepository) {}

  async getThemeBySlug(slug: string) {
    return this.themes.findBySlug(slug);
  }

  async getThemes() {
    return this.themes.listAll();
  }

  async getThemeById(id: string) {
    return this.themes.findById(id);
  }

  async getThemeByName(name: string) {
    return this.themes.findByName(name);
  }

  async createTheme(data: { name: string; slug: string }) {
    return this.themes.create(data);
  }

  async updateTheme(id: string, data: { name?: string; slug?: string }) {
    return this.themes.update(id, data);
  }

  async deleteTheme(id: string) {
    return this.themes.delete(id);
  }
}

export const themeService = new ThemeService();
