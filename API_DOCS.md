# 📡 PulseAPI - Complete API Documentation

**Version:** 1.0.0
**Base URL:** `https://your-app.up.railway.app`
**Protocol:** x402 Agent Protocol
**Payment:** USDC on Base network

## Table of Contents

1. [Authentication & Payment](#authentication--payment)
2. [Entrypoint: crypto-price](#1-crypto-price)
3. [Entrypoint: news](#2-news)
4. [Entrypoint: weather](#3-weather)
5. [Entrypoint: multi-data](#4-multi-data)
6. [Entrypoint: market-sentiment](#5-market-sentiment)
7. [Entrypoint: analytics](#6-analytics)
8. [Entrypoint: historical-data](#7-historical-data)
9. [Error Handling](#error-handling)
10. [Rate Limits](#rate-limits)

---

## Authentication & Payment

PulseAPI uses the x402 protocol for micropayments. Each request requires:

1. **USDC payment** on Base network
2. **AP2 authentication** with merchant role
3. Payments routed through: `https://facilitator.daydreams.systems`

### Payment Address
```
0x01D11F7e1a46AbFC6092d7be484895D2d505095c
```

### Making a Request

```bash
POST /entrypoints/{entrypoint-key}/invoke
Content-Type: application/json
```

Include payment proof in headers (handled automatically by x402 clients).

---

## 1. crypto-price

Get real-time cryptocurrency prices for 1000+ coins from multiple sources.

### Endpoint
```
POST /entrypoints/crypto-price/invoke
```

### Price
**0.01 USDC** (10,000 units)

### Input Schema

```typescript
{
  symbols: string[],           // Array of crypto symbols (e.g., ["bitcoin", "ethereum"])
  vsCurrency?: string,         // Quote currency (default: "usd")
  includeMarketCap?: boolean,  // Include market cap data (default: false)
  include24hChange?: boolean   // Include 24h price change (default: true)
}
```

### Output Schema

```typescript
{
  data: Array<{
    symbol: string,           // Symbol in uppercase (e.g., "BTC")
    name: string,             // Full name (e.g., "bitcoin")
    price: number,            // Current price in quote currency
    marketCap?: number,       // Market capitalization (if requested)
    change24h?: number,       // 24h price change percentage (if requested)
    lastUpdated: string       // ISO timestamp
  }>,
  timestamp: string,          // Request timestamp
  source: string              // Data source(s) used
}
```

### Example Request

```bash
curl -X POST https://your-app.up.railway.app/entrypoints/crypto-price/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "symbols": ["bitcoin", "ethereum", "solana"],
    "vsCurrency": "usd",
    "includeMarketCap": true,
    "include24hChange": true
  }'
```

### Example Response

```json
{
  "data": [
    {
      "symbol": "BTC",
      "name": "bitcoin",
      "price": 43250.50,
      "marketCap": 847500000000,
      "change24h": 2.5,
      "lastUpdated": "2025-01-15T10:30:00.000Z"
    },
    {
      "symbol": "ETH",
      "name": "ethereum",
      "price": 2280.75,
      "marketCap": 274200000000,
      "change24h": 1.8,
      "lastUpdated": "2025-01-15T10:30:00.000Z"
    }
  ],
  "timestamp": "2025-01-15T10:30:00.000Z",
  "source": "CoinGecko + CoinCap"
}
```

### Data Sources
- **Primary**: CoinGecko API (free tier)
- **Fallback**: CoinCap API
- **Update Frequency**: Real-time

---

## 2. news

Get latest cryptocurrency news with AI-powered sentiment analysis from top sources.

### Endpoint
```
POST /entrypoints/news/invoke
```

### Price
**0.015 USDC** (15,000 units)

### Input Schema

```typescript
{
  topics?: string[],                                    // Topics to search (default: ["crypto"])
  limit?: number,                                       // Max articles (max: 50, default: 10)
  sentiment?: "all" | "positive" | "negative" | "neutral"  // Filter by sentiment (default: "all")
}
```

### Output Schema

```typescript
{
  articles: Array<{
    title: string,                              // Article title
    description: string,                        // Article excerpt
    url: string,                                // Full article URL
    source: string,                             // News source name
    publishedAt: string,                        // ISO timestamp
    sentiment?: "positive" | "negative" | "neutral"  // AI sentiment analysis
  }>,
  totalResults: number,                         // Number of articles returned
  timestamp: string                             // Request timestamp
}
```

### Example Request

```bash
curl -X POST https://your-app.up.railway.app/entrypoints/news/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "topics": ["bitcoin", "ethereum"],
    "limit": 5,
    "sentiment": "all"
  }'
```

### Example Response

```json
{
  "articles": [
    {
      "title": "Bitcoin Surges Past $43K as Institutional Interest Grows",
      "description": "Major financial institutions are increasing their Bitcoin holdings...",
      "url": "https://example.com/article1",
      "source": "CoinDesk",
      "publishedAt": "2025-01-15T09:00:00.000Z",
      "sentiment": "positive"
    }
  ],
  "totalResults": 5,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### Data Sources
- **Primary**: CryptoCompare News API
- **Sentiment Analysis**: Custom keyword-based algorithm
- **Update Frequency**: Real-time

---

## 3. weather

Get real-time weather data and forecasts for any location worldwide.

### Endpoint
```
POST /entrypoints/weather/invoke
```

### Price
**0.005 USDC** (5,000 units) - Lowest price!

### Input Schema

```typescript
{
  location: string,                    // City name or coordinates
  units?: "metric" | "imperial",      // Temperature units (default: "metric")
  forecast?: boolean                   // Include 5-day forecast (default: false)
}
```

### Output Schema

```typescript
{
  location: {
    name: string,                      // City name
    country: string,                   // Country code
    coordinates: {
      lat: number,                     // Latitude
      lon: number                      // Longitude
    }
  },
  current: {
    temp: number,                      // Current temperature
    feelsLike: number,                 // Feels-like temperature
    humidity: number,                  // Humidity percentage
    pressure: number,                  // Atmospheric pressure (hPa)
    windSpeed: number,                 // Wind speed (km/h)
    description: string,               // Weather description
    icon: string                       // Weather code
  },
  forecast?: Array<{                   // 5-day forecast (if requested)
    date: string,                      // ISO date
    tempMin: number,                   // Minimum temperature
    tempMax: number,                   // Maximum temperature
    description: string                // Weather description
  }>,
  timestamp: string                    // Request timestamp
}
```

### Example Request

```bash
curl -X POST https://your-app.up.railway.app/entrypoints/weather/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "location": "New York",
    "units": "imperial",
    "forecast": true
  }'
```

### Example Response

```json
{
  "location": {
    "name": "New York",
    "country": "US",
    "coordinates": {
      "lat": 40.7128,
      "lon": -74.0060
    }
  },
  "current": {
    "temp": 45.2,
    "feelsLike": 41.5,
    "humidity": 65,
    "pressure": 1013,
    "windSpeed": 12.5,
    "description": "Partly cloudy",
    "icon": "2"
  },
  "forecast": [
    {
      "date": "2025-01-16",
      "tempMin": 38.0,
      "tempMax": 48.5,
      "description": "Cloudy"
    }
  ],
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### Data Sources
- **Primary**: Open-Meteo API (100% free, unlimited)
- **Geocoding**: Open-Meteo Geocoding API
- **Update Frequency**: Real-time

---

## 4. multi-data

🔥 **THE POWER COMBO** - Get crypto prices, news, and weather in ONE request!

### Endpoint
```
POST /entrypoints/multi-data/invoke
```

### Price
**0.025 USDC** (25,000 units) - **40% savings** vs individual calls!

### Input Schema

```typescript
{
  crypto?: {
    symbols: string[],
    vsCurrency?: string
  },
  news?: {
    topics: string[],
    limit?: number
  },
  weather?: {
    location: string,
    units?: "metric" | "imperial"
  }
}
```

### Output Schema

```typescript
{
  crypto?: {
    data: Array<PriceData>,
    source: string
  },
  news?: {
    articles: Array<Article>,
    totalResults: number
  },
  weather?: {
    location: LocationData,
    current: CurrentWeather
  },
  timestamp: string,
  requestCount: number              // Number of data types requested
}
```

### Example Request

```bash
curl -X POST https://your-app.up.railway.app/entrypoints/multi-data/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "crypto": {
      "symbols": ["bitcoin", "ethereum"],
      "vsCurrency": "usd"
    },
    "news": {
      "topics": ["bitcoin"],
      "limit": 3
    },
    "weather": {
      "location": "San Francisco",
      "units": "imperial"
    }
  }'
```

### Example Response

```json
{
  "crypto": {
    "data": [
      {
        "symbol": "BTC",
        "price": 43250.50,
        "change24h": 2.5
      }
    ],
    "source": "CoinGecko + CoinCap"
  },
  "news": {
    "articles": [...],
    "totalResults": 3
  },
  "weather": {
    "location": {
      "name": "San Francisco",
      "country": "US"
    },
    "current": {
      "temp": 62.5,
      "description": "Clear sky"
    }
  },
  "timestamp": "2025-01-15T10:30:00.000Z",
  "requestCount": 3
}
```

### Cost Comparison
- Individual calls: 0.01 + 0.015 + 0.005 = **0.03 USDC**
- Multi-data: **0.025 USDC** (saves 0.005 USDC per request)
- **Savings: 16.7%** + faster response time

---

## 5. market-sentiment

Advanced market sentiment analysis combining price action, social media, and news.

### Endpoint
```
POST /entrypoints/market-sentiment/invoke
```

### Price
**0.03 USDC** (30,000 units)

### Input Schema

```typescript
{
  asset?: string,                              // Crypto asset (default: "bitcoin")
  timeframe?: "1h" | "24h" | "7d" | "30d"     // Analysis timeframe (default: "24h")
}
```

### Output Schema

```typescript
{
  asset: string,
  sentiment: {
    score: number,                             // -1 (bearish) to 1 (bullish)
    label: "very_bearish" | "bearish" | "neutral" | "bullish" | "very_bullish",
    confidence: number                         // 0-100
  },
  indicators: {
    socialVolume: number,                      // Social media mentions
    newsCount: number,                         // News articles count
    priceAction: string                        // Price movement description
  },
  signals: Array<{
    type: string,                              // Signal type
    description: string,                       // Signal description
    strength: "weak" | "moderate" | "strong"   // Signal strength
  }>,
  timestamp: string
}
```

### Example Request

```bash
curl -X POST https://your-app.up.railway.app/entrypoints/market-sentiment/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "asset": "bitcoin",
    "timeframe": "24h"
  }'
```

### Example Response

```json
{
  "asset": "bitcoin",
  "sentiment": {
    "score": 0.65,
    "label": "bullish",
    "confidence": 85
  },
  "indicators": {
    "socialVolume": 12500,
    "newsCount": 45,
    "priceAction": "+2.5%"
  },
  "signals": [
    {
      "type": "price_volatility",
      "description": "Strong upward price movement",
      "strength": "moderate"
    },
    {
      "type": "high_activity",
      "description": "Significant media coverage and social activity",
      "strength": "strong"
    }
  ],
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

## 6. analytics

🎯 **AGENT OBSERVABILITY** - Track your API usage, costs, latency, and errors.

### Endpoint
```
POST /entrypoints/analytics/invoke
```

### Price
**0.005 USDC** (5,000 units)

### Input Schema

```typescript
{
  agentId?: string,                            // Your agent ID (optional)
  timeframe?: "1h" | "24h" | "7d" | "30d" | "all",  // Time period (default: "24h")
  metrics?: Array<"cost" | "usage" | "latency" | "errors" | "top_queries">  // Metrics to retrieve
}
```

### Output Schema

```typescript
{
  agentId?: string,
  timeframe: string,
  cost?: {
    total: number,                             // Total USDC spent
    byEndpoint: Record<string, number>,        // Cost per endpoint
    trend: string                              // "up" | "down" | "stable"
  },
  usage?: {
    totalQueries: number,
    byEndpoint: Record<string, number>,
    successRate: number                        // Percentage
  },
  latency?: {
    average: number,                           // Average response time (ms)
    p95: number,                               // 95th percentile
    p99: number                                // 99th percentile
  },
  errors?: {
    total: number,
    byType: Record<string, number>,
    recent: Array<ErrorLog>
  },
  topQueries?: Array<{
    query: string,
    count: number,
    avgCost: number
  }>,
  recommendations: string[],                   // AI-generated recommendations
  timestamp: string
}
```

### Example Request

```bash
curl -X POST https://your-app.up.railway.app/entrypoints/analytics/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "my-trading-bot",
    "timeframe": "24h",
    "metrics": ["cost", "usage", "latency"]
  }'
```

### Example Response

```json
{
  "agentId": "my-trading-bot",
  "timeframe": "24h",
  "cost": {
    "total": 2.45,
    "byEndpoint": {
      "crypto-price": 1.20,
      "multi-data": 0.75,
      "news": 0.45,
      "market-sentiment": 0.05
    },
    "trend": "stable"
  },
  "usage": {
    "totalQueries": 245,
    "byEndpoint": {
      "crypto-price": 120,
      "multi-data": 30,
      "news": 30,
      "market-sentiment": 65
    },
    "successRate": 98.5
  },
  "latency": {
    "average": 185,
    "p95": 320,
    "p99": 485
  },
  "recommendations": [
    "✅ Your agent is running optimally! Keep up the good work."
  ],
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

## 7. historical-data

📊 **TIME SERIES DATA** - Historical crypto prices for backtesting and analysis.

### Endpoint
```
POST /entrypoints/historical-data/invoke
```

### Price
**0.02 USDC** (20,000 units)

### Input Schema

```typescript
{
  symbol: string,                              // Crypto symbol (required)
  dataType?: "price" | "volume" | "market_cap" | "all",  // Data type (default: "price")
  timeframe?: "1h" | "24h" | "7d" | "30d" | "90d" | "1y",  // Historical timeframe (default: "7d")
  interval?: "1m" | "5m" | "1h" | "1d",       // Data interval (default: "1h")
  vsCurrency?: string                          // Quote currency (default: "usd")
}
```

### Output Schema

```typescript
{
  symbol: string,
  dataType: string,
  timeframe: string,
  interval: string,
  dataPoints: Array<{
    timestamp: number,                         // Unix timestamp
    date: string,                              // ISO date
    price?: number,
    volume?: number,
    marketCap?: number
  }>,
  statistics: {
    min: number,                               // Minimum price
    max: number,                               // Maximum price
    average: number,                           // Average price
    change: number,                            // Percentage change
    volatility: number                         // Volatility score
  },
  insights: string[],                          // AI-generated insights
  timestamp: string
}
```

### Example Request

```bash
curl -X POST https://your-app.up.railway.app/entrypoints/historical-data/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "bitcoin",
    "dataType": "all",
    "timeframe": "7d",
    "interval": "1d"
  }'
```

### Example Response

```json
{
  "symbol": "bitcoin",
  "dataType": "all",
  "timeframe": "7d",
  "interval": "1d",
  "dataPoints": [
    {
      "timestamp": 1705276800000,
      "date": "2025-01-15T00:00:00.000Z",
      "price": 43250.50,
      "volume": 28500000000,
      "marketCap": 847500000000
    }
  ],
  "statistics": {
    "min": 41200.00,
    "max": 43500.00,
    "average": 42350.00,
    "change": 5.2,
    "volatility": 875.50
  },
  "insights": [
    "📈 Strong bullish trend: +5.20% over period",
    "🎯 Support level: $41200.00",
    "🎯 Resistance level: $43500.00",
    "📊 Average price: $42350.00"
  ],
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_INPUT` | 400 | Input validation failed |
| `PAYMENT_REQUIRED` | 402 | Insufficient payment |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `EXTERNAL_API_ERROR` | 502 | Upstream API failure |
| `INTERNAL_ERROR` | 500 | Internal server error |

---

## Rate Limits

**Current Limits:**
- No hard rate limits (pay-per-use model)
- Fair use policy applies
- Burst protection: 100 requests/minute per agent

**Recommended Usage:**
- Implement exponential backoff
- Cache responses when appropriate
- Use `multi-data` endpoint for batch requests

---

## Support

- **Documentation Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/pulseapi/issues)
- **x402 Protocol**: [docs.x402.com](https://docs.x402.com)
- **Discord**: x402 Discord server

---

**Last Updated:** 2025-01-15
**API Version:** 1.0.0
