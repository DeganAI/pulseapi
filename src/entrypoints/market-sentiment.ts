import { z } from "zod";
import type { EntrypointDef } from "@lucid-dreams/agent-kit/types";
import { getMarketSentiment } from "../lib/data-sources";

const MarketSentimentInputSchema = z.object({
  asset: z
    .string()
    .default("bitcoin")
    .optional()
    .describe("Crypto asset to analyze (default: bitcoin)"),
  timeframe: z
    .enum(["1h", "24h", "7d", "30d"])
    .default("24h")
    .optional()
    .describe("Analysis timeframe"),
});

const MarketSentimentOutputSchema = z.object({
  asset: z.string(),
  sentiment: z.object({
    score: z.number().describe("Sentiment score from -1 (bearish) to 1 (bullish)"),
    label: z.enum(["very_bearish", "bearish", "neutral", "bullish", "very_bullish"]),
    confidence: z.number().describe("Confidence level (0-100)"),
  }),
  indicators: z.object({
    socialVolume: z.number().describe("Social media mentions"),
    newsCount: z.number().describe("News articles count"),
    priceAction: z.string().describe("Price movement description"),
  }),
  signals: z.array(
    z.object({
      type: z.string(),
      description: z.string(),
      strength: z.enum(["weak", "moderate", "strong"]),
    })
  ),
  timestamp: z.string(),
});

export function registerMarketSentimentEntrypoint(
  addEntrypoint: (def: EntrypointDef) => void
) {
  addEntrypoint({
    key: "market-sentiment",
    description:
      "Advanced market sentiment analysis combining price action, social media, and news sentiment. Perfect for trading algorithms and investment decision support. Provides actionable signals with confidence scores.",
    input: MarketSentimentInputSchema,
    output: MarketSentimentOutputSchema,
    price: "60000", // 0.06 USDC - premium AI market intelligence
    async handler({ input }) {
      const result = await getMarketSentiment(input);

      return {
        output: {
          asset: input.asset || "bitcoin",
          sentiment: result.sentiment,
          indicators: result.indicators,
          signals: result.signals,
          timestamp: new Date().toISOString(),
        },
        usage: {
          total_tokens: 100,
        },
      };
    },
  });
}
