# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Build
- Build all: `docker-compose up --build` (requires external `traefik` network)
- Build single: `cd <service> && npm run build` (TS -> `dist/`)

## Test & Lint
- Lint: `eslint src/ --ext .ts` (custom config)
- Test: `vitest run --config vitest.config.ts` (tests co‑located)

## Code Style
- Imports: Named only, semicolons
- Error handling: `try/catch` + `console.error`
- Logging: JSON with timestamp, service, level, message, extra

## Architecture
- 4 MCP servers (docker, notion, playwright, traefik) via `@modelcontextprotocol/sdk`
- Tool registration via `ToolHandler` in `src/application/services/ToolHandler.ts`
- Domain → Application → Infrastructure layering
- Docker service: mounts `/var/run/docker.sock`, runs privileged
- Traefik: requires `TRAEFIK_API_URL`, routes via `PathPrefix`
- Notion: unique `presentation/` layout, uses `@notionhq/client`
- Playwright: IP‑isolated sessions via `PlaywrightSessionManager`
- All services listen on port 80 internally, exposed via Traefik

## Gotchas
- Pre‑create `traefik` Docker network (`docker network create traefik`)
- Tests must be in same dir as source for Vitest
- Health check hits `/mcp`; no localStorage in webview
- Docker socket access required, runs privileged
- No ESLint/Vitest config – rely on `package.json` scripts