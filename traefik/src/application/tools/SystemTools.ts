import { ITraefikService } from "../../domain/interfaces/ITraefikService.js";
import { ITool, ToolDefinition, ToolResult } from "../../domain/interfaces/ITool.js";

export default class ReloadConfigTool implements ITool {
  constructor(private traefikService: ITraefikService) {}

  getDefinition(): ToolDefinition {
    return {
      name: "reload_config",
      description: "Reload Traefik configuration",
      inputSchema: {
        type: "object",
        properties: {},
      },
    };
  }

  async execute(_args: any): Promise<ToolResult> {
    await this.traefikService.reloadConfig();
    return {
      content: [{ type: "text", text: "Configuration reloaded successfully" }],
    };
  }
}

export class GetHealthTool implements ITool {
  constructor(private traefikService: ITraefikService) {}

  getDefinition(): ToolDefinition {
    return {
      name: "get_health",
      description: "Get Traefik health and overview",
      inputSchema: {
        type: "object",
        properties: {},
      },
    };
  }

  async execute(_args: any): Promise<ToolResult> {
    const health = await this.traefikService.getHealth();
    return {
      content: [{ type: "text", text: JSON.stringify(health, null, 2) }],
    };
  }
}