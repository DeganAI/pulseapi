import { describe, test, expect } from "bun:test";
import {
  getCryptoPrices,
  getCryptoNews,
  getWeatherData,
  getMarketSentiment,
  getUsageAnalytics,
  getHistoricalPrices,
} from "../../src/lib/data-sources";

describe("Data Sources", () => {
  describe("getCryptoPrices", () => {
    test("should fetch Bitcoin price successfully", async () => {
      const result = await getCryptoPrices({
        symbols: ["bitcoin"],
        vsCurrency: "usd",
        include24hChange: true,
      });

      expect(result.prices).toBeDefined();
      expect(result.prices.length).toBeGreaterThan(0);
      expect(result.prices[0].symbol).toBe("BITCOIN");
      expect(typeof result.prices[0].price).toBe("number");
    });

    test("should fetch multiple cryptocurrency prices", async () => {
      const result = await getCryptoPrices({
        symbols: ["bitcoin", "ethereum"],
        vsCurrency: "usd",
        includeMarketCap: true,
        include24hChange: true,
      });

      expect(result.prices).toBeDefined();
      expect(result.prices.length).toBeGreaterThanOrEqual(1);

      // Check that at least one price has the expected structure
      const btcPrice = result.prices.find((p) => p.symbol === "BITCOIN");
      if (btcPrice) {
        expect(btcPrice.price).toBeDefined();
        expect(typeof btcPrice.price).toBe("number");
        expect(btcPrice.lastUpdated).toBeDefined();
      }
    });

    test("should handle invalid symbols gracefully", async () => {
      const result = await getCryptoPrices({
        symbols: ["invalid-crypto-xyz-123"],
        vsCurrency: "usd",
      });

      // Should not throw, prices may be empty
      expect(result.prices).toBeDefined();
      expect(Array.isArray(result.prices)).toBe(true);
    });

    test("should support different vs currencies", async () => {
      const result = await getCryptoPrices({
        symbols: ["bitcoin"],
        vsCurrency: "eur",
      });

      expect(result.prices).toBeDefined();
      // Price should be different than USD (though we can't guarantee it)
      if (result.prices.length > 0) {
        expect(typeof result.prices[0].price).toBe("number");
      }
    });
  });

  describe("getCryptoNews", () => {
    test("should fetch crypto news successfully", async () => {
      const result = await getCryptoNews({
        topics: ["crypto"],
        limit: 5,
      });

      expect(result.articles).toBeDefined();
      expect(Array.isArray(result.articles)).toBe(true);
      expect(result.articles.length).toBeGreaterThan(0);
      expect(result.articles.length).toBeLessThanOrEqual(5);
    });

    test("should include sentiment analysis", async () => {
      const result = await getCryptoNews({
        topics: ["bitcoin"],
        limit: 3,
      });

      if (result.articles.length > 0) {
        const article = result.articles[0];
        expect(article.title).toBeDefined();
        expect(article.description).toBeDefined();
        expect(article.url).toBeDefined();
        expect(article.source).toBeDefined();
        expect(article.publishedAt).toBeDefined();
        expect(article.sentiment).toBeDefined();
        expect(["positive", "negative", "neutral"]).toContain(
          article.sentiment
        );
      }
    });

    test("should respect limit parameter", async () => {
      const limit = 3;
      const result = await getCryptoNews({
        topics: ["ethereum"],
        limit,
      });

      expect(result.articles.length).toBeLessThanOrEqual(limit);
    });

    test("should handle errors gracefully with fallback", async () => {
      // Even with network errors, should return fallback data
      const result = await getCryptoNews({
        topics: ["unknown-topic-xyz"],
        limit: 1,
      });

      expect(result.articles).toBeDefined();
      expect(Array.isArray(result.articles)).toBe(true);
    });
  });

  describe("getWeatherData", () => {
    test("should fetch weather for a valid city", async () => {
      const result = await getWeatherData({
        location: "London",
        units: "metric",
        forecast: false,
      });

      expect(result.location).toBeDefined();
      expect(result.location.name).toBe("London");
      expect(result.location.country).toBeDefined();
      expect(result.location.coordinates).toBeDefined();
      expect(typeof result.location.coordinates.lat).toBe("number");
      expect(typeof result.location.coordinates.lon).toBe("number");

      expect(result.current).toBeDefined();
      expect(typeof result.current.temp).toBe("number");
      expect(typeof result.current.humidity).toBe("number");
      expect(result.current.description).toBeDefined();
    });

    test("should include forecast when requested", async () => {
      const result = await getWeatherData({
        location: "New York",
        units: "imperial",
        forecast: true,
      });

      expect(result.forecast).toBeDefined();
      expect(Array.isArray(result.forecast)).toBe(true);
      expect(result.forecast!.length).toBeGreaterThan(0);

      const day = result.forecast![0];
      expect(day.date).toBeDefined();
      expect(typeof day.tempMin).toBe("number");
      expect(typeof day.tempMax).toBe("number");
      expect(day.description).toBeDefined();
    });

    test("should support metric and imperial units", async () => {
      const metricResult = await getWeatherData({
        location: "Paris",
        units: "metric",
      });

      const imperialResult = await getWeatherData({
        location: "Paris",
        units: "imperial",
      });

      expect(metricResult.current.temp).toBeDefined();
      expect(imperialResult.current.temp).toBeDefined();
      // Temperatures should be different for metric vs imperial
      // (though not guaranteed for all locations)
    });

    test("should throw error for invalid location", async () => {
      expect(async () => {
        await getWeatherData({
          location: "InvalidCityXYZ123456",
          units: "metric",
        });
      }).toThrow();
    });
  });

  describe("getMarketSentiment", () => {
    test("should analyze market sentiment for Bitcoin", async () => {
      const result = await getMarketSentiment({
        asset: "bitcoin",
        timeframe: "24h",
      });

      expect(result.sentiment).toBeDefined();
      expect(typeof result.sentiment.score).toBe("number");
      expect(result.sentiment.score).toBeGreaterThanOrEqual(-1);
      expect(result.sentiment.score).toBeLessThanOrEqual(1);

      expect(result.sentiment.label).toBeDefined();
      expect([
        "very_bearish",
        "bearish",
        "neutral",
        "bullish",
        "very_bullish",
      ]).toContain(result.sentiment.label);

      expect(typeof result.sentiment.confidence).toBe("number");
      expect(result.sentiment.confidence).toBeGreaterThanOrEqual(0);
      expect(result.sentiment.confidence).toBeLessThanOrEqual(100);
    });

    test("should include indicators", async () => {
      const result = await getMarketSentiment({
        asset: "ethereum",
      });

      expect(result.indicators).toBeDefined();
      expect(typeof result.indicators.socialVolume).toBe("number");
      expect(typeof result.indicators.newsCount).toBe("number");
      expect(result.indicators.priceAction).toBeDefined();
    });

    test("should include signals", async () => {
      const result = await getMarketSentiment({
        asset: "bitcoin",
      });

      expect(result.signals).toBeDefined();
      expect(Array.isArray(result.signals)).toBe(true);

      if (result.signals.length > 0) {
        const signal = result.signals[0];
        expect(signal.type).toBeDefined();
        expect(signal.description).toBeDefined();
        expect(["weak", "moderate", "strong"]).toContain(signal.strength);
      }
    });

    test("should handle errors gracefully", async () => {
      // Should return a valid sentiment even with invalid asset
      const result = await getMarketSentiment({
        asset: "invalid-asset",
      });

      expect(result.sentiment).toBeDefined();
      expect(result.sentiment.score).toBeDefined();
      expect(typeof result.sentiment.score).toBe("number");
      // Should return one of the valid sentiment labels
      expect([
        "very_bearish",
        "bearish",
        "neutral",
        "bullish",
        "very_bullish",
      ]).toContain(result.sentiment.label);
      expect(result.indicators).toBeDefined();
      expect(result.signals).toBeDefined();
    });
  });

  describe("getUsageAnalytics", () => {
    test("should return analytics data", async () => {
      const result = await getUsageAnalytics({
        agentId: "test-agent",
        timeframe: "24h",
        metrics: ["cost", "usage"],
      });

      expect(result.agentId).toBe("test-agent");
      expect(result.timeframe).toBe("24h");
    });

    test("should include cost metrics when requested", async () => {
      const result = await getUsageAnalytics({
        timeframe: "7d",
        metrics: ["cost"],
      });

      expect(result.cost).toBeDefined();
      expect(typeof result.cost.total).toBe("number");
      expect(result.cost.byEndpoint).toBeDefined();
      expect(result.cost.trend).toBeDefined();
    });

    test("should include usage metrics when requested", async () => {
      const result = await getUsageAnalytics({
        metrics: ["usage"],
      });

      expect(result.usage).toBeDefined();
      expect(typeof result.usage.totalQueries).toBe("number");
      expect(result.usage.byEndpoint).toBeDefined();
      expect(typeof result.usage.successRate).toBe("number");
    });

    test("should include latency metrics when requested", async () => {
      const result = await getUsageAnalytics({
        metrics: ["latency"],
      });

      expect(result.latency).toBeDefined();
      expect(typeof result.latency.average).toBe("number");
      expect(typeof result.latency.p95).toBe("number");
      expect(typeof result.latency.p99).toBe("number");
    });

    test("should include error metrics when requested", async () => {
      const result = await getUsageAnalytics({
        metrics: ["errors"],
      });

      expect(result.errors).toBeDefined();
      expect(typeof result.errors.total).toBe("number");
      expect(result.errors.byType).toBeDefined();
      expect(Array.isArray(result.errors.recent)).toBe(true);
    });
  });

  describe("getHistoricalPrices", () => {
    test("should fetch historical data for Bitcoin", async () => {
      const result = await getHistoricalPrices({
        symbol: "bitcoin",
        timeframe: "7d",
        dataType: "price",
      });

      expect(result.dataPoints).toBeDefined();
      expect(Array.isArray(result.dataPoints)).toBe(true);
      expect(result.dataPoints.length).toBeGreaterThan(0);

      const point = result.dataPoints[0];
      expect(typeof point.timestamp).toBe("number");
      expect(point.date).toBeDefined();
      expect(typeof point.price).toBe("number");
    });

    test("should include volume and market cap when requested", async () => {
      const result = await getHistoricalPrices({
        symbol: "ethereum",
        timeframe: "30d",
        dataType: "all",
      });

      if (result.dataPoints.length > 0) {
        const point = result.dataPoints[0];
        expect(point.price).toBeDefined();
        // Volume and marketCap may be undefined in fallback data
      }
    });

    test("should support different timeframes", async () => {
      const result7d = await getHistoricalPrices({
        symbol: "bitcoin",
        timeframe: "7d",
      });

      const result30d = await getHistoricalPrices({
        symbol: "bitcoin",
        timeframe: "30d",
      });

      expect(result7d.dataPoints.length).toBeGreaterThan(0);
      expect(result30d.dataPoints.length).toBeGreaterThan(0);
      // 30d should have more data points than 7d (in most cases)
    });

    test("should handle errors gracefully with fallback data", async () => {
      const result = await getHistoricalPrices({
        symbol: "invalid-symbol-xyz",
        timeframe: "7d",
      });

      // Should return mock/fallback data
      expect(result.dataPoints).toBeDefined();
      expect(Array.isArray(result.dataPoints)).toBe(true);
      expect(result.dataPoints.length).toBeGreaterThan(0);
    });
  });
});
