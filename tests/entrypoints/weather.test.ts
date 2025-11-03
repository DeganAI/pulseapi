import { describe, test, expect } from "bun:test";
import { registerWeatherEntrypoint } from "../../src/entrypoints/weather";

describe("weather entrypoint", () => {
  let mockEntrypoint: any = null;

  const mockAddEntrypoint = (def: any) => {
    mockEntrypoint = def;
  };

  test("should register entrypoint with correct configuration", () => {
    registerWeatherEntrypoint(mockAddEntrypoint);

    expect(mockEntrypoint).toBeDefined();
    expect(mockEntrypoint.key).toBe("weather");
    expect(mockEntrypoint.description).toBeDefined();
    expect(mockEntrypoint.price).toBe("5000"); // 0.005 USDC - lowest price
    expect(mockEntrypoint.handler).toBeDefined();
  });

  test("should validate input schema - valid input", () => {
    registerWeatherEntrypoint(mockAddEntrypoint);

    const validInput = {
      location: "London",
      units: "metric",
      forecast: true,
    };

    const parseResult = mockEntrypoint.input.safeParse(validInput);
    expect(parseResult.success).toBe(true);
  });

  test("should validate input schema - reject invalid units", () => {
    registerWeatherEntrypoint(mockAddEntrypoint);

    const invalidInput = {
      location: "Paris",
      units: "kelvin", // Not valid, should be "metric" or "imperial"
    };

    const parseResult = mockEntrypoint.input.safeParse(invalidInput);
    expect(parseResult.success).toBe(false);
  });

  test("should handle weather request without forecast", async () => {
    registerWeatherEntrypoint(mockAddEntrypoint);

    const input = {
      location: "Tokyo",
      units: "metric" as const,
      forecast: false,
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.output).toBeDefined();
    expect(result.output.location).toBeDefined();
    expect(result.output.current).toBeDefined();
    expect(result.output.timestamp).toBeDefined();
    expect(result.usage).toBeDefined();
    expect(result.usage.total_tokens).toBe(20); // Without forecast
  });

  test("should handle weather request with forecast", async () => {
    registerWeatherEntrypoint(mockAddEntrypoint);

    const input = {
      location: "Berlin",
      units: "metric" as const,
      forecast: true,
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.output.forecast).toBeDefined();
    expect(Array.isArray(result.output.forecast)).toBe(true);
    expect(result.usage.total_tokens).toBe(50); // With forecast
  });

  test("should return correct output schema structure", async () => {
    registerWeatherEntrypoint(mockAddEntrypoint);

    const input = {
      location: "Paris",
      units: "imperial" as const,
    };

    const result = await mockEntrypoint.handler({ input });

    expect(result.output.location).toBeDefined();
    expect(result.output.location.name).toBeDefined();
    expect(result.output.location.country).toBeDefined();
    expect(result.output.location.coordinates).toBeDefined();

    expect(result.output.current).toBeDefined();
    expect(typeof result.output.current.temp).toBe("number");
    expect(typeof result.output.current.feelsLike).toBe("number");
    expect(typeof result.output.current.humidity).toBe("number");
    expect(result.output.current.description).toBeDefined();
  });

  test("should use default values for optional parameters", async () => {
    registerWeatherEntrypoint(mockAddEntrypoint);

    const minimalInput = {
      location: "London",
    };

    const parseResult = mockEntrypoint.input.safeParse(minimalInput);
    expect(parseResult.success).toBe(true);

    // Test that handler works with minimal input (uses defaults)
    const result = await mockEntrypoint.handler({ input: minimalInput });
    expect(result.output).toBeDefined();
    expect(result.output.current).toBeDefined();
    // Without forecast specified, should use default (false)
    // which means usage tokens should be 20 (not 50)
    expect(result.usage.total_tokens).toBe(20);
  });

  test("should validate output schema", async () => {
    registerWeatherEntrypoint(mockAddEntrypoint);

    const input = {
      location: "Sydney",
    };

    const result = await mockEntrypoint.handler({ input });
    const parseResult = mockEntrypoint.output.safeParse(result.output);

    expect(parseResult.success).toBe(true);
  });
});
