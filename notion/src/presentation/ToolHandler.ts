import { ITool, ToolDefinition, ToolResult } from "./interfaces/ITool.js";

export default class ToolHandler {
  private tools: Map<string, ITool> = new Map();

  registerTool(tool: ITool): void {
    const def = tool.getDefinition();
    this.tools.set(def.name, tool);
  }

  getTools(): ToolDefinition[] {
    return Array.from(this.tools.values()).map((tool) => tool.getDefinition());
  }

  async handle(name: string, args: any): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return {
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
        isError: true,
      };
    }
    try {
      return await tool.execute(args);
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true,
      };
    }
  }
}