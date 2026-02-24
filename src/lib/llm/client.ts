// src/lib/llm/client.ts — Claude API 클라이언트

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-sonnet-4-5-20250514";

export interface LLMRequest {
  system: string;
  prompt: string;
  maxTokens?: number;
  model?: string;
}

export interface LLMResponse {
  text: string;
  model: string;
  usage: { inputTokens: number; outputTokens: number };
}

/**
 * Claude API 단일 호출
 */
export async function callClaude(req: LLMRequest): Promise<LLMResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  const model = req.model ?? DEFAULT_MODEL;

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: req.maxTokens ?? 2000,
      system: req.system,
      messages: [{ role: "user", content: req.prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      `Claude API 오류 (${response.status}): ${(err as Record<string, string>).message ?? response.statusText}`
    );
  }

  const data = await response.json();
  return {
    text: data.content?.[0]?.text ?? "",
    model,
    usage: {
      inputTokens: data.usage?.input_tokens ?? 0,
      outputTokens: data.usage?.output_tokens ?? 0,
    },
  };
}

/**
 * 에러 재시도 래퍼 (최대 retries회)
 */
export async function callClaudeWithRetry(
  req: LLMRequest,
  retries: number = 2
): Promise<LLMResponse> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await callClaude(req);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries) {
        // 지수 백오프: 1초, 2초, 4초...
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError;
}
