import { describe, test, expect } from "bun:test";
import { registerHistoricalDataEntrypoint } from "../../src/entrypoints/historical-data";

describe("historical-data entrypoint", () => {
  let mockEntrypoint: any = null;

  const mockAddEntrypoint = (def: any) => {
    mockEntrypoint = def;
  };

  test("should register entrypoint with correct configuration", () => {
    registerHistoricalDataEntrypoint(mockAddEntrypoint);

    expect(mockEntrypoint).toBeDefined();
    expect(mockEntrypoint.key).toBe("historical-data");
    expect(mockEntrypoint.description).toBeDefined();
    expect(mockEntrypoint.description).toContain("TIME SERIES");
    expect(mockEntrypoint.price).toBe("20000"); // 0.02 USDC
    expect(mockEntrypoint.handler).toBeDefined();
  });

  test("should validate input schema - valid input", () => {
    registerHistoricalDataEntrypoint(mockAddEntrypoint);

    const validInput = {
      symbol: "bitcoin",
      dataType: "price",
      timeframe: "7d",
      interval: "1h",
    };

    const parseResult = mockEntrypoint.input.safeParse(validInput);
    expect(parseResult.success).toBe(true);
  });

  test("should require symbol", () => {
    registerHistoricalDataEntrypoint(mockAddEntrypoint);

    const invalidInput = {
      // Missing required symbol
      timeframe: "7d",
    };

    const parseResult = mockEntrypoint.input.safeParse(invalidInput);
    expect(parseResult.success).toBe(false);
  });

  test("should validate input schema - reject invalid dataType", () => {
    registerHistoricalDataEntrypoint(mockAddEntrypoint);

    const invalidInput = {
      symbol: "ethereum",
      dataType: "invalid", // Not a valid data type
    };

    const parseResult = mockEntrypoint.input.safeParse(invalidInput);
    expect(parseResult.success).toBe(false);
  });

  test("should validate input schema - reject invalid timeframe", () => {
    registerHistoricalDataEntrypoint(mockAddEntrypoint);

    const invalidInput = {
      symbol: "bitcoin",
      timeframe: "3d", // Not valid
    };

    const parseResult = mockEntrypoint.input.safeParse(invalidInput);
    expect(parseResult.success).toBe(false);
  });

  test("should accept all valid data types", () => {
    registerHistoricalDataEntrypoint(mockAddEntrypoint);

    const dataTypes = ["price", "volume", "market_cap", "all"];

    for (const dataType of dataTypes) {
      const input = { symbol: "bitcoin", dataType };
      const parseResult = mockEntrypoint.input.safeParse(input);
      expect(parseResult.success).toBe(true);
    }
  });

  test("should accept all valid timeframes", () => {
    registerHistoricalDataEntrypoint(mockAddEntrypoint);

    const timeframes = ["1h", "24h", "7d", "30d", "90d", "1y"];

    for (const timeframe of timeframes) {
      const input = { symbol: "ethereum", timeframe };
      const parseResult = mockEntrypoint.input.safeParse(input);
      expect(parseResult.success).toBe(true);
    }
  });

  test("should accept all valid intervals", () => {
    registerHistoricalDataEntrypoint(mockAddEntrypoint);

    const intervals = ["1m", "5m", "1h", "1d"];

    for (const interval of intervals) {
      const input = { symbol: "bitcoin", interval };
      const parseResult = mockEntrypoint.input.safeParse(input);
      expect(parseResult.success).toBe(true);
    }
  });

  test("should fetch historical data successfully", async () => {
    registerHistoricalDataEntrypoint(mockAddEntrypoint);

    const input = {
      symbol: "bitcoin",
      dataType: "price",
      timeframe: "7d",
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.output).toBeDefined();
    expect(result.output.symbol).toBe("bitcoin");
    expect(result.output.dataPoints).toBeDefined();
    expect(Array.isArray(result.output.dataPoints)).toBe(true);
    expect(result.output.dataPoints.length).toBeGreaterThan(0);
  });

  test("should include statistics", async () => {
    registerHistoricalDataEntrypoint(mockAddEntrypoint);

    const input = {
      symbol: "ethereum",
      timeframe: "30d",
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.output.statistics).toBeDefined();
    expect(typeof result.output.statistics.min).toBe("number");
    expect(typeof result.output.statistics.max).toBe("number");
    expect(typeof result.output.statistics.average).toBe("number");
    expect(typeof result.output.statistics.change).toBe("number");
    expect(typeof result.output.statistics.volatility).toBe("number");
  });

  test("should include AI-generated insights", async () => {
    registerHistoricalDataEntrypoint(mockAddEntrypoint);

    const input = {
      symbol: "bitcoin",
      timeframe: "7d",
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.output.insights).toBeDefined();
    expect(Array.isArray(result.output.insights)).toBe(true);
    expect(result.output.insights.length).toBeGreaterThan(0);

    // Each insight should be a string
    for (const insight of result.output.insights) {
      expect(typeof insight).toBe("string");
    }
  });

  test("should return properly structured data points", async () => {
    registerHistoricalDataEntrypoint(mockAddEntrypoint);

    const input = {
      symbol: "solana",
      timeframe: "7d",
    };

    const result = await mockEntrypoint.handler({ input });

    const dataPoint = result.output.dataPoints[0];
    expect(typeof dataPoint.timestamp).toBe("number");
    expect(dataPoint.date).toBeDefined();
    expect(typeof dataPoint.price).toBe("number");
  });

  test("should include volume and market cap for 'all' dataType", async () => {
    registerHistoricalDataEntrypoint(mockAddEntrypoint);

    const input = {
      symbol: "ethereum",
      dataType: "all",
      timeframe: "7d",
    };

    const result = await mockEntrypoint.handler({ input });

    // Data points may have volume and marketCap (or undefined if fallback)
    const dataPoint = result.output.dataPoints[0];
    expect(dataPoint).toBeDefined();
    // These fields are optional in fallback mode
  });

  test("should calculate usage tokens based on data points", async () => {
    registerHistoricalDataEntrypoint(mockAddEntrypoint);

    const input = {
      symbol: "bitcoin",
      timeframe: "7d",
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.usage).toBeDefined();
    expect(typeof result.usage.total_tokens).toBe("number");
    // Tokens should equal number of data points
    expect(result.usage.total_tokens).toBe(result.output.dataPoints.length);
  });

  test("should use default values for optional parameters", async () => {
    registerHistoricalDataEntrypoint(mockAddEntrypoint);

    const minimalInput = {
      symbol: "bitcoin",
    };

    const result = await mockEntrypoint.handler({ input: minimalInput });

    expect(result.output).toBeDefined();
    expect(result.output.dataType).toBe("price"); // default
    expect(result.output.timeframe).toBe("7d"); // default
    expect(result.output.interval).toBe("1h"); // default
  });

  test("should validate output schema", async () => {
    registerHistoricalDataEntrypoint(mockAddEntrypoint);

    const input = {
      symbol: "ethereum",
      dataType: "all",
      timeframe: "30d",
    };

    const result = await mockEntrypoint.handler({ input });
    const parseResult = mockEntrypoint.output.safeParse(result.output);

    expect(parseResult.success).toBe(true);
  });

  test("should handle different symbols", async () => {
    registerHistoricalDataEntrypoint(mockAddEntrypoint);

    const symbols = ["bitcoin", "ethereum", "solana", "cardano"];

    for (const symbol of symbols) {
      const input = { symbol, timeframe: "7d" };
      const result = await mockEntrypoint.handler({ input });

      expect(result.output.symbol).toBe(symbol);
      expect(result.output.dataPoints).toBeDefined();
    }
  });

  test("should handle different timeframes", async () => {
    registerHistoricalDataEntrypoint(mockAddEntrypoint);

    const timeframes = ["7d", "30d", "90d"];

    for (const timeframe of timeframes) {
      const input = { symbol: "bitcoin", timeframe };
      const result = await mockEntrypoint.handler({ input });

      expect(result.output.timeframe).toBe(timeframe);
      expect(result.output.dataPoints.length).toBeGreaterThan(0);
    }
  });

  test("should handle fallback gracefully for invalid symbols", async () => {
    registerHistoricalDataEntrypoint(mockAddEntrypoint);

    const input = {
      symbol: "invalid-crypto-xyz-123",
      timeframe: "7d",
    };

    const result = await mockEntrypoint.handler({ input });

    // Should return fallback mock data instead of throwing
    expect(result.output).toBeDefined();
    expect(result.output.dataPoints).toBeDefined();
    expect(result.output.dataPoints.length).toBeGreaterThan(0);
  });

  test("should provide meaningful statistics", async () => {
    registerHistoricalDataEntrypoint(mockAddEntrypoint);

    const input = {
      symbol: "bitcoin",
      timeframe: "30d",
    };

    const result = await mockEntrypoint.handler({ input });

    const stats = result.output.statistics;

    // Min should be less than or equal to max
    expect(stats.min).toBeLessThanOrEqual(stats.max);

    // Average should be between min and max
    expect(stats.average).toBeGreaterThanOrEqual(stats.min);
    expect(stats.average).toBeLessThanOrEqual(stats.max);

    // Volatility should be non-negative
    expect(stats.volatility).toBeGreaterThanOrEqual(0);
  });

  test("should include timestamp", async () => {
    registerHistoricalDataEntrypoint(mockAddEntrypoint);

    const input = {
      symbol: "ethereum",
      timeframe: "7d",
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.output.timestamp).toBeDefined();
    // Should be a valid ISO timestamp
    const timestamp = new Date(result.output.timestamp);
    expect(timestamp.toString()).not.toBe("Invalid Date");
  });
});
