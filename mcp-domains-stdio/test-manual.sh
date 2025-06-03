#!/bin/bash

echo "Testing STDIO server with direct JSON-RPC messages..."

# Initialize connection
echo '{"jsonrpc": "2.0", "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test-client", "version": "1.0.0"}}, "id": 1}' | node dist/index.js 2>&1 | jq .

echo ""
echo "Now you can copy the configuration above to your Claude Desktop settings."
echo "Or run these commands to test the tools:"
echo ""
echo "List tools:"
echo 'echo '"'"'{"jsonrpc": "2.0", "method": "tools/list", "id": 2}'"'"' | node dist/index.js 2>&1 | jq .'
echo ""
echo "Search domains:"
echo 'echo '"'"'{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "search_domains", "arguments": {"domain": "test", "limit": 2}}, "id": 3}'"'"' | node dist/index.js 2>&1 | jq .'