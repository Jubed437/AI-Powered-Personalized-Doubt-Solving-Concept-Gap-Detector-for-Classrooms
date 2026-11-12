export const CONCEPTS = [
  {
    id: 'arrays',
    name: 'Arrays',
    description: 'Indexed contiguous collections and element access.',
    difficulty: 1,
    prerequisites: [],
  },
  {
    id: 'time-complexity',
    name: 'Time complexity',
    description: 'Asymptotic analysis of algorithm running time.',
    difficulty: 1,
    prerequisites: [],
  },
  {
    id: 'recursion',
    name: 'Recursion',
    description: 'Solving a problem through smaller self-similar calls and base cases.',
    difficulty: 1,
    prerequisites: [],
  },
  {
    id: 'binary-search',
    name: 'Binary search',
    description: 'Searching a sorted range by repeatedly halving the search interval.',
    difficulty: 2,
    prerequisites: ['arrays', 'time-complexity'],
  },
  {
    id: 'linked-lists',
    name: 'Linked lists',
    description: 'Node-based sequences connected through references.',
    difficulty: 1,
    prerequisites: [],
  },
  {
    id: 'stacks-and-queues',
    name: 'Stacks and queues',
    description: 'Linear structures organized by LIFO and FIFO access.',
    difficulty: 2,
    prerequisites: ['arrays', 'linked-lists'],
  },
  {
    id: 'trees',
    name: 'Trees',
    description: 'Hierarchical node structures and traversal.',
    difficulty: 2,
    prerequisites: ['recursion'],
  },
  {
    id: 'dynamic-programming',
    name: 'Dynamic programming',
    description: 'Solving overlapping subproblems and reusing their results.',
    difficulty: 3,
    prerequisites: ['recursion', 'arrays'],
  },
];

const conceptById = new Map(CONCEPTS.map((concept) => [concept.id, concept]));

export function getPrerequisiteContext(conceptIds) {
  const visited = new Set();
  const result = [];

  function visit(conceptId, depth) {
    const concept = conceptById.get(conceptId);
    if (!concept) return;

    for (const prerequisiteId of concept.prerequisites) {
      if (visited.has(prerequisiteId)) continue;
      visited.add(prerequisiteId);
      const prerequisite = conceptById.get(prerequisiteId);
      result.push({ ...prerequisite, depth: depth + 1 });
      visit(prerequisiteId, depth + 1);
    }
  }

  conceptIds.forEach((conceptId) => visit(conceptId, 0));
  return result;
}

export function resolveConcepts(candidates) {
  return candidates
    .filter((candidate) => conceptById.has(candidate.conceptId))
    .map((candidate) => ({
      ...candidate,
      name: conceptById.get(candidate.conceptId).name,
    }));
}
