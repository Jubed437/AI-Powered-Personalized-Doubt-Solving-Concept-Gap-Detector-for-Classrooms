const Joi = require('joi');
const { aiServiceUrl, aiServiceKey } = require('../config/env');
const ApiError = require('../utils/ApiError');

const SERVICE_TIMEOUT_MS = 20000;
const MAX_ATTEMPTS = 2;
const analysisSchema = Joi.object({
  answer: Joi.string().trim().min(1).required(),
  gaps: Joi.array()
    .items(
      Joi.object({
        concept: Joi.string().trim().min(1).required(),
        severity: Joi.string().valid('low', 'medium', 'high').required(),
      }).unknown(false)
    )
    .required(),
}).unknown(false);

class RetryableServiceError extends Error {
  constructor(message) {
    super(message);
    this.retryable = true;
  }
}

class ServiceResponseError extends Error {}

const validateAnalysis = (response) => {
  const { error, value } = analysisSchema.validate(response, {
    abortEarly: false,
    convert: true,
  });

  if (error) {
    throw new ServiceResponseError('AI service returned an invalid response');
  }

  return value;
};

const createMockAnalysis = ({ subject, topic }) => validateAnalysis({
  answer: `[Mock response] Here is an explanation of "${topic}" in ${subject}.`,
  gaps: [{ concept: topic, severity: 'medium' }],
});

const requestAnalysis = async ({ subject, topic, text }) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SERVICE_TIMEOUT_MS);
  const serviceUrl = `${aiServiceUrl.replace(/\/+$/, '')}/analyze`;
  const headers = { 'Content-Type': 'application/json' };

  if (aiServiceKey) headers.Authorization = `Bearer ${aiServiceKey}`;

  try {
    let response;
    try {
      response = await fetch(serviceUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ subject, topic, text }),
        signal: controller.signal,
      });
    } catch (error) {
      const message = error.name === 'AbortError'
        ? 'AI service request timed out'
        : 'Could not reach the AI service';
      throw new RetryableServiceError(message);
    }

    if (response.status >= 500) {
      throw new RetryableServiceError('AI service is temporarily unavailable');
    }
    if (!response.ok) {
      throw new ServiceResponseError(`AI service rejected the request (${response.status})`);
    }

    let result;
    try {
      result = await response.json();
    } catch (error) {
      if (controller.signal.aborted || error.name === 'AbortError') {
        throw new RetryableServiceError('AI service request timed out');
      }
      if (!(error instanceof SyntaxError)) {
        throw new RetryableServiceError('Could not read the AI service response');
      }
      throw new ServiceResponseError('AI service returned malformed JSON');
    }

    return validateAnalysis(result);
  } finally {
    clearTimeout(timeout);
  }
};

const analyzeDoubt = async ({ subject, topic, text }) => {
  if (!aiServiceUrl) return createMockAnalysis({ subject, topic });

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      return await requestAnalysis({ subject, topic, text });
    } catch (error) {
      if (error.retryable && attempt + 1 < MAX_ATTEMPTS) continue;

      throw new ApiError(502, `AI analysis failed: ${error.message}`);
    }
  }

  throw new ApiError(502, 'AI analysis failed');
};

module.exports = { analyzeDoubt };
