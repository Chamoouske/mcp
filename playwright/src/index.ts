import express, { Request, Response } from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import ToolHandler from "./application/services/ToolHandler.js";
import PlaywrightSessionManager from "./infrastructure/playwright/PlaywrightSessionManager.js";
import {
  PlaywrightClickTool,
  PlaywrightCloseSessionTool,
  PlaywrightContentTool,
  PlaywrightFillTool,
  PlaywrightNavigateTool,
  PlaywrightScreenshotTool,
} from "./application/tools/BrowserTools.js";

function log(level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.error(
    JSON.stringify({
      timestamp,
      service: "playwright-mcp",
      level,
      message,
      ...data,
    })
  );
}

function resolveClientId(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown-client";
}

function addValidHeaders(req: Request) {
  const accept = req.headers.accept || "";
  if (!accept.includes("application/json") || !accept.includes("text/event-stream")) {
    req.headers.accept = "application/json, text/event-stream";
  }
  const headerKeys = Object.keys(req.headers);
  const rawHeaders: string[] = [];
  for (const key of headerKeys) {
    rawHeaders.push(key);
    rawHeaders.push(req.headers[key] as string);
  }
  req.rawHeaders = rawHeaders;
}

const sessionManager = new PlaywrightSessionManager();

function createServer(clientId: string) {
  const server = new Server(
    {
      name: "playwright-mcp-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  const toolHandler = new ToolHandler();
  toolHandler.registerTool(new PlaywrightNavigateTool(sessionManager, clientId));
  toolHandler.registerTool(new PlaywrightClickTool(sessionManager, clientId));
  toolHandler.registerTool(new PlaywrightFillTool(sessionManager, clientId));
  toolHandler.registerTool(new PlaywrightScreenshotTool(sessionManager, clientId));
  toolHandler.registerTool(new PlaywrightContentTool(sessionManager, clientId));
  toolHandler.registerTool(new PlaywrightCloseSessionTool(sessionManager, clientId));

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    log("info", "list_tools_request", { clientId });
    return { tools: toolHandler.getTools() };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
    const { name, arguments: args } = request.params;
    log("info", "tool_call", { clientId, tool: name, args: Object.keys(args || {}) });
    const result = await toolHandler.executeTool(name, args);
    if (result?.isError) {
      log("error", "tool_error", { clientId, tool: name });
    } else {
      log("info", "tool_success", { clientId, tool: name });
    }
    return result;
  });

  return server;
}

const app = express();
const PORT = Number(process.env.PORT) || 80;

app.use(express.json({ limit: "10mb" }));

app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "playwright-mcp",
    version: "1.0.0",
    status: "running",
    sessions: sessionManager.getSessionCount(),
  });
});

app.post("/mcp", async (req: Request, res: Response) => {
  const clientId = resolveClientId(req);
  log("info", "request", { method: "POST", path: "/mcp", clientId });
  addValidHeaders(req);

  const server = createServer(clientId);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.get("/mcp", async (req: Request, res: Response) => {
  const clientId = resolveClientId(req);
  log("info", "request", { method: "GET", path: "/mcp", clientId });
  addValidHeaders(req);

  const server = createServer(clientId);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  await server.connect(transport);
  await transport.handleRequest(req, res);
});

app.listen(PORT, () => {
  log("info", "server_start", { port: PORT });
});

process.on("SIGTERM", async () => {
  await sessionManager.closeAll();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await sessionManager.closeAll();
  process.exit(0);
});
