import { CommentUseCases } from "../../application/useCases.js";
import { ITool, ToolDefinition, ToolResult } from "../interfaces/ITool.js";

export default class NotionCreateCommentTool implements ITool {
  constructor(private commentUseCases: CommentUseCases) {}

  getDefinition(): ToolDefinition {
    return {
      name: "notion_create_comment",
      description: "Create a comment on a page",
      inputSchema: {
        type: "object",
        properties: {
          page_id: { type: "string", description: "Page ID" },
          content: { type: "string", description: "Comment content" },
          discussion_id: { type: "string", description: "Discussion ID for replies" },
        },
        required: ["page_id", "content"],
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    const result = await this.commentUseCases.createComment(args.page_id as string, args.content as string);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
}