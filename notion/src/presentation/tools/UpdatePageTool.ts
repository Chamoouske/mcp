import { PageUseCases } from "../../application/useCases.js";
import { ITool, ToolDefinition, ToolResult } from "../interfaces/ITool.js";

export default class NotionUpdatePageTool implements ITool {
  constructor(private pageUseCases: PageUseCases) {}

  getDefinition(): ToolDefinition {
    return {
      name: "notion_update_page",
      description: "Update a page's properties or content",
      inputSchema: {
        type: "object",
        properties: {
          page_id: { type: "string", description: "Page ID" },
          properties: { type: "string", description: "Properties as JSON string" },
          content: { type: "string", description: "Content updates in Notion Markdown" },
          icon: { type: "string", description: "Emoji icon" },
          cover: { type: "string", description: "Cover image URL" },
        },
        required: ["page_id"],
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    const properties = args.properties ? JSON.parse(args.properties as string) : undefined;
    const result = await this.pageUseCases.updatePage(
      args.page_id as string,
      properties,
      args.icon as string,
      args.cover as string
    );
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
}