import { createAgentApp } from "@lucid-dreams/agent-kit";
import { Hono } from "hono";
import { registerCryptoPriceEntrypoint } from "./entrypoints/crypto-price";
import { registerNewsEntrypoint } from "./entrypoints/news";
import { registerWeatherEntrypoint } from "./entrypoints/weather";
import { registerMultiDataEntrypoint } from "./entrypoints/multi-data";
import { registerMarketSentimentEntrypoint } from "./entrypoints/market-sentiment";
import { registerAnalyticsEntrypoint } from "./entrypoints/analytics";
import { registerHistoricalDataEntrypoint } from "./entrypoints/historical-data";

// Create a wrapper app to intercept agent.json
const wrapperApp = new Hono();

const { app, addEntrypoint, config } = createAgentApp(
  {
    name: "PulseAPI - The GOAT Data Aggregation Agent",
    version: "1.0.0",
    description:
      "Real-time cryptocurrency prices, news, weather, and multi-source data aggregation. The ultimate x402 data hub for AI agents. Pay per query with instant USDC micropayments.",
    author: "DegenLlama.net",
    organization: "Daydreams",
    provider: "Daydreams",
    framework: "x402 / agent-kit",
  } as any,
  {
    config: {
      payments: {
        facilitatorUrl: "https://facilitator.daydreams.systems",
        payTo: "0x01D11F7e1a46AbFC6092d7be484895D2d505095c",
        network: "base",
        asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        defaultPrice: "$0.02", // 0.02 USDC - premium positioning
      },
    },
    useConfigPayments: true,
    ap2: {
      required: true,
      params: { roles: ["merchant"] },
    },
  }
);

// Register all entrypoints
registerCryptoPriceEntrypoint(addEntrypoint);
registerNewsEntrypoint(addEntrypoint);
registerWeatherEntrypoint(addEntrypoint);
registerMultiDataEntrypoint(addEntrypoint);
registerMarketSentimentEntrypoint(addEntrypoint);
registerAnalyticsEntrypoint(addEntrypoint);
registerHistoricalDataEntrypoint(addEntrypoint);

// Mount agent app on wrapper
wrapperApp.route("/", app);

// Override agent.json endpoint with metadata
wrapperApp.get("/.well-known/agent.json", async (c) => {
  const manifest = config.toManifest();

  return c.json({
    ...manifest,
    author: "DegenLlama.net",
    organization: "Daydreams",
    provider: "Daydreams",
    framework: "x402 / agent-kit",
  });
});

// Export wrapper for Railway/Bun
export default {
  port: process.env.PORT || 3000,
  fetch: wrapperApp.fetch,
};

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                    🔥 PULSEAPI - THE GOAT 🔥                  ║
╠═══════════════════════════════════════════════════════════════╣
║  Real-time Data Hub for AI Agents                             ║
║  Powered by x402 Protocol                                     ║
╠═══════════════════════════════════════════════════════════════╣
║  🚀 Server running on port ${PORT}
║  📝 Manifest: ${BASE_URL}/.well-known/agent.json
║  💰 Payment address: ${config.payments?.payTo}
║  💵 Default price: 0.02 USDC per query
║  🌐 Network: Base
╠═══════════════════════════════════════════════════════════════╣
║  Available Entrypoints:                                       ║
║  • /entrypoints/crypto-price/invoke                          ║
║  • /entrypoints/news/invoke                                  ║
║  • /entrypoints/weather/invoke                               ║
║  • /entrypoints/multi-data/invoke (🔥 COMBO!)               ║
║  • /entrypoints/market-sentiment/invoke                      ║
║  • /entrypoints/analytics/invoke (🎯 OBSERVABILITY!)        ║
║  • /entrypoints/historical-data/invoke (📊 TIME SERIES!)    ║
╚═══════════════════════════════════════════════════════════════╝
`);
