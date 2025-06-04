# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains two Model Context Protocol (MCP) servers that provide domain name information via the domainsdb.info API. Both servers expose identical functionality through different transport mechanisms.

## Common Commands

### Development
```bash
# Install dependencies
pnpm install

# Build TypeScript to JavaScript
pnpm build

# Run in development mode (using tsx)
pnpm dev

# Run production build
pnpm start

# Run server on custom port
PORT=8080 pnpm start  # For both mcp-domains-sse and mcp-domains-streamable
```

### No lint or test commands are currently configured.

## Architecture

### Server Structure
Both servers follow the same pattern:
1. `DomainsServer` class with MCP server instance
2. Tool handlers registered in `setupToolHandlers()`
3. Transport-specific connection in `run()` method
4. Shared API interaction logic

### Key Differences
- **mcp-domains-sse**: Uses SSEServerTransport with built-in HTTP server on port 3000
- **mcp-domains-streamable**: Uses StreamableHttpServerTransport with single endpoint for POST/GET requests

### Exposed Tools
- `search_domains`: Accepts filters (domain, zone, country, isDead, A, NS, CNAME, MX, TXT, page, limit)
- `get_domain_info`: Requires domain parameter, returns first match from search

### API Integration
- Base URL: `https://api.domainsdb.info/v1`
- Endpoint: `/domains/search`
- Response includes domains array with DNS records
- Pagination: max 50 results per page

## TypeScript Configuration
- Target: ES2022
- Module: Node16
- Strict mode enabled
- Source maps and declarations generated
- Output to `dist/` directory

## Important Notes
- Both servers require running before Claude Desktop can connect
- Both servers use the same domain search API internally
- Error responses include `isError: true` flag
- No rate limiting implemented - be mindful of API usage
- Streamable server endpoint: `/mcp` (handles both POST and GET)