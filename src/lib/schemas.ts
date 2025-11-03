// Export all Zod schemas for manifest generation
import { z } from "zod";

// Crypto Price Schemas
export const CryptoPriceInputSchema = z.object({
  symbols: z
    .array(z.string())
    .describe("Array of crypto symbols (e.g., ['bitcoin', 'ethereum', 'solana'])"),
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

// Weather Schemas
export const WeatherInputSchema = z.object({
  location: z
    .string()
    .describe("City name or coordinates (e.g., 'New York' or '40.7128,-74.0060')"),
  units: z
    .enum(["metric", "imperial"])
    .default("metric")
    .optional()
    .describe("Temperature units"),
  forecast: z
    .boolean()
    .default(false)
    .optional()
    .describe("Include 5-day forecast"),
});

// Historical Data Schemas
export const HistoricalDataInputSchema = z.object({
  symbol: z.string().describe("Crypto symbol (e.g., 'bitcoin', 'ethereum')"),
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

// News Schemas
export const NewsInputSchema = z.object({
  topics: z
    .array(z.string())
    .default(["cryptocurrency"])
    .optional()
    .describe("News topics to filter"),
  limit: z
    .number()
    .default(10)
    .optional()
    .describe("Number of articles to return"),
  sentiment: z
    .enum(["positive", "negative", "neutral", "all"])
    .default("all")
    .optional()
    .describe("Filter by sentiment"),
});

// Market Sentiment Schemas
export const MarketSentimentInputSchema = z.object({
  asset: z
    .string()
    .default("bitcoin")
    .optional()
    .describe("Crypto asset to analyze"),
  timeframe: z
    .enum(["24h", "7d", "30d"])
    .default("24h")
    .optional()
    .describe("Analysis timeframe"),
});

// Multi-Data Schemas
export const MultiDataInputSchema = z.object({
  cryptoSymbols: z
    .array(z.string())
    .default(["bitcoin", "ethereum"])
    .optional()
    .describe("Crypto symbols for price data"),
  location: z
    .string()
    .default("New York")
    .optional()
    .describe("Location for weather data"),
  newsTopics: z
    .array(z.string())
    .default(["cryptocurrency"])
    .optional()
    .describe("Topics for news"),
  includeWeather: z.boolean().default(true).optional(),
  includeNews: z.boolean().default(true).optional(),
});

// Analytics Schemas
export const AnalyticsInputSchema = z.object({
  agentId: z.string().optional().describe("Agent ID for tracking"),
  timeframe: z
    .enum(["1h", "24h", "7d", "30d"])
    .default("24h")
    .optional()
    .describe("Time window for analytics"),
  metrics: z
    .array(z.enum(["cost", "usage", "latency", "errors", "top_queries"]))
    .default(["cost", "usage"])
    .optional()
    .describe("Metrics to include"),
});
