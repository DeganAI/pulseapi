import { z } from "zod";
import type { EntrypointDef } from "@lucid-dreams/agent-kit/types";
import { getUsageAnalytics } from "../lib/data-sources";

const AnalyticsInputSchema = z.object({
  agentId: z
    .string()
    .optional()
    .describe("Your agent ID for tracking (leave empty for global stats)"),
  timeframe: z
    .enum(["1h", "24h", "7d", "30d", "all"])
    .default("24h")
    .optional()
    .describe("Time period to analyze"),
  metrics: z
    .array(z.enum(["cost", "usage", "latency", "errors", "top_queries"]))
    .default(["cost", "usage"])
    .optional()
    .describe("Metrics to retrieve"),
});

const AnalyticsOutputSchema = z.object({
  agentId: z.string().optional(),
  timeframe: z.string(),
  cost: z
    .object({
      total: z.number().describe("Total USDC spent"),
      byEndpoint: z.record(z.number()),
      trend: z.string().describe("up/down/stable"),
    })
    .optional(),
  usage: z
    .object({
      totalQueries: z.number(),
      byEndpoint: z.record(z.number()),
      successRate: z.number().describe("Percentage of successful queries"),
    })
    .optional(),
  latency: z
    .object({
      average: z.number().describe("Average response time in ms"),
      p95: z.number(),
      p99: z.number(),
    })
    .optional(),
  errors: z
    .object({
      total: z.number(),
      byType: z.record(z.number()),
      recent: z.array(
        z.object({
          timestamp: z.string(),
          endpoint: z.string(),
          error: z.string(),
        })
      ),
    })
    .optional(),
  topQueries: z
    .array(
      z.object({
        query: z.string(),
        count: z.number(),
        avgCost: z.number(),
      })
    )
    .optional(),
  recommendations: z.array(z.string()),
  timestamp: z.string(),
});

export function registerAnalyticsEntrypoint(
  addEntrypoint: (def: EntrypointDef) => void
) {
  addEntrypoint({
    key: "analytics",
    description:
      "🎯 AGENT OBSERVABILITY - Track your API usage, costs, latency, and errors. Debug your agent's behavior, optimize spending, and identify issues BEFORE they become problems. This is the #1 missing feature in AI agent development. Monitor cost per query, success rates, response times, error patterns, and get actionable recommendations.",
    input: AnalyticsInputSchema,
    output: AnalyticsOutputSchema,
    price: "$0.01", // 0.01 USDC - premium observability
    async handler({ input }) {
      const result = await getUsageAnalytics(input);

      return {
        output: {
          ...result,
          timestamp: new Date().toISOString(),
          recommendations: generateRecommendations(result),
        },
        usage: {
          total_tokens: 50,
        },
      };
    },
  });
}

function generateRecommendations(analytics: any): string[] {
  const recommendations: string[] = [];

  // Cost optimization
  if (analytics.cost?.total > 10) {
    recommendations.push(
      "💰 High API costs detected. Consider using multi-data endpoint to batch requests and save 20-30%."
    );
  }

  // Performance
  if (analytics.latency?.average > 1000) {
    recommendations.push(
      "⚡ Slow response times detected. Try caching frequent queries or using historical-data endpoint."
    );
  }

  // Error rate
  if (analytics.usage?.successRate < 95) {
    recommendations.push(
      "⚠️ Low success rate detected. Check recent errors and adjust your query format."
    );
  }

  // Usage patterns
  if (analytics.usage?.totalQueries < 10) {
    recommendations.push(
      "📊 Low usage detected. Integrate more entrypoints to maximize value."
    );
  }

  if (recommendations.length === 0) {
    recommendations.push("✅ Your agent is running optimally! Keep up the good work.");
  }

  return recommendations;
}
