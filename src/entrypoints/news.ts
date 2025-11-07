import { z } from "zod";
import type { EntrypointDef } from "@lucid-agents/agent-kit/types";
import { getCryptoNews } from "../lib/data-sources";

const NewsInputSchema = z.object({
  topics: z
    .array(z.string())
    .default(["crypto"])
    .optional()
    .describe(
      "Topics to search (e.g., ['bitcoin', 'ethereum', 'defi', 'nft'])"
    ),
  limit: z
    .number()
    .max(50)
    .default(10)
    .optional()
    .describe("Maximum number of articles (max: 50)"),
  sentiment: z
    .enum(["all", "positive", "negative", "neutral"])
    .default("all")
    .optional()
    .describe("Filter by sentiment"),
});

const NewsOutputSchema = z.object({
  articles: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      url: z.string(),
      source: z.string(),
      publishedAt: z.string(),
      sentiment: z.enum(["positive", "negative", "neutral"]).optional(),
    })
  ),
  totalResults: z.number(),
  timestamp: z.string(),
});

export function registerNewsEntrypoint(
  addEntrypoint: (def: EntrypointDef) => void
) {
  addEntrypoint({
    key: "news",
    description:
      "Get latest cryptocurrency news from top sources (CoinDesk, CoinTelegraph, Decrypt, etc). Includes sentiment analysis and filtering. Perfect for market intelligence and trading signals.",
    input: NewsInputSchema,
    output: NewsOutputSchema,
    price: "$0.03", // 0.03 USDC - AI sentiment analysis included
    async handler({ input }) {
      const result = await getCryptoNews(input);

      return {
        output: {
          articles: result.articles,
          totalResults: result.articles.length,
          timestamp: new Date().toISOString(),
        },
        usage: {
          total_tokens: result.articles.length * 20,
        },
      };
    },
  });
}
