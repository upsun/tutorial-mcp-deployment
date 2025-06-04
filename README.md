# MCP Domains Servers

Two Model Context Protocol (MCP) servers that provide domain name information via the [domainsdb.info API](https://domainsdb.info/).

## Overview

This project contains two implementations of an MCP server for domain information:

1. **SSE Transport Server** (`mcp-domains-sse`) - For web-based clients with multiple connections
2. **Streamable HTTP Transport Server** (`mcp-domains-streamable`) - Modern HTTP transport with SSE support

Both servers provide identical functionality through different transport mechanisms.

## Quick Start

### SSE Transport Server

```bash
# Navigate to SSE server
cd mcp-domains-sse

# Install and build
pnpm install
pnpm build

# Start the server
pnpm start
```

### Streamable HTTP Transport Server

```bash
# Navigate to Streamable HTTP server
cd mcp-domains-streamable

# Install and build
pnpm install
pnpm build

# Start the server
pnpm start
```

## Features

Both servers provide tools to:

- **Search domains** with wildcards and filters
- **Get detailed information** about specific domains
- **Filter by DNS records** (A, NS, CNAME, MX, TXT)
- **Filter by attributes** (country, zone, dead status)

### Example Queries

You can use these servers to:
- "Search for all domains containing 'shop'"
- "Find .org domains with CloudFlare nameservers"
- "Get information about example.com"
- "Show me domains from Germany with MX records"

## Transport Comparison

| Feature | SSE | Streamable HTTP |
|---------|-----|-----------------|
| **Best for** | Web apps, multiple concurrent connections | Modern HTTP clients, Claude Desktop |
| **Setup** | Requires running server | Requires running server |
| **Communication** | HTTP + Server-Sent Events | HTTP POST/GET with SSE responses |
| **Multiple clients** | Yes (session-based) | Yes (stateless) |
| **Session management** | Stateful with session IDs | Stateless (new instance per request) |
| **SDK version** | Custom SSE implementation | Built-in StreamableHTTPServerTransport |

## Technical Details

### MCP (Model Context Protocol)

MCP is a protocol that enables AI assistants to interact with external tools and data sources. These servers implement MCP to give AI assistants the ability to search domain information.

### Data Source

Both servers use the free [domainsdb.info API](https://domainsdb.info/), which provides:
- Domain registration data
- DNS records
- Search with wildcards
- No authentication required

### Architecture

```
┌─────────────┐     MCP Protocol    ┌─────────────┐     HTTP API    ┌──────────────┐
│ MCP Client  │ ←────────────────→  │ MCP Server  │ ←─────────────→ │ domainsdb.info│
│             │  (SSE or Streamable) │             │                 │     API       │
└─────────────┘                      └─────────────┘                 └──────────────┘
```

## Development

Both servers are written in TypeScript and use:
- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `typescript` - Type safety
- `tsx` - Development mode execution
- `pnpm` - Package management

### Project Structure

```
mcp-tutorial/
├── mcp-domains-sse/           # SSE transport implementation
│   ├── src/
│   │   └── index.ts          # Express server + custom SSE MCP
│   ├── package.json
│   ├── test-client.js
│   └── README.md             # Detailed SSE docs
│
├── mcp-domains-streamable/    # Streamable HTTP transport implementation
│   ├── src/
│   │   └── index.ts          # Express server + StreamableHTTPServerTransport
│   ├── package.json
│   ├── test-client.js
│   ├── test-sse.sh
│   └── README.md             # Detailed Streamable docs
│
├── CLAUDE.md                  # Project guidance for Claude Code
└── README.md                  # This file
```

## Getting Help

- Check individual server READMEs for detailed setup and troubleshooting
- MCP Protocol documentation: [modelcontextprotocol.io](https://modelcontextprotocol.io)
- domainsdb.info API docs: [domainsdb.info/api-documentation](https://domainsdb.info/api-documentation)

## License

MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.