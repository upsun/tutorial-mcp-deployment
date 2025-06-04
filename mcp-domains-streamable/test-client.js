#!/usr/bin/env node
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const serverUrl = process.env.MCP_URL || 'http://127.0.0.1:3000/mcp';

async function main() {
  console.log(`Connecting to MCP server at ${serverUrl}...`);

  const transport = new StreamableHTTPClientTransport(new URL(serverUrl));
  const client = new Client({
    name: 'test-client',
    version: '1.0.0',
  }, {
    capabilities: {},
  });

  try {
    await client.connect(transport);
    console.log('Connected successfully!\n');

    // List available tools
    console.log('Available tools:');
    const tools = await client.listTools();
    tools.tools.forEach(tool => {
      console.log(`- ${tool.name}: ${tool.description}`);
    });
    console.log();

    // Test search_domains
    console.log('Testing search_domains for *.google.com:');
    const searchResult = await client.callTool('search_domains', {
      domain: '*.google.com',
      limit: 5,
    });
    console.log(JSON.parse(searchResult.content[0].text).domains?.slice(0, 2) || 'No results');
    console.log();

    // Test get_domain_info
    console.log('Testing get_domain_info for google.com:');
    const infoResult = await client.callTool('get_domain_info', {
      domain: 'google.com',
    });
    const domainInfo = JSON.parse(infoResult.content[0].text);
    if (domainInfo.domains?.[0]) {
      console.log('Domain:', domainInfo.domains[0].domain);
      console.log('Country:', domainInfo.domains[0].country);
      console.log('A Records:', domainInfo.domains[0].A?.slice(0, 3).join(', '));
      console.log('NS Records:', domainInfo.domains[0].NS?.slice(0, 3).join(', '));
    }

    await client.close();
    console.log('\nConnection closed.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main().catch(console.error);