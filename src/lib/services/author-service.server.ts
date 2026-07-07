import {
  AuthorRepository,
  authorRepository,
} from "@/lib/repositories/author-repository.server";

export class AuthorService {
  constructor(private readonly authors = authorRepository) {}

  async getAuthorById(id: string) {
    return this.authors.findById(id);
  }

  async getAuthors() {
    return this.authors.listAll();
  }
}

export const authorService = new AuthorService();

