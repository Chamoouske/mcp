import { PageUseCases } from "../../application/useCases.js";
import { ITool, ToolDefinition, ToolResult } from "../interfaces/ITool.js";

export default class NotionDeletePageTool implements ITool {
  constructor(private pageUseCases: PageUseCases) {}

  getDefinition(): ToolDefinition {
    return {
      name: "notion_delete_page",
      description: "Move a page to trash",
      inputSchema: {
        type: "object",
        properties: {
          page_id: { type: "string", description: "Page ID to delete" },
        },
        required: ["page_id"],
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    await this.pageUseCases.deletePage(args.page_id as string);
    return { content: [{ type: "text", text: "Page archived successfully" }] };
  }
}