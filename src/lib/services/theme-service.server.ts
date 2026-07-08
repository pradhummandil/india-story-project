import { ThemeRepository, themeRepository } from "@/lib/repositories/theme-repository.server";

export class ThemeService {
  constructor(private readonly themes = themeRepository) {}

  async getThemeBySlug(slug: string) {
    return this.themes.findBySlug(slug);
  }

  async getThemes() {
    return this.themes.listAll();
  }
}

export const themeService = new ThemeService();
