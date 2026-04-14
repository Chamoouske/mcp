import express, { Request, Response, NextFunction } from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { toolDefinitions } from "./presentation/tools.js";
import { ToolHandler } from "./presentation/handler.js";
import { NotionClient, NotionPageRepository, NotionDatabaseRepository, NotionCommentRepository, NotionUserRepository, NotionSearchRepository } from "./infrastructure/repositories.js";
import { PageUseCases, DatabaseUseCases, CommentUseCases, UserUseCases, SearchUseCases } from "./application/useCases.js";

import "dotenv/config";

const NOTION_API_KEY = process.env.NOTION_API_KEY;

if (!NOTION_API_KEY) {
  console.error("Error: NOTION_API_KEY is not set in environment");
  process.exit(1);
}

function log(level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.error(JSON.stringify({
    timestamp,
    service: "notion-mcp",
    level,
    message,
    ...data,
  }));
}

function createServer() {
  const notionClient = new NotionClient(NOTION_API_KEY!);
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
    log("info", "list_tools_request");
    return { tools: toolDefinitions };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const name = request.params.name;
    const args = request.params.arguments || {};
    log("info", "tool_call", { tool: name, args: Object.keys(args) });

    try {
      const result = await toolHandler.handle(name, args);
      log("info", "tool_success", { tool: name });
      return result as any;
    } catch (error: any) {
      log("error", "tool_error", { tool: name, error: error.message });
      throw error;
    }
  });

  return server;
}

const app = express();
const PORT = Number(process.env.PORT) || 80;

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "notion-mcp",
    version: "1.0.0",
    status: "running"
  });
});

function addValidHeaders(req: Request) {
  const accept = req.headers.accept || "";
  if (!accept.includes("application/json") || !accept.includes("text/event-stream")) {
    req.headers.accept = "application/json, text/event-stream";
  }
}

app.post("/mcp", async (req: Request, res: Response) => {
  log("info", "request", { method: "POST", path: "/mcp" });
  addValidHeaders(req);

  const server = createServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.get("/mcp", async (req: Request, res: Response) => {
  log("info", "request", { method: "GET", path: "/mcp" });
  addValidHeaders(req);

  const server = createServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  await server.connect(transport);
  await transport.handleRequest(req, res);
});

app.listen(PORT, () => {
  log("info", "server_start", { port: PORT });
});