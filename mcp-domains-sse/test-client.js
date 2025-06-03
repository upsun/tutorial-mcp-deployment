// Test client for SSE server
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

async function testSSEServer() {
  console.log('Creating SSE client transport...');
  
  const transport = new SSEClientTransport(
    new URL('http://localhost:3000/sse')
  );

  const client = new Client(
    {
      name: 'test-client',
      version: '1.0.0',
    },
    {
      capabilities: {}
    }
  );

  try {
    console.log('Connecting to server...');
    await client.connect(transport);
    console.log('Connected successfully!');

    // List available tools
    console.log('\nListing available tools...');
    const tools = await client.listTools();
    console.log('Available tools:', JSON.stringify(tools, null, 2));

    // Test search_domains
    console.log('\nTesting search_domains...');
    const searchResult = await client.callTool('search_domains', {
      domain: 'example',
      limit: 5
    });
    console.log('Search result:', JSON.stringify(searchResult, null, 2));

    // Test get_domain_info
    console.log('\nTesting get_domain_info...');
    const infoResult = await client.callTool('get_domain_info', {
      domain: 'example.com'
    });
    console.log('Domain info:', JSON.stringify(infoResult, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    console.log('\nClosing connection...');
    await client.close();
  }
}

testSSEServer().catch(console.error);