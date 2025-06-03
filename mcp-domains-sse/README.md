# MCP Domains SSE Server

A Model Context Protocol (MCP) server that provides domain name information via the domainsdb.info API using SSE (Server-Sent Events) transport.

## What is this?

This MCP server allows AI assistants and other clients to search for domain information through a web-based interface. It uses Server-Sent Events (SSE) for real-time communication, making it suitable for web applications and clients that prefer HTTP-based transports.

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd mcp-domains-sse

# Install dependencies
pnpm install

# Build the TypeScript code
pnpm build
```

## How to Use

### Starting the Server

1. Build the server:
   ```bash
   pnpm build
   ```

2. Start the server:
   ```bash
   pnpm start
   
   # Or with a custom port:
   PORT=8080 pnpm start
   ```

3. The server will start and display:
   ```
   MCP Domains SSE Server running on http://localhost:3000
   SSE endpoint: http://localhost:3000/sse
   Messages endpoint: http://localhost:3000/messages
   Health check: http://localhost:3000/health
   ```

### With Claude Desktop

1. First, start the SSE server (see above)

2. Add to your Claude Desktop configuration:
   ```json
   {
     "mcpServers": {
       "domains-sse": {
         "transport": {
           "type": "sse",
           "url": "http://localhost:3000"
         }
       }
     }
   }
   ```

3. Restart Claude Desktop

4. The server must be running for Claude to connect to it

### Available Tools

The SSE server provides the same tools as the STDIO version:

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

#### `get_domain_info`

Get detailed information about a specific domain:

```typescript
{
  domain: string  // Exact domain name to look up (required)
}
```

## How SSE Transport Works

The SSE transport uses HTTP for bidirectional communication:

1. **Initial Connection**: Client connects to `GET /sse`
   - Server establishes an SSE stream
   - Server sends an `endpoint` event with the message URL and session ID

2. **Message Exchange**:
   - **Client → Server**: POST requests to `/messages?sessionId=xxx`
   - **Server → Client**: SSE events on the established stream

3. **Session Management**: Each connection gets a unique session ID for message routing

### Server Endpoints

- `GET /` - Server information
- `GET /sse` - SSE event stream endpoint
- `POST /messages?sessionId=xxx` - Message handling endpoint
- `GET /health` - Health check with session information

## Development

### Running in Development Mode

```bash
pnpm dev
```

### Testing the Server

1. **Check server health**:
   ```bash
   curl http://localhost:3000/health
   ```

2. **Test SSE connection**:
   ```bash
   curl -N http://localhost:3000/sse
   ```
   You should see an `endpoint` event with the message URL.

3. **Using the test client** (create a test-client.js):
   ```javascript
   import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
   import { Client } from '@modelcontextprotocol/sdk/client/index.js';

   const transport = new SSEClientTransport(new URL('http://localhost:3000/sse'));
   const client = new Client({ name: 'test', version: '1.0.0' }, { capabilities: {} });
   
   await client.connect(transport);
   const tools = await client.listTools();
   console.log(tools);
   ```

### Architecture

The SSE server maintains:
- A separate MCP server instance per connection
- Session mapping for routing messages
- Automatic cleanup on disconnect

This design allows multiple clients to connect simultaneously without interference.

## Troubleshooting

### "SSEServerTransport already started!" Error
This is handled internally now. Each connection gets its own transport instance.

### Session Not Found
- Check the health endpoint to see active sessions
- Ensure your client is using the correct session ID from the endpoint event
- Sessions are cleaned up when connections close

### CORS Issues
The server includes CORS headers for cross-origin requests. If you still have issues:
- Check that your client sends appropriate headers
- Verify the Origin header in your requests

### Server Won't Start
- Check if port 3000 is already in use
- Use `PORT=8080 pnpm start` to use a different port
- Check for any build errors with `pnpm build`

## Differences from STDIO Transport

| Feature | SSE | STDIO |
|---------|-----|-------|
| Transport | HTTP/SSE | Standard I/O |
| Server Required | Yes (Express) | No |
| Multiple Clients | Yes | No |
| Web Compatible | Yes | No |
| Claude Desktop | Supported | Recommended |

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