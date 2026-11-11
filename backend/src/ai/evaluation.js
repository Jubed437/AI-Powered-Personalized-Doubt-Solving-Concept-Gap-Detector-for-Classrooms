export function calculateConceptMetrics(cases) {
  let truePositive = 0;
  let falsePositive = 0;
  let falseNegative = 0;

  for (const result of cases) {
    const expected = new Set(result.expectedConceptIds);
    const predicted = new Set(result.predictedConceptIds);
    for (const conceptId of predicted) {
      if (expected.has(conceptId)) truePositive += 1;
      else falsePositive += 1;
    }
    for (const conceptId of expected) {
      if (!predicted.has(conceptId)) falseNegative += 1;
    }
  }

  const precision = truePositive + falsePositive === 0
    ? 0
    : truePositive / (truePositive + falsePositive);
  const recall = truePositive + falseNegative === 0
    ? 0
    : truePositive / (truePositive + falseNegative);
  const f1 = precision + recall === 0
    ? 0
    : (2 * precision * recall) / (precision + recall);

  return {
    truePositive,
    falsePositive,
    falseNegative,
    precision,
    recall,
    f1,
  };
}
