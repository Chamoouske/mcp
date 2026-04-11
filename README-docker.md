# Docker Compose - MCP Servers

## Configuração

### 1. Variáveis de ambiente

```bash
# Copie o exemplo e preencha com suas chaves
cp notion/.env.example notion/.env

# Edite o arquivo notion/.env com sua NOTION_API_KEY
```

## Executar

```bash
# Build e start
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

## Portas

| Serviço | Porta |
|---------|-------|
| notion-mcp | 3001 |
| docker-mcp | 3002 |

## Configuração OpenCode

Edite `C:\Users\ajaxl\.config\opencode\opencode.jsonc`:

**Notion:**
```json
"notion": {
    "type": "remote",
    "url": "http://localhost:3001/mcp"
}
```

**Docker:**
```json
"docker": {
    "type": "remote", 
    "url": "http://localhost:3002/mcp"
}
```

Para usar local (sem Docker), configure assim:
```json
"notion": {
    "type": "local",
    "command": ["node", "C:\\Users\\ajaxl\\Documents\\dev\\mcp\\notion\\dist\\index.js"]
}
```