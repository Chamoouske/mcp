import { PageUseCases, DatabaseUseCases } from "../../application/useCases.js";
import { ITool, ToolDefinition, ToolResult } from "../interfaces/ITool.js";

export default class NotionFetchTool implements ITool {
  constructor(
    private pageUseCases: PageUseCases,
    private databaseUseCases: DatabaseUseCases
  ) {}

  getDefinition(): ToolDefinition {
    return {
      name: "notion_fetch",
      description: "Fetch a page or database by ID or URL",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "Page ID, Database ID, or Notion URL" },
        },
        required: ["id"],
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    const id = this.extractId(args.id as string);
    const page = await this.pageUseCases.getPage(id);
    if (page) {
      return { content: [{ type: "text", text: JSON.stringify(page, null, 2) }] };
    }
    const db = await this.databaseUseCases.getDatabase(id);
    return { content: [{ type: "text", text: JSON.stringify(db, null, 2) }] };
  }

  private extractId(input: string): string {
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const match = input.match(uuidRegex);
    return match ? match[0] : input.replace(/[^a-f0-9-]/gi, "");
  }
}