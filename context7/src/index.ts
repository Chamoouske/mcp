import express, { Request, Response } from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import { Context7Service } from "./infrastructure/context7/Context7Service.js";
import ToolHandler from "./application/services/ToolHandler.js";
import ResolveLibraryIdTool from "./application/tools/ResolveLibraryIdTool.js";
import QueryDocsTool from "./application/tools/QueryDocsTool.js";

const CONTEXT7_API_KEY = process.env.CONTEXT7_API_KEY;

if (!CONTEXT7_API_KEY) {
    console.error("Error: CONTEXT7_API_KEY is not set in environment");
    process.exit(1);
}

function log(level: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    console.error(JSON.stringify({
        timestamp,
        service: "context7-mcp",
        level,
        message,
        ...data,
    }));
}

function createServer() {
    const server = new Server(
        {
            name: "context7-mcp-server",
            version: "1.0.0",
        },
        {
            capabilities: {
                tools: {},
            },
        }
    );

    const context7Service = new Context7Service(CONTEXT7_API_KEY!);
    const toolHandler = new ToolHandler();

    toolHandler.registerTool(new ResolveLibraryIdTool(context7Service));
    toolHandler.registerTool(new QueryDocsTool(context7Service));

    server.setRequestHandler(ListToolsRequestSchema, async () => {
        log("info", "list_tools_request");
        return { tools: toolHandler.getTools() };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
        const { name, arguments: args } = request.params;
        log("info", "tool_call", { tool: name, args: Object.keys(args) });

        try {
            const result = await toolHandler.executeTool(name, args);
            log("info", "tool_success", { tool: name });
            return result;
        } catch (error: any) {
            log("error", "tool_error", { tool: name, error: error.message });
            throw error;
        }
    });

    return server;
}

const app = express();
const PORT = Number(process.env.PORT) || 80;

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
    res.json({
        name: "context7-mcp",
        version: "1.0.0",
        status: "running"
    });
});

function addValidHeaders(req: Request) {
    const accept = req.headers.accept || "";
    if (!accept.includes("application/json") || !accept.includes("text/event-stream")) {
        req.headers.accept = "application/json, text/event-stream";
    }
    const headerKeys = Object.keys(req.headers);
    const rawHeaders: string[] = [];
    for (const key of headerKeys) {
        rawHeaders.push(key);
        rawHeaders.push(req.headers[key] as string);
    }
    req.rawHeaders = rawHeaders;
}

app.post("/mcp", async (req: Request, res: Response) => {
    log("info", "request", { method: "POST", path: "/mcp" });
    addValidHeaders(req);

    const server = createServer();
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
});

app.get("/mcp", async (req: Request, res: Response) => {
    log("info", "request", { method: "GET", path: "/mcp" });
    addValidHeaders(req);

    const server = createServer();
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
    });

    await server.connect(transport);
    await transport.handleRequest(req, res);
});

app.listen(PORT, () => {
    log("info", "server_start", { port: PORT });
});
