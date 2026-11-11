process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:1/knowra_test_only';
process.env.JWT_SECRET = 'jest-only-ai-signing-key';
process.env.AI_SERVICE_URL = 'https://ai-service.test/v1';
process.env.AI_SERVICE_KEY = 'jest-only-service-key';

const { analyzeDoubt } = require('../src/services/ai.service');

describe('analyzeDoubt', () => {
  const originalFetch = global.fetch;
  const request = {
    subject: 'Computer Science',
    topic: 'Arrays',
    text: 'How does indexing work?',
  };
  const expected = {
    answer: 'A useful explanation.',
    gaps: [{ concept: 'Prerequisite concept', severity: 'high' }],
  };

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  const providerResponse = (payload) => ({
    ok: true,
    status: 200,
    json: async () => payload,
  });

  test('returns a topic-specific mock when AI_SERVICE_URL is empty', async () => {
    jest.resetModules();
    process.env.AI_SERVICE_URL = '';
    const mockAnalyzeDoubt = require('../src/services/ai.service').analyzeDoubt;

    await expect(mockAnalyzeDoubt(request)).resolves.toEqual({
      answer: expect.stringContaining('Arrays'),
      gaps: [{ concept: 'Arrays', severity: 'medium' }],
    });
    expect(global.fetch).not.toHaveBeenCalled();

    jest.resetModules();
    process.env.AI_SERVICE_URL = 'https://ai-service.test/v1';
  });

  test('posts only the analysis fields and validates a valid response', async () => {
    global.fetch.mockResolvedValue(providerResponse(expected));

    await expect(analyzeDoubt(request)).resolves.toEqual(expected);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch.mock.calls[0][0]).toBe('https://ai-service.test/v1/analyze');
    const options = global.fetch.mock.calls[0][1];
    expect(options.method).toBe('POST');
    expect(options.headers.Authorization).toBe('Bearer jest-only-service-key');
    expect(JSON.parse(options.body)).toEqual(request);
    expect(options.signal).toBeInstanceOf(AbortSignal);
  });

  test('rejects malformed JSON without retrying', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => { throw new SyntaxError('invalid JSON'); },
    });

    await expect(analyzeDoubt(request)).rejects.toMatchObject({ statusCode: 502 });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('rejects a response missing required fields without retrying', async () => {
    global.fetch.mockResolvedValue(providerResponse({ answer: 'No gaps field.' }));

    await expect(analyzeDoubt(request)).rejects.toMatchObject({ statusCode: 502 });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('retries one time on server errors but not on client errors', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce(providerResponse(expected));

    await expect(analyzeDoubt(request)).resolves.toEqual(expected);
    expect(global.fetch).toHaveBeenCalledTimes(2);

    global.fetch.mockReset();
    global.fetch.mockResolvedValue({ ok: false, status: 401 });

    await expect(analyzeDoubt(request)).rejects.toMatchObject({ statusCode: 502 });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
