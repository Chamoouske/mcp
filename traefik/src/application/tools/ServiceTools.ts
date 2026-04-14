import { ITraefikService } from "../../domain/interfaces/ITraefikService.js";
import { ITool, ToolDefinition, ToolResult } from "../../domain/interfaces/ITool.js";

export default class ListServicesTool implements ITool {
  constructor(private traefikService: ITraefikService) {}

  getDefinition(): ToolDefinition {
    return {
      name: "list_services",
      description: "List all Traefik HTTP services",
      inputSchema: {
        type: "object",
        properties: {},
      },
    };
  }

  async execute(_args: any): Promise<ToolResult> {
    const services = await this.traefikService.getServices();
    return {
      content: [{ type: "text", text: JSON.stringify(services, null, 2) }],
    };
  }
}