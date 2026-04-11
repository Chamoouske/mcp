import { Client, APIResponseError } from "@notionhq/client";
import type { PageEntity, DatabaseEntity, CommentEntity, UserEntity } from "../domain/entities.js";
import type {
  PageRepository,
  DatabaseRepository,
  CommentRepository,
  UserRepository,
  SearchRepository,
} from "../domain/repositories.js";
import type { CreatePageInput, UpdatePageInput, CreateDatabaseInput, CreateCommentInput } from "../domain/repositories.js";

export class NotionClient {
  private client: Client;

  constructor(apiKey: string) {
    this.client = new Client({ auth: apiKey });
  }

  get clientInstance() {
    return this.client;
  }
}

interface PageResponse {
  id: string;
  created_time: string;
  last_edited_time: string;
  properties?: Record<string, { type: string; title?: Array<{ plain_text: string }> }>;
  parent?: { page_id?: string; database_id?: string };
}

interface DatabaseResponse {
  id: string;
  created_time: string;
  title?: Array<{ plain_text: string }>;
  parent?: string;
  properties?: Record<string, unknown>;
}

interface CommentResponse {
  id: string;
  created_time: string;
  parent?: { page_id?: string };
  rich_text?: Array<{ plain_text: string }>;
  created_by?: { id: string };
}

interface UserResponse {
  id: string;
  name?: string;
  person?: { email?: string };
  type: string;
}

export class NotionPageRepository implements PageRepository {
  constructor(private notion: NotionClient) {}

  async getById(id: string): Promise<PageEntity | null> {
    try {
      const page = await this.notion.clientInstance.pages.retrieve({ page_id: id });
      return this.mapPage(page as unknown as PageResponse);
    } catch {
      return null;
    }
  }

  async create(data: CreatePageInput): Promise<PageEntity> {
    console.error("=== REPO CREATE ===");
    console.error("parentId:", data.parentId);
    console.error("properties:", JSON.stringify(data.properties).substring(0, 200));
    
    let parent: { database_id?: string; page_id?: string };
    
    try {
      await this.notion.clientInstance.databases.retrieve({ database_id: data.parentId });
      console.error("Using database_id parent");
      parent = { database_id: data.parentId };
    } catch (e: any) {
      console.error("Using page_id parent, error:", e.message);
      parent = { page_id: data.parentId };
    }

    const page: any = { parent, properties: data.properties };

    if (data.content) {
      page.children = this.parseContent(data.content);
    }

    console.error("Creating page with:", JSON.stringify(page).substring(0, 300));
    const result = await this.notion.clientInstance.pages.create(page);
    console.error("Page created:", result.id);
    return this.mapPage(result as unknown as PageResponse);
  }

  async update(id: string, data: UpdatePageInput): Promise<PageEntity> {
    const update: any = {};
    if (data.properties) update.properties = data.properties;
    if (data.icon) update.icon = { emoji: data.icon };
    if (data.cover) update.cover = { external: { url: data.cover } };

    const result = await this.notion.clientInstance.pages.update({ page_id: id, ...update });
    return this.mapPage(result as unknown as PageResponse);
  }

  async archive(id: string): Promise<void> {
    await this.notion.clientInstance.pages.update({ page_id: id, archived: true });
  }

  private mapPage(page: PageResponse): PageEntity {
    const title = this.extractTitle(page.properties);
    const status = this.extractStatus(page.properties);
    return {
      id: page.id,
      createdTime: page.created_time,
      lastEditedTime: page.last_edited_time,
      title,
      status,
      parentId: page.parent?.page_id || page.parent?.database_id || "",
    };
  }

  private extractTitle(properties?: Record<string, any>): string {
    if (!properties) return "";
    const titleProp = Object.values(properties).find((p) => p.type === "title");
    return titleProp?.title?.[0]?.plain_text || "";
  }

  private extractStatus(properties?: Record<string, any>): string | undefined {
    if (!properties) return undefined;
    const statusProp = Object.values(properties).find(
      (p) => p.type === "status" || (p.type === "select" && p.select?.options?.length > 0)
    );
    return statusProp?.status?.name || statusProp?.select?.name;
  }

  private parseContent(content: string): any[] {
    const lines = content.split("\n");
    return lines.map((line) => {
      if (line.startsWith("# ")) {
        return { type: "heading_1", heading_1: { rich_text: [{ text: { content: line.slice(2) } }] } };
      }
      if (line.startsWith("## ")) {
        return { type: "heading_2", heading_2: { rich_text: [{ text: { content: line.slice(3) } }] } };
      }
      if (line.startsWith("### ")) {
        return { type: "heading_3", heading_3: { rich_text: [{ text: { content: line.slice(4) } }] } };
      }
      return { type: "paragraph", paragraph: { rich_text: [{ text: { content: line } }] } };
    });
  }
}

export class NotionDatabaseRepository implements DatabaseRepository {
  constructor(private notion: NotionClient) {}

  async getById(id: string): Promise<DatabaseEntity | null> {
    try {
      const db = await this.notion.clientInstance.databases.retrieve({ database_id: id });
      return this.mapDatabase(db as unknown as DatabaseResponse);
    } catch {
      return null;
    }
  }

  async create(data: CreateDatabaseInput): Promise<DatabaseEntity> {
    const result = await this.notion.clientInstance.databases.create({
      parent: { page_id: data.parentPageId },
      title: [{ text: { content: data.title } }],
      description: data.description ? [{ text: { content: data.description } }] : [],
      properties: data.schema as any,
    });
    return this.mapDatabase(result as unknown as DatabaseResponse);
  }

  async query(
    databaseId: string,
    filter?: { property: string; value: unknown },
    sorts?: { property: string; direction: "ascending" | "descending" }
  ): Promise<PageEntity[]> {
    const args: any = { database_id: databaseId };
    if (filter) args.filter = filter;
    if (sorts) args.sorts = sorts;

    const result = await this.notion.clientInstance.databases.query(args);
    return result.results.map((page: any) => this.mapPageWithProperties(page, databaseId));
  }

  private mapPageWithProperties(page: any, parentId: string): PageEntity {
    const props = page.properties;
    const title = this.extractTitle(props);
    const status = this.extractStatus(props);
    const createdTime = props["Criado em"]?.created_time || props["Created time"]?.created_time || page.created_time;
    
    return {
      id: page.id,
      createdTime: page.created_time,
      lastEditedTime: page.last_edited_time,
      title,
      status,
      createdAt: createdTime,
      parentId,
    };
  }

  private extractStatus(properties: any): string | undefined {
    if (!properties) return undefined;
    const statusProp = Object.values(properties).find(
      (p: any) => p.type === "status" || (p.type === "select" && p.select?.name)
    ) as any;
    return statusProp?.status?.name || statusProp?.select?.name;
  }

  private mapDatabase(db: DatabaseResponse): DatabaseEntity {
    return {
      id: db.id,
      createdTime: db.created_time,
      title: db.title?.[0]?.plain_text || "",
      parentPageId: db.parent || "",
      properties: db.properties as any,
    };
  }

  private extractTitle(properties?: Record<string, unknown>): string {
    if (!properties) return "";
    const props = properties as Record<string, { type: string; title?: Array<{ plain_text: string }> }>;
    const titleProp = Object.values(props).find((p) => p.type === "title");
    return titleProp?.title?.[0]?.plain_text || "";
  }
}

export class NotionCommentRepository implements CommentRepository {
  constructor(private notion: NotionClient) {}

  async getByPageId(pageId: string): Promise<CommentEntity[]> {
    const result = await this.notion.clientInstance.comments.list({ block_id: pageId });
    return result.results.map((comment: any) => ({
      id: comment.id,
      createdTime: comment.created_time,
      pageId: comment.parent?.page_id || "",
      content: comment.rich_text?.[0]?.plain_text || "",
      authorId: comment.created_by?.id || "",
    }));
  }

  async create(data: CreateCommentInput): Promise<CommentEntity> {
    const args: any = {
      parent: { page_id: data.pageId },
      rich_text: [{ text: { content: data.content } }],
    };
    if (data.discussionId) args.discussion_id = data.discussionId;

    const result = await this.notion.clientInstance.comments.create(args);
    return {
      id: result.id,
      createdTime: new Date().toISOString(),
      pageId: data.pageId,
      content: data.content,
      authorId: "",
    };
  }
}

export class NotionUserRepository implements UserRepository {
  constructor(private notion: NotionClient) {}

  async list(query?: string): Promise<UserEntity[]> {
    const result = await this.notion.clientInstance.users.list({} as any);
    return result.results.map((user: any) => ({
      id: user.id,
      name: user.name || "",
      email: user.person?.email,
      type: user.type,
    }));
  }
}

export class NotionSearchRepository implements SearchRepository {
  constructor(private notion: NotionClient) {}

  async search(query: string, pageSize: number = 10): Promise<any[]> {
    const result = await this.notion.clientInstance.search({ query, page_size: pageSize });
    return result.results.map((item: any) => ({
      id: item.id,
      title: item.properties?.title?.title?.[0]?.plain_text || item.title?.[0]?.plain_text || "",
      type: item.object,
      url: item.url,
    }));
  }
}