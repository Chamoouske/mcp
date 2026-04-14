import { SearchUseCases } from "../../application/useCases.js";
import { ITool, ToolDefinition, ToolResult } from "../interfaces/ITool.js";

export default class NotionSearchTool implements ITool {
  constructor(private searchUseCases: SearchUseCases) {}

  getDefinition(): ToolDefinition {
    return {
      name: "notion_search",
      description: "Search for pages in Notion workspace",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
          page_size: { type: "number", description: "Number of results (max 100)", default: 10 },
        },
        required: ["query"],
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    const result = await this.searchUseCases.search(args.query as string, args.page_size as number);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
}