# AGENTS.md

## Quick Start

```bash
# Build all MCPs
cd notion && npm run build
cd ../docker && npm run build
cd ../traefik && npm run build

# Run locally (notion requires NOTION_API_KEY in notion/.env)
cd notion && npm start   # http://localhost:3001/mcp
cd ../docker && npm start  # http://localhost:3002/mcp
cd ../traefik && npm start  # http://localhost:3003/mcp

# Or via Docker (requires traefik network: docker network create traefik)
docker-compose up -d --build
```

## MCPs

| MCP | Port | Env Required |
|-----|------|-------------|
| notion | 3001 | `NOTION_API_KEY` (in `notion/.env`) |
| docker | 3002 | - |
| traefik | 3003 | - |

## Commands (per package)

```bash
npm start       # Run HTTP server
npm run build   # Compile TypeScript
```

## Project Structure

```
mcp/
├── notion/     # Notion API MCP (Clean Architecture)
├── docker/    # Docker management MCP
├── traefik/   # Traefik config MCP
└── docker-compose.yml
```

## OpenCode Config

Remote (HTTP):
```json
{
  "notion": { "type": "remote", "url": "http://localhost:3001/mcp" },
  "docker": { "type": "remote", "url": "http://localhost:3002/mcp" },
  "traefik": { "type": "remote", "url": "http://localhost:3003/mcp" }
}
```

Local (stdio):
```json
{
  "notion": { "type": "local", "command": ["node", "path/to/mcp/notion/dist/index.js"] }
}
```

## Important Notes

- MCP SDK uses `StreamableHTTPServerTransport` (not `NodeStreamableHTTPServerTransport`)
- `tsconfig.json`: set `noImplicitAny: false` if TypeScript errors about express types
- docker-mcp container needs `/var/run/docker.sock` volume mounted for Docker access
- Docker Compose requires external `traefik` network: `docker network create traefik`