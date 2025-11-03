# 🚀 PulseAPI Deployment Guide

## Prerequisites
- GitHub account
- Railway account (connected to GitHub)
- Your wallet address for receiving payments

## Step 1: Push to GitHub

```bash
# Initialize git repo
cd pulseapi
git init
git add .
git commit -m "Initial commit: PulseAPI - The GOAT x402 Data Hub"

# Create repo on GitHub (via web or CLI)
gh repo create pulseapi --public --source=. --remote=origin --push
# Or manually: Create repo at github.com/new, then:
git remote add origin https://github.com/YOUR_USERNAME/pulseapi.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Railway

1. **Go to Railway:** https://railway.app
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Choose your `pulseapi` repository**
5. **Railway will auto-detect settings from `railway.toml`**

## Step 3: Set Environment Variables

In Railway dashboard, go to your service → Variables tab:

```bash
PORT=3000
NODE_ENV=production
FACILITATOR_URL=https://facilitator.daydreams.systems
ADDRESS=0x01D11F7e1a46AbFC6092d7be484895D2d505095c
NETWORK=base
DEFAULT_PRICE=10000
```

Railway will automatically set `BASE_URL` based on your deployment URL.

## Step 4: Wait for Deployment

Railway will:
1. Detect Bun runtime (via `package.json`)
2. Run `bun install`
3. Execute `bun run start`
4. Expose your service on a public URL

**Deployment time:** ~2-3 minutes

## Step 5: Verify Endpoints

Once deployed, test these endpoints:

```bash
# Get your Railway URL (something like: https://pulseapi-production-XXXX.up.railway.app)
RAILWAY_URL="your-railway-url"

# Test health check
curl $RAILWAY_URL/health

# Test agent manifest
curl $RAILWAY_URL/.well-known/agent.json

# Test agent card
curl $RAILWAY_URL/.well-known/agent-card.json

# Test entrypoint (should return 402 Payment Required)
curl -X POST $RAILWAY_URL/entrypoints/crypto-price/invoke \
  -H "Content-Type: application/json" \
  -d '{"symbols": ["BTC", "ETH"]}'
```

**Expected responses:**
- `/health` → `{"status": "ok"}`
- `/.well-known/agent.json` → HTTP 200 with manifest
- `/.well-known/agent-card.json` → HTTP 200 with full details
- `/entrypoints/crypto-price/invoke` → HTTP 402 with payment requirements

## Step 6: Register on x402scan

1. **Go to:** https://www.x402scan.com/resources/register
2. **Enter URL:** `https://your-service.railway.app/entrypoints/crypto-price/invoke`
3. **Leave headers blank**
4. **Click "Add"**
5. **Repeat for other entrypoints:**
   - `/entrypoints/news/invoke`
   - `/entrypoints/weather/invoke`
   - `/entrypoints/multi-data/invoke`
   - `/entrypoints/market-sentiment/invoke`

## Step 7: Verify on x402scan

Visit https://www.x402scan.com and search for your service.

You should see all 5 entrypoints listed!

## Step 8: Test with Real Payment

Use the x402 client or an agent with payment capabilities:

```typescript
import { AgentRuntime } from "@lucid-dreams/agent-auth";
import { createRuntimePaymentContext } from "@lucid-dreams/agent-kit";

const { runtime } = await AgentRuntime.load({ /* wallet config */ });
const { fetchWithPayment } = await createRuntimePaymentContext({ runtime });

const response = await fetchWithPayment(
  "https://your-service.railway.app/entrypoints/crypto-price/invoke",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      symbols: ["BTC", "ETH", "SOL"],
      include24hChange: true
    })
  }
);

console.log(await response.json());
```

## Troubleshooting

### Service won't start
- Check Railway logs for errors
- Verify all environment variables are set
- Ensure `bun.lockb` is NOT in git (it's in .gitignore)

### 402 not working
- Verify manifest is accessible: `/.well-known/agent.json`
- Check facilitator URL is correct
- Ensure wallet address is valid Base address

### Data not fetching
- Check Railway logs for API errors
- Verify external APIs are accessible (CoinGecko, Open-Meteo, etc)
- Test individual data sources locally first

### Deployment fails
- Check `railway.toml` syntax
- Verify `package.json` has correct scripts
- Ensure TypeScript compiles: `bun run typecheck`

## Monitoring

Railway provides:
- **Logs:** Real-time application logs
- **Metrics:** CPU, memory, network usage
- **Deployments:** History of all deployments
- **Custom Domain:** Add your own domain (optional)

## Scaling

Railway auto-scales based on load. To optimize:
1. Use Railway's caching features
2. Monitor response times
3. Add rate limiting if needed
4. Consider adding Redis for caching expensive operations

## Cost Estimation

Railway pricing (as of 2025):
- **Hobby Plan:** $5/month for starter projects
- **Pro Plan:** $20/month + usage
- **Team Plan:** Custom pricing

**Expected costs for PulseAPI:**
- Low traffic (<1000 requests/day): ~$5-10/month
- Medium traffic (10k requests/day): ~$20-50/month
- High traffic (100k+ requests/day): ~$100-200/month

**Revenue potential FAR exceeds costs!**

## Next Steps

1. **Monitor usage** via Railway dashboard
2. **Promote on Twitter/X** with #x402 hashtag
3. **Submit to bounty programs** if applicable
4. **Add more data sources** based on demand
5. **Build analytics dashboard** for users

## Support

Need help?
- Railway Docs: https://docs.railway.app
- x402 Discord: [Coming Soon]
- GitHub Issues: [Your Repo]

---

**You're live! Time to make money! 🚀💰**
