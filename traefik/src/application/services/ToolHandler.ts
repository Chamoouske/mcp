import { ITool, ToolDefinition, ToolResult } from "../../domain/interfaces/ITool.js";

export default class ToolHandler {
  private tools: Map<string, ITool> = new Map();

  registerTool(tool: ITool): void {
    const def = tool.getDefinition();
    this.tools.set(def.name, tool);
  }

  getTools(): ToolDefinition[] {
    return Array.from(this.tools.values()).map((tool) => tool.getDefinition());
  }

  async executeTool(name: string, args: any): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      return {
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
        isError: true,
        task: null,
      };
    }
    try {
      const result = await tool.execute(args);
      return { ...result, task: null };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true,
        task: null,
      };
    }
  }

  hasTool(name: string): boolean {
    return this.tools.has(name);
  }
}