#!/bin/bash

# PulseAPI Quick Start Script
# Run this to set up and test locally before deploying

echo "🔥 PulseAPI Quick Start 🔥"
echo "=========================="
echo ""

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed!"
    echo "Install it with: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo "✅ Bun is installed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
bun install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Type check
echo "🔍 Type checking..."
bun run typecheck

if [ $? -ne 0 ]; then
    echo "❌ Type check failed"
    exit 1
fi

echo "✅ Type check passed"
echo ""

# Start dev server
echo "🚀 Starting development server..."
echo ""
echo "Server will run at: http://localhost:3000"
echo ""
echo "Test endpoints:"
echo "  Health: curl http://localhost:3000/health"
echo "  Manifest: curl http://localhost:3000/.well-known/agent.json"
echo "  Entrypoint: curl -X POST http://localhost:3000/entrypoints/crypto-price/invoke \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"symbols\": [\"BTC\", \"ETH\"]}'"
echo ""
echo "Press Ctrl+C to stop"
echo ""

bun run dev
