export class AIServiceError extends Error {
  constructor(message, { code = 'AI_SERVICE_ERROR', statusCode = 502, cause } = {}) {
    super(message, { cause });
    this.name = 'AIServiceError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export class AIConfigurationError extends AIServiceError {
  constructor(message) {
    super(message, { code: 'AI_NOT_CONFIGURED', statusCode: 503 });
    this.name = 'AIConfigurationError';
  }
}

export class GroqProvider {
  constructor({
    apiKey = process.env.GROQ_API_KEY,
    model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    timeoutMs = Number(process.env.AI_TIMEOUT_MS) || 20000,
    fetchImpl = fetch,
  } = {}) {
    if (!apiKey) {
      throw new AIConfigurationError('AI is not configured. Set GROQ_API_KEY on the backend.');
    }

    this.apiKey = apiKey;
    this.model = model;
    this.timeoutMs = timeoutMs;
    this.fetchImpl = fetchImpl;
  }

  async generateStructured({ messages, metadata = {} }) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    const startedAt = Date.now();

    try {
      const response = await this.fetchImpl('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const statusCode = response.status === 429 ? 503 : 502;
        throw new AIServiceError(
          response.status === 429
            ? 'The AI provider is rate limited. Please try again shortly.'
            : 'The AI provider could not complete the request.',
          { code: response.status === 429 ? 'AI_RATE_LIMITED' : 'AI_PROVIDER_ERROR', statusCode },
        );
      }

      const payload = await response.json();
      const content = payload.choices?.[0]?.message?.content;
      if (typeof content !== 'string') {
        throw new AIServiceError('The AI provider returned an empty response.', {
          code: 'AI_EMPTY_RESPONSE',
        });
      }

      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (cause) {
        throw new AIServiceError('The AI provider returned malformed JSON.', {
          code: 'AI_MALFORMED_JSON',
          cause,
        });
      }

      return {
        data: parsed,
        metadata: {
          provider: 'groq',
          model: this.model,
          promptVersion: metadata.promptVersion,
          latencyMs: Date.now() - startedAt,
          usage: payload.usage || null,
        },
      };
    } catch (error) {
      if (error instanceof AIServiceError) throw error;
      if (controller.signal.aborted) {
        throw new AIServiceError('The AI request timed out. Please retry.', {
          code: 'AI_TIMEOUT',
          statusCode: 504,
          cause: error,
        });
      }
      throw new AIServiceError('The AI provider could not be reached.', {
        code: 'AI_CONNECTION_ERROR',
        statusCode: 502,
        cause: error,
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function createAIProvider() {
  const providerName = process.env.AI_PROVIDER || 'groq';
  if (providerName !== 'groq') {
    throw new AIConfigurationError(`Unsupported AI_PROVIDER "${providerName}".`);
  }
  return new GroqProvider();
}
