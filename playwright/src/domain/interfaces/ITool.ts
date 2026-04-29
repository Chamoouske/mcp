export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: any;
}

export interface ITool {
  getDefinition(): ToolDefinition;
  execute(args: any): Promise<ToolResult>;
}

export interface ToolResult {
  content: { type: string; text: string }[];
  isError?: boolean;
}
