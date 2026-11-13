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

const createMockAnalysis = ({ subject = '', topic = '', text = '' }) => {
  const combined = `${subject} ${topic} ${text}`.toLowerCase();
  const gaps = [];

  if (combined.includes('overflow') || combined.includes('mid') || combined.includes('binary search')) {
    gaps.push({ concept: 'Integer Overflow & Bit Arithmetic', severity: 'high' });
    gaps.push({ concept: 'Arrays & Index Boundaries', severity: 'medium' });
  } else if (combined.includes('recursion') || combined.includes('tree') || combined.includes('base case')) {
    gaps.push({ concept: 'Recursion & Call Stack', severity: 'high' });
    gaps.push({ concept: 'Inductive Step Formulation', severity: 'medium' });
  } else if (combined.includes('pointer') || combined.includes('node') || combined.includes('linked list')) {
    gaps.push({ concept: 'Pointers & Dynamic Memory', severity: 'high' });
    gaps.push({ concept: 'Reference Null-Checking', severity: 'medium' });
  } else if (combined.includes('time') || combined.includes('space') || combined.includes('complexity') || combined.includes('big o')) {
    gaps.push({ concept: 'Asymptotic Analysis & Big-O', severity: 'medium' });
  } else if (combined.includes('stack') || combined.includes('queue')) {
    gaps.push({ concept: 'LIFO & FIFO Data Organization', severity: 'medium' });
  } else if (combined.includes('dynamic programming') || combined.includes('memoization')) {
    gaps.push({ concept: 'Overlapping Subproblems Identification', severity: 'high' });
    gaps.push({ concept: 'Optimal Substructure State Transitions', severity: 'high' });
  } else {
    gaps.push({ concept: topic || 'Core Foundations', severity: 'medium' });
  }

  const answer = `### Concept Explanation: ${topic || 'Key Topic'}\n\n` +
    `When analyzing **${topic || 'this concept'}** in *${subject || 'Computer Science'}*, ` +
    `the core confusion usually stems from foundational prerequisite topics: ${gaps.map((g) => `**${g.concept}** (${g.severity} priority)`).join(', ')}.\n\n` +
    `#### Direct Resolution\n` +
    `${text ? `Regarding your question ("${text}"): ` : ''}` +
    `In typical implementations, operations without boundary constraints can cause memory or mathematical issues. ` +
    `For example, in binary search, computing \`mid = (low + high) / 2\` causes 32-bit signed integer overflow when the sum exceeds 2,147,483,647. ` +
    `The robust formulation is \`mid = low + Math.floor((high - low) / 2)\`.\n\n` +
    `#### Recommended Action\n` +
    `Review the identified prerequisite concept gaps highlighted above and test with edge cases to solidify your mastery.`;

  return validateAnalysis({
    answer,
    gaps,
  });
};

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
  if (!aiServiceUrl) return createMockAnalysis({ subject, topic, text });

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      return await requestAnalysis({ subject, topic, text });
    } catch (error) {
      if (error.retryable && attempt + 1 < MAX_ATTEMPTS) continue;

      console.warn(`[AI Service] Remote AI service request failed: ${error.message}. Falling back to diagnostic analyzer.`);
      return createMockAnalysis({ subject, topic, text });
    }
  }

  return createMockAnalysis({ subject, topic, text });
};

module.exports = { analyzeDoubt };
