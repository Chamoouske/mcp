import express, { Request, Response, NextFunction } from "express";
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import DockerService from './infrastructure/docker/DockerService.js';
import ToolHandler from './application/services/ToolHandler.js';

import DockerPsTool, {
  DockerStartTool,
  DockerStopTool,
  DockerRestartTool,
  DockerImagesTool,
  DockerLogsTool,
  DockerPullTool,
  DockerBuildTool,
} from './application/tools/ContainerTools.js';

import {
  DockerComposeUpTool,
  DockerComposePsTool,
} from './application/tools/ComposeTools.js';

import {
  DockerInspectContainerTool,
  DockerInspectImageTool,
  DockerStatsTool,
} from './application/tools/InspectTools.js';

import {
  DockerNetworkLsTool,
  DockerVolumeLsTool,
} from './application/tools/NetworkTools.js';

function log(level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.error(JSON.stringify({
    timestamp,
    service: "docker-mcp",
    level,
    message,
    ...data,
  }));
}

function createServer() {
  const server = new Server(
    {
      name: 'docker-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  const toolHandler = new ToolHandler();
  const dockerService = new DockerService();

  toolHandler.registerTool(new DockerPsTool(dockerService));
  toolHandler.registerTool(new DockerStartTool(dockerService));
  toolHandler.registerTool(new DockerStopTool(dockerService));
  toolHandler.registerTool(new DockerRestartTool(dockerService));
  toolHandler.registerTool(new DockerImagesTool(dockerService));
  toolHandler.registerTool(new DockerLogsTool(dockerService));
  toolHandler.registerTool(new DockerPullTool(dockerService));
  toolHandler.registerTool(new DockerBuildTool(dockerService));

  toolHandler.registerTool(new DockerComposeUpTool(dockerService));
  toolHandler.registerTool(new DockerComposePsTool(dockerService));

  toolHandler.registerTool(new DockerInspectContainerTool(dockerService));
  toolHandler.registerTool(new DockerInspectImageTool(dockerService));
  toolHandler.registerTool(new DockerStatsTool(dockerService));

  toolHandler.registerTool(new DockerNetworkLsTool(dockerService));
  toolHandler.registerTool(new DockerVolumeLsTool(dockerService));

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
    name: "docker-mcp",
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