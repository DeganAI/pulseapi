import { describe, test, expect } from "bun:test";
import { registerCryptoPriceEntrypoint } from "../../src/entrypoints/crypto-price";

describe("crypto-price entrypoint", () => {
  let mockEntrypoint: any = null;

  const mockAddEntrypoint = (def: any) => {
    mockEntrypoint = def;
  };

  test("should register entrypoint with correct configuration", () => {
    registerCryptoPriceEntrypoint(mockAddEntrypoint);

    expect(mockEntrypoint).toBeDefined();
    expect(mockEntrypoint.key).toBe("crypto-price");
    expect(mockEntrypoint.description).toBeDefined();
    expect(mockEntrypoint.price).toBe("10000"); // 0.01 USDC
    expect(mockEntrypoint.input).toBeDefined();
    expect(mockEntrypoint.output).toBeDefined();
    expect(mockEntrypoint.handler).toBeDefined();
  });

  test("should validate input schema", () => {
    registerCryptoPriceEntrypoint(mockAddEntrypoint);

    // Valid input
    const validInput = {
      symbols: ["bitcoin", "ethereum"],
      vsCurrency: "usd",
      includeMarketCap: true,
      include24hChange: true,
    };

    const parseResult = mockEntrypoint.input.safeParse(validInput);
    expect(parseResult.success).toBe(true);
  });

  test("should reject invalid input", () => {
    registerCryptoPriceEntrypoint(mockAddEntrypoint);

    // Invalid input - symbols not an array
    const invalidInput = {
      symbols: "bitcoin", // Should be array
    };

    const parseResult = mockEntrypoint.input.safeParse(invalidInput);
    expect(parseResult.success).toBe(false);
  });

  test("should handle request successfully", async () => {
    registerCryptoPriceEntrypoint(mockAddEntrypoint);

    const input = {
      symbols: ["bitcoin"],
      vsCurrency: "usd",
      include24hChange: true,
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.output).toBeDefined();
    expect(result.output.data).toBeDefined();
    expect(Array.isArray(result.output.data)).toBe(true);
    expect(result.output.timestamp).toBeDefined();
    expect(result.output.source).toBeDefined();
    expect(result.usage).toBeDefined();
    expect(typeof result.usage.total_tokens).toBe("number");
  });

  test("should return correct output schema structure", async () => {
    registerCryptoPriceEntrypoint(mockAddEntrypoint);

    const input = {
      symbols: ["bitcoin", "ethereum"],
    };

    const result = await mockEntrypoint.handler({ input });
    const parseResult = mockEntrypoint.output.safeParse(result.output);

    expect(parseResult.success).toBe(true);
  });
});
