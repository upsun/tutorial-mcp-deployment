#!/bin/bash

echo "Starting SSE server..."
pnpm start &
SERVER_PID=$!

sleep 3

echo -e "\n1. Testing health endpoint:"
curl http://localhost:3000/health

echo -e "\n\n2. Testing root endpoint:"
curl http://localhost:3000/

echo -e "\n\n3. Testing SSE connection:"
# Connect to SSE and capture first few events
timeout 5 curl -N http://localhost:3000/sse 2>&1 | head -20

echo -e "\n\nKilling server..."
kill $SERVER_PID

echo "Test complete."