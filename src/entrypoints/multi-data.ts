import { z } from "zod";
import type { EntrypointDef } from "@lucid-dreams/agent-kit/types";
import {
  getCryptoPrices,
  getCryptoNews,
  getWeatherData,
} from "../lib/data-sources";

const MultiDataInputSchema = z.object({
  crypto: z
    .object({
      symbols: z.array(z.string()),
      vsCurrency: z.string().optional(),
    })
    .optional()
    .describe("Crypto price data request"),
  news: z
    .object({
      topics: z.array(z.string()),
      limit: z.number().optional(),
    })
    .optional()
    .describe("News data request"),
  weather: z
    .object({
      location: z.string(),
      units: z.enum(["metric", "imperial"]).optional(),
    })
    .optional()
    .describe("Weather data request"),
});

const MultiDataOutputSchema = z.object({
  crypto: z
    .object({
      data: z.array(z.any()),
      source: z.string(),
    })
    .optional(),
  news: z
    .object({
      articles: z.array(z.any()),
      totalResults: z.number(),
    })
    .optional(),
  weather: z
    .object({
      location: z.object({
        name: z.string(),
        country: z.string(),
      }),
      current: z.object({
        temp: z.number(),
        description: z.string(),
      }),
    })
    .optional(),
  timestamp: z.string(),
  requestCount: z.number(),
});

export function registerMultiDataEntrypoint(
  addEntrypoint: (def: EntrypointDef) => void
) {
  addEntrypoint({
    key: "multi-data",
    description:
      "🔥 THE POWER COMBO 🔥 - Get crypto prices, news, and weather in ONE request! Perfect for AI agents that need comprehensive context. Massive time and money saver compared to multiple API calls. This is the KILLER feature!",
    input: MultiDataInputSchema,
    output: MultiDataOutputSchema,
    price: "$0.05", // 0.05 USDC - premium combo (saves 29% vs individual)
    async handler({ input }) {
      const results: any = {
        timestamp: new Date().toISOString(),
        requestCount: 0,
      };

      // Fetch crypto data if requested
      if (input.crypto) {
        const cryptoData = await getCryptoPrices({
          symbols: input.crypto.symbols,
          vsCurrency: input.crypto.vsCurrency || "usd",
        });
        results.crypto = {
          data: cryptoData.prices,
          source: "CoinGecko + CoinCap",
        };
        results.requestCount++;
      }

      // Fetch news if requested
      if (input.news) {
        const newsData = await getCryptoNews({
          topics: input.news.topics,
          limit: input.news.limit || 10,
        });
        results.news = {
          articles: newsData.articles,
          totalResults: newsData.articles.length,
        };
        results.requestCount++;
      }

      // Fetch weather if requested
      if (input.weather) {
        const weatherData = await getWeatherData({
          location: input.weather.location,
          units: input.weather.units || "metric",
        });
        results.weather = {
          location: {
            name: weatherData.location.name,
            country: weatherData.location.country,
          },
          current: {
            temp: weatherData.current.temp,
            description: weatherData.current.description,
          },
        };
        results.requestCount++;
      }

      return {
        output: results,
        usage: {
          total_tokens: results.requestCount * 30,
        },
      };
    },
  });
}
