# PulseAPI MCP Server - Complete Setup & Distribution Guide

## Overview

We've built and published an MCP (Model Context Protocol) server that brings PulseAPI directly into Claude Desktop, Cline, and other MCP-enabled AI tools. This enables instant distribution to thousands of users.

**Package Name:** `@hashmonkey/mcp-server-pulseapi`
**npm URL:** https://www.npmjs.com/package/@hashmonkey/mcp-server-pulseapi
**Version:** 1.0.0
**Status:** ✅ Published and Live

---

## What is MCP?

**MCP (Model Context Protocol)** is a standard that lets AI assistants like Claude Desktop discover and use external tools/APIs. Think of it as "plugins for Claude."

- **For Users:** One config file = instant access to your API
- **For You:** Zero-friction distribution to Claude Desktop's user base
- **Payments:** Automatic via x402 (USDC on Base)

---

## What We Built

### The MCP Server Package

Located in: `/mcp-server-pulseapi/`

**Files:**
- `src/index.ts` - Main MCP server with 7 tools
- `package.json` - Package config
- `README.md` - User documentation
- `claude_desktop_config.example.json` - Example config

**Features:**
- 7 tools exposing all PulseAPI endpoints
- Automatic x402 payment handling
- Type-safe with TypeScript
- Works with any MCP client (Claude Desktop, Cline, etc.)

### The 7 Tools

| Tool Name | Description | Cost | MCP Function |
|-----------|-------------|------|--------------|
| `get_crypto_prices` | Real-time crypto prices for 1000+ coins | $0.02 | Auto-calls `/entrypoints/crypto-price/invoke` |
| `get_crypto_news` | News with AI sentiment analysis | $0.03 | Auto-calls `/entrypoints/news/invoke` |
| `get_weather` | Weather + 5-day forecast | $0.01 | Auto-calls `/entrypoints/weather/invoke` |
| `get_multi_data` | **COMBO** - All data in one call | $0.05 | Auto-calls `/entrypoints/multi-data/invoke` |
| `get_market_sentiment` | AI trading signals + sentiment | $0.06 | Auto-calls `/entrypoints/market-sentiment/invoke` |
| `get_analytics` | Usage tracking & observability | $0.01 | Auto-calls `/entrypoints/analytics/invoke` |
| `get_historical_data` | Historical price data + analysis | $0.04 | Auto-calls `/entrypoints/historical-data/invoke` |

---

## How Users Install It

### For Claude Desktop

1. **Find config file:**
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. **Add this config:**

```json
{
  "mcpServers": {
    "pulseapi": {
      "command": "npx",
      "args": ["-y", "@hashmonkey/mcp-server-pulseapi"],
      "env": {
        "X402_PRIVATE_KEY": "0xYOUR_PRIVATE_KEY_HERE"
      }
    }
  }
}
```

3. **Restart Claude Desktop**

4. **Test it:**
   - Look for 🔌 MCP icon
   - Ask: "What's the current Bitcoin price?"
   - Claude uses the tool automatically
   - Payment happens via x402
   - Data returned

### For Cline (VS Code Extension)

Same config in Cline's MCP settings.

---

## How Payments Work

### The Flow

1. **User asks Claude:** "What's BTC price?"
2. **Claude calls MCP tool:** `get_crypto_prices`
3. **MCP server calls PulseAPI:** POST to Railway URL
4. **PulseAPI returns 402:** Payment required
5. **x402-fetch handles it:** Creates payment with user's wallet
6. **Payment sent:** USDC on Base → Your wallet (`0x01D11F7e1a46AbFC6092d7be484895D2d505095c`)
7. **Request retried:** With payment header
8. **Data returned:** Through MCP → Claude → User
9. **User sees answer:** Natural response

### User's Wallet Requirements

- **USDC on Base network** (not Ethereum mainnet!)
- Private key set in config
- Enough balance for queries (~$10-50 recommended)

### You Get Paid

Every query = instant USDC payment to your wallet.

**Check payments:**
https://basescan.org/address/0x01D11F7e1a46AbFC6092d7be484895D2d505095c

---

## Distribution Strategy

### 1. npm Package (DONE ✅)

**Published:** `@hashmonkey/mcp-server-pulseapi@1.0.0`

Anyone can install with:
```bash
npx @hashmonkey/mcp-server-pulseapi
```

No registration, no API keys, just works.

### 2. MCP Registry Submission (TODO)

**Goal:** Get listed in Claude Desktop's official server browser

**Steps:**
1. Fork: https://github.com/modelcontextprotocol/servers
2. Edit `src/servers.json`
3. Add entry:

```json
{
  "@hashmonkey/mcp-server-pulseapi": {
    "description": "Real-time crypto prices, news, weather, and market sentiment with automatic USDC micropayments via x402. Pay-per-query pricing starting at $0.01.",
    "repository": "https://github.com/DeganAI/pulseapi",
    "homepage": "https://pulseapi-production-00cc.up.railway.app",
    "categories": ["data", "crypto", "weather", "news"],
    "author": "DegenLlama.net",
    "license": "MIT"
  }
}
```

4. Create PR with title: "Add PulseAPI MCP server"
5. Description: "MCP server providing real-time crypto, news, weather data with x402 micropayments"

**Impact:** Users discover you directly in Claude Desktop

### 3. Social Media Marketing

#### Twitter/X Post Template

```
🔥 PulseAPI is now available for Claude Desktop!

7 powerful data tools:
• Real-time crypto prices ($0.02)
• News with AI sentiment ($0.03)
• Weather forecasts ($0.01)
• Market analysis ($0.06)
• Historical data ($0.04)

One-line install, automatic USDC payments on Base ⚡

npx @hashmonkey/mcp-server-pulseapi

Built by @DegenLlamaNet for the x402 ecosystem

#ClaudeAI #x402 #crypto #AI
```

**When to post:**
- After MCP registry acceptance
- With demo video
- Tag @AnthropicAI, @CoinbaseWallet, relevant crypto accounts

#### Reddit Communities

- **r/ClaudeAI** - "New MCP server for crypto/weather data"
- **r/cryptocurrency** - "AI assistant now has real-time crypto data via x402"
- **r/ChatGPT** - Cross-post about AI + crypto integration

#### Discord Servers

- **Anthropic Discord** (#claude-desktop, #mcp-servers)
- **x402 Discord** (#projects, #showcase)
- **Daydreams Discord** (#builders)

### 4. Demo Video (High Impact)

**30-second screen recording:**

1. Show Claude Desktop
2. Open config file
3. Add PulseAPI config
4. Restart Claude
5. Ask: "What's Bitcoin's price and sentiment?"
6. Show payment in wallet (optional)
7. Show Claude's response with data
8. End card: "Install: npx @hashmonkey/mcp-server-pulseapi"

**Post on:**
- Twitter/X
- YouTube
- Reddit
- Product Hunt

### 5. Content Marketing

#### Blog Post Ideas

- "How to Add Real-Time Crypto Data to Claude Desktop"
- "Building a Profitable MCP Server with x402"
- "Pay-Per-Use APIs: The Future of AI Agent Infrastructure"

#### Tutorial

Step-by-step guide:
1. Install Claude Desktop
2. Get USDC on Base
3. Configure MCP server
4. Try example queries
5. Check your wallet for payments

### 6. Community Engagement

**Find users asking:**
- "How to get crypto prices in Claude?"
- "Claude Desktop plugins?"
- "MCP servers for data?"
- "x402 services?"

**Reply with:**
"I built an MCP server for this! Real-time crypto prices with automatic payments: npx @hashmonkey/mcp-server-pulseapi"

---

## Technical Details

### Package Structure

```
mcp-server-pulseapi/
├── src/
│   └── index.ts          # Main server (237 lines)
├── dist/                 # Compiled JS
├── package.json          # npm config
├── README.md             # User docs (180 lines)
├── tsconfig.json         # TypeScript config
└── claude_desktop_config.example.json
```

### Dependencies

```json
{
  "@modelcontextprotocol/sdk": "^0.5.0",  // MCP protocol
  "x402-fetch": "^0.7.0"                  // Automatic payments
}
```

### How It Works Internally

1. **Server starts** via `npx` command
2. **Reads env var:** `X402_PRIVATE_KEY`
3. **Creates signer:** Using x402's `createSigner()`
4. **Wraps fetch:** With `wrapFetchWithPayment()`
5. **Registers 7 tools:** With MCP SDK
6. **Listens on stdio:** For MCP protocol messages
7. **Tool called:** Receives parameters from Claude
8. **Makes request:** To PulseAPI with x402 payment
9. **Returns data:** Back through MCP to Claude

### Error Handling

- Missing private key → Clear error message
- Insufficient funds → Payment error (user needs more USDC)
- API errors → Caught and returned to Claude
- Network issues → Timeout after configured seconds

### Security

- Private keys stored locally (user's machine)
- Never transmitted except for signing
- All payments on-chain (transparent)
- No API keys needed
- No authentication required

---

## Monitoring & Analytics

### Check Payments

**Wallet:** `0x01D11F7e1a46AbFC6092d7be484895D2d505095c`

View on Base:
```
https://basescan.org/address/0x01D11F7e1a46AbFC6092d7be484895D2d505095c
```

Filter for USDC transfers.

### Track npm Downloads

```bash
npm view @hashmonkey/mcp-server-pulseapi
```

Shows:
- Weekly downloads
- Total downloads
- Version info

Check stats: https://npm-stat.com/charts.html?package=@hashmonkey/mcp-server-pulseapi

### Monitor Usage via Analytics Tool

Users can call the `get_analytics` tool:

```
Show me PulseAPI usage stats for the last 7 days
```

Returns:
- Total queries
- Cost breakdown by endpoint
- Success rates
- Error patterns

---

## Troubleshooting

### Common User Issues

**"X402_PRIVATE_KEY environment variable is required"**
- User forgot to set private key in config
- Solution: Add to `env` section

**"Insufficient funds"**
- Wallet needs more USDC on Base
- Solution: Bridge from Ethereum or buy USDC

**"Payment failed"**
- Wrong network (Ethereum instead of Base)
- Invalid private key
- Network issues

**"Tool not showing in Claude"**
- Config syntax error (invalid JSON)
- Need to restart Claude Desktop
- Check Developer Console for errors

### Updating the Package

When you make changes:

```bash
cd mcp-server-pulseapi

# Update version in package.json
npm version patch  # or minor, or major

# Rebuild
npm run build

# Publish
npm publish --access=public
```

Users will get updates automatically on next `npx` run.

---

## Revenue Optimization

### Pricing Strategy

Current pricing is competitive:

| Service | Your Price | Typical API | Savings |
|---------|-----------|-------------|---------|
| Crypto Price | $0.02 | $0.05+ | 60% |
| News + Sentiment | $0.03 | $0.10+ | 70% |
| Multi-Data | $0.05 | $0.15+ | 67% |

**Position:** "Premium quality at competitive prices"

### Upsell Opportunities

**Multi-data bundle** saves 17%:
- Individual: $0.02 + $0.03 + $0.01 = $0.06
- Bundle: $0.05 (17% savings)

Claude will automatically prefer the bundle when users ask for multiple data points.

### Volume Discounts (Future)

Could implement:
- Subscription tier ($10/month = 500 queries)
- Bulk credits
- Partner deals

Requires backend changes.

---

## Growth Metrics to Track

### Week 1-2 Goals

- [ ] 100 npm downloads
- [ ] 10 active users
- [ ] First $1 in revenue
- [ ] Accepted into MCP registry

### Month 1 Goals

- [ ] 500 npm downloads
- [ ] 50 active users
- [ ] $50+ in revenue
- [ ] 5 GitHub stars
- [ ] Featured in x402 ecosystem

### Quarter 1 Goals

- [ ] 2,000 npm downloads
- [ ] 200 active users
- [ ] $500+ in revenue
- [ ] Partnership with agent builders
- [ ] Case studies/testimonials

---

## Next Steps

### Immediate (Next 7 Days)

1. **Submit to MCP registry** - Get official listing
2. **Create demo video** - 30-second walkthrough
3. **Tweet announcement** - With demo video
4. **Post in 3 communities** - Reddit, Discord, Farcaster

### Short Term (Next 30 Days)

1. **Monitor first users** - Help them succeed
2. **Collect feedback** - Improve based on issues
3. **Write blog post** - Tutorial + case study
4. **Build partnerships** - Find agent builders to integrate

### Long Term (Next 90 Days)

1. **Add more data sources** - Based on demand
2. **Build analytics dashboard** - Public usage stats
3. **Create SDK** - Make it easier to build on PulseAPI
4. **Launch affiliate program** - Let others promote

---

## Resources

### Links

- **npm Package:** https://www.npmjs.com/package/@hashmonkey/mcp-server-pulseapi
- **GitHub Repo:** https://github.com/DeganAI/pulseapi
- **Service:** https://pulseapi-production-00cc.up.railway.app
- **x402scan:** https://www.x402scan.com/resources
- **Wallet:** https://basescan.org/address/0x01D11F7e1a46AbFC6092d7be484895D2d505095c

### Documentation

- **User README:** `/mcp-server-pulseapi/README.md`
- **API Docs:** `/API_DOCS.md`
- **Deployment Guide:** `/DEPLOYMENT.md`
- **This Guide:** `/MCP_SETUP_GUIDE.md`

### Support Channels

- **GitHub Issues:** https://github.com/DeganAI/pulseapi/issues
- **x402 Discord:** Ask in #support
- **Email:** Support via npm package page

---

## Success Stories (To Be Added)

Document early users:
- Who they are
- How they use it
- How much they spend
- Testimonials

This builds social proof for future marketing.

---

## Competitive Advantage

### vs Traditional APIs

- ✅ **No API keys** - Just works
- ✅ **Pay per use** - No subscriptions
- ✅ **Crypto payments** - Instant settlement
- ✅ **MCP native** - Zero integration code
- ✅ **AI-optimized** - Perfect for agents

### vs Free APIs

- ✅ **Reliability** - Paid = better uptime
- ✅ **Rate limits** - Higher than free tiers
- ✅ **Support** - Responsive help
- ✅ **Features** - AI sentiment, combos
- ✅ **Quality** - Multiple data sources

### vs Other x402 Services

- ✅ **Multi-source** - Not just one type
- ✅ **MCP first** - Built for Claude
- ✅ **Documentation** - Comprehensive
- ✅ **Combo pricing** - Save money
- ✅ **Observability** - Analytics included

---

## Final Notes

This is a **working, published, revenue-generating product** as of today.

Everything is ready:
- ✅ Service running
- ✅ Payments working
- ✅ npm package published
- ✅ Documentation complete
- ✅ GitHub public

**Just needs promotion.**

When you're ready to push this, focus on:
1. MCP registry submission (high impact)
2. Demo video (converts users)
3. Social media (builds awareness)

The infrastructure is solid. Now it's about getting users.

---

**Built by DegenLlama.net for the x402 ecosystem** 🚀
