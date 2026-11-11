const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const hasOnlyKeys = (value, keys) => Object.keys(value).every((key) => keys.includes(key));
const isText = (value, maxLength = 2000) => (
  typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength
);

export function validateConceptAnalysis(value, knownConceptIds) {
  const errors = [];
  if (
    !isRecord(value)
    || !hasOnlyKeys(value, ['concepts', 'unknownTerms'])
    || !Array.isArray(value.concepts)
    || !Array.isArray(value.unknownTerms)
  ) {
    return ['Concept analysis must contain concepts and unknownTerms arrays.'];
  }

  if (value.concepts.length > 8 || value.unknownTerms.length > 10) {
    errors.push('Concept analysis contains too many entries.');
  }

  for (const concept of value.concepts) {
    if (
      !isRecord(concept)
      || !hasOnlyKeys(concept, ['conceptId', 'confidence', 'evidence'])
      || !knownConceptIds.has(concept.conceptId)
    ) {
      errors.push('A concept entry has an unknown ID or unexpected fields.');
      continue;
    }
    if (
      typeof concept.confidence !== 'number'
      || concept.confidence < 0
      || concept.confidence > 1
      || !isText(concept.evidence, 300)
    ) {
      errors.push(`Concept "${concept.conceptId}" has invalid confidence or evidence.`);
    }
  }

  if (value.unknownTerms.some((term) => !isText(term, 100))) {
    errors.push('Unknown terms must be short non-empty strings.');
  }
  return errors;
}

export function validateExplanation(value, allowedConceptIds) {
  const errors = [];
  if (
    !isRecord(value)
    || !hasOnlyKeys(value, [
      'summary',
      'steps',
      'prerequisiteReminders',
      'checkForUnderstanding',
      'practiceRecommendations',
    ])
    || !isText(value.summary)
    || !Array.isArray(value.steps)
    || !Array.isArray(value.prerequisiteReminders)
    || !isText(value.checkForUnderstanding)
    || !Array.isArray(value.practiceRecommendations)
  ) {
    return ['Explanation does not match the required response shape.'];
  }

  if (value.steps.length < 2 || value.steps.length > 5 || value.steps.some((step) => !isText(step, 500))) {
    errors.push('Explanation must have 2 to 5 concise, non-empty steps.');
  }
  if (
    value.prerequisiteReminders.length > 8
    || value.prerequisiteReminders.some((item) => !isText(item, 200))
  ) {
    errors.push('Prerequisite reminders must be short strings.');
  }
  if (value.practiceRecommendations.length > 8) {
    errors.push('Too many practice recommendations.');
  }

  for (const recommendation of value.practiceRecommendations) {
    if (
      !isRecord(recommendation)
      || !hasOnlyKeys(recommendation, ['conceptId', 'difficulty', 'reason'])
      || !allowedConceptIds.has(recommendation.conceptId)
      || !Number.isInteger(recommendation.difficulty)
      || recommendation.difficulty < 1
      || recommendation.difficulty > 3
      || !isText(recommendation.reason, 200)
    ) {
      errors.push('A practice recommendation is invalid or references an unknown concept.');
    }
  }
  return errors;
}
