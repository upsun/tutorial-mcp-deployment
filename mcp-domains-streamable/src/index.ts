#!/usr/bin/env node
import express from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolResult,
  TextContent,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

interface DomainRecord {
  domain: string;
  create_date?: string;
  update_date?: string;
  country?: string;
  isDead?: string;
  A?: string[];
  NS?: string[];
  CNAME?: string[];
  MX?: string[];
  TXT?: string[];
}

interface DomainsDBResponse {
  domains: DomainRecord[];
  time: string;
  next_page?: string;
  total?: number;
}

const API_BASE_URL = 'https://api.domainsdb.info/v1';

class DomainsServer {
  private app: express.Application;

  constructor() {
    this.app = express();
    this.app.use(express.json());
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Enable CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      next();
    });

    // Main MCP endpoint - handles both POST and GET
    this.app.all('/mcp', async (req, res) => {
      const server = new Server({
        name: 'mcp-domains-streamable',
        version: '1.0.0',
      }, {
        capabilities: {
          tools: {},
        },
      });

      this.setupToolHandlers(server);

      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined, // Stateless mode
        enableJsonResponse: !!(req.headers.accept && !req.headers.accept.includes('text/event-stream')),
      });

      server.onerror = (error) => {
        console.error('[MCP Error]', error);
      };

      try {
        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
      } catch (error) {
        console.error('Request handling error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal server error' });
        }
      }

      // Cleanup on connection close
      res.on('close', () => {
        transport.close();
        server.close();
      });
    });

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', transport: 'streamable-http' });
    });

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        name: 'mcp-domains-streamable',
        version: '1.0.0',
        transport: 'streamable-http',
        endpoint: '/mcp',
      });
    });
  }

  private setupToolHandlers(server: Server): void {
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'search_domains',
          description: 'Search for domains using various filters',
          inputSchema: {
            type: 'object',
            properties: {
              domain: { type: 'string', description: 'Domain name to search (supports wildcards with *)' },
              zone: { type: 'string', description: 'Top-level domain zone (e.g., com, org)' },
              country: { type: 'string', description: 'Country code (e.g., US, UK)' },
              isDead: { type: 'string', enum: ['true', 'false'], description: 'Filter for dead/inactive domains' },
              A: { type: 'string', description: 'A record (IPv4 address)' },
              NS: { type: 'string', description: 'Name server' },
              CNAME: { type: 'string', description: 'CNAME record' },
              MX: { type: 'string', description: 'Mail exchange record' },
              TXT: { type: 'string', description: 'TXT record' },
              page: { type: 'number', description: 'Page number for pagination (starts at 1)' },
              limit: { type: 'number', description: 'Number of results per page (max 50)', maximum: 50 },
            },
          },
        } as Tool,
        {
          name: 'get_domain_info',
          description: 'Get information about a specific domain',
          inputSchema: {
            type: 'object',
            properties: {
              domain: { type: 'string', description: 'Domain name to look up' },
            },
            required: ['domain'],
          },
        } as Tool,
      ],
    }));

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'search_domains':
          return this.handleSearchDomains(request.params.arguments ?? {});
        case 'get_domain_info':
          return this.handleGetDomainInfo(request.params.arguments ?? {});
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    });
  }

  private async handleSearchDomains(args: Record<string, unknown>): Promise<CallToolResult> {
    const queryParams = new URLSearchParams();

    const paramMap: Record<string, string> = {
      domain: 'domain',
      zone: 'zone',
      country: 'country',
      isDead: 'isDead',
      A: 'A',
      NS: 'NS',
      CNAME: 'CNAME',
      MX: 'MX',
      TXT: 'TXT',
    };

    for (const [key, apiParam] of Object.entries(paramMap)) {
      if (args[key]) {
        queryParams.append(apiParam, String(args[key]));
      }
    }

    if (args.page) {
      queryParams.append('page', String(args.page));
    }
    if (args.limit) {
      queryParams.append('limit', String(Math.min(Number(args.limit), 50)));
    }

    try {
      const url = `${API_BASE_URL}/domains/search?${queryParams}`;
      console.log(`Fetching: ${url}`);
      
      const response = await fetch(url);
      const data = await response.json() as DomainsDBResponse;

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          } as TextContent,
        ],
      };
    } catch (error) {
      console.error('Search error:', error);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: error instanceof Error ? error.message : 'Search failed',
              isError: true,
            }),
          } as TextContent,
        ],
        isError: true,
      };
    }
  }

  private async handleGetDomainInfo(args: Record<string, unknown>): Promise<CallToolResult> {
    if (!args.domain) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: 'Domain parameter is required',
              isError: true,
            }),
          } as TextContent,
        ],
        isError: true,
      };
    }

    return this.handleSearchDomains({ ...args, limit: 1 });
  }

  async run(port: number = 3000): Promise<void> {
    console.log(`Starting Streamable HTTP MCP server on port ${port}...`);
    
    this.app.listen(port, '127.0.0.1', () => {
      console.log(`Server running at http://127.0.0.1:${port}`);
      console.log('Available endpoints:');
      console.log(`  http://127.0.0.1:${port}/mcp - MCP endpoint (POST/GET)`);
      console.log(`  http://127.0.0.1:${port}/health - Health check`);
      console.log(`  http://127.0.0.1:${port}/ - Server info`);
    });
  }
}

const server = new DomainsServer();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

server.run(port).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});