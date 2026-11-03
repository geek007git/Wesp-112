const dotenv = require("dotenv");
dotenv.config();

async function main() {
  const apiKey = process.env.MISTRAL_API_KEY;
  const model = process.env.MISTRAL_MODEL || "mistral-medium-latest";

  console.log("Checking Mistral AI Configuration...");
  console.log(`Model: ${model}`);

  if (!apiKey) {
    console.error("Error: MISTRAL_API_KEY environment variable is not set.");
    console.log("Please define MISTRAL_API_KEY in your .env file or environment.");
    process.exit(1);
  }

  console.log(`API Key: ${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`);
  console.log("Connecting to Mistral AI...");

  try {
    const { Mistral } = await import("@mistralai/mistralai");
    const client = new Mistral({ apiKey });

    const startTime = Date.now();
    const response = await client.chat.complete({
      model,
      messages: [
        {
          role: "user",
          content: "Hello! This is a health check from MediMate appointment assistant. Please reply with a brief confirmation.",
        },
      ],
      maxTokens: 50,
      temperature: 0.3,
    });

    const elapsed = Date.now() - startTime;
    const reply = response.choices?.[0]?.message?.content;
    console.log(`\nSuccess (${elapsed}ms)!`);
    console.log("Mistral AI Response:");
    console.log("-----------------------------------------");
    console.log(typeof reply === "string" ? reply.trim() : JSON.stringify(reply));
    console.log("-----------------------------------------");
  } catch (error) {
    console.error("\nMistral AI Connection Error:", error.message || error);
    process.exit(1);
  }
}

main();
