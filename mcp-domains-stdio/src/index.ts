#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
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
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'mcp-domains-stdio',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
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

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
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
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP Domains STDIO Server running');
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.error('Shutting down...');
      await this.server.close();
      process.exit(0);
    });
  }
}

const server = new DomainsServer();
server.run().catch(console.error);