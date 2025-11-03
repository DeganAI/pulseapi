import { describe, test, expect } from "bun:test";
import { registerNewsEntrypoint } from "../../src/entrypoints/news";

describe("news entrypoint", () => {
  let mockEntrypoint: any = null;

  const mockAddEntrypoint = (def: any) => {
    mockEntrypoint = def;
  };

  test("should register entrypoint with correct configuration", () => {
    registerNewsEntrypoint(mockAddEntrypoint);

    expect(mockEntrypoint).toBeDefined();
    expect(mockEntrypoint.key).toBe("news");
    expect(mockEntrypoint.description).toBeDefined();
    expect(mockEntrypoint.price).toBe("15000"); // 0.015 USDC
    expect(mockEntrypoint.handler).toBeDefined();
  });

  test("should validate input schema - valid input", () => {
    registerNewsEntrypoint(mockAddEntrypoint);

    const validInput = {
      topics: ["bitcoin", "ethereum"],
      limit: 10,
      sentiment: "all",
    };

    const parseResult = mockEntrypoint.input.safeParse(validInput);
    expect(parseResult.success).toBe(true);
  });

  test("should validate input schema - reject invalid sentiment", () => {
    registerNewsEntrypoint(mockAddEntrypoint);

    const invalidInput = {
      topics: ["bitcoin"],
      sentiment: "super-positive", // Invalid sentiment value
    };

    const parseResult = mockEntrypoint.input.safeParse(invalidInput);
    expect(parseResult.success).toBe(false);
  });

  test("should validate input schema - reject excessive limit", () => {
    registerNewsEntrypoint(mockAddEntrypoint);

    const invalidInput = {
      topics: ["crypto"],
      limit: 100, // Max is 50
    };

    const parseResult = mockEntrypoint.input.safeParse(invalidInput);
    expect(parseResult.success).toBe(false);
  });

  test("should handle news request successfully", async () => {
    registerNewsEntrypoint(mockAddEntrypoint);

    const input = {
      topics: ["bitcoin"],
      limit: 5,
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.output).toBeDefined();
    expect(result.output.articles).toBeDefined();
    expect(Array.isArray(result.output.articles)).toBe(true);
    expect(result.output.totalResults).toBeDefined();
    expect(typeof result.output.totalResults).toBe("number");
    expect(result.output.timestamp).toBeDefined();
  });

  test("should include sentiment analysis in articles", async () => {
    registerNewsEntrypoint(mockAddEntrypoint);

    const input = {
      topics: ["ethereum"],
      limit: 3,
    };

    const result = await mockEntrypoint.handler({ input });

    if (result.output.articles.length > 0) {
      const article = result.output.articles[0];
      expect(article.title).toBeDefined();
      expect(article.description).toBeDefined();
      expect(article.url).toBeDefined();
      expect(article.source).toBeDefined();
      expect(article.publishedAt).toBeDefined();
      // Sentiment is optional but if present, should be valid
      if (article.sentiment) {
        expect(["positive", "negative", "neutral"]).toContain(article.sentiment);
      }
    }
  });

  test("should respect limit parameter", async () => {
    registerNewsEntrypoint(mockAddEntrypoint);

    const limit = 3;
    const input = {
      topics: ["defi"],
      limit,
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.output.articles.length).toBeLessThanOrEqual(limit);
  });

  test("should calculate usage tokens correctly", async () => {
    registerNewsEntrypoint(mockAddEntrypoint);

    const input = {
      topics: ["crypto"],
      limit: 10,
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.usage).toBeDefined();
    expect(typeof result.usage.total_tokens).toBe("number");
    // Tokens should be articles.length * 20
    expect(result.usage.total_tokens).toBe(result.output.articles.length * 20);
  });

  test("should use default values for optional parameters", async () => {
    registerNewsEntrypoint(mockAddEntrypoint);

    const minimalInput = {
      // No topics, limit, or sentiment specified
    };

    const parseResult = mockEntrypoint.input.safeParse(minimalInput);
    expect(parseResult.success).toBe(true);

    // Should work with defaults
    const result = await mockEntrypoint.handler({ input: minimalInput });
    expect(result.output).toBeDefined();
    expect(result.output.articles).toBeDefined();
  });

  test("should validate output schema", async () => {
    registerNewsEntrypoint(mockAddEntrypoint);

    const input = {
      topics: ["bitcoin"],
      limit: 5,
    };

    const result = await mockEntrypoint.handler({ input });
    const parseResult = mockEntrypoint.output.safeParse(result.output);

    expect(parseResult.success).toBe(true);
  });

  test("should handle multiple topics", async () => {
    registerNewsEntrypoint(mockAddEntrypoint);

    const input = {
      topics: ["bitcoin", "ethereum", "defi", "nft"],
      limit: 20,
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.output).toBeDefined();
    expect(result.output.articles).toBeDefined();
    // Should return articles related to any of the topics
    expect(result.output.totalResults).toBeGreaterThanOrEqual(0);
  });
});
