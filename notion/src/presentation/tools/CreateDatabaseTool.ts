import { DatabaseUseCases } from "../../application/useCases.js";
import { ITool, ToolDefinition, ToolResult } from "../interfaces/ITool.js";

export default class NotionCreateDatabaseTool implements ITool {
  constructor(private databaseUseCases: DatabaseUseCases) {}

  getDefinition(): ToolDefinition {
    return {
      name: "notion_create_database",
      description: "Create a new database in Notion",
      inputSchema: {
        type: "object",
        properties: {
          parent: { type: "string", description: "Parent page_id" },
          title: { type: "string", description: "Database title" },
          schema: { type: "string", description: "SQL DDL CREATE TABLE statement" },
          description: { type: "string", description: "Database description" },
        },
        required: ["parent", "title", "schema"],
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    const schema = args.schema ? JSON.parse(args.schema as string) : {};
    const result = await this.databaseUseCases.createDatabase({
      parentPageId: args.parent as string,
      title: args.title as string,
      schema,
      description: args.description as string,
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
}