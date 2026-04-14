import { UserUseCases } from "../../application/useCases.js";
import { ITool, ToolDefinition, ToolResult } from "../interfaces/ITool.js";

export default class NotionGetUsersTool implements ITool {
  constructor(private userUseCases: UserUseCases) {}

  getDefinition(): ToolDefinition {
    return {
      name: "notion_get_users",
      description: "Get users in the workspace",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query for users" },
        },
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    const result = await this.userUseCases.listUsers(args.query as string);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
}

export class NotionGetTeamsTool implements ITool {
  constructor(private userUseCases: UserUseCases) {}

  getDefinition(): ToolDefinition {
    return {
      name: "notion_get_teams",
      description: "Get teamspaces in the workspace",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query for teams" },
        },
      },
    };
  }

  async execute(_args: any): Promise<ToolResult> {
    const result = await this.userUseCases.listUsers();
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
}