import test from 'node:test';
import assert from 'node:assert/strict';
import { selectNextQuestion } from './adaptive.js';
import {
  masteryLabel,
  MASTERY_THRESHOLD,
  REQUIRED_CORRECT_ATTEMPTS,
  updateMastery,
} from './mastery.js';
import { PRACTICE_QUESTIONS } from './questionBank.js';

test('new learners are directed to foundational concepts, not presumed weak', () => {
  const question = selectNextQuestion({
    masteries: [],
    questions: PRACTICE_QUESTIONS,
  });
  assert.equal(question.conceptId, 'arrays');
  assert.equal(question.difficulty, 1);
});

test('adaptive selection targets a weak prerequisite before a stronger advanced concept', () => {
  const question = selectNextQuestion({
    masteries: [
      {
        conceptId: 'binary-search',
        masteryScore: 0.62,
        evidenceCount: 2,
        correctAttempts: 1,
        incorrectAttempts: 1,
        lastEvidenceAt: new Date().toISOString(),
      },
    ],
    questions: PRACTICE_QUESTIONS,
  });
  assert.equal(question.conceptId, 'arrays');
});

test('adaptive selection avoids questions already used in the session', () => {
  const question = selectNextQuestion({
    masteries: [],
    usedQuestionIds: ['arrays-indexing-1'],
    questions: PRACTICE_QUESTIONS,
  });
  assert.equal(question.conceptId, 'arrays');
  assert.equal(question.id, 'arrays-indexing-2');
});

test('mastery updates use bounded difficulty weights and count evidence', () => {
  const first = updateMastery(null, { correct: true, difficulty: 3 });
  assert.equal(first.masteryScore, 0.66);
  assert.equal(first.correctAttempts, 1);
  assert.equal(first.isMastered, false);

  const lowerBound = updateMastery({
    masteryScore: 0.02,
    evidenceCount: 10,
    correctAttempts: 0,
    incorrectAttempts: 10,
  }, { correct: false, difficulty: 1 });
  assert.equal(lowerBound.masteryScore, 0);
});

test('mastery label requires both score threshold and repeated correct evidence', () => {
  assert.equal(masteryLabel({ evidenceCount: 0, masteryScore: 0.5 }), 'not_assessed');
  assert.equal(masteryLabel({
    evidenceCount: 1,
    correctAttempts: 0,
    masteryScore: 0.6,
  }), 'needs_review');
  assert.equal(masteryLabel({
    evidenceCount: REQUIRED_CORRECT_ATTEMPTS,
    correctAttempts: REQUIRED_CORRECT_ATTEMPTS,
    masteryScore: MASTERY_THRESHOLD,
  }), 'mastered');
  assert.equal(masteryLabel({
    evidenceCount: REQUIRED_CORRECT_ATTEMPTS,
    correctAttempts: REQUIRED_CORRECT_ATTEMPTS,
    masteryScore: MASTERY_THRESHOLD - 0.01,
  }), 'learning');
});

test('mastery engine rejects invalid correctness and difficulty values', () => {
  assert.throws(() => updateMastery(null, { correct: true, difficulty: 4 }), RangeError);
  assert.throws(() => updateMastery(null, { correct: 'yes', difficulty: 1 }), TypeError);
});
