import "dotenv/config";

const BASE_URL = process.env.ANTHROPIC_BASE_URL ?? "https://api.anthropic.com";
const KEY = process.env.ANTHROPIC_KEY ?? "";

console.log("BASE_URL:", BASE_URL);
console.log("KEY prefix:", KEY.slice(0, 12) + "...\n");

const MODELS = [
  "claude-haiku-4-5-20251001",
  "claude-sonnet-4-6",
  "claude-opus-4-6",
  "claude-opus-4-7",
];

const BODY = JSON.stringify({
  max_tokens: 10,
  messages: [{ role: "user", content: "Say: OK" }],
});

// Raw fetch — no SDK, so we see the exact response
async function testModel(model) {
  process.stdout.write(`Testing ${model}... `);
  const url = `${BASE_URL}/v1/messages`;
  const isThirdParty = !BASE_URL.includes("api.anthropic.com");
  const headers = {
    "content-type": "application/json",
    ...(isThirdParty
      ? { "authorization": `Bearer ${KEY}` }
      : { "x-api-key": KEY }),
    "anthropic-version": "2023-06-01",
    "user-agent": "anthropic-typescript/0.39.0",
  };
  console.log("\n  → POST", url);
  console.log("  → headers:", JSON.stringify(headers, null, 4));

  let res;
  try {
    res = await fetch(url, { method: "POST", headers, body: JSON.stringify({ model, ...JSON.parse(BODY) }) });
  } catch (err) {
    console.log(`  ❌ fetch threw: ${err.message}`);
    if (err.cause) console.log("     cause:", err.cause?.message ?? err.cause);
    return;
  }

  const text = await res.text();
  console.log(`  ← HTTP ${res.status} ${res.statusText}`);
  console.log("  ← response headers:", JSON.stringify(Object.fromEntries(res.headers.entries()), null, 4));
  console.log("  ← body:", text.slice(0, 500));
}

for (const model of MODELS) {
  await testModel(model);
  console.log();
}
