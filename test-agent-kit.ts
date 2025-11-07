import { createAgentApp } from "@lucid-dreams/agent-kit";

const { app } = createAgentApp(
  {
    name: "Test Agent",
    version: "1.0.0",
    description: "Test",
  } as any,
  {
    config: {
      payments: {
        facilitatorUrl: "https://facilitator.daydreams.systems",
        payTo: "0x01D11F7e1a46AbFC6092d7be484895D2d505095c",
        network: "base",
        asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        defaultPrice: "$0.02",
      },
    },
  }
);

export default {
  port: 4500,
  fetch: app.fetch,
};

console.log("Test server running on port 4500");
