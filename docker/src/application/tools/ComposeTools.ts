import IDockerService from '../../domain/interfaces/IDockerService.js';
import { ITool, ToolDefinition, ToolResult } from '../../domain/interfaces/ITool.js';

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