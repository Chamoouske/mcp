import express, { Request, Response } from "express";
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
  DockerRmTool,
  DockerImagesTool,
  DockerLogsTool,
  DockerExecTool,
  DockerPullTool,
  DockerRunTool,
  DockerBuildTool,
} from './application/tools/ContainerTools.js';

import {
  DockerComposeUpTool,
  DockerComposeDownTool,
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
toolHandler.registerTool(new DockerRmTool(dockerService));
toolHandler.registerTool(new DockerImagesTool(dockerService));
toolHandler.registerTool(new DockerLogsTool(dockerService));
toolHandler.registerTool(new DockerExecTool(dockerService));
toolHandler.registerTool(new DockerPullTool(dockerService));
toolHandler.registerTool(new DockerRunTool(dockerService));
toolHandler.registerTool(new DockerBuildTool(dockerService));

toolHandler.registerTool(new DockerComposeUpTool(dockerService));
toolHandler.registerTool(new DockerComposeDownTool(dockerService));
toolHandler.registerTool(new DockerComposePsTool(dockerService));

toolHandler.registerTool(new DockerInspectContainerTool(dockerService));
toolHandler.registerTool(new DockerInspectImageTool(dockerService));
toolHandler.registerTool(new DockerStatsTool(dockerService));

toolHandler.registerTool(new DockerNetworkLsTool(dockerService));
toolHandler.registerTool(new DockerVolumeLsTool(dockerService));

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: toolHandler.getTools() };
});

server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
  const { name, arguments: args } = request.params;
  return await toolHandler.executeTool(name, args);
});

const app = express();
const PORT = Number(process.env.PORT) || 3002;

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({ 
    name: "docker-mcp", 
    version: "1.0.0",
    status: "running" 
  });
});

app.post("/mcp", async (req: Request, res: Response) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.get("/mcp", async (req: Request, res: Response) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  
  await server.connect(transport);
  await transport.handleRequest(req, res);
});

app.listen(PORT, () => {
  console.error(`Docker MCP Server running on http://localhost:${PORT}`);
});