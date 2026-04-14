import { ITraefikService, Middleware } from "../../domain/interfaces/ITraefikService.js";
import { ITool, ToolDefinition, ToolResult } from "../../domain/interfaces/ITool.js";

export default class ListMiddlewaresTool implements ITool {
  constructor(private traefikService: ITraefikService) {}

  getDefinition(): ToolDefinition {
    return {
      name: "list_middlewares",
      description: "List all Traefik middlewares",
      inputSchema: {
        type: "object",
        properties: {},
      },
    };
  }

  async execute(_args: any): Promise<ToolResult> {
    const middlewares = await this.traefikService.getMiddlewares();
    return {
      content: [{ type: "text", text: JSON.stringify(middlewares, null, 2) }],
    };
  }
}

export class GetMiddlewareTool implements ITool {
  constructor(private traefikService: ITraefikService) {}

  getDefinition(): ToolDefinition {
    return {
      name: "get_middleware",
      description: "Get details of a specific middleware",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Middleware name" },
        },
        required: ["name"],
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    const middleware = await this.traefikService.getMiddleware(args.name);
    if (!middleware) {
      return {
        content: [{ type: "text", text: `Middleware ${args.name} not found` }],
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(middleware, null, 2) }],
    };
  }
}

export class CreateMiddlewareTool implements ITool {
  constructor(private traefikService: ITraefikService) {}

  getDefinition(): ToolDefinition {
    return {
      name: "create_middleware",
      description: "Create a new Traefik middleware",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Middleware name" },
          type: { type: "string", description: "Middleware type (e.g., basicauth, compress, rateLimit)" },
          config: { type: "object", description: "Middleware configuration" },
        },
        required: ["name", "type"],
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    const middleware: Middleware = {
      name: args.name,
      type: args.type,
      config: args.config,
    };
    await this.traefikService.createMiddleware(middleware);
    return {
      content: [{ type: "text", text: `Middleware ${args.name} created successfully` }],
    };
  }
}

export class DeleteMiddlewareTool implements ITool {
  constructor(private traefikService: ITraefikService) {}

  getDefinition(): ToolDefinition {
    return {
      name: "delete_middleware",
      description: "Delete a middleware",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Middleware name" },
        },
        required: ["name"],
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    await this.traefikService.deleteMiddleware(args.name);
    return {
      content: [{ type: "text", text: `Middleware ${args.name} deleted successfully` }],
    };
  }
}