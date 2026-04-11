import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { toolDefinitions } from "./presentation/tools.js";
import { ToolHandler } from "./presentation/handler.js";
import { NotionClient, NotionPageRepository, NotionDatabaseRepository, NotionCommentRepository, NotionUserRepository, NotionSearchRepository } from "./infrastructure/repositories.js";
import { PageUseCases, DatabaseUseCases, CommentUseCases, UserUseCases, SearchUseCases } from "./application/useCases.js";

import "dotenv/config";

console.error("=== Notion MCP started ===");
console.error("ENV CHECK:", { key: process.env.NOTION_API_KEY?.substring(0, 10) });

const NOTION_API_KEY = process.env.NOTION_API_KEY;

if (!NOTION_API_KEY) {
  console.error("Error: NOTION_API_KEY is not set in environment");
  process.exit(1);
}

const notionClient = new NotionClient(NOTION_API_KEY);
const pageRepo = new NotionPageRepository(notionClient);
const databaseRepo = new NotionDatabaseRepository(notionClient);
const commentRepo = new NotionCommentRepository(notionClient);
const userRepo = new NotionUserRepository(notionClient);
const searchRepo = new NotionSearchRepository(notionClient);

const pageUseCases = new PageUseCases(pageRepo);
const databaseUseCases = new DatabaseUseCases(databaseRepo);
const commentUseCases = new CommentUseCases(commentRepo);
const userUseCases = new UserUseCases(userRepo);
const searchUseCases = new SearchUseCases(searchRepo);

const toolHandler = new ToolHandler(
  pageUseCases,
  databaseUseCases,
  commentUseCases,
  userUseCases,
  searchUseCases
);

const server = new Server(
  { name: "notion-custom", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: toolDefinitions };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const name = request.params.name;
  const args = request.params.arguments || {};
  const result = await toolHandler.handle(name, args);
  return result as any;
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Notion MCP Server running on stdio");
}

main().catch(console.error);