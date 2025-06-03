#!/bin/bash

echo "Testing STDIO MCP Server..."

# Test 1: List tools
echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | node dist/index.js

# Test 2: Search domains
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "search_domains", "arguments": {"domain": "example", "limit": 3}}, "id": 2}' | node dist/index.js

# Test 3: Get domain info
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "get_domain_info", "arguments": {"domain": "example.com"}}, "id": 3}' | node dist/index.js