# MCP Domains Servers

Two Model Context Protocol (MCP) servers that provide domain name information via the [domainsdb.info API](https://domainsdb.info/).

## Overview

This project contains two implementations of an MCP server for domain information:

1. **STDIO Transport Server** (`mcp-domains-stdio`) - Recommended for Claude Desktop
2. **SSE Transport Server** (`mcp-domains-sse`) - For web-based clients

Both servers provide identical functionality through different transport mechanisms.

## Quick Start

### For Claude Desktop Users (STDIO)

```bash
# Navigate to STDIO server
cd mcp-domains-stdio

# Install and build
pnpm install
pnpm build

# Add to Claude Desktop configuration
# See mcp-domains-stdio/README.md for details
```

### For Web Applications (SSE)

```bash
# Navigate to SSE server
cd mcp-domains-sse

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

With Claude Desktop, you can ask:
- "Search for all domains containing 'shop'"
- "Find .org domains with CloudFlare nameservers"
- "Get information about example.com"
- "Show me domains from Germany with MX records"

## Transport Comparison

| Feature | STDIO | SSE |
|---------|-------|-----|
| **Best for** | Claude Desktop, CLI tools | Web apps, multiple clients |
| **Setup** | No server needed | Requires running server |
| **Communication** | Standard I/O streams | HTTP + Server-Sent Events |
| **Multiple clients** | No | Yes |
| **Debugging** | Simple (visible streams) | HTTP tools |

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
│   Claude    │ ←────────────────→  │ MCP Server  │ ←─────────────→ │ domainsdb.info│
│   Desktop   │    (STDIO or SSE)    │             │                 │     API       │
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
├── mcp-domains-stdio/     # STDIO transport implementation
│   ├── src/
│   │   └── index.ts      # Main server code
│   ├── package.json
│   └── README.md         # Detailed STDIO docs
│
├── mcp-domains-sse/       # SSE transport implementation
│   ├── src/
│   │   └── index.ts      # Express server + MCP
│   ├── package.json
│   └── README.md         # Detailed SSE docs
│
└── README.md             # This file
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