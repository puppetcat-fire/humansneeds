import "server-only";

import OpenAI from "openai";

import { getOpenAiApiKey } from "@/lib/env";

let cachedClient: OpenAI | null = null;

export function createOpenAiClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const apiKey = getOpenAiApiKey();

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  cachedClient = new OpenAI({ apiKey });

  return cachedClient;
}

