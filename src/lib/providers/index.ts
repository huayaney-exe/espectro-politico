// Selector de proveedor por env var. Default: mock (corre sin token).
// Si LLM_PROVIDER=anthropic pero falta la key, cae a mock con aviso.

import { LLMProvider } from "./types";
import { MockProvider } from "./mock";
import { AnthropicProvider } from "./anthropic";

export * from "./types";

export function getProvider(): LLMProvider {
  const which = (process.env.LLM_PROVIDER || "mock").toLowerCase();

  if (which === "anthropic") {
    const key = process.env.ANTHROPIC_API_KEY;
    if (key) {
      return new AnthropicProvider(key, process.env.ANTHROPIC_MODEL);
    }
    console.warn(
      "[espectro] LLM_PROVIDER=anthropic pero falta ANTHROPIC_API_KEY; usando MockProvider."
    );
  }

  return new MockProvider();
}
