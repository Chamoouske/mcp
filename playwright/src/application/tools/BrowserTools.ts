import { ITool, ToolDefinition, ToolResult } from "../../domain/interfaces/ITool.js";
import PlaywrightSessionManager from "../../infrastructure/playwright/PlaywrightSessionManager.js";

abstract class BaseBrowserTool implements ITool {
  constructor(
    protected readonly sessionManager: PlaywrightSessionManager,
    protected readonly clientId: string
  ) {}

  abstract getDefinition(): ToolDefinition;
  abstract execute(args: any): Promise<ToolResult>;
}

export class PlaywrightNavigateTool extends BaseBrowserTool {
  getDefinition(): ToolDefinition {
    return {
      name: "playwright_navigate",
      description: "Navigate browser page to URL for current requester IP session",
      inputSchema: {
        type: "object",
        properties: {
          url: { type: "string", description: "Target URL" },
          waitUntil: {
            type: "string",
            description: "Navigation wait strategy",
            enum: ["load", "domcontentloaded", "networkidle", "commit"],
            default: "load",
          },
        },
        required: ["url"],
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    const session = await this.sessionManager.getOrCreateSession(this.clientId);
    const response = await session.page.goto(args.url, {
      waitUntil: args.waitUntil || "load",
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              clientId: this.clientId,
              url: session.page.url(),
              status: response?.status() ?? null,
              ok: response?.ok() ?? null,
              title: await session.page.title(),
            },
            null,
            2
          ),
        },
      ],
    };
  }
}

export class PlaywrightClickTool extends BaseBrowserTool {
  getDefinition(): ToolDefinition {
    return {
      name: "playwright_click",
      description: "Click an element on the current requester IP page",
      inputSchema: {
        type: "object",
        properties: {
          selector: { type: "string", description: "Element selector" },
          timeoutMs: { type: "number", description: "Timeout in milliseconds", default: 10000 },
        },
        required: ["selector"],
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    const session = await this.sessionManager.getOrCreateSession(this.clientId);
    await session.page.click(args.selector, { timeout: args.timeoutMs || 10000 });
    return {
      content: [{ type: "text", text: `Clicked '${args.selector}' for ${this.clientId}` }],
    };
  }
}

export class PlaywrightFillTool extends BaseBrowserTool {
  getDefinition(): ToolDefinition {
    return {
      name: "playwright_fill",
      description: "Fill input element on the current requester IP page",
      inputSchema: {
        type: "object",
        properties: {
          selector: { type: "string", description: "Element selector" },
          value: { type: "string", description: "Input value" },
          timeoutMs: { type: "number", description: "Timeout in milliseconds", default: 10000 },
        },
        required: ["selector", "value"],
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    const session = await this.sessionManager.getOrCreateSession(this.clientId);
    await session.page.fill(args.selector, args.value, { timeout: args.timeoutMs || 10000 });
    return {
      content: [{ type: "text", text: `Filled '${args.selector}' for ${this.clientId}` }],
    };
  }
}

export class PlaywrightScreenshotTool extends BaseBrowserTool {
  getDefinition(): ToolDefinition {
    return {
      name: "playwright_screenshot",
      description: "Take screenshot of current requester IP page",
      inputSchema: {
        type: "object",
        properties: {
          fullPage: { type: "boolean", default: true },
          type: { type: "string", enum: ["png", "jpeg"], default: "png" },
          quality: { type: "number", description: "JPEG quality (0-100)" },
        },
      },
    };
  }

  async execute(args: any): Promise<ToolResult> {
    const session = await this.sessionManager.getOrCreateSession(this.clientId);
    const type = args.type || "png";
    const screenshot = await session.page.screenshot({
      fullPage: args.fullPage ?? true,
      type,
      quality: type === "jpeg" ? args.quality : undefined,
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              clientId: this.clientId,
              url: session.page.url(),
              mimeType: type === "jpeg" ? "image/jpeg" : "image/png",
              base64: screenshot.toString("base64"),
            },
            null,
            2
          ),
        },
      ],
    };
  }
}

export class PlaywrightContentTool extends BaseBrowserTool {
  getDefinition(): ToolDefinition {
    return {
      name: "playwright_content",
      description: "Get current page content for requester IP session",
      inputSchema: {
        type: "object",
        properties: {},
      },
    };
  }

  async execute(): Promise<ToolResult> {
    const session = await this.sessionManager.getOrCreateSession(this.clientId);
    return {
      content: [
        {
          type: "text",
          text: await session.page.content(),
        },
      ],
    };
  }
}

export class PlaywrightCloseSessionTool extends BaseBrowserTool {
  getDefinition(): ToolDefinition {
    return {
      name: "playwright_close_session",
      description: "Close browser session bound to requester IP",
      inputSchema: {
        type: "object",
        properties: {},
      },
    };
  }

  async execute(): Promise<ToolResult> {
    const closed = await this.sessionManager.closeSession(this.clientId);
    return {
      content: [
        {
          type: "text",
          text: closed
            ? `Closed Playwright session for ${this.clientId}`
            : `No active session for ${this.clientId}`,
        },
      ],
    };
  }
}
