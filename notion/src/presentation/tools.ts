export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, ToolProperty>;
    required?: string[];
  };
}

export interface ToolProperty {
  type: string;
  description?: string;
  default?: unknown;
}

export interface ToolInput {
  [key: string]: unknown;
}

export interface ToolResult {
  content: { type: string; text: string }[];
  isError?: boolean;
}

export const toolDefinitions: ToolDefinition[] = [
  {
    name: "notion_search",
    description: "Search for pages in Notion workspace",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        page_size: { type: "number", description: "Number of results (max 100)", default: 10 },
      },
      required: ["query"],
    },
  },
  {
    name: "notion_fetch",
    description: "Fetch a page or database by ID or URL",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Page ID, Database ID, or Notion URL" },
      },
      required: ["id"],
    },
  },
  {
    name: "notion_create_page",
    description: "Create a new page in Notion",
    inputSchema: {
      type: "object",
      properties: {
        parent: { type: "string", description: "Parent page_id or database_id" },
        properties: { type: "string", description: "Page properties as JSON string" },
        content: { type: "string", description: "Page content in Notion Markdown" },
      },
      required: ["parent"],
    },
  },
  {
    name: "notion_create_database",
    description: "Create a new database in Notion",
    inputSchema: {
      type: "object",
      properties: {
        parent: { type: "string", description: "Parent page_id" },
        title: { type: "string", description: "Database title" },
        schema: { type: "string", description: "SQL DDL CREATE TABLE statement" },
        description: { type: "string", description: "Database description" },
      },
      required: ["parent", "title", "schema"],
    },
  },
  {
    name: "notion_update_page",
    description: "Update a page's properties or content",
    inputSchema: {
      type: "object",
      properties: {
        page_id: { type: "string", description: "Page ID" },
        properties: { type: "string", description: "Properties as JSON string" },
        content: { type: "string", description: "Content updates in Notion Markdown" },
        icon: { type: "string", description: "Emoji icon" },
        cover: { type: "string", description: "Cover image URL" },
      },
      required: ["page_id"],
    },
  },
  {
    name: "notion_delete_page",
    description: "Move a page to trash",
    inputSchema: {
      type: "object",
      properties: {
        page_id: { type: "string", description: "Page ID to delete" },
      },
      required: ["page_id"],
    },
  },
  {
    name: "notion_list_database_items",
    description: "List all items in a database",
    inputSchema: {
      type: "object",
      properties: {
        database_id: { type: "string", description: "Database ID" },
        page_size: { type: "number", description: "Number of results", default: 100 },
        filter: { type: "string", description: "Filter as JSON string" },
        sorts: { type: "string", description: "Sorts as JSON string" },
      },
      required: ["database_id"],
    },
  },
  {
    name: "notion_query_database",
    description: "Query a database with filters and sorts",
    inputSchema: {
      type: "object",
      properties: {
        database_id: { type: "string", description: "Database ID" },
        filter: { type: "string", description: "Filter as JSON string" },
        sorts: { type: "string", description: "Sorts as JSON string" },
        page_size: { type: "number", description: "Number of results", default: 100 },
      },
      required: ["database_id"],
    },
  },
  {
    name: "notion_create_comment",
    description: "Create a comment on a page",
    inputSchema: {
      type: "object",
      properties: {
        page_id: { type: "string", description: "Page ID" },
        content: { type: "string", description: "Comment content" },
        discussion_id: { type: "string", description: "Discussion ID for replies" },
      },
      required: ["page_id", "content"],
    },
  },
  {
    name: "notion_get_comments",
    description: "Get comments from a page",
    inputSchema: {
      type: "object",
      properties: {
        page_id: { type: "string", description: "Page ID" },
        block_id: { type: "string", description: "Block ID for comments on specific content" },
      },
      required: ["page_id"],
    },
  },
  {
    name: "notion_get_users",
    description: "Get users in the workspace",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query for users" },
      },
    },
  },
  {
    name: "notion_get_teams",
    description: "Get teamspaces in the workspace",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query for teams" },
      },
    },
  },
];