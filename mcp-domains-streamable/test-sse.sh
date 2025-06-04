#!/bin/bash

# Test the Streamable HTTP MCP server with SSE responses

SERVER_URL="http://127.0.0.1:3000/mcp"

echo "Testing Streamable HTTP MCP Server"
echo "=================================="
echo ""

# Helper function to extract JSON from SSE response
extract_json() {
  grep "^data: " | sed 's/^data: //'
}

# Test 1: Send initialize request
echo "1. Testing initialize request:"
curl -s -X POST "$SERVER_URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {
      "protocolVersion": "2025-03-26",
      "capabilities": {},
      "clientInfo": {
        "name": "test-client",
        "version": "1.0.0"
      }
    },
    "id": 1
  }' | extract_json | jq '.result'

echo ""
echo "2. Testing tools/list request:"
curl -s -X POST "$SERVER_URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "params": {},
    "id": 2
  }' | extract_json | jq '.result.tools[] | {name, description}'

echo ""
echo "3. Testing search_domains tool call:"
curl -s -X POST "$SERVER_URL" \
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
  }' | extract_json | jq -r '.result.content[0].text' | jq '.domains[0:2] | .[] | {domain, country, A: .A[0:2]}'