import { z } from "zod";
import type { EntrypointDef } from "@lucid-agents/agent-kit/types";
import { TrustVerifyInputSchema } from "../lib/schemas";
import { verifyEndpoint } from "../lib/trust-verifier";

const TrustVerifyOutputSchema = z.object({
  endpoint: z.string(),
  verification: z.object({
    accuracy_score: z.number().describe("Data accuracy percentage (0-100)"),
    latency_score: z.number().describe("Response speed score (0-100)"),
    reliability_score: z.number().describe("Availability and error rate (0-100)"),
    overall_trust_score: z.number().describe("Combined trust metric (0-100)"),
    grade: z.string().describe("Letter grade (A-F)"),
    recommendation: z
      .enum(["TRUSTED", "CAUTION", "AVOID"])
      .describe("Usage recommendation"),
  }),
  details: z.object({
    endpoint_returned: z.any().describe("Response from tested endpoint"),
    latency_ms: z.number().describe("Response time in milliseconds"),
    status_code: z.number().describe("HTTP status code"),
    error: z.string().optional().describe("Error message if failed"),
  }),
  badge: z.string().describe("Trust badge emoji + text"),
  verified_at: z.string().describe("ISO timestamp of verification"),
});

export function registerTrustVerifyEntrypoint(
  addEntrypoint: (def: EntrypointDef) => void
) {
  addEntrypoint({
    key: "trust-verify",
    description:
      "Verify and grade any x402 endpoint for trust, accuracy, and reliability. Get detailed TrustScore analysis with actionable recommendations. Essential for AI agents choosing data sources.",
    input: TrustVerifyInputSchema,
    output: TrustVerifyOutputSchema,
    price: "$0.03", // 0.03 USDC - premium trust verification service
    async handler({ input }) {
      const result = await verifyEndpoint(input);

      return {
        output: {
          endpoint: input.endpoint_url,
          verification: {
            accuracy_score: result.accuracy_score,
            latency_score: result.latency_score,
            reliability_score: result.reliability_score,
            overall_trust_score: result.overall_trust_score,
            grade: result.grade,
            recommendation: result.recommendation,
          },
          details: {
            endpoint_returned: result.endpoint_response,
            latency_ms: result.latency_ms,
            status_code: result.status_code,
            error: result.error,
          },
          badge: result.badge,
          verified_at: new Date().toISOString(),
        },
        usage: {
          total_tokens: 100, // Fixed token cost for verification
        },
      };
    },
  });
}
