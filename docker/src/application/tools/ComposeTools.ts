import IDockerService from '../../domain/interfaces/IDockerService.js';
import { ITool, ToolDefinition, ToolResult } from '../../domain/interfaces/ITool.js';

export class DockerComposeUpTool implements ITool {
  constructor(private dockerService: IDockerService) {}

  getDefinition(): ToolDefinition {
    return {
      name: 'docker_compose_up',
      description: 'Start docker-compose services',
      inputSchema: {
        type: 'object',
        properties: {
          composeFile: { type: 'string', description: 'Path to docker-compose file', default: 'docker-compose.yml' },
          projectName: { type: 'string', description: 'Project name' },
        },
        required: ['composeFile'],
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    await this.dockerService.composeUp(args.projectName || 'default', args.composeFile);
    return { content: [{ type: 'text', text: 'Compose services started' }] };
  }
}

export class DockerComposeDownTool implements ITool {
  constructor(private dockerService: IDockerService) {}

  getDefinition(): ToolDefinition {
    return {
      name: 'docker_compose_down',
      description: 'Stop docker-compose services',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: { type: 'string', description: 'Project name' },
        },
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    await this.dockerService.composeDown(args.projectName || 'default');
    return { content: [{ type: 'text', text: 'Compose services stopped' }] };
  }
}

export class DockerComposePsTool implements ITool {
  constructor(private dockerService: IDockerService) {}

  getDefinition(): ToolDefinition {
    return {
      name: 'docker_compose_ps',
      description: 'List docker-compose services',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: { type: 'string', description: 'Project name' },
        },
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    const services = await this.dockerService.composePs(args.projectName || 'default');
    return { content: [{ type: 'text', text: JSON.stringify(services, null, 2) }] };
  }
}