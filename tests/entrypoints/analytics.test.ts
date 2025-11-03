import { describe, test, expect } from "bun:test";
import { registerAnalyticsEntrypoint } from "../../src/entrypoints/analytics";

describe("analytics entrypoint", () => {
  let mockEntrypoint: any = null;

  const mockAddEntrypoint = (def: any) => {
    mockEntrypoint = def;
  };

  test("should register entrypoint with correct configuration", () => {
    registerAnalyticsEntrypoint(mockAddEntrypoint);

    expect(mockEntrypoint).toBeDefined();
    expect(mockEntrypoint.key).toBe("analytics");
    expect(mockEntrypoint.description).toBeDefined();
    expect(mockEntrypoint.description).toContain("OBSERVABILITY");
    expect(mockEntrypoint.price).toBe("5000"); // 0.005 USDC - cheap observability
    expect(mockEntrypoint.handler).toBeDefined();
  });

  test("should validate input schema - valid input", () => {
    registerAnalyticsEntrypoint(mockAddEntrypoint);

    const validInput = {
      agentId: "my-agent",
      timeframe: "24h",
      metrics: ["cost", "usage"],
    };

    const parseResult = mockEntrypoint.input.safeParse(validInput);
    expect(parseResult.success).toBe(true);
  });

  test("should validate input schema - reject invalid timeframe", () => {
    registerAnalyticsEntrypoint(mockAddEntrypoint);

    const invalidInput = {
      timeframe: "2h", // Not valid
    };

    const parseResult = mockEntrypoint.input.safeParse(invalidInput);
    expect(parseResult.success).toBe(false);
  });

  test("should validate input schema - reject invalid metrics", () => {
    registerAnalyticsEntrypoint(mockAddEntrypoint);

    const invalidInput = {
      metrics: ["cost", "invalid_metric"],
    };

    const parseResult = mockEntrypoint.input.safeParse(invalidInput);
    expect(parseResult.success).toBe(false);
  });

  test("should accept all valid timeframes", () => {
    registerAnalyticsEntrypoint(mockAddEntrypoint);

    const timeframes = ["1h", "24h", "7d", "30d", "all"];

    for (const timeframe of timeframes) {
      const input = { timeframe };
      const parseResult = mockEntrypoint.input.safeParse(input);
      expect(parseResult.success).toBe(true);
    }
  });

  test("should accept all valid metrics", () => {
    registerAnalyticsEntrypoint(mockAddEntrypoint);

    const validMetrics = ["cost", "usage", "latency", "errors", "top_queries"];

    const input = { metrics: validMetrics };
    const parseResult = mockEntrypoint.input.safeParse(input);
    expect(parseResult.success).toBe(true);
  });

  test("should return analytics data successfully", async () => {
    registerAnalyticsEntrypoint(mockAddEntrypoint);

    const input = {
      agentId: "test-agent",
      timeframe: "24h",
      metrics: ["cost", "usage"],
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.output).toBeDefined();
    expect(result.output.timeframe).toBe("24h");
    expect(result.output.timestamp).toBeDefined();
    expect(result.output.recommendations).toBeDefined();
    expect(Array.isArray(result.output.recommendations)).toBe(true);
  });

  test("should include cost metrics when requested", async () => {
    registerAnalyticsEntrypoint(mockAddEntrypoint);

    const input = {
      metrics: ["cost"],
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.output.cost).toBeDefined();
    expect(typeof result.output.cost.total).toBe("number");
    expect(result.output.cost.byEndpoint).toBeDefined();
    expect(typeof result.output.cost.byEndpoint).toBe("object");
    expect(result.output.cost.trend).toBeDefined();
  });

  test("should include usage metrics when requested", async () => {
    registerAnalyticsEntrypoint(mockAddEntrypoint);

    const input = {
      metrics: ["usage"],
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.output.usage).toBeDefined();
    expect(typeof result.output.usage.totalQueries).toBe("number");
    expect(result.output.usage.byEndpoint).toBeDefined();
    expect(typeof result.output.usage.successRate).toBe("number");
    expect(result.output.usage.successRate).toBeGreaterThanOrEqual(0);
    expect(result.output.usage.successRate).toBeLessThanOrEqual(100);
  });

  test("should include latency metrics when requested", async () => {
    registerAnalyticsEntrypoint(mockAddEntrypoint);

    const input = {
      metrics: ["latency"],
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.output.latency).toBeDefined();
    expect(typeof result.output.latency.average).toBe("number");
    expect(typeof result.output.latency.p95).toBe("number");
    expect(typeof result.output.latency.p99).toBe("number");
  });

  test("should include error metrics when requested", async () => {
    registerAnalyticsEntrypoint(mockAddEntrypoint);

    const input = {
      metrics: ["errors"],
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.output.errors).toBeDefined();
    expect(typeof result.output.errors.total).toBe("number");
    expect(result.output.errors.byType).toBeDefined();
    expect(Array.isArray(result.output.errors.recent)).toBe(true);
  });

  test("should include top queries when requested", async () => {
    registerAnalyticsEntrypoint(mockAddEntrypoint);

    const input = {
      metrics: ["top_queries"],
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.output.topQueries).toBeDefined();
    expect(Array.isArray(result.output.topQueries)).toBe(true);

    if (result.output.topQueries.length > 0) {
      const query = result.output.topQueries[0];
      expect(query.query).toBeDefined();
      expect(typeof query.count).toBe("number");
      expect(typeof query.avgCost).toBe("number");
    }
  });

  test("should support multiple metrics at once", async () => {
    registerAnalyticsEntrypoint(mockAddEntrypoint);

    const input = {
      metrics: ["cost", "usage", "latency"],
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.output.cost).toBeDefined();
    expect(result.output.usage).toBeDefined();
    expect(result.output.latency).toBeDefined();
  });

  test("should generate recommendations", async () => {
    registerAnalyticsEntrypoint(mockAddEntrypoint);

    const input = {
      metrics: ["cost", "usage"],
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.output.recommendations).toBeDefined();
    expect(Array.isArray(result.output.recommendations)).toBe(true);
    expect(result.output.recommendations.length).toBeGreaterThan(0);

    // Each recommendation should be a string
    for (const rec of result.output.recommendations) {
      expect(typeof rec).toBe("string");
    }
  });

  test("should use default metrics when not specified", async () => {
    registerAnalyticsEntrypoint(mockAddEntrypoint);

    const input = {
      agentId: "test",
    };

    const result = await mockEntrypoint.handler({ input });

    // Default metrics are ["cost", "usage"]
    expect(result.output.cost).toBeDefined();
    expect(result.output.usage).toBeDefined();
  });

  test("should calculate usage tokens correctly", async () => {
    registerAnalyticsEntrypoint(mockAddEntrypoint);

    const input = {
      metrics: ["cost"],
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.usage).toBeDefined();
    expect(result.usage.total_tokens).toBe(50); // Fixed amount
  });

  test("should validate output schema", async () => {
    registerAnalyticsEntrypoint(mockAddEntrypoint);

    const input = {
      agentId: "test-agent",
      metrics: ["cost", "usage", "latency"],
    };

    const result = await mockEntrypoint.handler({ input });
    const parseResult = mockEntrypoint.output.safeParse(result.output);

    expect(parseResult.success).toBe(true);
  });

  test("should work without agent ID", async () => {
    registerAnalyticsEntrypoint(mockAddEntrypoint);

    const input = {
      timeframe: "7d",
      metrics: ["usage"],
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.output).toBeDefined();
    expect(result.output.usage).toBeDefined();
  });

  test("should handle different timeframes", async () => {
    registerAnalyticsEntrypoint(mockAddEntrypoint);

    const timeframes = ["1h", "24h", "7d", "30d", "all"];

    for (const timeframe of timeframes) {
      const input = { timeframe, metrics: ["cost"] };
      const result = await mockEntrypoint.handler({ input });

      expect(result.output.timeframe).toBe(timeframe);
    }
  });
});
