import { z } from "zod";
import type { EntrypointDef } from "@lucid-dreams/agent-kit/types";
import { getWeatherData } from "../lib/data-sources";

const WeatherInputSchema = z.object({
  location: z
    .string()
    .describe("City name or coordinates (e.g., 'New York' or '40.7128,-74.0060')"),
  units: z
    .enum(["metric", "imperial"])
    .default("metric")
    .optional()
    .describe("Temperature units"),
  forecast: z
    .boolean()
    .default(false)
    .optional()
    .describe("Include 5-day forecast"),
});

const WeatherOutputSchema = z.object({
  location: z.object({
    name: z.string(),
    country: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lon: z.number(),
    }),
  }),
  current: z.object({
    temp: z.number(),
    feelsLike: z.number(),
    humidity: z.number(),
    pressure: z.number(),
    windSpeed: z.number(),
    description: z.string(),
    icon: z.string(),
  }),
  forecast: z
    .array(
      z.object({
        date: z.string(),
        tempMin: z.number(),
        tempMax: z.number(),
        description: z.string(),
      })
    )
    .optional(),
  timestamp: z.string(),
});

export function registerWeatherEntrypoint(
  addEntrypoint: (def: EntrypointDef) => void
) {
  addEntrypoint({
    key: "weather",
    description:
      "Get real-time weather data and forecasts for any location worldwide. Includes current conditions and optional 5-day forecast. Perfect for location-based agents and planning algorithms.",
    input: WeatherInputSchema,
    output: WeatherOutputSchema,
    price: "$0.01", // 0.01 USDC - real-time weather + forecast
    async handler({ input }) {
      const result = await getWeatherData(input);

      return {
        output: {
          ...result,
          timestamp: new Date().toISOString(),
        },
        usage: {
          total_tokens: input.forecast ? 50 : 20,
        },
      };
    },
  });
}
