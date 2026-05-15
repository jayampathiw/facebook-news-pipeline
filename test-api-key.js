import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";

console.log(
  "BASE_URL:",
  process.env.ANTHROPIC_BASE_URL || "(direct Anthropic)",
);
console.log("KEY prefix:", process.env.ANTHROPIC_KEY?.slice(0, 12) + "...\n");

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_KEY,
  ...(process.env.ANTHROPIC_BASE_URL && {
    baseURL: process.env.ANTHROPIC_BASE_URL,
  }),
});

const MODELS = [
  "claude-haiku-4-5",
  "claude-haiku-4-5-20251001",
  "claude-sonnet-4-6",
];

for (const model of MODELS) {
  process.stdout.write(`Testing ${model}... `);
  try {
    const res = await client.messages.create({
      model,
      max_tokens: 10,
      messages: [{ role: "user", content: "Say: OK" }],
    });
    console.log(`✅  RAW:`, JSON.stringify(res));
  } catch (err) {
    console.log(`❌  err: ${err} status:${err.status}  message:${err.message}`);
    if (err.error) console.log("    body:", JSON.stringify(err.error));
  }
}
