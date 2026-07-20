// Selector de proveedor por env var. Default: mock (corre sin token).
// Si el proveedor elegido no tiene key, cae a mock con aviso.
// Producción recomendada: LLM_PROVIDER=openrouter (structured outputs,
// ver docs/LLM-CHAT-ARCHITECTURE.md).

import { LLMProvider } from "./types";
import { MockProvider } from "./mock";
import { AnthropicProvider } from "./anthropic";
import { OpenAIProvider } from "./openai";
import { OpenRouterProvider } from "./openrouter";

export * from "./types";

export function getProvider(): LLMProvider {
  const which = (process.env.LLM_PROVIDER || "mock").toLowerCase();

  if (which === "openrouter") {
    const key = process.env.OPENROUTER_API_KEY;
    if (key) {
      return new OpenRouterProvider(key, {
        model: process.env.OPENROUTER_MODEL,
        siteUrl: process.env.OPENROUTER_SITE_URL,
        siteName: process.env.OPENROUTER_SITE_NAME,
      });
    }
    console.warn(
      "[espectro] LLM_PROVIDER=openrouter pero falta OPENROUTER_API_KEY; usando MockProvider."
    );
  }

  if (which === "anthropic") {
    const key = process.env.ANTHROPIC_API_KEY;
    if (key) {
      return new AnthropicProvider(key, process.env.ANTHROPIC_MODEL);
    }
    console.warn(
      "[espectro] LLM_PROVIDER=anthropic pero falta ANTHROPIC_API_KEY; usando MockProvider."
    );
  }

  if (which === "openai") {
    const key = process.env.OPENAI_API_KEY;
    if (key) {
      return new OpenAIProvider(
        key,
        process.env.OPENAI_MODEL,
        process.env.OPENAI_BASE_URL
      );
    }
    console.warn(
      "[espectro] LLM_PROVIDER=openai pero falta OPENAI_API_KEY; usando MockProvider."
    );
  }

  return new MockProvider();
}
