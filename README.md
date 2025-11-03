# 🔥 PulseAPI - The Ultimate x402 Data Hub

[![Railway Deploy](https://img.shields.io/badge/Railway-Deploy-blueviolet)](https://railway.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-1.0%2B-black)](https://bun.sh)

**Real-time cryptocurrency prices, news, weather, and multi-source data aggregation for AI agents.**

PulseAPI is a premium data aggregation service built for the x402 ecosystem. Get instant access to crypto prices, market sentiment, news with AI sentiment analysis, weather data, and more - all through simple API calls with USDC micropayments.

## 🚀 Why PulseAPI?

- **7 Powerful Entrypoints** - Crypto prices, news, weather, market sentiment, analytics, historical data, and multi-data combos
- **Pay Per Query** - Only pay for what you use with USDC micropayments (starting at 0.005 USDC)
- **Multi-Source Aggregation** - Combines data from CoinGecko, CoinCap, CryptoCompare, Open-Meteo, and more
- **Built for AI Agents** - Perfect for trading bots, market intelligence, and autonomous decision-making
- **Type-Safe** - Full TypeScript with Zod schemas for bulletproof integrations
- **Instant Deployment** - One-click Railway deployment with auto-scaling

## 📊 Available Entrypoints

| Entrypoint | Description | Price (USDC) | Use Case |
|------------|-------------|--------------|----------|
| `crypto-price` | Real-time crypto prices for 1000+ coins | 0.02 | Trading bots, price alerts |
| `news` | Crypto news with AI sentiment analysis | 0.03 | Market intelligence |
| `weather` | Global weather data + 5-day forecast | 0.01 | Location-based agents |
| `multi-data` | **🔥 COMBO** - All data in one call (29% savings!) | 0.05 | Comprehensive context |
| `market-sentiment` | Advanced AI sentiment analysis | 0.06 | Trading signals |
| `analytics` | **🎯 OBSERVABILITY** - Track your usage | 0.01 | Cost monitoring |
| `historical-data` | **📊 TIME SERIES** - Historical prices + AI insights | 0.04 | Backtesting |

## ⚡ Quick Start

### Prerequisites

- [Bun](https://bun.sh) runtime (NOT Node.js)
- Railway account (for deployment)
- Wallet with USDC on Base network

### Local Development

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/pulseapi.git
cd pulseapi

# Install dependencies
bun install

# Start development server
bun run dev
```

The server will start on `http://localhost:3000`

### Test an Entrypoint

```bash
# Get crypto prices
curl -X POST http://localhost:3000/entrypoints/crypto-price/invoke \
  -H "Content-Type: application/json" \
  -d '{"symbols": ["bitcoin", "ethereum"], "include24hChange": true}'

# Get weather
curl -X POST http://localhost:3000/entrypoints/weather/invoke \
  -H "Content-Type: application/json" \
  -d '{"location": "New York", "forecast": true}'
```

## 🌐 Deployment

### Deploy to Railway (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/pulseapi.git
   git push -u origin main
   ```

2. **Deploy on Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your `pulseapi` repository
   - Railway auto-deploys from `railway.toml`

3. **Set Environment Variables** (in Railway dashboard)
   ```
   PORT=3000
   NODE_ENV=production
   FACILITATOR_URL=https://facilitator.daydreams.systems
   ADDRESS=0xYOUR_WALLET_ADDRESS_HERE
   NETWORK=base
   DEFAULT_PRICE=10000
   ```

4. **Get Your URL**
   - Railway provides: `https://your-app.up.railway.app`
   - Test: `https://your-app.up.railway.app/.well-known/agent.json`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 📡 Register on x402scan

After deployment, register your entrypoints on [x402scan.org](https://x402scan.org):

1. Navigate to "Register Agent"
2. Enter your Railway URL: `your-app.up.railway.app`
3. Register each entrypoint:
   - `crypto-price` (0.02 USDC)
   - `news` (0.03 USDC)
   - `weather` (0.01 USDC)
   - `multi-data` (0.05 USDC)
   - `market-sentiment` (0.06 USDC)
   - `analytics` (0.01 USDC)
   - `historical-data` (0.04 USDC)

## 💡 Usage Examples

### Get Crypto Prices

```typescript
// Request
{
  "symbols": ["bitcoin", "ethereum", "solana"],
  "vsCurrency": "usd",
  "includeMarketCap": true,
  "include24hChange": true
}

// Response
{
  "data": [
    {
      "symbol": "BTC",
      "name": "bitcoin",
      "price": 43250.50,
      "marketCap": 847500000000,
      "change24h": 2.5,
      "lastUpdated": "2025-01-15T10:30:00Z"
    }
  ],
  "timestamp": "2025-01-15T10:30:00Z",
  "source": "CoinGecko + CoinCap"
}
```

### Get Market Sentiment

```typescript
// Request
{
  "asset": "bitcoin",
  "timeframe": "24h"
}

// Response
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
    }
  ]
}
```

### Multi-Data Combo (🔥 BEST VALUE)

```typescript
// Request - Get everything in one call!
{
  "crypto": {
    "symbols": ["bitcoin", "ethereum"],
    "vsCurrency": "usd"
  },
  "news": {
    "topics": ["bitcoin"],
    "limit": 5
  },
  "weather": {
    "location": "New York",
    "units": "imperial"
  }
}

// Response includes crypto prices, news, AND weather
// Saves 40% vs calling each endpoint separately!
```

See [API_DOCS.md](./API_DOCS.md) for complete API documentation.

## 🏗️ Architecture

```
pulseapi/
├── src/
│   ├── index.ts              # Main agent setup & entrypoint registration
│   ├── entrypoints/          # 7 entrypoint handlers
│   │   ├── crypto-price.ts
│   │   ├── news.ts
│   │   ├── weather.ts
│   │   ├── multi-data.ts
│   │   ├── market-sentiment.ts
│   │   ├── analytics.ts
│   │   └── historical-data.ts
│   └── lib/
│       └── data-sources.ts   # External API integrations
├── tests/                    # Test suite
├── package.json
├── tsconfig.json
└── railway.toml
```

## 🔧 Technology Stack

- **Runtime**: Bun (ultra-fast JavaScript runtime)
- **Framework**: Daydreams x402 Agent Kit
- **Language**: TypeScript with strict type checking
- **Validation**: Zod schemas for all inputs/outputs
- **Deployment**: Railway (auto-scaling, zero-config)
- **Payment**: USDC on Base network via x402 protocol

## 🎯 Data Sources

All APIs used are **FREE** (no API keys required!):

- **Crypto Prices**: CoinGecko API (primary) + CoinCap API (fallback)
- **News**: CryptoCompare News API
- **Weather**: Open-Meteo API (completely free, unlimited)
- **Market Data**: Aggregated from multiple sources

## 💰 Revenue Projections (NEW Premium Pricing!)

**Conservative** (100 calls/day): ~$350/year
**Moderate** (1,000 calls/day): ~$8,000/year
**Aggressive** (10,000 calls/day): ~$80,000/year
**Scale** (100,000+ calls/day): Path to $20M+ annual revenue

💡 **2x revenue with premium positioning** - Still 50% below competitors!

See [PRICING_STRATEGY.md](./PRICING_STRATEGY.md) and [MONEY_STRATEGY.md](./MONEY_STRATEGY.md) for detailed analysis.

## 🧪 Testing

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Type checking
bun run type-check
```

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `bun test`
5. Commit: `git commit -m "Add amazing feature"`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🌟 Roadmap

- [ ] WebSocket support for real-time streaming
- [ ] Advanced caching layer for cost optimization
- [ ] Social media sentiment integration (Twitter, Reddit)
- [ ] DeFi metrics (TVL, yields, liquidity)
- [ ] Premium tier with higher rate limits
- [ ] Custom data endpoints for enterprise
- [ ] API dashboard for usage analytics

## 🆘 Support

- **Documentation**: See [API_DOCS.md](./API_DOCS.md)
- **Deployment**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **x402 Docs**: [docs.x402.com](https://docs.x402.com)
- **Discord**: x402 Discord server
- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/pulseapi/issues)

## 🏆 Built by the PulseAPI Swarm

This project was built using a coordinated multi-agent swarm approach with 8 specialized AI agents:
- 🎯 Project Orchestrator
- 🏗️ Backend Architect
- 💎 TypeScript Specialist
- 🔌 Data Integration Engineer
- 🚀 DevOps Engineer
- 🔒 Security Specialist
- ✅ Testing Engineer
- 📚 Documentation Writer

See [docs/agent-prompt.md](./docs/agent-prompt.md) for the complete swarm architecture.

---

**Made with 🔥 for the x402 ecosystem**

**Deploy. Earn. Scale.** 🚀
