#!/usr/bin/env node
import express from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const DOMAINS_API_BASE = 'https://api.domainsdb.info/v1';

interface DomainSearchParams {
  domain?: string;
  zone?: string;
  country?: string;
  isDead?: string;
  A?: string;
  NS?: string;
  CNAME?: string;
  MX?: string;
  TXT?: string;
  page?: number;
  limit?: number;
}

interface DomainInfo {
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

interface DomainsApiResponse {
  domains: DomainInfo[];
  time: string;
  next_page?: string;
  total?: number;
}

class DomainsServer {
  private transports: Map<string, SSEServerTransport> = new Map();
  private servers: Map<string, Server> = new Map();

  constructor() {
    // We'll create server instances per connection
  }

  private createMCPServer(): Server {
    const server = new Server(
      {
        name: 'mcp-domains-sse',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers(server);
    return server;
  }

  private setupToolHandlers(server: Server) {
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'search_domains',
          description: 'Search for domain names using various filters',
          inputSchema: {
            type: 'object',
            properties: {
              domain: {
                type: 'string',
                description: 'Domain name to search (supports wildcards)',
              },
              zone: {
                type: 'string',
                description: 'Domain zone (e.g., com, org, net)',
              },
              country: {
                type: 'string',
                description: 'Country code',
              },
              isDead: {
                type: 'string',
                description: 'Filter by dead domains (true/false)',
              },
              A: {
                type: 'string',
                description: 'A record IP address',
              },
              NS: {
                type: 'string',
                description: 'Name server',
              },
              CNAME: {
                type: 'string',
                description: 'CNAME record',
              },
              MX: {
                type: 'string',
                description: 'Mail exchange record',
              },
              TXT: {
                type: 'string',
                description: 'TXT record',
              },
              page: {
                type: 'number',
                description: 'Page number (default: 1)',
              },
              limit: {
                type: 'number',
                description: 'Results per page (default: 50, max: 50)',
              },
            },
          },
        },
        {
          name: 'get_domain_info',
          description: 'Get detailed information about a specific domain',
          inputSchema: {
            type: 'object',
            properties: {
              domain: {
                type: 'string',
                description: 'Exact domain name to look up',
              },
            },
            required: ['domain'],
          },
        },
      ],
    }));

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'search_domains':
          return await this.searchDomains(args as DomainSearchParams);
        case 'get_domain_info':
          return await this.getDomainInfo(args as { domain: string });
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  private async searchDomains(params: DomainSearchParams) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });

      const url = `${DOMAINS_API_BASE}/domains/search?${queryParams.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json() as DomainsApiResponse;

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error searching domains: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  }

  private async getDomainInfo(params: { domain: string }) {
    try {
      const searchParams: DomainSearchParams = {
        domain: params.domain,
        limit: 1,
      };
      
      const result = await this.searchDomains(searchParams);
      
      if (result.isError) {
        return result;
      }

      const data = JSON.parse(result.content[0].text);
      
      if (data.domains && data.domains.length > 0) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data.domains[0], null, 2),
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: 'text',
              text: `No information found for domain: ${params.domain}`,
            },
          ],
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting domain info: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  }

  async run() {
    const port = process.env.PORT || 3000;
    const app = express();
    
    // Middleware
    app.use(express.json());
    
    // CORS headers
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // SSE endpoint
    app.get('/sse', async (req, res) => {
      console.log('New SSE connection');
      
      // Create transport with the messages endpoint
      const transport = new SSEServerTransport('/messages', res);
      
      // Store transport by its session ID (generated internally by SSEServerTransport)
      // We need to access the sessionId after the transport is created
      // The sessionId is accessible as transport.sessionId
      const sessionId = (transport as any).sessionId;
      this.transports.set(sessionId, transport);
      
      console.log(`Created transport with session ID: ${sessionId}`);
      
      try {
        // Create a new server instance for this connection
        const server = this.createMCPServer();
        this.servers.set(sessionId, server);
        
        // Connect the server to this transport
        await server.connect(transport);
        
        // Clean up on disconnect
        res.on('close', () => {
          console.log(`SSE connection closed for session: ${sessionId}`);
          this.transports.delete(sessionId);
          this.servers.delete(sessionId);
          transport.close();
        });
      } catch (error) {
        console.error('Error connecting transport:', error);
        this.transports.delete(sessionId);
        this.servers.delete(sessionId);
        res.status(500).end();
      }
    });

    // Messages endpoint
    app.post('/messages', async (req, res) => {
      const sessionId = req.query.sessionId as string;
      
      console.log(`Received message for session: ${sessionId}`);
      console.log(`Message body:`, JSON.stringify(req.body));
      
      if (!sessionId) {
        res.status(400).json({ error: 'Missing sessionId' });
        return;
      }
      
      const transport = this.transports.get(sessionId);
      
      if (!transport) {
        console.error(`Transport not found for session: ${sessionId}`);
        console.log(`Available sessions: ${Array.from(this.transports.keys()).join(', ')}`);
        res.status(404).json({ error: 'Session not found' });
        return;
      }
      
      try {
        await transport.handlePostMessage(req, res, req.body);
      } catch (error) {
        console.error('Error handling message:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Health check
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        sessions: this.transports.size,
        sessionIds: Array.from(this.transports.keys())
      });
    });

    // Root endpoint
    app.get('/', (req, res) => {
      res.json({
        name: 'MCP Domains SSE Server',
        version: '1.0.0',
        endpoints: {
          sse: '/sse',
          messages: '/messages',
          health: '/health'
        }
      });
    });

    app.listen(port, () => {
      console.log(`MCP Domains SSE Server running on http://localhost:${port}`);
      console.log(`SSE endpoint: http://localhost:${port}/sse`);
      console.log(`Messages endpoint: http://localhost:${port}/messages`);
      console.log(`Health check: http://localhost:${port}/health`);
    });
  }
}

const server = new DomainsServer();
server.run().catch(console.error);