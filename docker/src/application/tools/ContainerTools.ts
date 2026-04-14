import IDockerService from '../../domain/interfaces/IDockerService.js';
import { ITool, ToolDefinition, ToolResult } from '../../domain/interfaces/ITool.js';

export default class DockerPsTool implements ITool {
  constructor(private dockerService: IDockerService) {}

  getDefinition(): ToolDefinition {
    return {
      name: 'docker_ps',
      description: 'List Docker containers',
      inputSchema: {
        type: 'object',
        properties: {
          all: { type: 'boolean', description: 'Show all containers (default: false)', default: false },
        },
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    const containers = await this.dockerService.listContainers(args.all || false);
    return {
      content: [{ type: 'text', text: JSON.stringify(containers, null, 2) }],
    };
  }
}

export class DockerStartTool implements ITool {
  constructor(private dockerService: IDockerService) {}

  getDefinition(): ToolDefinition {
    return {
      name: 'docker_start',
      description: 'Start a Docker container',
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
    await this.dockerService.startContainer(args.container);
    return { content: [{ type: 'text', text: `Container ${args.container} started` }] };
  }
}

export class DockerStopTool implements ITool {
  constructor(private dockerService: IDockerService) {}

  getDefinition(): ToolDefinition {
    return {
      name: 'docker_stop',
      description: 'Stop a Docker container',
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
    await this.dockerService.stopContainer(args.container);
    return { content: [{ type: 'text', text: `Container ${args.container} stopped` }] };
  }
}

export class DockerRestartTool implements ITool {
  constructor(private dockerService: IDockerService) {}

  getDefinition(): ToolDefinition {
    return {
      name: 'docker_restart',
      description: 'Restart a Docker container',
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
    await this.dockerService.restartContainer(args.container);
    return { content: [{ type: 'text', text: `Container ${args.container} restarted` }] };
  }
}

export class DockerImagesTool implements ITool {
  constructor(private dockerService: IDockerService) {}

  getDefinition(): ToolDefinition {
    return {
      name: 'docker_images',
      description: 'List Docker images',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    };
  }

  async execute(_args: any): Promise<ToolResult> {
    const images = await this.dockerService.listImages();
    return {
      content: [{ type: 'text', text: JSON.stringify(images, null, 2) }],
    };
  }
}

export class DockerLogsTool implements ITool {
  constructor(private dockerService: IDockerService) {}

  getDefinition(): ToolDefinition {
    return {
      name: 'docker_logs',
      description: 'Get Docker container logs',
      inputSchema: {
        type: 'object',
        properties: {
          container: { type: 'string', description: 'Container name or ID' },
          tail: { type: 'number', description: 'Number of lines to show', default: 100 },
        },
        required: ['container'],
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    const logs = await this.dockerService.getContainerLogs(args.container, args.tail || 100);
    return { content: [{ type: 'text', text: logs }] };
  }
}

export class DockerExecTool implements ITool {
  constructor(private dockerService: IDockerService) {}

  getDefinition(): ToolDefinition {
    return {
      name: 'docker_exec',
      description: 'Execute a command in a running container',
      inputSchema: {
        type: 'object',
        properties: {
          container: { type: 'string', description: 'Container name or ID' },
          cmd: { type: 'string', description: 'Command to execute' },
        },
        required: ['container', 'cmd'],
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    const output = await this.dockerService.execInContainer(args.container, args.cmd);
    return { content: [{ type: 'text', text: output }] };
  }
}

export class DockerPullTool implements ITool {
  constructor(private dockerService: IDockerService) {}

  getDefinition(): ToolDefinition {
    return {
      name: 'docker_pull',
      description: 'Pull a Docker image',
      inputSchema: {
        type: 'object',
        properties: {
          image: { type: 'string', description: 'Image name (e.g., nginx:latest)' },
        },
        required: ['image'],
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    await this.dockerService.pullImage(args.image);
    return { content: [{ type: 'text', text: `Image ${args.image} pulled successfully` }] };
  }
}

export class DockerRunTool implements ITool {
  constructor(private dockerService: IDockerService) {}

  getDefinition(): ToolDefinition {
    return {
      name: 'docker_run',
      description: 'Run a new container',
      inputSchema: {
        type: 'object',
        properties: {
          image: { type: 'string', description: 'Image name' },
          name: { type: 'string', description: 'Container name' },
          ports: { type: 'array', items: { type: 'string' }, description: 'Port mappings (e.g., ["8080:80"])' },
          volumes: { type: 'array', items: { type: 'string' }, description: 'Volume mappings' },
          env: { type: 'array', items: { type: 'string' }, description: 'Environment variables' },
          detached: { type: 'boolean', description: 'Run in detached mode', default: true },
        },
        required: ['image'],
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    const containerId = await this.dockerService.runContainer({
      image: args.image,
      name: args.name,
      ports: args.ports,
      volumes: args.volumes,
      env: args.env,
      detached: args.detached,
    });
    return { content: [{ type: 'text', text: `Container created: ${containerId}` }] };
  }
}

export class DockerBuildTool implements ITool {
  constructor(private dockerService: IDockerService) {}

  getDefinition(): ToolDefinition {
    return {
      name: 'docker_build',
      description: 'Build a Docker image from Dockerfile',
      inputSchema: {
        type: 'object',
        properties: {
          dockerfile: { type: 'string', description: 'Path to Dockerfile', default: 'Dockerfile' },
          tag: { type: 'string', description: 'Image tag (e.g., myapp:latest)' },
          context: { type: 'string', description: 'Build context path', default: '.' },
        },
        required: ['tag'],
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    const result = await this.dockerService.buildImage(
      args.dockerfile || 'Dockerfile',
      args.tag,
      args.context || '.'
    );
    return { content: [{ type: 'text', text: `Image built: ${result}` }] };
  }
}