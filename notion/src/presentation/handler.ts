import type { ToolInput, ToolResult, ToolDefinition } from "./tools.js";
import type {
  PageUseCases,
  DatabaseUseCases,
  CommentUseCases,
  UserUseCases,
  SearchUseCases,
} from "../application/useCases.js";

export class ToolHandler {
  constructor(
    private pageUseCases: PageUseCases,
    private databaseUseCases: DatabaseUseCases,
    private commentUseCases: CommentUseCases,
    private userUseCases: UserUseCases,
    private searchUseCases: SearchUseCases
  ) {}

  async handle(toolName: string, args: ToolInput): Promise<ToolResult> {
    try {
      switch (toolName) {
        case "notion_search": {
          const result = await this.searchUseCases.search(args.query as string, args.page_size as number);
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        case "notion_fetch": {
          const id = this.extractId(args.id as string);
          const page = await this.pageUseCases.getPage(id);
          if (page) {
            return { content: [{ type: "text", text: JSON.stringify(page, null, 2) }] };
          }
          const db = await this.databaseUseCases.getDatabase(id);
          return { content: [{ type: "text", text: JSON.stringify(db, null, 2) }] };
        }

        case "notion_create_page": {
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

        case "notion_create_database": {
          const schema = args.schema ? JSON.parse(args.schema as string) : {};
          const result = await this.databaseUseCases.createDatabase({
            parentPageId: args.parent as string,
            title: args.title as string,
            schema,
            description: args.description as string,
          });
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        case "notion_update_page": {
          const properties = args.properties ? JSON.parse(args.properties as string) : undefined;
          const result = await this.pageUseCases.updatePage(
            args.page_id as string,
            properties,
            args.icon as string,
            args.cover as string
          );
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        case "notion_delete_page": {
          await this.pageUseCases.deletePage(args.page_id as string);
          return { content: [{ type: "text", text: "Page archived successfully" }] };
        }

        case "notion_list_database_items": {
          const filter = args.filter ? JSON.parse(args.filter as string) : undefined;
          const sorts = args.sorts ? JSON.parse(args.sorts as string) : undefined;
          const result = await this.databaseUseCases.queryDatabase(args.database_id as string, filter, sorts);
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        case "notion_query_database": {
          const filter = args.filter ? JSON.parse(args.filter as string) : undefined;
          const sorts = args.sorts ? JSON.parse(args.sorts as string) : undefined;
          const result = await this.databaseUseCases.queryDatabase(args.database_id as string, filter, sorts);
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        case "notion_create_comment": {
          const result = await this.commentUseCases.createComment(args.page_id as string, args.content as string);
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        case "notion_get_comments": {
          const result = await this.commentUseCases.getComments(args.page_id as string);
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        case "notion_get_users": {
          const result = await this.userUseCases.listUsers(args.query as string);
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        case "notion_get_teams": {
          const result = await this.userUseCases.listUsers();
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
    }
  }

  private extractId(input: string): string {
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const match = input.match(uuidRegex);
    return match ? match[0] : input.replace(/[^a-f0-9-]/gi, "");
  }
}