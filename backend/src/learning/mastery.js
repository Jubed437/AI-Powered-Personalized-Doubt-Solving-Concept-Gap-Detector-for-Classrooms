export const MASTERY_THRESHOLD = 0.8;
export const WEAK_CONCEPT_THRESHOLD = 0.7;
export const REQUIRED_CORRECT_ATTEMPTS = 3;

const CORRECT_DELTAS = {
  1: 0.08,
  2: 0.12,
  3: 0.16,
};

export function updateMastery(current, { correct, difficulty }) {
  if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 3) {
    throw new RangeError('Difficulty must be an integer from 1 to 3.');
  }
  if (typeof correct !== 'boolean') {
    throw new TypeError('Correctness must be a boolean.');
  }

  const score = current?.masteryScore ?? 0.5;
  const correctAttempts = (current?.correctAttempts ?? 0) + (correct ? 1 : 0);
  const incorrectAttempts = (current?.incorrectAttempts ?? 0) + (correct ? 0 : 1);
  const masteryScore = Math.max(
    0,
    Math.min(1, score + (correct ? CORRECT_DELTAS[difficulty] : -0.07)),
  );
  const evidenceCount = correctAttempts + incorrectAttempts;

  return {
    masteryScore: Number(masteryScore.toFixed(4)),
    evidenceCount,
    correctAttempts,
    incorrectAttempts,
    isMastered: masteryScore >= MASTERY_THRESHOLD
      && correctAttempts >= REQUIRED_CORRECT_ATTEMPTS,
  };
}

export function masteryLabel(mastery) {
  if (!mastery || mastery.evidenceCount === 0) return 'not_assessed';
  if (
    mastery.masteryScore >= MASTERY_THRESHOLD
    && mastery.correctAttempts >= REQUIRED_CORRECT_ATTEMPTS
  ) {
    return 'mastered';
  }
  return mastery.masteryScore < WEAK_CONCEPT_THRESHOLD ? 'needs_review' : 'learning';
}
