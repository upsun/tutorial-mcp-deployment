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
- **mcp-domains-sse**: Custom SSE implementation with session management on port 3000
  - Multiple endpoints: `/sse`, `/messages`, `/health`, `/`
  - Stateful with session IDs for multiple concurrent clients
  - Manual Express setup with custom SSE handling
- **mcp-domains-streamable**: SDK's StreamableHTTPServerTransport on port 3000
  - Single endpoint: `/mcp` (handles both POST and GET)
  - Stateless mode (new server instance per request)
  - Built-in SSE support via SDK
  - Requires Accept header: `application/json, text/event-stream`

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

## Testing

### mcp-domains-sse
```bash
cd mcp-domains-sse
node test-client.js          # Node.js client test
./test-sse.sh               # curl-based test
```

### mcp-domains-streamable
```bash
cd mcp-domains-streamable
node test-client.js          # Node.js client test
./test-sse.sh               # curl with SSE parsing
./test-streamable.sh        # basic curl test
```

## Important Notes
- Both servers require running before clients can connect
- Both servers use the same domain search API internally
- Error responses include `isError: true` flag
- No rate limiting implemented - be mindful of API usage
- SSE server: Multiple endpoints, session-based
- Streamable server: Single `/mcp` endpoint, stateless
- Streamable responses are in SSE format by default