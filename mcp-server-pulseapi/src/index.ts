#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { wrapFetchWithPayment, createSigner } from "x402-fetch";

const PULSEAPI_BASE_URL = process.env.PULSEAPI_URL || "https://pulseapi-production-00cc.up.railway.app";

// Initialize x402 payment-enabled fetch
const privateKey = process.env.X402_PRIVATE_KEY;
if (!privateKey) {
  console.error("ERROR: X402_PRIVATE_KEY environment variable is required");
  console.error("Set it in your MCP config: X402_PRIVATE_KEY=0x...");
  process.exit(1);
}

// Create signer for x402 payments on Base network
const signer = await createSigner("base", privateKey as `0x${string}`);

// Wrap fetch with x402 payment handling (max 1 USDC per call)
const x402fetch = wrapFetchWithPayment(
  fetch,
  signer,
  BigInt(1_000_000) // 1 USDC max (in base units)
);

// Create MCP server
const server = new Server(
  {
    name: "pulseapi",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
const tools = [
  {
    name: "get_crypto_prices",
    description: "Get real-time cryptocurrency prices for multiple assets. Supports 1000+ coins with instant updates. Perfect for trading bots, price alerts, and market monitoring. Cost: $0.02 USDC",
    inputSchema: {
      type: "object",
      properties: {
        symbols: {
          type: "array",
          items: { type: "string" },
          description: "Array of crypto symbols (e.g., ['bitcoin', 'ethereum', 'solana'])",
        },
        vsCurrency: {
          type: "string",
          description: "Quote currency (default: usd)",
          default: "usd",
        },
        includeMarketCap: {
          type: "boolean",
          description: "Include market cap data",
          default: false,
        },
        include24hChange: {
          type: "boolean",
          description: "Include 24h price change percentage",
          default: true,
        },
      },
      required: ["symbols"],
    },
  },
  {
    name: "get_crypto_news",
    description: "Get latest cryptocurrency news from top sources (CoinDesk, CoinTelegraph, Decrypt, etc). Includes AI sentiment analysis and filtering. Perfect for market intelligence and trading signals. Cost: $0.03 USDC",
    inputSchema: {
      type: "object",
      properties: {
        topics: {
          type: "array",
          items: { type: "string" },
          description: "Topics to search (e.g., ['bitcoin', 'ethereum', 'defi', 'nft'])",
          default: ["crypto"],
        },
        limit: {
          type: "number",
          description: "Maximum number of articles (max: 50)",
          default: 10,
          maximum: 50,
        },
        sentiment: {
          type: "string",
          enum: ["all", "positive", "negative", "neutral"],
          description: "Filter by sentiment",
          default: "all",
        },
      },
    },
  },
  {
    name: "get_weather",
    description: "Get real-time weather data and forecasts for any location worldwide. Includes current conditions and optional 5-day forecast. Perfect for location-based agents and planning algorithms. Cost: $0.01 USDC",
    inputSchema: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "Location name (e.g., 'London', 'New York', 'Tokyo')",
        },
        units: {
          type: "string",
          enum: ["metric", "imperial"],
          description: "Temperature units",
          default: "metric",
        },
        forecast: {
          type: "boolean",
          description: "Include 5-day forecast",
          default: false,
        },
      },
      required: ["location"],
    },
  },
  {
    name: "get_multi_data",
    description: "🔥 THE POWER COMBO 🔥 - Get crypto prices, news, and weather in ONE request! Perfect for AI agents that need comprehensive context. Massive time and money saver compared to multiple API calls. Cost: $0.05 USDC (29% savings!)",
    inputSchema: {
      type: "object",
      properties: {
        cryptoSymbols: {
          type: "array",
          items: { type: "string" },
          description: "Crypto symbols to fetch",
        },
        newsTopics: {
          type: "array",
          items: { type: "string" },
          description: "News topics to search",
        },
        location: {
          type: "string",
          description: "Location for weather data",
        },
        includeMarketCap: {
          type: "boolean",
          default: false,
        },
        newsLimit: {
          type: "number",
          default: 10,
        },
      },
    },
  },
  {
    name: "get_market_sentiment",
    description: "Advanced market sentiment analysis combining price action, social media, and news sentiment. Perfect for trading algorithms and investment decision support. Provides actionable signals with confidence scores. Cost: $0.06 USDC",
    inputSchema: {
      type: "object",
      properties: {
        asset: {
          type: "string",
          description: "Asset to analyze (e.g., 'bitcoin', 'ethereum')",
          default: "bitcoin",
        },
        timeframe: {
          type: "string",
          description: "Analysis timeframe",
          default: "24h",
        },
      },
    },
  },
  {
    name: "get_analytics",
    description: "🎯 AGENT OBSERVABILITY - Track your API usage, costs, latency, and errors. Debug your agent's behavior, optimize spending, and identify issues BEFORE they become problems. Monitor cost per query, success rates, response times, error patterns. Cost: $0.01 USDC",
    inputSchema: {
      type: "object",
      properties: {
        agentId: {
          type: "string",
          description: "Your agent ID (optional)",
        },
        timeframe: {
          type: "string",
          description: "Time window (e.g., '24h', '7d', '30d')",
          default: "24h",
        },
        metrics: {
          type: "array",
          items: {
            type: "string",
            enum: ["cost", "usage", "latency", "errors", "top_queries"],
          },
          description: "Metrics to retrieve",
          default: ["cost", "usage"],
        },
      },
    },
  },
  {
    name: "get_historical_data",
    description: "📊 TIME SERIES DATA - Get historical crypto prices, volume, and market cap data for backtesting, analysis, and agent decision-making. Perfect for trading algorithms that need historical context. Includes statistics, volatility analysis, and AI-generated insights. Cost: $0.04 USDC",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Crypto symbol (e.g., 'bitcoin', 'ethereum')",
        },
        timeframe: {
          type: "string",
          enum: ["1h", "24h", "7d", "30d", "90d", "1y"],
          description: "Time period",
          default: "7d",
        },
        vsCurrency: {
          type: "string",
          description: "Quote currency",
          default: "usd",
        },
      },
      required: ["symbol"],
    },
  },
];

// Map tool names to endpoint paths
const toolEndpoints: Record<string, string> = {
  get_crypto_prices: "/entrypoints/crypto-price/invoke",
  get_crypto_news: "/entrypoints/news/invoke",
  get_weather: "/entrypoints/weather/invoke",
  get_multi_data: "/entrypoints/multi-data/invoke",
  get_market_sentiment: "/entrypoints/market-sentiment/invoke",
  get_analytics: "/entrypoints/analytics/invoke",
  get_historical_data: "/entrypoints/historical-data/invoke",
};

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const endpoint = toolEndpoints[name];
  if (!endpoint) {
    throw new Error(`Unknown tool: ${name}`);
  }

  try {
    const url = `${PULSEAPI_BASE_URL}${endpoint}`;

    // Make x402-enabled request (handles payment automatically)
    const response = await x402fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args || {}),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error calling ${name}: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("PulseAPI MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
