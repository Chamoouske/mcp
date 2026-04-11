export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, ToolProperty>;
    required?: string[];
  };
}

export interface ToolProperty {
  type: string;
  description?: string;
  default?: unknown;
}

export interface ToolInput {
  [key: string]: unknown;
}

export interface ToolResult {
  content: { type: string; text: string }[];
  isError?: boolean;
}