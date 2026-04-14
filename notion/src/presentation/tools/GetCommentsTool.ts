import { CommentUseCases } from "../../application/useCases.js";
import { ITool, ToolDefinition, ToolResult } from "../interfaces/ITool.js";

export default class NotionGetCommentsTool implements ITool {
  constructor(private commentUseCases: CommentUseCases) {}

  getDefinition(): ToolDefinition {
    return {
      name: "notion_get_comments",
      description: "Get comments from a page",
      inputSchema: {
        type: "object",
        properties: {
          page_id: { type: "string", description: "Page ID" },
          block_id: { type: "string", description: "Block ID for comments on specific content" },
        },
        required: ["page_id"],
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    const result = await this.commentUseCases.getComments(args.page_id as string);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
}