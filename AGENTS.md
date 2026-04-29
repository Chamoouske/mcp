# AGENTS.md

## Build & Run

```bash
# Build all MCPs
cd notion && npm run build
cd ../docker && npm run build
cd ../traefik && npm run build

# Run locally (notion requires NOTION_API_KEY in notion/.env)
cd notion && npm start   # http://localhost:3001/mcp
cd ../docker && npm start  # http://localhost:3002/mcp
cd ../traefik && npm start  # http://localhost:3003/mcp

# Docker (requires external traefik network)
docker network create traefik  # one-time setup
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

## Architecture

Monorepo with 3 independent MCP servers. Each package has its own `package.json`, `tsconfig.json`, and `src/` directory. No tests or lint configs present.

## Known Quirks

- MCP SDK uses `StreamableHTTPServerTransport` (not `NodeStreamableHTTPServerTransport`)
- `notion/tsconfig.json`: `noImplicitAny: false` (express type issues)
- `docker/` and `traefik/` have `strict: false` in tsconfig
- docker-mcp container needs `/var/run/docker.sock` volume mounted
- Docker Compose requires external `traefik` network
- CI pushes to `chamoouske/mcp-*` Docker Hub repos on master push

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
