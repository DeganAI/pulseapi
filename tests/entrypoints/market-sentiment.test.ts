import { describe, test, expect } from "bun:test";
import { registerMarketSentimentEntrypoint } from "../../src/entrypoints/market-sentiment";

describe("market-sentiment entrypoint", () => {
  let mockEntrypoint: any = null;

  const mockAddEntrypoint = (def: any) => {
    mockEntrypoint = def;
  };

  test("should register entrypoint with correct configuration", () => {
    registerMarketSentimentEntrypoint(mockAddEntrypoint);

    expect(mockEntrypoint).toBeDefined();
    expect(mockEntrypoint.key).toBe("market-sentiment");
    expect(mockEntrypoint.description).toBeDefined();
    expect(mockEntrypoint.price).toBe("30000"); // 0.03 USDC - premium pricing
    expect(mockEntrypoint.handler).toBeDefined();
  });

  test("should validate input schema - valid input", () => {
    registerMarketSentimentEntrypoint(mockAddEntrypoint);

    const validInput = {
      asset: "bitcoin",
      timeframe: "24h",
    };

    const parseResult = mockEntrypoint.input.safeParse(validInput);
    expect(parseResult.success).toBe(true);
  });

  test("should validate input schema - reject invalid timeframe", () => {
    registerMarketSentimentEntrypoint(mockAddEntrypoint);

    const invalidInput = {
      asset: "ethereum",
      timeframe: "2h", // Not a valid timeframe
    };

    const parseResult = mockEntrypoint.input.safeParse(invalidInput);
    expect(parseResult.success).toBe(false);
  });

  test("should accept all valid timeframes", () => {
    registerMarketSentimentEntrypoint(mockAddEntrypoint);

    const timeframes = ["1h", "24h", "7d", "30d"];

    for (const timeframe of timeframes) {
      const input = { asset: "bitcoin", timeframe };
      const parseResult = mockEntrypoint.input.safeParse(input);
      expect(parseResult.success).toBe(true);
    }
  });

  test("should analyze sentiment successfully", async () => {
    registerMarketSentimentEntrypoint(mockAddEntrypoint);

    const input = {
      asset: "bitcoin",
      timeframe: "24h",
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.output).toBeDefined();
    expect(result.output.asset).toBe("bitcoin");
    expect(result.output.sentiment).toBeDefined();
    expect(result.output.indicators).toBeDefined();
    expect(result.output.signals).toBeDefined();
    expect(result.output.timestamp).toBeDefined();
  });

  test("should return valid sentiment score", async () => {
    registerMarketSentimentEntrypoint(mockAddEntrypoint);

    const input = {
      asset: "ethereum",
      timeframe: "7d",
    };

    const result = await mockEntrypoint.handler({ input });

    expect(typeof result.output.sentiment.score).toBe("number");
    expect(result.output.sentiment.score).toBeGreaterThanOrEqual(-1);
    expect(result.output.sentiment.score).toBeLessThanOrEqual(1);
  });

  test("should return valid sentiment label", async () => {
    registerMarketSentimentEntrypoint(mockAddEntrypoint);

    const input = {
      asset: "solana",
    };

    const result = await mockEntrypoint.handler({ input });

    const validLabels = [
      "very_bearish",
      "bearish",
      "neutral",
      "bullish",
      "very_bullish",
    ];

    expect(validLabels).toContain(result.output.sentiment.label);
  });

  test("should return confidence score", async () => {
    registerMarketSentimentEntrypoint(mockAddEntrypoint);

    const input = {
      asset: "bitcoin",
    };

    const result = await mockEntrypoint.handler({ input });

    expect(typeof result.output.sentiment.confidence).toBe("number");
    expect(result.output.sentiment.confidence).toBeGreaterThanOrEqual(0);
    expect(result.output.sentiment.confidence).toBeLessThanOrEqual(100);
  });

  test("should include market indicators", async () => {
    registerMarketSentimentEntrypoint(mockAddEntrypoint);

    const input = {
      asset: "ethereum",
      timeframe: "24h",
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.output.indicators).toBeDefined();
    expect(typeof result.output.indicators.socialVolume).toBe("number");
    expect(typeof result.output.indicators.newsCount).toBe("number");
    expect(typeof result.output.indicators.priceAction).toBe("string");
  });

  test("should include actionable signals", async () => {
    registerMarketSentimentEntrypoint(mockAddEntrypoint);

    const input = {
      asset: "bitcoin",
      timeframe: "24h",
    };

    const result = await mockEntrypoint.handler({ input });

    expect(Array.isArray(result.output.signals)).toBe(true);

    if (result.output.signals.length > 0) {
      const signal = result.output.signals[0];
      expect(signal.type).toBeDefined();
      expect(signal.description).toBeDefined();
      expect(["weak", "moderate", "strong"]).toContain(signal.strength);
    }
  });

  test("should use default asset when not specified", async () => {
    registerMarketSentimentEntrypoint(mockAddEntrypoint);

    const input = {};

    const result = await mockEntrypoint.handler({ input });

    expect(result.output.asset).toBe("bitcoin"); // Default
  });

  test("should calculate usage tokens correctly", async () => {
    registerMarketSentimentEntrypoint(mockAddEntrypoint);

    const input = {
      asset: "ethereum",
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.usage).toBeDefined();
    expect(result.usage.total_tokens).toBe(100); // Fixed amount
  });

  test("should validate output schema", async () => {
    registerMarketSentimentEntrypoint(mockAddEntrypoint);

    const input = {
      asset: "bitcoin",
      timeframe: "7d",
    };

    const result = await mockEntrypoint.handler({ input });
    const parseResult = mockEntrypoint.output.safeParse(result.output);

    expect(parseResult.success).toBe(true);
  });

  test("should analyze different assets", async () => {
    registerMarketSentimentEntrypoint(mockAddEntrypoint);

    const assets = ["bitcoin", "ethereum", "solana", "cardano"];

    for (const asset of assets) {
      const input = { asset };
      const result = await mockEntrypoint.handler({ input });

      expect(result.output.asset).toBe(asset);
      expect(result.output.sentiment).toBeDefined();
    }
  });

  test("should handle different timeframes", async () => {
    registerMarketSentimentEntrypoint(mockAddEntrypoint);

    const timeframes = ["1h", "24h", "7d", "30d"];

    for (const timeframe of timeframes) {
      const input = { asset: "bitcoin", timeframe };
      const result = await mockEntrypoint.handler({ input });

      expect(result.output).toBeDefined();
      expect(result.output.sentiment).toBeDefined();
    }
  });
});
