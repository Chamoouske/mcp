import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
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

class DockerMcpServer {
  private server: Server;
  private toolHandler: ToolHandler;

  constructor() {
    this.server = new Server(
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

    this.toolHandler = new ToolHandler();
    this.registerTools();
    this.setupHandlers();
  }

  private registerTools(): void {
    const dockerService = new DockerService();

    this.toolHandler.registerTool(new DockerPsTool(dockerService));
    this.toolHandler.registerTool(new DockerStartTool(dockerService));
    this.toolHandler.registerTool(new DockerStopTool(dockerService));
    this.toolHandler.registerTool(new DockerRestartTool(dockerService));
    this.toolHandler.registerTool(new DockerRmTool(dockerService));
    this.toolHandler.registerTool(new DockerImagesTool(dockerService));
    this.toolHandler.registerTool(new DockerLogsTool(dockerService));
    this.toolHandler.registerTool(new DockerExecTool(dockerService));
    this.toolHandler.registerTool(new DockerPullTool(dockerService));
    this.toolHandler.registerTool(new DockerRunTool(dockerService));
    this.toolHandler.registerTool(new DockerBuildTool(dockerService));

    this.toolHandler.registerTool(new DockerComposeUpTool(dockerService));
    this.toolHandler.registerTool(new DockerComposeDownTool(dockerService));
    this.toolHandler.registerTool(new DockerComposePsTool(dockerService));

    this.toolHandler.registerTool(new DockerInspectContainerTool(dockerService));
    this.toolHandler.registerTool(new DockerInspectImageTool(dockerService));
    this.toolHandler.registerTool(new DockerStatsTool(dockerService));

    this.toolHandler.registerTool(new DockerNetworkLsTool(dockerService));
    this.toolHandler.registerTool(new DockerVolumeLsTool(dockerService));
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return { tools: this.toolHandler.getTools() };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const { name, arguments: args } = request.params;
      return await this.toolHandler.executeTool(name, args);
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

const server = new DockerMcpServer();
server.start();