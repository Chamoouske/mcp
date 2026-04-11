# AGENTS.md

## Quick Start

```bash
# Build both MCPs
cd notion && npm run build
cd ../docker && npm run build

# Run locally (requires NOTION_API_KEY in notion/.env)
cd notion && npm start        # http://localhost:3001/mcp
cd ../docker && npm start   # http://localhost:3002/mcp

# Or via Docker
docker-compose up -d --build
```

## MCPs

| MCP | Port | Env Required |
|-----|------|-------------|
| notion | 3001 | `NOTION_API_KEY` (Notion token) |
| docker | 3002 | - |

## Commands

```bash
npm start        # Run with HTTP server
npm run dev     # Dev mode (notion only)
npm run build  # Compile TypeScript
```

## OpenCode Config

Use `type: "remote"` for HTTP mode:
```json
{
  "notion": { "type": "remote", "url": "http://localhost:3001/mcp" },
  "docker": { "type": "remote", "url": "http://localhost:3002/mcp" }
}
```

Use `type: "local"` for stdio mode:
```json
{
  "notion": { "type": "local", "command": ["node", "path/to/notion/dist/index.js"] }
}
```

## Project Structure

```
mcp/
├── notion/         # Notion API MCP (Clean Architecture)
│   └── src/
│       ├── index.ts           # Entry: Express + StreamableHTTPServerTransport
│       ├── domain/         # Entities, repositories interfaces
│       ├── application/   # Use cases
│       ├── infrastructure/  # Notion client, implementations
│       └── presentation/  # Tools, handlers
├── docker/        # Docker management MCP
│   └── src/
│       ├── index.ts           # Entry: Express + StreamableHTTPServerTransport
│       ├── domain/interfaces/
│       ├── application/tools/
│       └── infrastructure/docker/
├── docker-compose.yml
└── README-docker.md
```

## Important Notes

- MCP SDK uses `StreamableHTTPServerTransport` (not `NodeStreamableHTTPServerTransport`)
- tsconfig: set `noImplicitAny: false` if TypeScript errors about express types
- docker-mcp container needs `/var/run/docker.sock` volume mounted for Docker access