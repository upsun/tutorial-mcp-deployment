import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

async function testStdioServer() {
  console.log('Testing STDIO MCP Server...\n');
  
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['dist/index.js'],
    cwd: process.cwd()
  });

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
    console.log('✓ Connected successfully!\n');

    // List available tools
    console.log('Available tools:');
    const tools = await client.listTools();
    tools.tools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });
    console.log();

    // Test search_domains
    console.log('Testing search_domains...');
    const searchResult = await client.callTool('search_domains', {
      domain: 'example',
      limit: 3
    });
    console.log('Search result:', JSON.stringify(searchResult.content[0].text, null, 2).substring(0, 200) + '...\n');

    // Test get_domain_info
    console.log('Testing get_domain_info...');
    const infoResult = await client.callTool('get_domain_info', {
      domain: 'example.com'
    });
    console.log('Domain info:', JSON.stringify(infoResult.content[0].text, null, 2).substring(0, 200) + '...\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    console.log('Closing connection...');
    await client.close();
    console.log('✓ Test complete!');
  }
}

testStdioServer().catch(console.error);