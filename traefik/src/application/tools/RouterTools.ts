import { ITraefikService } from "../../domain/interfaces/ITraefikService.js";
import { ITool, ToolDefinition, ToolResult } from "../../domain/interfaces/ITool.js";

export default class ListRoutersTool implements ITool {
  constructor(private traefikService: ITraefikService) {}

  getDefinition(): ToolDefinition {
    return {
      name: "list_routers",
      description: "List all Traefik HTTP routers",
      inputSchema: {
        type: "object",
        properties: {},
      },
    };
  }

  async execute(_args: any): Promise<ToolResult> {
    const routers = await this.traefikService.getRouters();
    return {
      content: [{ type: "text", text: JSON.stringify(routers, null, 2) }],
    };
  }
}

export class GetRouterTool implements ITool {
  constructor(private traefikService: ITraefikService) {}

  getDefinition(): ToolDefinition {
    return {
      name: "get_router",
      description: "Get details of a specific router",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Router name" },
        },
        required: ["name"],
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    const router = await this.traefikService.getRouter(args.name);
    if (!router) {
      return {
        content: [{ type: "text", text: `Router ${args.name} not found` }],
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(router, null, 2) }],
    };
  }
}

export class CreateRouterTool implements ITool {
  constructor(private traefikService: ITraefikService) {}

  getDefinition(): ToolDefinition {
    return {
      name: "create_router",
      description: "Create a new Traefik router",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Router name" },
          rule: { type: "string", description: "Routing rule (e.g., PathPrefix(`/api`)" },
          service: { type: "string", description: "Target service name" },
          middlewares: { type: "array", items: { type: "string" }, description: "Middleware names" },
          tls: { type: "object", properties: { certResolver: { type: "string" } } },
        },
        required: ["name", "rule", "service"],
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    await this.traefikService.createRouter({
      name: args.name,
      rule: args.rule,
      service: args.service,
      middlewares: args.middlewares,
      tls: args.tls,
    });
    return {
      content: [{ type: "text", text: `Router ${args.name} created successfully` }],
    };
  }
}

export class UpdateRouterTool implements ITool {
  constructor(private traefikService: ITraefikService) {}

  getDefinition(): ToolDefinition {
    return {
      name: "update_router",
      description: "Update an existing router",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Router name" },
          rule: { type: "string", description: "Routing rule" },
          service: { type: "string", description: "Target service name" },
          middlewares: { type: "array", items: { type: "string" } },
          tls: { type: "object", properties: { certResolver: { type: "string" } } },
        },
        required: ["name"],
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    await this.traefikService.updateRouter(args.name, {
      rule: args.rule,
      service: args.service,
      middlewares: args.middlewares,
      tls: args.tls,
    });
    return {
      content: [{ type: "text", text: `Router ${args.name} updated successfully` }],
    };
  }
}

export class DeleteRouterTool implements ITool {
  constructor(private traefikService: ITraefikService) {}

  getDefinition(): ToolDefinition {
    return {
      name: "delete_router",
      description: "Delete a router",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Router name" },
        },
        required: ["name"],
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    await this.traefikService.deleteRouter(args.name);
    return {
      content: [{ type: "text", text: `Router ${args.name} deleted successfully` }],
    };
  }
}