# MCP Domains STDIO Server

A Model Context Protocol (MCP) server that provides domain name information via the domainsdb.info API using STDIO transport.

## What is this?

This MCP server allows AI assistants like Claude to search for domain information directly through a standardized interface. It communicates using STDIO (standard input/output), making it perfect for integration with Claude Desktop and other MCP clients.

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd mcp-domains-stdio

# Install dependencies
pnpm install

# Build the TypeScript code
pnpm build
```

## How to Use

### With Claude Desktop

1. Build the server:
   ```bash
   pnpm build
   ```

2. Add to your Claude Desktop configuration file:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

   ```json
   {
     "mcpServers": {
       "domains": {
         "command": "node",
         "args": ["/absolute/path/to/mcp-domains-stdio/dist/index.js"]
       }
     }
   }
   ```

3. Restart Claude Desktop

4. You can now ask Claude to:
   - "Search for domains containing 'example'"
   - "Get information about example.com"
   - "Find all .org domains with the word 'test'"

### Available Tools

#### `search_domains`

Search for domain names with various filters:

```typescript
{
  domain?: string,    // Domain name to search (supports wildcards)
  zone?: string,      // Domain zone (e.g., com, org, net)
  country?: string,   // Country code
  isDead?: string,    // Filter by dead domains (true/false)
  A?: string,         // A record IP address
  NS?: string,        // Name server
  CNAME?: string,     // CNAME record
  MX?: string,        // Mail exchange record
  TXT?: string,       // TXT record
  page?: number,      // Page number (default: 1)
  limit?: number      // Results per page (default: 50, max: 50)
}
```

Example: "Search for domains containing 'shop' in the .com zone"

#### `get_domain_info`

Get detailed information about a specific domain:

```typescript
{
  domain: string  // Exact domain name to look up (required)
}
```

Example: "Get information about github.com"

## Development

### Running in Development Mode

```bash
pnpm dev
```

### Testing the Server

1. **Manual Testing with JSON-RPC**:
   ```bash
   # Initialize connection
   echo '{"jsonrpc": "2.0", "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test", "version": "1.0"}}, "id": 1}' | node dist/index.js

   # List available tools
   echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 2}' | node dist/index.js

   # Search for domains
   echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "search_domains", "arguments": {"domain": "example", "limit": 3}}, "id": 3}' | node dist/index.js
   ```

2. **Using MCP Inspector**:
   ```bash
   npx @modelcontextprotocol/inspector node dist/index.js
   ```

### How STDIO Transport Works

The STDIO transport is the simplest MCP transport:

1. The client (e.g., Claude Desktop) starts the server as a subprocess
2. Communication happens through:
   - **stdin**: Client sends JSON-RPC requests to the server
   - **stdout**: Server sends JSON-RPC responses back
   - **stderr**: Server logs and debug messages

This makes it very reliable and easy to debug since you can see all communication in real-time.

## Troubleshooting

### Server not appearing in Claude Desktop

1. Make sure the path in your configuration is absolute, not relative
2. Check that the server builds successfully: `pnpm build`
3. Try running the server manually to check for errors: `node dist/index.js`
4. Check Claude Desktop logs for any error messages

### API Rate Limiting

The domainsdb.info API is free but may have rate limits. If you encounter errors, wait a few moments before trying again.

### Debugging

To see what's happening, you can run the server manually and watch stderr:
```bash
node dist/index.js 2>debug.log
# In another terminal, send requests and watch debug.log
```

## API Information

This server uses the free [domainsdb.info API](https://domainsdb.info/) which provides:
- Domain registration information
- DNS records (A, NS, CNAME, MX, TXT)
- Search capabilities with wildcards
- No authentication required

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