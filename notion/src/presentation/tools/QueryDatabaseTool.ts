import { DatabaseUseCases } from "../../application/useCases.js";
import { ITool, ToolDefinition, ToolResult } from "../interfaces/ITool.js";

export default class NotionQueryDatabaseTool implements ITool {
  constructor(private databaseUseCases: DatabaseUseCases) {}

  getDefinition(): ToolDefinition {
    return {
      name: "notion_query_database",
      description: "Query a database with filters and sorts",
      inputSchema: {
        type: "object",
        properties: {
          database_id: { type: "string", description: "Database ID" },
          filter: { type: "string", description: "Filter as JSON string" },
          sorts: { type: "string", description: "Sorts as JSON string" },
          page_size: { type: "number", description: "Number of results", default: 100 },
        },
        required: ["database_id"],
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    const filter = args.filter ? JSON.parse(args.filter as string) : undefined;
    const sorts = args.sorts ? JSON.parse(args.sorts as string) : undefined;
    const result = await this.databaseUseCases.queryDatabase(args.database_id as string, filter, sorts);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
}