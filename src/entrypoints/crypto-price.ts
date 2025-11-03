import { z } from "zod";
import type { EntrypointDef } from "@lucid-dreams/agent-kit/types";
import { getCryptoPrices } from "../lib/data-sources";

const CryptoPriceInputSchema = z.object({
  symbols: z
    .array(z.string())
    .describe("Array of crypto symbols (e.g., ['BTC', 'ETH', 'SOL'])"),
  vsCurrency: z
    .string()
    .default("usd")
    .optional()
    .describe("Quote currency (default: usd)"),
  includeMarketCap: z
    .boolean()
    .default(false)
    .optional()
    .describe("Include market cap data"),
  include24hChange: z
    .boolean()
    .default(true)
    .optional()
    .describe("Include 24h price change percentage"),
});

const CryptoPriceOutputSchema = z.object({
  data: z.array(
    z.object({
      symbol: z.string(),
      name: z.string(),
      price: z.number(),
      marketCap: z.number().optional(),
      change24h: z.number().optional(),
      lastUpdated: z.string(),
    })
  ),
  timestamp: z.string(),
  source: z.string(),
});

export function registerCryptoPriceEntrypoint(
  addEntrypoint: (def: EntrypointDef) => void
) {
  addEntrypoint({
    key: "crypto-price",
    description:
      "Get real-time cryptocurrency prices for multiple assets. Supports 1000+ coins with instant updates. Perfect for trading bots, price alerts, and market monitoring.",
    input: CryptoPriceInputSchema,
    output: CryptoPriceOutputSchema,
    price: "20000", // 0.02 USDC - premium real-time data
    async handler({ input }) {
      const result = await getCryptoPrices(input);

      return {
        output: {
          data: result.prices,
          timestamp: new Date().toISOString(),
          source: "CoinGecko + CoinCap",
        },
        usage: {
          total_tokens: input.symbols.length * 10,
        },
      };
    },
  });
}
