import { z } from "zod";
import type { EntrypointDef } from "@lucid-agents/agent-kit/types";
import { getHistoricalPrices } from "../lib/data-sources";

const HistoricalDataInputSchema = z.object({
  symbol: z.string().describe("Crypto symbol (e.g., 'BTC', 'ETH')"),
  dataType: z
    .enum(["price", "volume", "market_cap", "all"])
    .default("price")
    .optional()
    .describe("Type of historical data"),
  timeframe: z
    .enum(["1h", "24h", "7d", "30d", "90d", "1y"])
    .default("7d")
    .optional()
    .describe("Historical timeframe"),
  interval: z
    .enum(["1m", "5m", "1h", "1d"])
    .default("1h")
    .optional()
    .describe("Data point interval"),
  vsCurrency: z.string().default("usd").optional(),
});

const HistoricalDataOutputSchema = z.object({
  symbol: z.string(),
  dataType: z.string(),
  timeframe: z.string(),
  interval: z.string(),
  dataPoints: z.array(
    z.object({
      timestamp: z.number(),
      date: z.string(),
      price: z.number().optional(),
      volume: z.number().optional(),
      marketCap: z.number().optional(),
    })
  ),
  statistics: z.object({
    min: z.number(),
    max: z.number(),
    average: z.number(),
    change: z.number().describe("Percentage change over period"),
    volatility: z.number().describe("Price volatility score"),
  }),
  insights: z.array(z.string()),
  timestamp: z.string(),
});

export function registerHistoricalDataEntrypoint(
  addEntrypoint: (def: EntrypointDef) => void
) {
  addEntrypoint({
    key: "historical-data",
    description:
      "📊 TIME SERIES DATA - Get historical crypto prices, volume, and market cap data for backtesting, analysis, and agent decision-making. Perfect for trading algorithms that need historical context. Includes statistics, volatility analysis, and AI-generated insights about trends and patterns.",
    input: HistoricalDataInputSchema,
    output: HistoricalDataOutputSchema,
    price: "$0.04", // 0.04 USDC - premium time-series + AI insights
    async handler({ input }) {
      const result = await getHistoricalPrices(input);

      // Calculate statistics
      const prices = result.dataPoints.map((d: any) => d.price).filter(Boolean);
      const statistics = calculateStatistics(prices);

      // Generate insights
      const insights = generateInsights(result.dataPoints, statistics);

      return {
        output: {
          symbol: input.symbol,
          dataType: input.dataType || "price",
          timeframe: input.timeframe || "7d",
          interval: input.interval || "1h",
          dataPoints: result.dataPoints,
          statistics,
          insights,
          timestamp: new Date().toISOString(),
        },
        usage: {
          total_tokens: result.dataPoints.length,
        },
      };
    },
  });
}

function calculateStatistics(prices: number[]) {
  if (!prices || prices.length === 0) {
    return {
      min: 0,
      max: 0,
      average: 0,
      change: 0,
      volatility: 0,
    };
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const average = prices.reduce((a, b) => a + b, 0) / prices.length;
  const change = ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100;

  // Calculate volatility (standard deviation)
  const squareDiffs = prices.map((value) => {
    const diff = value - average;
    return diff * diff;
  });
  const avgSquareDiff =
    squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
  const volatility = Math.sqrt(avgSquareDiff);

  return {
    min,
    max,
    average,
    change,
    volatility,
  };
}

function generateInsights(dataPoints: any[], stats: any): string[] {
  const insights: string[] = [];

  // Trend analysis
  if (stats.change > 10) {
    insights.push(
      `📈 Strong bullish trend: +${stats.change.toFixed(2)}% over period`
    );
  } else if (stats.change < -10) {
    insights.push(
      `📉 Strong bearish trend: ${stats.change.toFixed(2)}% over period`
    );
  } else {
    insights.push(`➡️ Sideways movement: ${stats.change.toFixed(2)}% change`);
  }

  // Volatility analysis
  const volatilityPercent = (stats.volatility / stats.average) * 100;
  if (volatilityPercent > 10) {
    insights.push(`⚡ High volatility detected: ${volatilityPercent.toFixed(1)}%`);
  } else if (volatilityPercent < 3) {
    insights.push(`💤 Low volatility: ${volatilityPercent.toFixed(1)}%`);
  }

  // Support/resistance levels
  insights.push(`🎯 Support level: $${stats.min.toFixed(2)}`);
  insights.push(`🎯 Resistance level: $${stats.max.toFixed(2)}`);

  // Average price
  insights.push(`📊 Average price: $${stats.average.toFixed(2)}`);

  return insights;
}
