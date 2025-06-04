# MCP Domains Server - Streamable HTTP Transport

This MCP server provides domain name information via the domainsdb.info API using the Streamable HTTP transport.

## Features

- Search domains with various filters (wildcards, DNS records, country, etc.)
- Get detailed information about specific domains
- Streamable HTTP transport with SSE support for notifications
- Single endpoint handling both POST and GET requests

## Installation

```bash
# Install dependencies
pnpm install

# Build TypeScript
pnpm build
```

## Running the Server

```bash
# Development mode (with hot reload)
pnpm dev

# Production mode
pnpm start

# Custom port
PORT=8080 pnpm start
```

The server runs on `http://127.0.0.1:3000/mcp` by default.

## Available Tools

### search_domains
Search for domains using various filters:
- `domain`: Domain name (supports wildcards with *)
- `zone`: Top-level domain (e.g., com, org)
- `country`: Country code (e.g., US, UK)
- `isDead`: Filter dead/inactive domains (true/false)
- `A`, `NS`, `CNAME`, `MX`, `TXT`: DNS record filters
- `page`: Page number for pagination
- `limit`: Results per page (max 50)

### get_domain_info
Get information about a specific domain:
- `domain`: Domain name to look up (required)

## Testing

### Using the test client:
```bash
node test-client.js
```

### Using test scripts:
```bash
# Test with SSE responses (default)
./test-sse.sh

# Test basic functionality
./test-streamable.sh
```

### Manual testing:
```bash
# Note: The server requires Accept header with both application/json and text/event-stream
# Responses are in SSE format by default

# Initialize connection
curl -X POST http://127.0.0.1:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{}},"id":1}'

# List tools
curl -X POST http://127.0.0.1:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":2}'

# Search domains
curl -X POST http://127.0.0.1:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"search_domains","arguments":{"domain":"*.example.com","limit":5}},"id":3}'
```

## Transport Details

The Streamable HTTP transport:
- Uses a single endpoint for all communication
- Requires both `application/json` and `text/event-stream` in Accept header
- Returns responses in SSE (Server-Sent Events) format
- Each connection creates a new server instance (stateless mode)
- Provides CORS support for browser-based clients
- Handles cleanup automatically on connection close

## Integration with Claude Desktop

The Streamable HTTP transport can be used with Claude Desktop or other MCP clients. Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "domains-streamable": {
      "command": "node",
      "args": ["/path/to/mcp-domains-streamable/dist/index.js"],
      "env": {
        "PORT": "3000"
      }
    }
  }
}
```

Or use with any HTTP client that supports the MCP Streamable HTTP protocol.

## Comparison with SSE Transport

| Feature | SSE Transport | Streamable HTTP |
|---------|--------------|-----------------|
| **Implementation** | Custom SSE handling | SDK's StreamableHTTPServerTransport |
| **Session Management** | Stateful with session IDs | Stateless (new instance per request) |
| **Endpoints** | Multiple (`/sse`, `/messages`, etc.) | Single (`/mcp`) |
| **Performance** | Better for many concurrent clients | Simpler, better for occasional use |
| **Memory Usage** | Higher (persistent connections) | Lower (no persistent state) |