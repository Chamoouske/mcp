import IDockerService from '../../domain/interfaces/IDockerService.js';
import { ITool, ToolDefinition, ToolResult } from '../../domain/interfaces/ITool.js';

export class DockerNetworkLsTool implements ITool {
  constructor(private dockerService: IDockerService) {}

  getDefinition(): ToolDefinition {
    return {
      name: 'docker_network_ls',
      description: 'List Docker networks',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    };
  }

  async execute(_args: any): Promise<ToolResult> {
    const networks = await this.dockerService.listNetworks();
    return { content: [{ type: 'text', text: JSON.stringify(networks, null, 2) }] };
  }
}

export class DockerVolumeLsTool implements ITool {
  constructor(private dockerService: IDockerService) {}

  getDefinition(): ToolDefinition {
    return {
      name: 'docker_volume_ls',
      description: 'List Docker volumes',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    };
  }

  async execute(_args: any): Promise<ToolResult> {
    const volumes = await this.dockerService.listVolumes();
    return { content: [{ type: 'text', text: JSON.stringify(volumes, null, 2) }] };
  }
}