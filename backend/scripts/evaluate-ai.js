import { readFile } from 'node:fs/promises';
import { analyzeDoubt } from '../src/ai/workflow.js';
import { calculateConceptMetrics } from '../src/ai/evaluation.js';

const casesPath = new URL('../evaluation/cases.json', import.meta.url);
const cases = JSON.parse(await readFile(casesPath, 'utf8'));
const results = [];

for (const testCase of cases) {
  const startedAt = Date.now();
  try {
    const analysis = await analyzeDoubt({
      doubt: testCase.doubt,
      subject: 'Data Structures and Algorithms',
      topic: testCase.topic,
    });
    results.push({
      id: testCase.id,
      expectedConceptIds: testCase.expectedConceptIds,
      predictedConceptIds: analysis.concepts.map(({ conceptId }) => conceptId),
      responseValid: Boolean(analysis.explanation.summary && analysis.explanation.steps.length >= 2),
      latencyMs: Date.now() - startedAt,
    });
  } catch (error) {
    results.push({
      id: testCase.id,
      expectedConceptIds: testCase.expectedConceptIds,
      predictedConceptIds: [],
      responseValid: false,
      latencyMs: Date.now() - startedAt,
      errorCode: error.code || 'EVALUATION_ERROR',
    });
  }
}

const metrics = calculateConceptMetrics(results);
const validResponses = results.filter(({ responseValid }) => responseValid).length;
const latencies = results.map(({ latencyMs }) => latencyMs).sort((a, b) => a - b);
const p95Index = Math.max(0, Math.ceil(latencies.length * 0.95) - 1);
const report = {
  promptVersion: 'doubt-v1',
  provider: process.env.AI_PROVIDER || 'groq',
  model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  sampleCount: cases.length,
  responseValidityRate: validResponses / cases.length,
  averageLatencyMs: Math.round(latencies.reduce((sum, value) => sum + value, 0) / latencies.length),
  p95LatencyMs: latencies[p95Index],
  conceptMapping: metrics,
  results,
};

console.log(JSON.stringify(report, null, 2));
if (validResponses !== cases.length || metrics.f1 < 0.7) {
  process.exitCode = 1;
}
