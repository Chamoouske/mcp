import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { TraefikService } from './infrastructure/traefik/TraefikService.js';
import { RouterTools, MiddlewareTools, ServiceTools, SystemTools } from './application/tools/index.js';

const TRAEFIK_API_URL = process.env.TRAEFIK_API_URL || 'http://traefik:8080';

const traefikService = new TraefikService(TRAEFIK_API_URL);
const routerTools = new RouterTools(traefikService);
const middlewareTools = new MiddlewareTools(traefikService);
const serviceTools = new ServiceTools(traefikService);
const systemTools = new SystemTools(traefikService);

const server = new Server(
  {
    name: 'traefik-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_routers',
        description: 'List all Traefik HTTP routers',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_router',
        description: 'Get details of a specific router',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Router name' },
          },
          required: ['name'],
        },
      },
      {
        name: 'create_router',
        description: 'Create a new Traefik router',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Router name' },
            rule: { type: 'string', description: 'Routing rule (e.g., PathPrefix(`/api`)' },
            service: { type: 'string', description: 'Target service name' },
            middlewares: { type: 'array', items: { type: 'string' }, description: 'Middleware names' },
            tls: { type: 'object', properties: { certResolver: { type: 'string' } } },
          },
          required: ['name', 'rule', 'service'],
        },
      },
      {
        name: 'update_router',
        description: 'Update an existing router',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Router name' },
            rule: { type: 'string', description: 'Routing rule' },
            service: { type: 'string', description: 'Target service name' },
            middlewares: { type: 'array', items: { type: 'string' } },
            tls: { type: 'object', properties: { certResolver: { type: 'string' } } },
          },
          required: ['name'],
        },
      },
      {
        name: 'delete_router',
        description: 'Delete a router',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Router name' },
          },
          required: ['name'],
        },
      },
      {
        name: 'list_middlewares',
        description: 'List all Traefik middlewares',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_middleware',
        description: 'Get details of a specific middleware',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Middleware name' },
          },
          required: ['name'],
        },
      },
      {
        name: 'create_middleware',
        description: 'Create a new Traefik middleware',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Middleware name' },
            type: { type: 'string', description: 'Middleware type (e.g., basicauth, compress, rateLimit)' },
            config: { type: 'object', description: 'Middleware configuration' },
          },
          required: ['name', 'type'],
        },
      },
      {
        name: 'delete_middleware',
        description: 'Delete a middleware',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Middleware name' },
          },
          required: ['name'],
        },
      },
      {
        name: 'list_services',
        description: 'List all Traefik HTTP services',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'reload_config',
        description: 'Reload Traefik configuration',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_health',
        description: 'Get Traefik health and overview',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_routers':
        return await routerTools.listRouters();
      case 'get_router':
        return await routerTools.getRouter(args);
      case 'create_router':
        return await routerTools.createRouter(args);
      case 'update_router':
        return await routerTools.updateRouter(args);
      case 'delete_router':
        return await routerTools.deleteRouter(args);
      case 'list_middlewares':
        return await middlewareTools.listMiddlewares();
      case 'get_middleware':
        return await middlewareTools.getMiddleware(args);
      case 'create_middleware':
        return await middlewareTools.createMiddleware(args);
      case 'delete_middleware':
        return await middlewareTools.deleteMiddleware(args);
      case 'list_services':
        return await serviceTools.listServices();
      case 'reload_config':
        return await systemTools.reloadConfig();
      case 'get_health':
        return await systemTools.getHealth();
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: () => crypto.randomUUID(),
});

await transport.start();
await server.connect(transport);

console.log('Traefik MCP Server running on HTTP');

process.on('SIGTERM', async () => {
  await server.close();
  process.exit(0);
});