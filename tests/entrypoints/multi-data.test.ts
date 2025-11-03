import { describe, test, expect } from "bun:test";
import { registerMultiDataEntrypoint } from "../../src/entrypoints/multi-data";

describe("multi-data entrypoint", () => {
  let mockEntrypoint: any = null;

  const mockAddEntrypoint = (def: any) => {
    mockEntrypoint = def;
  };

  test("should register entrypoint with correct configuration", () => {
    registerMultiDataEntrypoint(mockAddEntrypoint);

    expect(mockEntrypoint).toBeDefined();
    expect(mockEntrypoint.key).toBe("multi-data");
    expect(mockEntrypoint.description).toBeDefined();
    expect(mockEntrypoint.price).toBe("25000"); // 0.025 USDC
    expect(mockEntrypoint.handler).toBeDefined();
  });

  test("should handle crypto data request", async () => {
    registerMultiDataEntrypoint(mockAddEntrypoint);

    const input = {
      crypto: {
        symbols: ["bitcoin", "ethereum"],
        vsCurrency: "usd",
      },
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.output).toBeDefined();
    expect(result.output.crypto).toBeDefined();
    expect(result.output.crypto.data).toBeDefined();
    expect(Array.isArray(result.output.crypto.data)).toBe(true);
    expect(result.output.crypto.source).toBeDefined();
    expect(result.output.requestCount).toBe(1);
  });

  test("should handle news data request", async () => {
    registerMultiDataEntrypoint(mockAddEntrypoint);

    const input = {
      news: {
        topics: ["bitcoin"],
        limit: 5,
      },
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.output.news).toBeDefined();
    expect(result.output.news.articles).toBeDefined();
    expect(Array.isArray(result.output.news.articles)).toBe(true);
    expect(typeof result.output.news.totalResults).toBe("number");
    expect(result.output.requestCount).toBe(1);
  });

  test("should handle weather data request", async () => {
    registerMultiDataEntrypoint(mockAddEntrypoint);

    const input = {
      weather: {
        location: "London",
        units: "metric" as const,
      },
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.output.weather).toBeDefined();
    expect(result.output.weather.location).toBeDefined();
    expect(result.output.weather.current).toBeDefined();
    expect(result.output.requestCount).toBe(1);
  });

  test("should handle multiple data types in one request", async () => {
    registerMultiDataEntrypoint(mockAddEntrypoint);

    const input = {
      crypto: {
        symbols: ["bitcoin"],
      },
      news: {
        topics: ["crypto"],
        limit: 3,
      },
      weather: {
        location: "New York",
      },
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.output.crypto).toBeDefined();
    expect(result.output.news).toBeDefined();
    expect(result.output.weather).toBeDefined();
    expect(result.output.requestCount).toBe(3);
    expect(result.output.timestamp).toBeDefined();
  });

  test("should include proper usage metrics", async () => {
    registerMultiDataEntrypoint(mockAddEntrypoint);

    const input = {
      crypto: {
        symbols: ["bitcoin"],
      },
      news: {
        topics: ["ethereum"],
      },
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.usage).toBeDefined();
    expect(typeof result.usage.total_tokens).toBe("number");
    // Should be requestCount * 30
    expect(result.usage.total_tokens).toBe(result.output.requestCount * 30);
  });

  test("should validate input schema", () => {
    registerMultiDataEntrypoint(mockAddEntrypoint);

    const validInput = {
      crypto: {
        symbols: ["bitcoin"],
      },
    };

    const parseResult = mockEntrypoint.input.safeParse(validInput);
    expect(parseResult.success).toBe(true);
  });

  test("should accept empty input (all fields optional)", () => {
    registerMultiDataEntrypoint(mockAddEntrypoint);

    const emptyInput = {};

    const parseResult = mockEntrypoint.input.safeParse(emptyInput);
    expect(parseResult.success).toBe(true);
  });
});
