#!/bin/bash

# Test the Streamable HTTP MCP server

SERVER_URL="http://127.0.0.1:3000/mcp"

echo "Testing Streamable HTTP MCP Server"
echo "================================="
echo ""

# Test 1: Send initialize request
echo "1. Testing initialize request:"
curl -X POST "$SERVER_URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {
      "protocolVersion": "0.1.0",
      "capabilities": {},
      "clientInfo": {
        "name": "test-client",
        "version": "1.0.0"
      }
    },
    "id": 1
  }' 2>/dev/null

echo ""
echo ""
echo "2. Testing tools/list request:"
curl -X POST "$SERVER_URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "params": {},
    "id": 2
  }' 2>/dev/null | jq .

echo ""
echo "3. Testing search_domains tool call:"
curl -X POST "$SERVER_URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "search_domains",
      "arguments": {
        "domain": "*.github.com",
        "limit": 3
      }
    },
    "id": 3
  }' 2>/dev/null | jq -c '.result.content[0].text' | jq -r . | jq '.domains[] | {domain, country, A: .A[0:2]}'