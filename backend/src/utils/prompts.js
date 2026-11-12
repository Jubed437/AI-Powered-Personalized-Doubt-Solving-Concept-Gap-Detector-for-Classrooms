const buildDoubtAnalysisMessages = ({ subject, topic, text }) => [
  {
    role: 'system',
    content: [
      'You are a careful classroom tutor.',
      'Analyze the student question and return JSON only, with no markdown or extra text.',
      'The JSON must match this shape:',
      '{"answer":"A clear, helpful explanation","gaps":[{"concept":"A prerequisite concept","severity":"low|medium|high"}]}',
      'Use an empty gaps array when no prerequisite knowledge gap is evident.',
      'Severity must be exactly one of: low, medium, high.',
    ].join(' '),
  },
  {
    role: 'user',
    content: JSON.stringify({ subject, topic, text }),
  },
];

module.exports = { buildDoubtAnalysisMessages };
