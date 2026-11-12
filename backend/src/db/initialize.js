import { CONCEPTS } from '../ai/concepts.js';
import { PRACTICE_QUESTIONS } from '../learning/questionBank.js';

export async function initializeDatabase(database) {
  const students = database.collection('students');
  const concepts = database.collection('concepts');
  const questions = database.collection('practiceQuestions');
  const sessions = database.collection('practiceSessions');
  const doubts = database.collection('doubts');

  await Promise.all([
    students.createIndex({ displayName: 1 }),
    concepts.createIndex({ name: 1 }),
    questions.createIndex({ conceptId: 1, active: 1, difficulty: 1 }),
    sessions.createIndex({ studentId: 1, createdAt: -1 }),
    sessions.createIndex({ status: 1, currentQuestionId: 1 }),
    doubts.createIndex({ createdAt: -1 }),
  ]);

  await concepts.bulkWrite(
    CONCEPTS.map((concept) => ({
      replaceOne: {
        filter: { _id: concept.id },
        replacement: {
          _id: concept.id,
          name: concept.name,
          description: concept.description,
          difficulty: concept.difficulty,
          prerequisites: concept.prerequisites,
          active: true,
        },
        upsert: true,
      },
    })),
  );

  await questions.bulkWrite(
    PRACTICE_QUESTIONS.map((question) => ({
      replaceOne: {
        filter: { _id: question.id },
        replacement: {
          _id: question.id,
          conceptId: question.conceptId,
          difficulty: question.difficulty,
          prompt: question.prompt,
          options: question.options,
          correctOptionId: question.correctOptionId,
          explanation: question.explanation,
          active: true,
        },
        upsert: true,
      },
    })),
  );
}
