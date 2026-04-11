import IDockerService from '../../domain/interfaces/IDockerService.js';
import { ITool, ToolDefinition, ToolResult } from '../../domain/interfaces/ITool.js';

export class DockerInspectContainerTool implements ITool {
  constructor(private dockerService: IDockerService) {}

  getDefinition(): ToolDefinition {
    return {
      name: 'docker_inspect_container',
      description: 'Get detailed information about a container',
      inputSchema: {
        type: 'object',
        properties: {
          container: { type: 'string', description: 'Container name or ID' },
        },
        required: ['container'],
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    const info = await this.dockerService.inspectContainer(args.container);
    return { content: [{ type: 'text', text: JSON.stringify(info, null, 2) }] };
  }
}

export class DockerInspectImageTool implements ITool {
  constructor(private dockerService: IDockerService) {}

  getDefinition(): ToolDefinition {
    return {
      name: 'docker_inspect_image',
      description: 'Get detailed information about an image',
      inputSchema: {
        type: 'object',
        properties: {
          image: { type: 'string', description: 'Image name or ID' },
        },
        required: ['image'],
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    const info = await this.dockerService.inspectImage(args.image);
    return { content: [{ type: 'text', text: JSON.stringify(info, null, 2) }] };
  }
}

export class DockerStatsTool implements ITool {
  constructor(private dockerService: IDockerService) {}

  getDefinition(): ToolDefinition {
    return {
      name: 'docker_stats',
      description: 'Get resource usage statistics for a container',
      inputSchema: {
        type: 'object',
        properties: {
          container: { type: 'string', description: 'Container name or ID' },
        },
        required: ['container'],
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    const stats = await this.dockerService.getContainerStats(args.container);
    return { content: [{ type: 'text', text: JSON.stringify(stats, null, 2) }] };
  }
}