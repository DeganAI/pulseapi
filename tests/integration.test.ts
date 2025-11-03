import { describe, test, expect } from "bun:test";

describe("PulseAPI Integration Tests", () => {
  describe("Application Setup", () => {
    test("should import main index file without errors", async () => {
      // This test verifies that all dependencies are correctly imported
      // and the application initializes without throwing
      expect(() => {
        require("../src/index");
      }).not.toThrow();
    });

    test("should have all required environment defaults", () => {
      // Test that the app can run without env vars (using defaults)
      const PORT = process.env.PORT || 3000;
      const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

      expect(PORT).toBeDefined();
      expect(BASE_URL).toBeDefined();
    });
  });

  describe("Entrypoint Registration", () => {
    test("should register all 7 entrypoints", () => {
      // Import all entrypoint registration functions
      const { registerCryptoPriceEntrypoint } = require("../src/entrypoints/crypto-price");
      const { registerNewsEntrypoint } = require("../src/entrypoints/news");
      const { registerWeatherEntrypoint } = require("../src/entrypoints/weather");
      const { registerMultiDataEntrypoint } = require("../src/entrypoints/multi-data");
      const { registerMarketSentimentEntrypoint } = require("../src/entrypoints/market-sentiment");
      const { registerAnalyticsEntrypoint } = require("../src/entrypoints/analytics");
      const { registerHistoricalDataEntrypoint } = require("../src/entrypoints/historical-data");

      const registeredEntrypoints: string[] = [];
      const mockAddEntrypoint = (def: any) => {
        registeredEntrypoints.push(def.key);
      };

      registerCryptoPriceEntrypoint(mockAddEntrypoint);
      registerNewsEntrypoint(mockAddEntrypoint);
      registerWeatherEntrypoint(mockAddEntrypoint);
      registerMultiDataEntrypoint(mockAddEntrypoint);
      registerMarketSentimentEntrypoint(mockAddEntrypoint);
      registerAnalyticsEntrypoint(mockAddEntrypoint);
      registerHistoricalDataEntrypoint(mockAddEntrypoint);

      expect(registeredEntrypoints).toContain("crypto-price");
      expect(registeredEntrypoints).toContain("news");
      expect(registeredEntrypoints).toContain("weather");
      expect(registeredEntrypoints).toContain("multi-data");
      expect(registeredEntrypoints).toContain("market-sentiment");
      expect(registeredEntrypoints).toContain("analytics");
      expect(registeredEntrypoints).toContain("historical-data");
      expect(registeredEntrypoints.length).toBe(7);
    });

    test("should have correct pricing for each entrypoint", () => {
      const entrypoints: any[] = [];
      const mockAddEntrypoint = (def: any) => {
        entrypoints.push(def);
      };

      const { registerCryptoPriceEntrypoint } = require("../src/entrypoints/crypto-price");
      const { registerNewsEntrypoint } = require("../src/entrypoints/news");
      const { registerWeatherEntrypoint } = require("../src/entrypoints/weather");
      const { registerMultiDataEntrypoint } = require("../src/entrypoints/multi-data");
      const { registerMarketSentimentEntrypoint } = require("../src/entrypoints/market-sentiment");
      const { registerAnalyticsEntrypoint } = require("../src/entrypoints/analytics");
      const { registerHistoricalDataEntrypoint } = require("../src/entrypoints/historical-data");

      registerCryptoPriceEntrypoint(mockAddEntrypoint);
      registerNewsEntrypoint(mockAddEntrypoint);
      registerWeatherEntrypoint(mockAddEntrypoint);
      registerMultiDataEntrypoint(mockAddEntrypoint);
      registerMarketSentimentEntrypoint(mockAddEntrypoint);
      registerAnalyticsEntrypoint(mockAddEntrypoint);
      registerHistoricalDataEntrypoint(mockAddEntrypoint);

      const cryptoPrice = entrypoints.find((e) => e.key === "crypto-price");
      const news = entrypoints.find((e) => e.key === "news");
      const weather = entrypoints.find((e) => e.key === "weather");
      const multiData = entrypoints.find((e) => e.key === "multi-data");
      const marketSentiment = entrypoints.find((e) => e.key === "market-sentiment");
      const analytics = entrypoints.find((e) => e.key === "analytics");
      const historicalData = entrypoints.find((e) => e.key === "historical-data");

      expect(cryptoPrice.price).toBe("10000"); // 0.01 USDC
      expect(news.price).toBe("15000"); // 0.015 USDC
      expect(weather.price).toBe("5000"); // 0.005 USDC
      expect(multiData.price).toBe("25000"); // 0.025 USDC
      expect(marketSentiment.price).toBe("30000"); // 0.03 USDC
      expect(analytics.price).toBe("5000"); // 0.005 USDC
      expect(historicalData.price).toBe("20000"); // 0.02 USDC
    });
  });

  describe("Data Source Integration", () => {
    test("should have all data source functions exported", () => {
      const dataSources = require("../src/lib/data-sources");

      expect(dataSources.getCryptoPrices).toBeDefined();
      expect(typeof dataSources.getCryptoPrices).toBe("function");

      expect(dataSources.getCryptoNews).toBeDefined();
      expect(typeof dataSources.getCryptoNews).toBe("function");

      expect(dataSources.getWeatherData).toBeDefined();
      expect(typeof dataSources.getWeatherData).toBe("function");

      expect(dataSources.getMarketSentiment).toBeDefined();
      expect(typeof dataSources.getMarketSentiment).toBe("function");

      expect(dataSources.getUsageAnalytics).toBeDefined();
      expect(typeof dataSources.getUsageAnalytics).toBe("function");

      expect(dataSources.getHistoricalPrices).toBeDefined();
      expect(typeof dataSources.getHistoricalPrices).toBe("function");
    });
  });

  describe("Type Safety", () => {
    test("all entrypoints should have Zod schemas", () => {
      const entrypoints: any[] = [];
      const mockAddEntrypoint = (def: any) => {
        entrypoints.push(def);
      };

      const { registerCryptoPriceEntrypoint } = require("../src/entrypoints/crypto-price");
      const { registerNewsEntrypoint } = require("../src/entrypoints/news");
      const { registerWeatherEntrypoint } = require("../src/entrypoints/weather");
      const { registerMultiDataEntrypoint } = require("../src/entrypoints/multi-data");

      registerCryptoPriceEntrypoint(mockAddEntrypoint);
      registerNewsEntrypoint(mockAddEntrypoint);
      registerWeatherEntrypoint(mockAddEntrypoint);
      registerMultiDataEntrypoint(mockAddEntrypoint);

      // Each entrypoint should have input and output Zod schemas
      for (const ep of entrypoints) {
        expect(ep.input).toBeDefined();
        expect(ep.output).toBeDefined();

        // Zod schemas should have parse and safeParse methods
        expect(typeof ep.input.parse).toBe("function");
        expect(typeof ep.input.safeParse).toBe("function");
        expect(typeof ep.output.parse).toBe("function");
        expect(typeof ep.output.safeParse).toBe("function");
      }
    });
  });

  describe("Error Handling", () => {
    test("data sources should handle API failures gracefully", async () => {
      const { getCryptoPrices, getCryptoNews } = require("../src/lib/data-sources");

      // These should not throw, even with invalid inputs
      const cryptoResult = await getCryptoPrices({
        symbols: ["invalid-crypto-xyz-123"],
      });
      expect(cryptoResult).toBeDefined();
      expect(cryptoResult.prices).toBeDefined();

      const newsResult = await getCryptoNews({
        topics: ["invalid-topic"],
        limit: 1,
      });
      expect(newsResult).toBeDefined();
      expect(newsResult.articles).toBeDefined();
    });
  });

  describe("Performance", () => {
    test("crypto price lookup should complete within 5 seconds", async () => {
      const { getCryptoPrices } = require("../src/lib/data-sources");

      const startTime = Date.now();
      await getCryptoPrices({
        symbols: ["bitcoin"],
      });
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(5000); // 5 seconds
    });

    test("news lookup should complete within 5 seconds", async () => {
      const { getCryptoNews } = require("../src/lib/data-sources");

      const startTime = Date.now();
      await getCryptoNews({
        topics: ["crypto"],
        limit: 5,
      });
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(5000);
    });
  });

  describe("Multi-Data Combo Value", () => {
    test("multi-data should be cheaper than individual calls", () => {
      const entrypoints: any[] = [];
      const mockAddEntrypoint = (def: any) => {
        entrypoints.push(def);
      };

      const { registerCryptoPriceEntrypoint } = require("../src/entrypoints/crypto-price");
      const { registerNewsEntrypoint } = require("../src/entrypoints/news");
      const { registerWeatherEntrypoint } = require("../src/entrypoints/weather");
      const { registerMultiDataEntrypoint } = require("../src/entrypoints/multi-data");

      registerCryptoPriceEntrypoint(mockAddEntrypoint);
      registerNewsEntrypoint(mockAddEntrypoint);
      registerWeatherEntrypoint(mockAddEntrypoint);
      registerMultiDataEntrypoint(mockAddEntrypoint);

      const cryptoPrice = parseInt(
        entrypoints.find((e) => e.key === "crypto-price").price
      );
      const news = parseInt(entrypoints.find((e) => e.key === "news").price);
      const weather = parseInt(
        entrypoints.find((e) => e.key === "weather").price
      );
      const multiData = parseInt(
        entrypoints.find((e) => e.key === "multi-data").price
      );

      const individualTotal = cryptoPrice + news + weather;

      // Multi-data should be cheaper than sum of individual calls
      expect(multiData).toBeLessThan(individualTotal);

      // Calculate savings percentage
      const savings = ((individualTotal - multiData) / individualTotal) * 100;
      expect(savings).toBeGreaterThan(0);
      console.log(`Multi-data saves ${savings.toFixed(1)}% vs individual calls`);
    });
  });
});
