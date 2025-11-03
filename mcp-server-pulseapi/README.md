# PulseAPI MCP Server

MCP (Model Context Protocol) server for [PulseAPI](https://github.com/DeganAI/pulseapi) - bringing real-time crypto prices, news, weather, and market data directly into Claude Desktop, Cline, and other MCP-enabled AI tools.

**Built by [DegenLlama.net](https://degenllama.net)**

## Features

This MCP server exposes 7 powerful data tools with automatic x402 micropayments:

| Tool | Description | Cost |
|------|-------------|------|
| 🪙 `get_crypto_prices` | Real-time prices for 1000+ coins | $0.02 |
| 📰 `get_crypto_news` | Latest news with AI sentiment analysis | $0.03 |
| 🌤️ `get_weather` | Weather data + 5-day forecast | $0.01 |
| 🔥 `get_multi_data` | **COMBO** - All data in one call (29% savings!) | $0.05 |
| 📊 `get_market_sentiment` | AI market sentiment + trading signals | $0.06 |
| 📈 `get_analytics` | Usage tracking & observability | $0.01 |
| 📉 `get_historical_data` | Historical price data + analysis | $0.04 |

**Payments are automatic** - uses USDC on Base via x402 protocol.

## Installation

### Prerequisites

1. **Node.js 18+** installed
2. **A wallet with USDC on Base network** for payments
3. **Private key** for your wallet (keep it secret!)

### Install via npm

```bash
npm install -g @degenai/mcp-server-pulseapi
```

### Or use npx (no installation)

```bash
npx @degenai/mcp-server-pulseapi
```

## Configuration

### For Claude Desktop

1. **Find your config file:**
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. **Add PulseAPI MCP server:**

```json
{
  "mcpServers": {
    "pulseapi": {
      "command": "npx",
      "args": ["-y", "@degenai/mcp-server-pulseapi"],
      "env": {
        "X402_PRIVATE_KEY": "0xYOUR_PRIVATE_KEY_HERE"
      }
    }
  }
}
```

3. **Restart Claude Desktop**

4. **Verify** - Look for the 🔌 MCP icon in Claude Desktop. You should see "pulseapi" with 7 tools.

### For Cline (VS Code Extension)

1. Open Cline settings
2. Add to MCP servers configuration:

```json
{
  "pulseapi": {
    "command": "npx",
    "args": ["-y", "@degenai/mcp-server-pulseapi"],
    "env": {
      "X402_PRIVATE_KEY": "0xYOUR_PRIVATE_KEY_HERE"
    }
  }
}
```

### Get Your Private Key

**⚠️ SECURITY WARNING:** Your private key controls your wallet. Never share it or commit it to git.

**Option 1: Use a dedicated payment wallet** (recommended)
- Create a new wallet just for x402 payments
- Fund it with a small amount of USDC (~$10-50)
- Export the private key from your wallet

**Option 2: Use Coinbase Smart Wallet**
- Create a smart wallet at https://wallet.coinbase.com
- Fund with USDC on Base
- Export private key from wallet settings

**Where to get USDC on Base:**
- Bridge from Ethereum: https://bridge.base.org
- Buy directly: Coinbase, Kraken, or other exchanges with Base support

## Usage Examples

Once configured, just ask Claude naturally:

### Get Crypto Prices

```
What's the current price of Bitcoin, Ethereum, and Solana?
```

Claude will use `get_crypto_prices` automatically and pay $0.02.

### Check Market Sentiment

```
What's the market sentiment for Bitcoin right now?
```

Claude will use `get_market_sentiment` ($0.06) and return AI analysis with trading signals.

### Get Weather

```
What's the weather like in Tokyo?
```

Claude will use `get_weather` ($0.01) and return current conditions.

### Combo Request (Best Value!)

```
Give me Bitcoin price, latest crypto news, and weather in New York
```

Claude will use `get_multi_data` ($0.05) instead of 3 separate calls ($0.06 total) - **saving 17%!**

### Historical Analysis

```
Show me Bitcoin's price history for the last 30 days
```

Claude will use `get_historical_data` ($0.04) with volatility analysis.

## How It Works

1. **You ask Claude** for crypto/news/weather data
2. **Claude calls the MCP tool** with your request
3. **MCP server makes x402 request** to PulseAPI
4. **x402-fetch handles payment** automatically (USDC on Base)
5. **Data returned** to Claude
6. **Claude formats response** for you

All payments are automatic - you just need USDC in your wallet!

## Monitoring

### Check Your Wallet

Watch payments: https://basescan.org/address/YOUR_ADDRESS

### Track Usage

Use the `get_analytics` tool:

```
Show me my PulseAPI usage stats for the last 7 days
```

This tracks:
- Total queries
- Cost per endpoint
- Success rates
- Average latency
- Error patterns

## Pricing Details

| Endpoint | Individual | vs Multi-Data |
|----------|-----------|---------------|
| Crypto Price | $0.02 | Included |
| News | $0.03 | Included |
| Weather | $0.01 | Included |
| **Total Individual** | **$0.06** | - |
| **Multi-Data Combo** | - | **$0.05** |
| **Savings** | - | **17% off!** |

All prices in USDC on Base network.

## Development

### Build from source

```bash
git clone https://github.com/DeganAI/pulseapi.git
cd pulseapi/mcp-server-pulseapi
npm install
npm run build
```

### Test locally

```bash
X402_PRIVATE_KEY=0x... node dist/index.js
```

### Publish updates

```bash
npm version patch
npm publish
```

## Troubleshooting

### "X402_PRIVATE_KEY environment variable is required"

You forgot to set your private key in the config. Add it to the `env` section.

### "Insufficient funds"

Your wallet needs more USDC. Bridge some from Ethereum or buy on Base.

### "Payment failed"

Check:
- Wallet has USDC on **Base** network (not Ethereum mainnet)
- Private key is correct
- Network connection is stable

### "Tool not showing in Claude"

1. Check config file syntax (valid JSON)
2. Restart Claude Desktop completely
3. Check Claude's developer console for errors

### Still stuck?

- GitHub Issues: https://github.com/DeganAI/pulseapi/issues
- x402 Discord: Ask in #support
- Check wallet: https://basescan.org/address/YOUR_ADDRESS

## Links

- **PulseAPI Service:** https://pulseapi-production-00cc.up.railway.app
- **GitHub:** https://github.com/DeganAI/pulseapi
- **x402scan:** https://www.x402scan.com/resources
- **x402 Protocol:** https://x402.org
- **Built by:** [DegenLlama.net](https://degenllama.net)

## License

MIT License - see [LICENSE](../LICENSE)

---

**Pay only for what you use. No subscriptions. No API keys. Just crypto.**

🔥 Built for the x402 ecosystem by [DegenLlama.net](https://degenllama.net)
