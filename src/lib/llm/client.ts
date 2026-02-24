// src/lib/llm/client.ts — Claude API 클라이언트 (Prompt Caching 지원)

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-sonnet-4-5-20250514";

// ─── Content Block 타입 (Anthropic Prompt Caching) ───

export interface TextContentBlock {
  type: "text";
  text: string;
  cache_control?: { type: "ephemeral" };
}

export interface LLMRequest {
  /** string (legacy) 또는 ContentBlock[] (Prompt Caching) */
  system: string | TextContentBlock[];
  /** string (legacy) 또는 ContentBlock[] (Prompt Caching) */
  prompt: string | TextContentBlock[];
  maxTokens?: number;
  model?: string;
}

export interface LLMResponse {
  text: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    cacheCreationInputTokens: number;
    cacheReadInputTokens: number;
  };
}

/**
 * Claude API 단일 호출 (Prompt Caching 지원)
 */
export async function callClaude(req: LLMRequest): Promise<LLMResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  const model = req.model ?? DEFAULT_MODEL;

  // system: string → ContentBlock[] 변환
  const systemBlocks: TextContentBlock[] =
    typeof req.system === "string"
      ? [{ type: "text", text: req.system }]
      : req.system;

  // prompt: string → ContentBlock[] 변환
  const userContent: string | TextContentBlock[] =
    typeof req.prompt === "string"
      ? req.prompt
      : req.prompt;

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
      system: systemBlocks,
      messages: [{ role: "user", content: userContent }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      `Claude API 오류 (${response.status}): ${(err as Record<string, string>).message ?? response.statusText}`
    );
  }

  const data = await response.json();

  const cacheCreation = data.usage?.cache_creation_input_tokens ?? 0;
  const cacheRead = data.usage?.cache_read_input_tokens ?? 0;

  // Cache hit logging (per section)
  if (cacheCreation > 0 || cacheRead > 0) {
    console.log(
      `[LLM Cache] cache_write=${cacheCreation} cache_read=${cacheRead}`
    );
  }

  return {
    text: data.content?.[0]?.text ?? "",
    model,
    usage: {
      inputTokens: data.usage?.input_tokens ?? 0,
      outputTokens: data.usage?.output_tokens ?? 0,
      cacheCreationInputTokens: cacheCreation,
      cacheReadInputTokens: cacheRead,
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
