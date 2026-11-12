import test from 'node:test';
import assert from 'node:assert/strict';
import { CONCEPTS } from '../ai/concepts.js';
import { PRACTICE_QUESTIONS } from '../learning/questionBank.js';
import { initializeDatabase } from './initialize.js';

test('database initialization creates indexes and seeds graph and curated questions', async () => {
  const collections = new Map();
  const calls = [];
  const database = {
    collection(name) {
      if (!collections.has(name)) {
        collections.set(name, {
          async createIndex(index) {
            calls.push({ type: 'index', name, index });
          },
          async bulkWrite(operations) {
            calls.push({ type: 'seed', name, operations });
          },
        });
      }
      return collections.get(name);
    },
  };

  await initializeDatabase(database);

  const conceptSeed = calls.find(({ type, name }) => type === 'seed' && name === 'concepts');
  const questionSeed = calls.find(({ type, name }) => type === 'seed' && name === 'practiceQuestions');
  assert.equal(conceptSeed.operations.length, CONCEPTS.length);
  assert.equal(questionSeed.operations.length, PRACTICE_QUESTIONS.length);
  assert.ok(calls.some(({ type, name }) => type === 'index' && name === 'doubts'));

  const binarySearch = conceptSeed.operations.find(
    ({ replaceOne }) => replaceOne.replacement._id === 'binary-search',
  );
  assert.deepEqual(binarySearch.replaceOne.replacement.prerequisites, ['arrays', 'time-complexity']);

  const question = questionSeed.operations[0].replaceOne.replacement;
  assert.ok(question.correctOptionId);
  assert.ok(question.options.length > 0);
});
