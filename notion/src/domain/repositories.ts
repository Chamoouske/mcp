import type { PageEntity, DatabaseEntity, CommentEntity, UserEntity } from "../domain/entities.js";

export interface PageRepository {
  getById(id: string): Promise<PageEntity | null>;
  create(data: CreatePageInput): Promise<PageEntity>;
  update(id: string, data: UpdatePageInput): Promise<PageEntity>;
  archive(id: string): Promise<void>;
}

export interface DatabaseRepository {
  getById(id: string): Promise<DatabaseEntity | null>;
  create(data: CreateDatabaseInput): Promise<DatabaseEntity>;
  query(databaseId: string, filter?: QueryFilter, sorts?: QuerySort): Promise<PageEntity[]>;
}

export interface CommentRepository {
  getByPageId(pageId: string): Promise<CommentEntity[]>;
  create(data: CreateCommentInput): Promise<CommentEntity>;
}

export interface UserRepository {
  list(query?: string): Promise<UserEntity[]>;
}

export interface SearchRepository {
  search(query: string, pageSize?: number): Promise<SearchResult[]>;
}

export interface CreatePageInput {
  parentId: string;
  properties: Record<string, unknown>;
  content?: string;
}

export interface UpdatePageInput {
  properties?: Record<string, unknown>;
  icon?: string;
  cover?: string;
}

export interface CreateDatabaseInput {
  parentPageId: string;
  title: string;
  schema: Record<string, PropertyDefinition>;
  description?: string;
}

export interface PropertyDefinition {
  type: string;
  options?: SelectOption[];
}

export interface SelectOption {
  name: string;
  color: string;
}

export interface CreateCommentInput {
  pageId: string;
  content: string;
  discussionId?: string;
}

export interface QueryFilter {
  property: string;
  value: unknown;
}

export interface QuerySort {
  property: string;
  direction: "ascending" | "descending";
}

export interface SearchResult {
  id: string;
  title: string;
  type: "page" | "database";
  url: string;
}