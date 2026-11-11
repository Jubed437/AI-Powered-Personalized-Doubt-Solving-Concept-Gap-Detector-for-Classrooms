import { CONCEPTS, getPrerequisiteContext } from '../ai/concepts.js';
import { WEAK_CONCEPT_THRESHOLD } from './mastery.js';

function getMastery(masteries, conceptId) {
  return masteries.get(conceptId) || {
    masteryScore: 0.5,
    evidenceCount: 0,
    correctAttempts: 0,
    incorrectAttempts: 0,
    lastEvidenceAt: null,
  };
}

function rankTargets(conceptIds, masteries, depths = new Map()) {
  return [...new Set(conceptIds)]
    .map((conceptId) => ({
      conceptId,
      mastery: getMastery(masteries, conceptId),
      depth: depths.get(conceptId) || 0,
    }))
    .sort((left, right) => {
      if (left.mastery.masteryScore !== right.mastery.masteryScore) {
        return left.mastery.masteryScore - right.mastery.masteryScore;
      }
      if (left.depth !== right.depth) return right.depth - left.depth;
      const leftLast = left.mastery.lastEvidenceAt
        ? new Date(left.mastery.lastEvidenceAt).getTime()
        : 0;
      const rightLast = right.mastery.lastEvidenceAt
        ? new Date(right.mastery.lastEvidenceAt).getTime()
        : 0;
      return leftLast - rightLast;
    });
}

export function selectNextQuestion({ masteries: masteryRows, usedQuestionIds = [], questions }) {
  const masteries = new Map(masteryRows.map((row) => [row.conceptId, row]));
  const available = questions.filter((question) => !usedQuestionIds.includes(question.id));
  if (available.length === 0) return null;

  const assessed = masteryRows.some(({ evidenceCount }) => evidenceCount > 0);
  let candidates;
  let depths = new Map();

  if (!assessed) {
    candidates = CONCEPTS.filter(({ prerequisites }) => prerequisites.length === 0)
      .map(({ id }) => id);
  } else {
    const weakConcepts = CONCEPTS.filter(({ id }) => {
      const mastery = getMastery(masteries, id);
      return mastery.evidenceCount > 0 && mastery.masteryScore < WEAK_CONCEPT_THRESHOLD;
    });

    if (weakConcepts.length > 0) {
      const expanded = new Set(weakConcepts.map(({ id }) => id));
      for (const { id } of weakConcepts) {
        for (const prerequisite of getPrerequisiteContext([id])) {
          expanded.add(prerequisite.id);
          depths.set(prerequisite.id, Math.max(
            depths.get(prerequisite.id) || 0,
            prerequisite.depth,
          ));
        }
      }
      candidates = [...expanded];
    } else {
      candidates = CONCEPTS.filter(({ id }) => {
        const mastery = getMastery(masteries, id);
        return !(
          mastery.masteryScore >= 0.8
          && mastery.correctAttempts >= 3
        );
      }).map(({ id }) => id);
    }
  }

  const targetOrder = rankTargets(candidates, masteries, depths);
  const questionsForTargets = targetOrder.flatMap(({ conceptId, mastery }) => {
    const concept = CONCEPTS.find(({ id }) => id === conceptId);
    const desiredDifficulty = mastery.evidenceCount === 0
      ? concept.difficulty
      : mastery.masteryScore < 0.4
        ? Math.max(1, concept.difficulty - 1)
        : mastery.masteryScore < 0.7
          ? concept.difficulty
          : Math.min(3, concept.difficulty + 1);

    return available
      .filter(({ conceptId: questionConceptId }) => questionConceptId === conceptId)
      .sort((left, right) => (
        Math.abs(left.difficulty - desiredDifficulty) - Math.abs(right.difficulty - desiredDifficulty)
      ));
  });

  return questionsForTargets[0] || available[0];
}
