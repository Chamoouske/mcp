import express, { Request, Response } from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import { TraefikService } from "./infrastructure/traefik/TraefikService.js";
import ToolHandler from "./application/services/ToolHandler.js";

import ListRoutersTool, {
  GetRouterTool,
  CreateRouterTool,
  UpdateRouterTool,
  DeleteRouterTool,
} from "./application/tools/RouterTools.js";

import ListMiddlewaresTool, {
  GetMiddlewareTool,
  CreateMiddlewareTool,
  DeleteMiddlewareTool,
} from "./application/tools/MiddlewareTools.js";

import ListServicesTool from "./application/tools/ServiceTools.js";

import ReloadConfigTool, { GetHealthTool } from "./application/tools/SystemTools.js";

const TRAEFIK_API_URL = process.env.TRAEFIK_API_URL || "http://traefik:8080";

function log(level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.error(JSON.stringify({
    timestamp,
    service: "traefik-mcp",
    level,
    message,
    ...data,
  }));
}

function createServer() {
  const server = new Server(
    {
      name: "traefik-mcp-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  const toolHandler = new ToolHandler();
  const traefikService = new TraefikService(TRAEFIK_API_URL);

  toolHandler.registerTool(new ListRoutersTool(traefikService));
  toolHandler.registerTool(new GetRouterTool(traefikService));
  toolHandler.registerTool(new CreateRouterTool(traefikService));
  toolHandler.registerTool(new UpdateRouterTool(traefikService));
  toolHandler.registerTool(new DeleteRouterTool(traefikService));

  toolHandler.registerTool(new ListMiddlewaresTool(traefikService));
  toolHandler.registerTool(new GetMiddlewareTool(traefikService));
  toolHandler.registerTool(new CreateMiddlewareTool(traefikService));
  toolHandler.registerTool(new DeleteMiddlewareTool(traefikService));

  toolHandler.registerTool(new ListServicesTool(traefikService));

  toolHandler.registerTool(new ReloadConfigTool(traefikService));
  toolHandler.registerTool(new GetHealthTool(traefikService));

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    log("info", "list_tools_request");
    return { tools: toolHandler.getTools() };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
    const { name, arguments: args } = request.params;
    log("info", "tool_call", { tool: name, args: Object.keys(args) });

    try {
      const result = await toolHandler.executeTool(name, args);
      log("info", "tool_success", { tool: name });
      return result;
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
    name: "traefik-mcp",
    version: "1.0.0",
    status: "running"
  });
});

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