import { PageUseCases } from "../../application/useCases.js";
import { ITool, ToolDefinition, ToolResult } from "../interfaces/ITool.js";

export default class NotionCreatePageTool implements ITool {
  constructor(private pageUseCases: PageUseCases) {}

  getDefinition(): ToolDefinition {
    return {
      name: "notion_create_page",
      description: "Create a new page in Notion",
      inputSchema: {
        type: "object",
        properties: {
          parent: { type: "string", description: "Parent page_id or database_id" },
          properties: { type: "string", description: "Page properties as JSON string" },
          content: { type: "string", description: "Page content in Notion Markdown" },
        },
        required: ["parent"],
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    let properties: Record<string, unknown> = {};
    if (args.properties) {
      if (typeof args.properties === "string") {
        properties = JSON.parse(args.properties as string);
      } else if (typeof args.properties === "object") {
        properties = args.properties as Record<string, unknown>;
      }
    }
    const title = (properties.Projeto as string) || (properties.Nome as string) || (properties.title as string) || (properties["Próxima ação"] as string) || "New Page";
    const extraProps = { ...properties };
    delete extraProps.Projeto;
    delete extraProps.Nome;
    delete extraProps.title;
    delete extraProps["Próxima ação"];

    const result = await this.pageUseCases.createPage({
      parentId: args.parent as string,
      title: title,
      properties: extraProps,
    });
    return { content: [{ type: "text", text: "Created: " + JSON.stringify(result) }] };
  }
}