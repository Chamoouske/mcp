import type {
  PageRepository,
  DatabaseRepository,
  CommentRepository,
  UserRepository,
  SearchRepository,
} from "../domain/repositories.js";

export class PageUseCases {
  constructor(private pageRepo: PageRepository) {}

  async getPage(id: string) {
    return this.pageRepo.getById(id);
  }

  async createPage(input: { parentId: string; title: string; properties?: Record<string, unknown> }) {
    const props = this.buildNotionProperties(input.title, input.properties);
    return this.pageRepo.create({ parentId: input.parentId, properties: props });
  }

  private buildNotionProperties(title: string, extraProps?: Record<string, unknown>): Record<string, any> {
    const properties: Record<string, any> = {};
    
    if (title) {
      properties.title = [{ text: { content: title } }];
    }
    
    if (extraProps) {
      for (const [key, value] of Object.entries(extraProps)) {
        if (key === "Status" && typeof value === "string") {
          if (value.includes("Done") || value.includes("Completed")) {
            properties[key] = { status: { name: "✅Completed" } };
          } else if (value.includes("In progress")) {
            properties[key] = { status: { name: "⚡In progress" } };
          } else if (value.includes("Postponed")) {
            properties[key] = { status: { name: "⌛Postponed" } };
          } else if (value.includes("Cancelled")) {
            properties[key] = { status: { name: "❌Cancelled" } };
          } else if (value.includes("Soon")) {
            properties[key] = { status: { name: "🕛Soon" } };
          } else {
            properties[key] = { select: { name: value } };
          }
        } else if (key !== "title" && typeof value === "string") {
          properties[key] = [{ text: { content: value } }];
        } else if (typeof value === "object" && value !== null) {
          properties[key] = value;
        }
      }
    }
    
    return properties;
  }

  async updatePage(id: string, properties?: Record<string, unknown>, icon?: string, cover?: string) {
    return this.pageRepo.update(id, { properties, icon, cover });
  }

  async deletePage(id: string) {
    return this.pageRepo.archive(id);
  }
}

export class DatabaseUseCases {
  constructor(private dbRepo: DatabaseRepository) {}

  async getDatabase(id: string) {
    return this.dbRepo.getById(id);
  }

  async createDatabase(input: { parentPageId: string; title: string; schema: Record<string, unknown>; description?: string }) {
    return this.dbRepo.create({ ...input, schema: input.schema as any });
  }

  async queryDatabase(id: string, filter?: { property: string; value: unknown }, sorts?: { property: string; direction: "ascending" | "descending" }) {
    return this.dbRepo.query(id, filter as any, sorts as any);
  }

  async listItems(id: string, pageSize?: number) {
    return this.dbRepo.query(id, undefined, undefined);
  }
}

export class CommentUseCases {
  constructor(private commentRepo: CommentRepository) {}

  async getComments(pageId: string) {
    return this.commentRepo.getByPageId(pageId);
  }

  async createComment(pageId: string, content: string) {
    return this.commentRepo.create({ pageId, content });
  }
}

export class UserUseCases {
  constructor(private userRepo: UserRepository) {}

  async listUsers(query?: string) {
    return this.userRepo.list(query);
  }
}

export class SearchUseCases {
  constructor(private searchRepo: SearchRepository) {}

  async search(query: string, pageSize?: number) {
    return this.searchRepo.search(query, pageSize);
  }
}